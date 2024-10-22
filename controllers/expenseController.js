const Expense = require("../models/expence");
const { Parser } = require("json2csv");
const fs = require("fs");
const path = require("path");

// Helper function to fetch expenses for a specific user and calculate their balance.
const getUserExpensesAndBalance = async (userId) => {
  // Find all expenses where the user is a participant.
  const userExpenses = await Expense.find({
    "participants.userId": userId,
  });

  // If no expenses are found, return empty results.
  if (userExpenses.length === 0) {
    return { expenses: [], totalAmountToPay: 0 };
  }

  let totalAmountToPay = 0;

  // Map through each expense to format the data and calculate the user's share.
  const expenseData = userExpenses.map((expense) => {
    // Find the participant's details within the expense.
    const participant = expense.participants.find(
      (p) => p.userId.toString() === userId
    );

    let share = 0;
    // Calculate the user's share based on the split type (percentage or exact).
    if (participant) {
      if (expense.splitType === "percentage") {
        share = (participant.share / 100) * expense.amount;
      } else {
        share = participant.share;
      }
      // Add the calculated share to the total amount the user has to pay.
      totalAmountToPay += share;
    }

    // Return the formatted expense data.
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

// Controller to handle adding a new expense.
exports.addExpense = async (req, res) => {
  const { amount, description, splitType, participants } = req.body;

  try {
    let updatedParticipants = participants;

    // If the split type is "equal", calculate an equal share for each participant.
    if (splitType === "equal" && participants.length > 0) {
      const equalShare = amount / participants.length;
      updatedParticipants = participants.map((participant) => ({
        ...participant,
        share: equalShare,
      }));
    }

    // Create a new expense with the updated participants and save it to the database.
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
    // Handle errors during expense creation.
    res.status(500).json({ error: "Error adding expense" });
  }
};

// Controller to get the overall expenses total from all expenses.
exports.getOverallExpenses = async (req, res) => {
  try {
    // Retrieve all expenses and calculate the total amount.
    const expenses = await Expense.find();
    const totalExpenses = expenses.reduce((acc, exp) => acc + exp.amount, 0);
    res.json({ "Overall expenses": totalExpenses });
  } catch (error) {
    // Handle errors during retrieval.
    res.status(500).json({ error: "Error retrieving expenses" });
  }
};

// Controller to get a balance sheet for a specific user.
exports.getBalanceSheet = async (req, res) => {
  try {
    // Fetch the user's expenses and total amount to pay.
    const { expenses, totalAmountToPay } = await getUserExpensesAndBalance(req.userId);
    if (expenses.length === 0) {
      return res.status(404).json({ message: "No expenses found for this user." });
    }

    // Respond with the user's expense details and the total amount they owe.
    res.status(200).json({ expenses, totalAmountToPay });
  } catch (error) {
    // Handle errors during balance sheet retrieval.
    res.status(500).json({ error: "Error retrieving user expenses" });
  }
};

// Controller to download the user's balance sheet as a CSV file.
exports.downloadBalanceSheetOfUser = async (req, res) => {
  try {
    // Fetch the user's expenses and total amount to pay.
    const { expenses, totalAmountToPay } = await getUserExpensesAndBalance(req.userId);
    if (expenses.length === 0) {
      return res.status(404).json({ message: "No expenses found for this user." });
    }

    // Add a summary row to display the total amount the user needs to pay.
    expenses.push({
      Description: "Total Amount to Pay",
      UserShare: totalAmountToPay.toFixed(2),
    });

    // Convert the expenses data to CSV format.
    const json2csvParser = new Parser();
    const csv = json2csvParser.parse(expenses);

    // Define the file path for the CSV file.
    const filePath = path.join(__dirname, "balance_sheet.csv");
    // Write the CSV data to a file.
    fs.writeFileSync(filePath, csv);

    // Send the file as a downloadable response.
    res.download(filePath, "balance_sheet.csv", (err) => {
      if (err) {
        // Handle errors during the download process.
        res.status(500).json({ error: "Error downloading the balance sheet" });
      }
    });
  } catch (error) {
    // Handle errors during balance sheet generation.
    res.status(500).json({ error: "Error generating balance sheet" });
  }
};
