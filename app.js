require("dotenv").config();
const express = require("express");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const bodyParser = require("body-parser");
const loginRoutes = require("./routes/loginRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const razorpayRoutes = require("./routes/razorpayRoutes");
const leaderboardRoutes = require("./routes/leaderboardRoutes");
const forgotPasswordRoutes = require("./routes/forgotPasswordRoutes");
const reportRoutes = require("./routes/reportRoutes");
const ForgotPassword = require("./models/forgotpassword");
const sequelize = require("./util/database");
const expenses = require("./models/expense");
const users = require("./models/user");
const helmet = require("helmet");
const morgan = require("morgan");
const app = express();

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" }
);

app.use(cors());
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      "script-src": [
        "'self'",
        "https://cdn.jsdelivr.net",
        "https://browser.sentry-cdn.com",
        "https://checkout.razorpay.com",
      ],
      "frame-src": ["'self'", "https://api.razorpay.com"],
      "connect-src": ["'self'", "https://lumberjack-cx.razorpay.com"],
    },
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(morgan("combined", { stream: accessLogStream }));

app.use("/", loginRoutes);
app.use("/user", forgotPasswordRoutes);
app.use("/user", expenseRoutes);
app.use("/user", reportRoutes);
app.use("/razorpay", razorpayRoutes);
app.use("/", leaderboardRoutes);

expenses.belongsTo(
  users,
  { foreignKey: "userId" },
  { constraints: true, onDelete: "CASCADE" }
);
users.hasMany(expenses, { foreignKey: "userId" });
users.hasMany(ForgotPassword, { foreignKey: "userId" });
ForgotPassword.belongsTo(users, { foreignKey: "userId" });

sequelize
  .sync({ force: false })
  .then((res) => {
    app.listen(process.env.PORT || 3000);
    console.log(`Server running at http://localhost:${process.env.PORT}/`);
  })
  .catch((err) => console.log(err));
