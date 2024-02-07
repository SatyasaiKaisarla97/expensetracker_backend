const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware");
const expenseController = require("../controllers/expenseController");
router.use(verifyToken);

router.post("/expense", expenseController.postExpenses);
router.get("/expense", expenseController.getExpenses);
router.put("/expense/:id", expenseController.updateExpenses);
router.get("/expense/:id", expenseController.getExpense);
router.delete("/expense/:id", expenseController.deleteExpense);

module.exports = router;
