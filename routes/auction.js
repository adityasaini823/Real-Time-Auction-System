const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

// Auction Details Page
router.get('/:id', async (req, res) => {
  const auctionId = req.params.id;
  try {
    const auctionQuery = 'SELECT * FROM auctions WHERE id = $1';
    const bidsQuery = 'SELECT b.*, u.name FROM bids b JOIN users u ON b.user_id = u.id WHERE auction_id = $1 ORDER BY bid_amount DESC';
    const auctionResult = await db.query(auctionQuery, [auctionId]);
    if (auctionResult.rows.length === 0) {
      return res.send("Auction not found");
    }
    const auction = auctionResult.rows[0];
    const bidsResult = await db.query(bidsQuery, [auctionId]);
    const bids = bidsResult.rows;
    res.render('auction_details', { auction, bids });
  } catch (err) {
    console.error(err);
    res.send("Error loading auction details");
  }
});

// Place a Bid
router.post('/:id/bid', authenticateToken, async (req, res) => {
  const auctionId = req.params.id;
  const { bidAmount } = req.body;
  const userId = req.user.id;
  try {
    // Check auction details
    const auctionQuery = 'SELECT * FROM auctions WHERE id = $1';
    const auctionResult = await db.query(auctionQuery, [auctionId]);
    if (auctionResult.rows.length === 0) {
      return res.send("Auction not found");
    }
    const auction = auctionResult.rows[0];
    const now = new Date();
    if (new Date(auction.end_time) <= now || auction.status === 'closed') {
      return res.send("Auction has ended");
    }
    // Validate bid amount
    let currentBid = auction.current_bid || auction.start_price;
    if (parseFloat(bidAmount) <= parseFloat(currentBid)) {
      return res.send("Bid must be higher than the current bid");
    }
    // Insert new bid
    const insertBidQuery = 'INSERT INTO bids (auction_id, user_id, bid_amount, bid_time) VALUES ($1, $2, $3, NOW())';
    await db.query(insertBidQuery, [auctionId, userId, bidAmount]);
    // Update auction's current bid
    const updateAuctionQuery = 'UPDATE auctions SET current_bid = $1 WHERE id = $2';
    await db.query(updateAuctionQuery, [bidAmount, auctionId]);
    
    // Emit socket event for new bid
    req.app.get('io').emit('bidUpdate', { auctionId, bidAmount, user: req.user.name });
    
    res.redirect('/auction/' + auctionId);
  } catch (err) {
    console.error(err);
    res.send("Error placing bid");
  }
});

// Create Auction Page
router.get('/create/new', authenticateToken, (req, res) => {
  res.render('create_auction', { error: null });
});

// Create Auction (POST)
router.post('/create', authenticateToken, async (req, res) => {
  const { title, description, start_price, end_time } = req.body;
  const userId = req.user.id;
  try {
    const insertAuctionQuery = 'INSERT INTO auctions (title, description, start_price, current_bid, end_time, created_by, status) VALUES ($1, $2, $3, $3, $4, $5, $6)';
    await db.query(insertAuctionQuery, [title, description, start_price, end_time, userId, 'ongoing']);
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.render('create_auction', { error: 'Error creating auction' });
  }
});

module.exports = router;
