const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config();
const db = require('./db');
const jwt = require('jsonwebtoken');

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use((req, res, next) => {
  const token = req.cookies.token;
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (!err) {
        req.user = user;
        res.locals.user = user;
      }
      next();
    });
  } else {
    next();
  }
});

// Routes
const authRoutes = require('./routes/auth');
const auctionRoutes = require('./routes/auction');
const indexRoutes = require('./routes/index');
const leaderboardRoutes = require('./routes/leaderboard');
const profileRoutes = require('./routes/profile');

app.use('/', indexRoutes);
app.use('/', authRoutes);
app.use('/auction', auctionRoutes);
app.use('/', leaderboardRoutes);
app.use('/', profileRoutes);


app.set('io', io);


io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('newBid', (data) => {
    io.emit('bidUpdate', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});
// use database triggers for better handling the auctions
setInterval(async () => {
  try {
    const now = new Date();
    const queryText = `UPDATE auctions SET status='closed' WHERE end_time <= $1 AND status = 'ongoing' RETURNING id,title`;
    const result = await db.query(queryText, [now]);
    if (result.rows.length > 0) {
      result.rows.forEach((auction) => {
        // console.log(auction);
        io.emit('auctionClosed', { auctionId: auction.id, auctionTitle:auction.title });
      });
      console.log(`Closed auctions: ${result.rows.map(a => a.id).join(', ')}`);
    }
  } catch (err) {
    console.error("Error closing auctions:", err);
  }
}, 30000);

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
