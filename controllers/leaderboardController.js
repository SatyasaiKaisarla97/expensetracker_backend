const users = require("../models/user");

async function getLeaderboard(req, res) {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;
  try {
    const totalUsers = await users.count(); 
    const leaderboardData = await users.findAll({
      attributes: ["username", "totalExpense"],
      order: [["totalExpense", "DESC"]],
      limit: pageSize,
      offset: (page - 1) * pageSize,
      raw: true,
    });
    res.json({ totalUsers, leaderboardData }); 
  } catch (error) {
    console.error("Error fetching leaderboard data:", error);
    res.status(500).send("Server error");
  }
}

module.exports = {
  getLeaderboard,
};
