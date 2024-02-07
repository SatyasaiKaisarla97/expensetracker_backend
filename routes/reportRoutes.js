const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware");
const reportController = require("../controllers/reportController");
router.use(verifyToken);

router.get("/generate-expense-report", reportController.generateExpenseReport);

module.exports = router;
