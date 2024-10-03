const axios = require('axios');
require('dotenv').config(); // Load environment variables

async function testOpenAI() {
    try {
        const response = await axios.post('https://api.openai.com/v1/completions', {
            model: 'gpt-3.5-turbo',
            prompt: 'Say hello world!',
            max_tokens: 5,
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            }
        });
        console.log('OpenAI response:', response.data.choices[0].text.trim());
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testOpenAI();
