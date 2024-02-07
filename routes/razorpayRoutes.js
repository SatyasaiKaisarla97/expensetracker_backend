const express = require("express");
const razorpayController = require("../controllers/razorpayController");
const router = express.Router();
const verifyToken = require("../middleware");
router.use(verifyToken);


router.post("/create-order", razorpayController.createOrder);
router.post("/verify-payment", razorpayController.verifyPayment);

module.exports = router;
