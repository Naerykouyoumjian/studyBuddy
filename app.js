// Import necessary modules
const express = require('express');
const OpenAI = require('openai'); // Import OpenAI package
require('dotenv').config(); // Load environment variables from .env file

// Initialize Express app
const app = express();

// Setup OpenAI Configuration using the latest method
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY // Your API key from the .env file
});

// Middleware to handle JSON requests (optional)
app.use(express.json());

// Test route to check OpenAI API connection
app.get('/test-openai', async (req, res) => {
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo', // Use the correct chat model
            messages: [
                { role: 'system', content: 'You are a helpful assistant.' },
                { role: 'user', content: 'Say hello world!' }
            ],
            max_tokens: 5
        });

        res.send(`OpenAI response: ${response.choices[0].message.content.trim()}`);
    } catch (error) {
        console.error('Error calling OpenAI API:', error.response ? error.response.data : error.message);
        res.status(500).send('Failed to call OpenAI API');
    }
});

// Set up the server to listen on a specific port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
