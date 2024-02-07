const expenses = require("../models/expense");
const users = require("../models/user");
const { v4: uuidv4 } = require("uuid");
const sequelize = require("../util/database");

async function postExpenses(req, res) {
  const t = await sequelize.transaction();
  try {
    const { expenseAmount, description, category } = req.body;
    const userId = req.user.userId;
    const id = uuidv4();
    const expense = await expenses.create(
      {
        id,
        expenseAmount,
        description,
        category,
        userId,
      },
      { transaction: t }
    );

    const user = await users.findByPk(userId, { transaction: t });
    user.totalExpense =
      (parseFloat(user.totalExpense) || 0) + parseFloat(expenseAmount);
    await user.save({ transaction: t });
    await t.commit();
    res.json(expense);
  } catch (error) {
    await t.rollback();
    console.error(error);
    res.status(500).send("Error in creating expense");
  }
}

async function getExpenses(req, res) {
  try {
    const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
    const pageSize = parseInt(req.query.pageSize) || 10; // Default page size is 10
    const offset = (page - 1) * pageSize;

    const userId = req.user.userId;

    // Fetching the total number of expenses for pagination
    const totalExpenses = await expenses.count({ where: { userId: userId } });
    const totalPages = Math.ceil(totalExpenses / pageSize);

    // Fetching paginated expenses
    const allexpenses = await expenses.findAll({
      where: { userId: userId },
      limit: pageSize,
      offset: offset,
      order: [["createdAt", "DESC"]], // Assuming you might want to order them by date
    });

    res.json({
      expenses: allexpenses,
      totalExpenses,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error in fetching expenses");
  }
}
async function updateExpenses(req, res) {
  const t = await sequelize.transaction();
  try {
    const expenseId = req.params.id;
    const userId = req.user.userId;
    const { expenseAmount, description, category } = req.body;

    const expense = await expenses.findOne({
      where: { id: expenseId, userId: userId },
      transaction: t,
    });

    if (expense) {
      const originalAmount = expense.expenseAmount;
      const difference = expenseAmount - originalAmount;
      await expense.update(
        { expenseAmount, description, category },
        { transaction: t }
      );
      const user = await users.findByPk(userId, { transaction: t });
      if (user) {
        user.totalExpense = parseFloat(user.totalExpense || 0) + difference;
        await user.save({ transaction: t });
      }

      await t.commit();
      res.json(expense);
    } else {
      t.rollback();
      res.status(404).send("Expense not found");
    }
  } catch (error) {
    await t.rollback();
    console.error(error);
    res.status(500).send("Error in updating expense");
  }
}
async function getExpense(req, res) {
  try {
    const expenseId = req.params.id;
    const userId = req.user.userId;
    const expense = await expenses.findOne({
      where: { id: expenseId, userId: userId },
    });

    if (expense) {
      res.json(expense);
    } else {
      t.rollback();
      res.status(404).send("Expense not found");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Error in fetching the expense");
  }
}

async function deleteExpense(req, res) {
  const t = await sequelize.transaction();
  try {
    const expenseId = req.params.id;
    const userId = req.user.userId;

    const expense = await expenses.findOne(
      {
        where: { id: expenseId, userId: userId },
      },
      { transaction: t }
    );

    if (!expense) {
      await t.rollback();
      return res.status(404).send("Expense not found");
    }

    const amountToDelete = expense.expenseAmount;

    await expense.destroy({ transaction: t });

    const user = await users.findByPk(userId, { transaction: t });
    if (!user) throw new Error("User not found");

    user.totalExpense =
      (parseFloat(user.totalExpense) || 0) - parseFloat(amountToDelete);
    await user.save({ transaction: t });

    await t.commit();
    res.json({ message: "Expense deleted" });
  } catch (error) {
    await t.rollback();
    console.error(error);
    res.status(500).send("Error in deleting expense");
  }
}

module.exports = {
  postExpenses,
  getExpenses,
  updateExpenses,
  getExpense,
  deleteExpense,
};
