const { Sequelize } = require("sequelize");
const sequelize = require("../util/database");

const ForgotPassword = sequelize.define("forgotPassword", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  token: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  status: {
    type: Sequelize.ENUM,
    values: ["active", "resolved"],
    defaultValue: "active",
  },
});

module.exports = ForgotPassword;
