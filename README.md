# Real-Time Auction System

This project is a full-stack real-time auction system built with Node.js, PostgreSQL, EJS, WebSockets, and JWT authentication.

## Features

- **User Authentication:** Signup/login with password hashing (bcrypt) and JWT-based sessions.
- **Auction Functionality:** Users can create auctions, view details, and place bids.
- **Real-Time Updates:** Bid updates and auction closures are pushed in real time using Socket.IO.
- **Automated Auction Closure:** Auctions close automatically based on the end time.
- **Leaderboard:** Displays top users based on the number of auctions won.
- **User Profile:** Shows user information and bidding history.

## Technologies Used

- Node.js with Express
- EJS templating
- PostgreSQL (using raw queries)
- Socket.IO for WebSocket communication
- JWT and bcrypt for authentication

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/real-time-auction.git
   cd real-time-auction
