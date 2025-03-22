const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
require('dotenv').config();

// GET Signup
router.get('/signup', (req, res) => {
  res.render('signup', { error: null });
});

// POST Signup
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const insertQuery = 'INSERT INTO users (name, email, password) VALUES ($1, $2, $3)';
    await db.query(insertQuery, [name, email, hashedPassword]);
    res.redirect('/login');
  } catch (err) {
    console.error(err);
    res.render('signup', { error: 'Error signing up. Email might already be in use.' });
  }
});

// GET Login
router.get('/login', (req, res) => {
  res.render('login', { error: null });
});

// POST Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const userQuery = 'SELECT * FROM users WHERE email = $1';
    const { rows } = await db.query(userQuery, [email]);
    if (rows.length === 0) {
      return res.render('login', { error: 'Invalid email or password.' });
    }
    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.render('login', { error: 'Invalid email or password.' });
    }
    const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, process.env.JWT_SECRET);
    res.cookie('token', token, { httpOnly: true });
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.render('login', { error: 'An error occurred during login.' });
  }
});

// GET Logout
router.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/login');
});

module.exports = router;
