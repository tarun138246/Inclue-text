const fetch = require('node-fetch');

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { base64Image, mediaType } = JSON.parse(event.body);

    if (!base64Image || !mediaType) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Image data and media type are required' })
        };
    }

    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'x-API-key': process.env.ANTHROPIC_API_KEY,
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

        return {
            statusCode: 200,
            body: JSON.stringify({ altText })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};