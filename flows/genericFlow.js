const { chromium } = require('playwright');
const basicActions = require('../flows/actions/basicActions');
const extendedActions = require('../flows/actions/extendedActions');
const axeRunner = require('../engines/axeRunner');
const { addScanResult } = require('../utils/reportAggregator');

const allActions = { ...basicActions, ...extendedActions };

module.exports = async ({ url, steps, name = 'Unnamed Page', profile = 'quick' }) => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log(`[MCP] Navigating to ${url}`);
  await page.goto(url);

  for (const step of steps) {
    if (step.action === 'scan') {
      console.log(`[MCP] Running accessibility scan on: ${name}`);
      const results = await axeRunner(page, profile);
      addScanResult(name, results);
      continue;
    }

    const action = allActions[step.action];
    if (!action) {
      console.warn(`[MCP] Unsupported action: ${step.action}`);
      continue;
    }
    try {
      console.log(`[MCP] Executing: ${step.action} ${step.selector || step.value}`);
      await action(page, step);
    } catch (err) {
      console.error(`[MCP] Step failed ${JSON.stringify(step)} → ${err.message}`);
      throw err;
    }
  }

  return { browser, page };
};