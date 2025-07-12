const express = require('express');
const router = express.Router();
const resolverFlow = require('./flowResolver');

router.post('/test', async (req, res) => {
    const prompt = req.body?.prompt;
    if (!prompt || typeof prompt !== 'string') {
        return res.status(400).json({ error: 'Prompt is required as a string' });
    }

    try {
        const result = await resolverFlow(prompt);
        res.status(200).json(result);
    } catch (err) {
        console.error('Error processing request:', err.message);
        res.status(500).json({ error: 'Flow resolution failed', details: err.message });
    }
});

module.exports = router;