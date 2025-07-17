const express = require('express');
const router = express.Router();

const resolveFlow = require('./flowResolver');
const runAxe = require('../engines/axeRunner');

router.post('/test', async (req, res) => {
  const { url, profile = 'quick', steps } = req.body;

  // Validate input
  if (!url || !Array.isArray(steps)) {
    return res.status(400).json({ error: 'Invalid flow structure' });
  }

  try {
    console.log(`[MCP] Flow received: ${url}, profile=${profile}`);
    
    const { page, browser } = await resolveFlow({ url, steps });

    const result = await runAxe(page, profile);

    await browser.close();

    res.json(result);
  } catch (error) {
    console.error('[MCP] Flow execution error:', error);
    res.status(500).json({ error: 'Flow resolution failed', details: error.message });
  }
});

module.exports = router;