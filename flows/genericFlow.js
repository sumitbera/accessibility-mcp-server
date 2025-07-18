const { chromium } = require('playwright');
const basicActions = require('./actions/basicActions');
const extendedActions = require('./actions/extendedActions');

// Merge all actions
const supportedActions = { ...basicActions, ...extendedActions };

module.exports = async ({ url, steps }) => {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    console.log(`[MCP] Navigating to ${url}`);
    await page.goto(url);

    for (const step of steps) {
        const action = supportedActions[step.action];
        if (!action) {
            console.warn(`[MCP] Unsupported action: ${step.action}`);
            continue;
        }
        try {
            console.log(`[MCP] Executing: ${step.action} ${step.selector || step.value}`);
            await action(page, step);
        } catch (err) {
            console.error(`[MCP] Step failed ${JSON.stringify(step)} → ${err.message}`);
            throw err; // Stop execution on failure
        }
    }

    return { browser, page };
};
