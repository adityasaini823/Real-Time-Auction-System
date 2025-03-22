const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

// Profile Page
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    // Get user info
    const userQuery = 'SELECT id, name, email FROM users WHERE id = $1';
    const userResult = await db.query(userQuery, [userId]);
    const user = userResult.rows[0];
    
    // Get bidding history
    const bidsQuery = `
      SELECT b.*, a.title as auction_title 
      FROM bids b 
      JOIN auctions a ON b.auction_id = a.id 
      WHERE b.user_id = $1
      ORDER BY b.bid_time DESC
    `;
    const bidsResult = await db.query(bidsQuery, [userId]);
    const bids = bidsResult.rows;
    res.render('profile', { user, bids });
  } catch (err) {
    console.error(err);
    res.send("Error loading profile");
  }
});

module.exports = router;
