const express = require('express');
const router = express.Router();
const db = require('../db');

// Home page: List all auctions
router.get('/', async (req, res) => {
  try {
    const auctionsQuery = 'SELECT * FROM auctions ORDER BY end_time ASC';
    const { rows: auctions } = await db.query(auctionsQuery);
    res.render('home', { auctions });
  } catch (err) {
    console.error(err);
    res.send("Error loading auctions");
  }
});

module.exports = router;
