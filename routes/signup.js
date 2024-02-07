const express = require("express");
const router = express();
const loginController = require("../controllers/signup");

router.get("/signup", loginController.userSignUp);

router.get("/login", loginController.userLogin);

router.post("/login", loginController.loginUser);

router.post("/signup", loginController.signupUser);

module.exports = router;
