const express = require('express');
const router = express.Router();
const db = require('../db');

// Leaderboard Page
router.get('/leaderboard', async (req, res) => {
  try {
    // Optimized query: count auction wins per user (assumes winner’s bid equals current_bid)
    const leaderboardQuery = `
      SELECT u.name, COUNT(*) as wins
      FROM auctions a
      JOIN bids b ON a.id = b.auction_id AND b.bid_amount = a.current_bid
      JOIN users u ON b.user_id = u.id
      WHERE a.status IN ('closed', 'completed')
      GROUP BY u.name
      ORDER BY wins DESC
    `;
    const { rows } = await db.query(leaderboardQuery);
    res.render('leaderboard', { leaderboard: rows });
  } catch (err) {
    console.error(err);
    res.send("Error loading leaderboard");
  }
});

module.exports = router;
