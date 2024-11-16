const { google } = require('googleapis');
require('dotenv').config();



// Function to send email
const sendEmail = async (refreshToken, to, subject, message) => {
    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        'http://localhost:3000/auth/google/callback' // redirect URL
    );

    // Set credentials using the stored refresh token
    oauth2Client.setCredentials({ refresh_token: refreshToken });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    const email = [
        `To: ${to}`,
        `Subject: ${subject}`,
        '',
        message,
    ].join('\n');

    const base64EncodedEmail = Buffer.from(email).toString('base64').replace(/=/g, '');

    await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
            raw: base64EncodedEmail,
        },
    });
};

// Function to fetch emails
const fetchEmails = async (refreshToken, label = undefined, maxResults = 20) => {
    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        'http://localhost:3000/auth/google/callback' // redirect URL
    );

    // Set credentials using the stored refresh token
    oauth2Client.setCredentials({ refresh_token: refreshToken });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    try {
        // Fetch messages with or without the label filter
        const response = await gmail.users.messages.list({
            userId: 'me',
            maxResults, // Number of emails to retrieve
            labelIds: label ? [label] : undefined, // Apply label filter only if provided
        });

        const messages = response.data.messages || [];
        const emailPromises = messages.map(async (message) => {
            const emailResponse = await gmail.users.messages.get({
                userId: 'me',
                id: message.id,
            });
            return emailResponse.data;
        });

        const emails = await Promise.all(emailPromises);
        return emails;
    } catch (error) {
        throw new Error('Error fetching emails: ' + error.message);
    }
};

// Function to fetch sent email count
const fetchSentEmailsCount = async (refreshToken) => {
    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        'http://localhost:3000/auth/google/callback' // redirect URL
    );

    // Set credentials using the stored refresh token
    oauth2Client.setCredentials({ refresh_token: refreshToken });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    try {
        const sentResult = await gmail.users.messages.list({
            userId: 'me',
            labelIds: ['SENT'],
            maxResults: 10 // Only get the total count, not individual messages
        });

        const sentCount = sentResult.data.resultSizeEstimate;
        return sentCount;
    } catch (error) {
        throw new Error('Error counting sent emails: ' + error.message);
    }
};

// Function to fetch received email count
const fetchReceivedEmailsCount = async (refreshToken) => {
    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        'http://localhost:3000/auth/google/callback' // redirect URL
    );

    // Set credentials using the stored refresh token
    oauth2Client.setCredentials({ refresh_token: refreshToken });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    try {
        const inboxResult = await gmail.users.messages.list({
            userId: 'me',
            labelIds: ['INBOX'],
            maxResults: 1 // Only get the total count, not individual messages
        });

        const inboxCount = inboxResult.data.resultSizeEstimate;
        return inboxCount;
    } catch (error) {
        throw new Error('Error counting received emails:: ' + error.message);
    }
};

module.exports = { sendEmail, fetchEmails, fetchSentEmailsCount, fetchReceivedEmailsCount };