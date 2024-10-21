const express = require("express");
const {
  addExpense,
  getOverallExpenses,
  getBalanceSheet,
  downloadBalanceSheetOfUser,
} = require("../controllers/expenseController");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

router.post("/", authenticate, addExpense);
router.get("/", getOverallExpenses);
router.get("/balance-sheet", authenticate, getBalanceSheet);
router.get("/balance-sheet/download", authenticate, downloadBalanceSheetOfUser);

module.exports = router;
