const fetch = require('node-fetch');

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { text } = JSON.parse(event.body);

    if (!text) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Text is required' })
        };
    }

    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'x-API-key': process.env.ANTHROPIC_API_KEY, // Use env variable
                'content-type': 'application/json',
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-sonnet-20240229',
                max_tokens: 1000,
                messages: [{
                    role: 'user',
                    content: `I have this text: "${text}". Can you simplify it so that it's easier to understand for a general audience? Please provide only the simplified text, without any explanation or additional words.`
                }]
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'API request failed');
        }

        const data = await response.json();
        const simplifiedText = data.content[0].text.trim();

        return {
            statusCode: 200,
            body: JSON.stringify({ simplifiedText })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};