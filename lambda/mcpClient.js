const axios = require('axios');
require('dotenv').config();

const MCP_URL = process.env.MCP_SERVER_URL || 'http://localhost:3000/accessibility/test';

async function callMCP(flow) {
    try {
        const res = await axios.post(MCP_URL, flow, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return res.data;
    } catch (error) {
        console.error('Error calling MCP server:', error.response?.data || error.message);
        throw new Error('Failed to reach MCP server');
    }

}

module.exports = { callMCP };