const { chromium } = require('playwright');
const basicActions = require('../flows/actions/basicActions');
const extendedActions = require('../flows/actions/extendedActions');
const axeRunner = require('../engines/axeRunner');
const { addScanResult } = require('../utils/reportAggregator');

const allActions = { ...basicActions, ...extendedActions };

/**
 * Execute steps using Playwright with accessibility scanning.
 * @param {Object} params
 * @param {string} [params.url] - Page URL for navigation (if starting fresh).
 * @param {Array} params.steps - Steps to perform.
 * @param {string} params.name - Page name for reporting (required).
 * @param {string} [params.profile] - Accessibility profile (default: quick).
 * @param {Object} [params.pageContext] - Existing browser context to reuse.
 */
module.exports = async ({ url, steps, name, profile = 'quick', pageContext }) => {
  if (!name) {
    throw new Error('Flow name is required for reporting.');
  }

  let browser, page;

  if (pageContext) {
    // Reuse existing browser context
    browser = pageContext.browser;
    page = pageContext.page;
    console.log(`[MCP] Reusing browser context for: ${name}`);
  } else {
    // Create a new browser context
    browser = await chromium.launch();
    const context = await browser.newContext();
    page = await context.newPage();

    if (!url) {
      throw new Error('URL is required when no pageContext is provided.');
    }

    console.log(`[MCP] Navigating to ${url}`);
    await page.goto(url);
  }

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