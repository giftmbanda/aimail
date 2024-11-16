const gpt3Service = require('../services/gpt3Service');

// Generate an email draft
exports.generateEmailDraft = async (req, res) => {
    const { prompt } = req.body;

    try {
        const draft = await gpt3Service.generateEmailDraft(prompt);
        res.json({ draft });
    } catch (error) {
        res.status(500).json({ message: 'Error generating draft', error });
    }
};

// Proofread an email draft
exports.proofreadEmail = async (req, res) => {
    const { emailContent } = req.body;

    try {
        const proofreadResult = await gpt3Service.proofreadEmail(emailContent);
        res.json({ proofreadResult });
    } catch (error) {
        res.status(500).json({ message: 'Error proofreading email', error });
    }
};

// Identify sensitive data in an email
exports.identifySensitiveData = async (req, res) => {
    const { emailContent, emailAddress } = req.body;

    try {
        const sensitiveDataFound = await gpt3Service.analyzeSensitiveData(emailContent, emailAddress);
        res.json({ sensitiveDataFound });
    } catch (error) {
        res.status(500).json({ message: 'Error identifying sensitive data', error });
    }
};
