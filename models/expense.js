const { DataTypes } = require("sequelize");
const sequelize = require("../util/database");
const users = require("./user");

const expenses = sequelize.define("expenses", {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "users",
      key: "id",
    },
  },
  id: {
    type: DataTypes.UUID,
    defaultValue: () => DataTypes.UUIDV4(),
    primaryKey: true,
    unique: true,
  },
  expenseAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = expenses;
