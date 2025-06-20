require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// OpenAI API endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful AI assistant created by Dinusha Deshan. Provide accurate, concise and helpful responses."
                },
                {
                    role: "user",
                    content: req.body.message
                }
            ],
            temperature: 0.7
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        res.json({ response: response.data.choices[0].message.content });
    } catch (error) {
        console.error('OpenAI API error:', error.response?.data || error.message);
        res.status(500).json({ 
            error: "Error processing your request",
            details: error.response?.data || error.message 
        });
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`OpenAI API key: ${process.env.OPENAI_API_KEY ? 'Loaded' : 'Missing'}`);
});