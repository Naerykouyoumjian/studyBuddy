const { Configuration, OpenAIApi } = require('openai');

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY, // Replace with your actual API key for testing
});

const openai = new OpenAIApi(configuration);

async function test() {
    try {
        const response = await openai.createCompletion({
            model: 'text-davinci-003', // Or any other model supported by OpenAI
            prompt: 'Hello, how are you?',
            max_tokens: 5,
        });

        console.log('Response:', response.data.choices[0].text);
    } catch (error) {
        console.error('Error:', error);
    }
}

test();
