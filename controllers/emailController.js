const emailService = require('../services/emailService');
const authController = require('./authController');

// Function to send email
exports.sendEmail = async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        await emailService.sendEmail(req.user.refreshToken, req.body.to, req.body.subject, req.body.message);
        res.json({ message: 'Email sent successfully!' });
    } catch (error) {
        authController.handleError(res, error);
    }
};

// Function to fetch emails
exports.fetchEmails = async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        // Extract the optional label from query parameters
        const label = req.query.label || undefined;
        const maxResults = parseInt(req.query.maxResults, 10) || 20; // Default to 20 if not provided or invalid

        // Fetch emails with or without the label filter
        const emails = await emailService.fetchEmails(req.user.refreshToken, label, maxResults);

        // Extract important fields: from, to, subject, body, date, labels
        const importantEmails = emails.map(email => {
            // Extract the labels for the email
            const labels = email.labelIds || [];
            const labelNames = labels.map(label => {
                switch (label) {
                    case 'INBOX':
                        return 'INBOX';
                    case 'SENT':
                        return 'SENT';
                    case 'DRAFT':
                        return 'DRAFT';
                    case 'TRASH':
                        return 'TRASH';
                    default:
                        return label;  // In case there's a label not defined here
                }
            });

            // Extract sender's name from the "From" header
            const fromHeader = email.payload.headers.find(header => header.name === 'From')?.value;
            const senderName = extractSenderName(fromHeader);

            // Extract other important fields
            return {
                senderName: senderName,
                from: decodeEscapedCharacters(email.payload.headers.find(header => header.name === 'From')?.value),
                to: decodeEscapedCharacters(email.payload.headers.find(header => header.name === 'To')?.value),
                date: email.payload.headers.find(header => header.name === 'Date')?.value,
                subject: email.payload.headers.find(header => header.name === 'Subject')?.value || 'No Subject',
                snippet: email.snippet,
                body: extractEmailBody(email),
                labels: labelNames,  // Include the labels in the email data
            };
        });

        res.json(importantEmails);
    } catch (error) {
        authController.handleError(res, error);
    }
};

// Function to fetch sent emails count
exports.fetchSentEmailsCount = async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const sentCount = await emailService.fetchSentEmailsCount(req.user.refreshToken);
        res.json({ sentCount });
    } catch (error) {
        authController.handleError(res, error);
    }
};

// Function to fetch received emails count
exports.fetchReceivedEmailsCount = async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const inboxCount = await emailService.fetchReceivedEmailsCount(req.user.refreshToken);
        res.json({ inboxCount });
    } catch (error) {
        authController.handleError(res, error);
    }
};

// Helper function to decode escaped characters
function decodeEscapedCharacters(text) {
    return text ? text.replace(/\\u003C/g, '<').replace(/\\u003E/g, '>') : text;
}

function extractEmailBody(email) {
    let body = '';

    // Function to decode base64-encoded email content
    const decodeBase64 = (data) => Buffer.from(data, 'base64').toString('utf-8');

    // Helper function to strip HTML tags, CSS, and unwanted characters while preserving new lines
    const cleanText = (text) => {
        // Remove style attributes and HTML tags
        let cleanText = text
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '') // Remove <style> blocks
            .replace(/<[^>]+style="[^"]*"[^>]*>/gi, '<') // Remove inline styles
            .replace(/<\/?[^>]+(>|$)/g, ""); // Remove all other HTML tags

        // Replace excessive spaces with a single space
        cleanText = cleanText.replace(/\s+/g, ' ');

        // Preserve new lines while removing \r characters
        cleanText = cleanText.replace(/\r/g, '').replace(/\n/g, '\n'); // Keep new lines
        return cleanText.trim(); // Trim leading/trailing whitespace
    };

    // Helper function to extract the body recursively in case of nested parts
    const extractFromParts = (parts) => {
        parts.forEach(part => {
            if (part.parts) {
                // Recursively check nested parts
                extractFromParts(part.parts);
            } else if (part.mimeType === 'text/plain' && part.body && part.body.data) {
                // Decode plain text part and clean it
                body += cleanText(decodeBase64(part.body.data)) + '\n'; // Add newline
            } else if (part.mimeType === 'text/html' && part.body && part.body.data) {
                // Decode HTML part, then clean it
                body += cleanText(decodeBase64(part.body.data)) + '\n'; // Add newline
            }
        });
    };

    // Check if email contains 'parts'
    if (email.payload.parts) {
        extractFromParts(email.payload.parts);
    } else if (email.payload.body && email.payload.body.data) {
        body += cleanText(decodeBase64(email.payload.body.data)) + '\n'; // Add newline
    }

    return body.trim() || 'No body content'; // Trim final body content
}

const extractSenderName = (fromHeader) => {
    if (!fromHeader) return 'Unknown Sender';

    // Check if the "From" header has the name part before the email address
    const nameMatch = fromHeader.match(/^(.+?)\s*<.*>$/);
    if (nameMatch && nameMatch[1]) {
        return nameMatch[1].trim();  // Return the name part
    }

    // If no name found, just return the email address or default value
    return fromHeader.split('<')[0].trim() || 'Unknown Sender';
};