const express = require('express');
const router = express.Router();
const flowResolver = require('./flowResolver');

// POST /accessibility/test
router.post('/test', async (req, res) => {
    try {
        const flowConfig = req.body;

        // Basic payload validation
        if (!flowConfig || typeof flowConfig !== 'object') {
            console.warn('[MCP] Missing or invalid flow payload');
            return res.status(400).json({ error: 'Flow JSON payload is required' });
        }

        const { url, steps, profile, isLastFlow } = flowConfig;
        if (!url || !Array.isArray(steps)) {
            console.warn('[MCP] Invalid flow structure:', flowConfig);
            return res.status(400).json({ error: 'Invalid flow structure: missing url or steps[]' });
        }

        // Inject fallback name if missing
        flowConfig.name = flowConfig.name || `Accessibility Scan: ${new URL(url).hostname}`;
        const lastFlowFlag = !!isLastFlow;  // ensure boolean

        console.log(`[MCP] Executing flow for URL: ${url}`);
        console.log(`[MCP] Profile: ${profile || 'quick'}, Steps: ${steps.length}, Name: ${flowConfig.name}`);
        console.log(`[MCP] isLastFlow: ${lastFlowFlag}`);
        if (lastFlowFlag) {
            console.log('[MCP] This is the final stage of the multi-page flow.');
        }

        // Pass isLastFlow to flowResolver
        const result = await flowResolver(flowConfig, lastFlowFlag);

        // Send the accessibility results
        res.json(result);
    } catch (error) {
        console.error('[MCP] Error in /test route:', error.message);
        res.status(500).json({
            error: 'Flow resolution failed',
            details: error.message
        });
    }
});

module.exports = router;