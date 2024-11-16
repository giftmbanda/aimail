const express = require('express');
const gpt3Controller = require('../controllers/gpt3Controller');
const router = express.Router();

router.post('/generate-draft', gpt3Controller.generateEmailDraft);
router.post('/proofread', gpt3Controller.proofreadEmail);
router.post('/identify-sensitive-data', gpt3Controller.identifySensitiveData);

module.exports = router;
