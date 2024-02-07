const express = require("express");
const router = express.Router();
const Expense = require("../models/expense");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const verifyToken = require("../middleware");

router.use(verifyToken);

router.post("/", async (req, res) => {
  try {
    const id = uuidv4();
    const { expenseAmount, description, category } = req.body;
    const userId = req.user.id;
    const expense = await Expense.create({
      userId,
      id,
      expenseAmount,
      description,
      category,
    });
    res.json(expense);
  } catch (error) {
    console.error(error);
  }
});

router.get("/expenses", async (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "expense.html"));
});

router.get("/", async (req, res) => {
  try {
    const expenses = await Expense.findAll();
    res.json(expenses);
  } catch (error) {
    console.error(error);
  }
});
router.put("/:id", async (req, res) => {
  try {
    const expenseId = req.params.id;
    const { expenseAmount, description, category } = req.body;
    const existingExpense = await Expense.findByPk(expenseId);
    if (existingExpense) {
      await existingExpense.update({ expenseAmount, description, category });
      res.json(existingExpense);
    } else {
      res.json({ message: "Expense not found" });
    }
  } catch (error) {
    console.log(error);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const expenseId = req.params.id;
    const response = await Expense.findByPk(expenseId);
    res.json(response);
  } catch (error) {
    console.error(error);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const expenseId = req.params.id;
    await Expense.findByPk(expenseId).then((expense) => expense.destroy());
    res.json({ message: "expense deleted" });
  } catch (error) {
    console.error(error);
  }
});

module.exports = router;
