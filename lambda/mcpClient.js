const axios = require('axios');
require('dotenv').config();

const MCP_BASE_URL = process.env.MCP_SERVER_URL || 'http://localhost:3000';

async function callMCP(flow) {
    try {
        const res = await axios.post(`${MCP_BASE_URL}/test`, flow);
        return res.data;
    } catch (error) {
        console.error('Error calling MCP server:', error.message);
        throw new Error('Failed to reach MCP server');
    }

}

module.exports = { callMCP };