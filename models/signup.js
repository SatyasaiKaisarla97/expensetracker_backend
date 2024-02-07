const { Sequelize } = require("sequelize");
const sequelize = require("../util/database");

const userDetails = sequelize.define("userdetails", {
  Id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    unique: true,
    autoIncrement: true,
  },
  username: { type: Sequelize.STRING, allowNull: false, unique: true },
  email: { type: Sequelize.STRING, allowNull: false, unique: true },
  password: { type: Sequelize.STRING, allowNull: false },
});

module.exports = userDetails;
