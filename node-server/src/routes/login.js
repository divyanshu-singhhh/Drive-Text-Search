const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const crypto = require('crypto');
const { createOAuthClient } = require('../helpers/googleClientSetup');
const SCOPES = [
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/contacts.readonly'
];

router.get('/', async (req, res) => {
    try {
        const oauth2Client = createOAuthClient();
        // Generate a secure random state value.
        const state = crypto.randomBytes(32).toString('hex');
        // Store state in the session
        req.session.state = state;
        const authUrl = oauth2Client.generateAuthUrl({
          access_type: 'offline',
          scope: SCOPES,
          state: state
        });
        res.redirect(authUrl); // Redirect to Google for user login
    } catch (error) {
        res.status(500).json({ error: 'An error occurred during login.' });
    }
});

router.get(`/callback`, async (req, res) => {
  const code = req.query.code; 

  try {
    const oauth2Client = createOAuthClient();
    // Exchange the authorization code for an access token
    const { tokens } = await oauth2Client.getToken(code);
    // Save tokens in session
    req.session.tokens = tokens;
    res.redirect('/');
  } catch (error) {
    console.error('Error during authentication:', error);
    res.status(500).send('Authentication failed');
  }
});

router.get('/logout', (req, res) => {
    // Clear the session tokens
    req.session.tokens = null;
    // Destroy the session
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).send('Logout failed');
        }
        // Clear the cookies
        res.clearCookie('connect.sid');
        res.status(200).send({ message: 'Logged out successfully' });
    });
});

module.exports = router; 