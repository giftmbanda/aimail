const express = require('express');
const emailController = require('../controllers/emailController');
const router = express.Router();

router.post('/send', emailController.sendEmail);
router.get('/fetch', emailController.fetchEmails);
router.get('/count-sent', emailController.fetchSentEmailsCount);
router.get('/count-received', emailController.fetchReceivedEmailsCount);

module.exports = router;