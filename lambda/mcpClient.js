const axios = require('axios');
require('dotenv').config();

const MCP_SERVER_URL = process.env.MCP_SERVER_URL || 'http://localhost:3000/accessibility/test';

/**
 * Calls the MCP server with flow configuration.
 * @param {Object} flow - The flow object containing steps, profile, etc.
 * @param {boolean} isLastFlow - Indicates if this is the final flow (used for closing browser).
 * @returns {Promise<Object>} - Response from the MCP server.
 */
async function callMCP(flow, isLastFlow = false) {
  try {
    const payload = {
      ...flow,
      isLastFlow // pass flag to server
    };

    const response = await axios.post(MCP_SERVER_URL, payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 300000 // 5 mins, in case of long flows
    });

    return response.data;
  } catch (error) {
    console.error('Error calling MCP server:', error.response?.data || error.message);
    throw new Error('Failed to reach MCP server');
  }
}

module.exports = { callMCP };
