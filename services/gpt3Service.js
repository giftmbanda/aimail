
const SensitiveData = require('../models/SensitiveData');
const { OpenAI } = require('openai');
require('dotenv').config();

// Set up OpenAI configuration
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Generate email draft using GPT-3
const generateEmailDraft = async (prompt) => {
    try {
        const prompt = `Draft a professional email based on the following input or request: \n\n"${prompt}"`;

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'system', content: 'You are a helpful assistant.' }, { role: 'user', content: prompt }],
            max_tokens: 200,
        });
        return response.choices[0].message.content.trim();
    } catch (error) {
        console.error('Error generating email draft:', error);
        throw error;
    }
};

// Proofread email content
const proofreadEmail = async (emailContent) => {
    try {
        const prompt = `Proofread the following email or text for grammar and clarity: \n\n"${emailContent}"`;

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'system', content: 'You are a professional editor.' }, { role: 'user', content: prompt }],
            max_tokens: 200,
        });
        return response.choices[0].message.content.trim();
    } catch (error) {
        console.error('Error proofreading email:', error);
        throw error;
    }
};

// Identify sensitive data (already defined in a previous step)
const analyzeSensitiveData = async (emailContent, emailAddress) => {
    try {
        const prompt = `Identify any sensitive information in the following email or text: \n\n"${emailContent}"`;

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'system', content: 'You are a security expert.' }, { role: 'user', content: prompt }],
            max_tokens: 200,
        });

        // const sensitiveDataFound = response.choices[0].message.content;

        // if (sensitiveDataFound) {
        //     const sensitiveDataEntry = new SensitiveData({
        //         email: emailAddress,
        //         sensitiveData: sensitiveDataFound.split('\n') // Store each line as a separate entry in the array
        //     });
        //     await sensitiveDataEntry.save();
        //     console.log('Sensitive data saved to the database');
        // }

        // return sensitiveDataFound;
        //return response;
        const res = response.choices[0].message.content;
        return res;

    } catch (error) {
        console.error('Error identifying sensitive data:', error);
        throw error;
    }
};


module.exports = {
    generateEmailDraft,
    proofreadEmail,
    analyzeSensitiveData,
};
