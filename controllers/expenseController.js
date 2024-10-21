const Expense = require("../models/expence");
const { Parser } = require("json2csv");
const fs = require("fs");
const path = require("path");

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

exports.addExpense = async (req, res) => {
  const { amount, description, splitType, participants } = req.body;

  try {
    let updatedParticipants = participants;

    if (splitType === "equal" && participants.length > 0) {
      const equalShare = amount / participants.length;
      updatedParticipants = participants.map((participant) => ({
        ...participant,
        share: equalShare,
      }));
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
};

exports.getOverallExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find();
    const totalExpenses = expenses.reduce((acc, exp) => acc + exp.amount, 0);
    res.json({ "Overall expenses": totalExpenses });
  } catch (error) {
    res.status(500).json({ error: "Error retrieving expenses" });
  }
};

exports.getBalanceSheet = async (req, res) => {
  try {
    const { expenses, totalAmountToPay } = await getUserExpensesAndBalance(req.userId);
    if (expenses.length === 0) {
      return res.status(404).json({ message: "No expenses found for this user." });
    }

    res.status(200).json({ expenses, totalAmountToPay });
  } catch (error) {
    res.status(500).json({ error: "Error retrieving user expenses" });
  }
};

exports.downloadBalanceSheetOfUser = async (req, res) => {
  try {
    const { expenses, totalAmountToPay } = await getUserExpensesAndBalance(req.userId);
    if (expenses.length === 0) {
      return res.status(404).json({ message: "No expenses found for this user." });
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
};
