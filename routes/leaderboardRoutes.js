const express = require("express");
const router = express.Router();
const leaderboardController = require("../controllers/leaderboardController");
const verifyToken = require("../middleware");

router.get("/leaderboard", verifyToken, leaderboardController.getLeaderboard);

module.exports = router;
