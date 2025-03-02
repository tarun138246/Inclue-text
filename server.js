// server.js
const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = 3000;
const API_KEY = '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'; // Replace with your Anthropic API key

app.use(express.json({ limit: '10mb' })); // Increase limit for base64 image data
app.use(express.static(path.join(__dirname)));

app.post('/generate-alt', async (req, res) => {
    const { base64Image, mediaType } = req.body;

    if (!base64Image || !mediaType) {
        return res.status(400).json({ error: 'Image data and media type are required' });
    }

    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'x-API-key': API_KEY,
                'content-type': 'application/json',
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-sonnet-20240229',
                max_tokens: 1024,
                messages: [{
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: 'Please generate a detailed, descriptive ALT text for this image that would be helpful for someone who cannot see it. The ALT text should be comprehensive and describe the key elements of the image in order of importance. Keep it under 125 characters if possible, but use more if needed for complex images.'
                        },
                        {
                            type: 'image',
                            source: {
                                type: 'base64',
                                media_type: mediaType,
                                data: base64Image
                            }
                        }
                    ]
                }]
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'API request failed');
        }

        const data = await response.json();
        const altText = data.content[0].text.trim();
        res.json({ altText });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/simplify', async (req, res) => {
    const { text } = req.body;

    if (!text) {
        return res.status(400).json({ error: 'Text is required' });
    }

    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'x-API-key': API_KEY,
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
        res.json({ simplifiedText });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});