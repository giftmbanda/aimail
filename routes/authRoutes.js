const express = require('express');
const passport = require('../config/auth');
const authController = require('../controllers/authController');
const router = express.Router();

// Google OAuth 2.0 authentication route
router.get('/google', passport.authenticate('google', {
    scope: [
        'profile',
        'email',
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/gmail.readonly'
    ],
    accessType: 'offline',
    prompt: 'consent'
}));

// Callback route after Google authentication
router.get('/google/callback', passport.authenticate('google', { failureRedirect: 'http://localhost:3000/' }), authController.loginSuccess);
router.get('/dashboard', authController.dashboard);
router.post('/logout', authController.logout);

module.exports = router;
