const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const verifyToken = require("../middleware");

router.post("/signup", authController.signUp);
router.post("/login", authController.login);
router.get("/verifyToken", authController.verify);
router.get("/check-premium", verifyToken, authController.checkPremiumStatus);

module.exports = router;


