const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const { authenticate } = require("./middleware/auth");
const User = require("./models/user");
const Expense = require("./models/expence");
const dotenv = require("dotenv");
const cors = require("cors");
const { Parser } = require("json2csv");
const fs = require("fs");
const path = require("path");

dotenv.config();

const app = express();
app.use(cors());

const PORT = process.env.PORT;
const JWT_SECRET = process.env.JWT_KEY;
const connectdb = require("./DB/db");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectdb();

// User registration
app.post(
  "/register",

  body("email").isEmail().withMessage("Invalid email"),
  body("password")
    .isLength({ min: 6 })
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/
    )
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
  body("mobileNumber")
    .isNumeric()
    .matches(/^((\+)?)([\s-.\(\)]*\d{1}){8,13}$/)
    .withMessage("Invalid mobile number"),
  body("name").isLength({ min: 3 }),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { email, name, mobileNumber, password } = req.body;
    console.log(email, name, mobileNumber, password);

    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({
        email,
        name,
        mobileNumber,
        password: hashedPassword,
      });
      await newUser.save();

      res
        .status(201)
        .json({ message: "User created", user: { email, name, mobileNumber } });
    } catch (error) {
      res.status(500).json({ error: "Error creating user" });
    }
  }
);

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log(email, password);

  try {
    const user = await User.findOne({ email });
    console.log(user);
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log(isMatch);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "1h",
    });
    console.log(token);
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ error: "Error logging in" });
  }
});

// Add expense
app.post("/expenses", authenticate, async (req, res) => {
  const { amount, description, splitType, participants } = req.body;

  try {
    let updatedParticipants = participants;

    if (splitType === "equal" && participants.length > 0) {
      // Calculate equal share
      const equalShare = amount / participants.length;

      // Update participants with the calculated share
      updatedParticipants = participants.map((participant) => ({
        ...participant,
        share: equalShare,
      }));
    } else if (
      splitType === "exact" &&
      participants.length > 0 &&
      !participants.every((participant) => participant.share > 0)
    ) {
      return res
        .status(400)
        .json({ error: "All participants must have a share greater than 0" });
    } else if (
      splitType === "percentage" &&
      participants.length > 0 &&
      !participants.every(
        (participant) => participant.share >= 0 && participant.share <= 100
      )
    ) {
      return res.status(400).json({
        error: "All participants must have a share between 0 and 100",
      });
    } else {
      updatedParticipants = participants;
    }

    const newExpense = new Expense({
      userId: req.userId,
      amount,
      description,
      splitType,
      participants: updatedParticipants,
    });

    await newExpense.save();
    res.status(201).json({ message: "Expense added", expense: newExpense });
  } catch (error) {
    res.status(500).json({ error: "Error adding expense" });
  }
});

// Retrieve overall expenses.
app.get("/expenses/overall", async (req, res) => {
  try {
    const expenses = await Expense.find();
    const totalExpenses = expenses.reduce((acc, exp) => acc + exp.amount, 0);
    res.json({ "Overall expenses": totalExpenses });
  } catch (error) {
    res.status(500).json({ error: "Error retrieving expenses" });
  }
});

const getUserExpensesAndBalance = async (userId) => {
  const userExpenses = await Expense.find({
    "participants.userId": userId,
  });

  if (userExpenses.length === 0) {
    return { expenses: [], totalAmountToPay: 0 };
  }

  let totalAmountToPay = 0;

  const expenseData = userExpenses.map((expense) => {
    const participant = expense.participants.find(
      (p) => p.userId.toString() === userId
    );

    let share = 0;
    if (participant) {
      if (expense.splitType === "percentage") {
        share = (participant.share / 100) * expense.amount;
      } else {
        share = participant.share;
      }
      totalAmountToPay += share;
    }

    return {
      Description: expense.description,
      Amount: expense.amount,
      SplitType: expense.splitType,
      UserShare: share.toFixed(2),
      Date: expense.createdAt.toISOString(),
    };
  });

  return { expenses: expenseData, totalAmountToPay };
};
app.get("/expenses/balance-sheet", authenticate, async (req, res) => {
  try {
    const { expenses, totalAmountToPay } = await getUserExpensesAndBalance(
      req.userId
    );

    if (expenses.length === 0) {
      return res
        .status(404)
        .json({ message: "No expenses found for this user." });
    }

    res.status(200).json({
      expenses,
      totalAmountToPay,
    });
  } catch (error) {
    res.status(500).json({ error: "Error retrieving user expenses" });
  }
});

app.get("/expenses/balance-sheet/download", authenticate, async (req, res) => {
  try {
    const { expenses, totalAmountToPay } = await getUserExpensesAndBalance(
      req.userId
    );

    if (expenses.length === 0) {
      return res
        .status(404)
        .json({ message: "No expenses found for this user." });
    }

    expenses.push({
      Description: "Total Amount to Pay",
      UserShare: totalAmountToPay.toFixed(2),
    });

    const json2csvParser = new Parser();
    const csv = json2csvParser.parse(expenses);

    const filePath = path.join(__dirname, "balance_sheet.csv");
    fs.writeFileSync(filePath, csv);

    res.download(filePath, "balance_sheet.csv", (err) => {
      if (err) {
        res.status(500).json({ error: "Error downloading the balance sheet" });
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Error generating balance sheet" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
