require('dotenv').config();
const express = require('express');
const cors = require('cors'); // Add this
const axios = require('axios');

const app = express();
app.use(cors()); // Enable CORS
app.use(express.json());

app.post('/api/chat', async (req, res) => {
    try {
        const response = await axios.post(
            "https://api.cohere.ai/v1/chat",
            {
                message: req.body.message,
                model: "command-nightly",
                temperature: 0.7
            },
            {
                headers: {
                    "Authorization": `Bearer ${process.env.COHERE_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );
        res.json({ response: response.data.text });
    } catch (error) {
        console.error("Cohere API Error:", error.response?.data || error.message);
        res.status(500).json({ 
            error: "AI service error",
            details: error.response?.data || error.message 
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));