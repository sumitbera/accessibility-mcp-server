require('dotenv').config();
const express = require('express');
const router = require('./router');

const app = express();
app.use(express.json());
app.use(require('cors')());
app.use('/accessibility', router);

// Fallback route for invalid endpoints
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`MCP Server is up and running at http://localhost:${PORT}`);
});