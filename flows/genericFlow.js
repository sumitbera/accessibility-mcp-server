const basicActions = require('../flows/actions/basicActions');
const extendedActions = require('../flows/actions/extendedActions');
const axeRunner = require('../engines/axeRunner');

const allActions = { ...basicActions, ...extendedActions };

/**
 * Executes steps on a given Playwright page, including accessibility scans.
 * @param {Object} params
 * @param {import('playwright').Page} params.page - Existing Playwright page instance.
 * @param {Array} params.steps - Array of step objects (action, selector, value).
 * @param {string} params.name - Name of the page/flow for reporting.
 * @param {string} [params.profile='quick'] - Accessibility profile.
 * @returns {Promise<Object>} Accessibility scan results (if scan was executed).
 */
module.exports = async ({ page, steps, name, profile = 'quick' }) => {
  if (!page) {
    throw new Error('[MCP] No Playwright page instance provided to genericFlow.');
  }

  console.log(`[MCP] Starting execution for flow: ${name}`);
  let lastScanResults = null;

  for (const step of steps) {
    if (step.action === 'scan') {
      console.log(`[MCP] Running accessibility scan on: ${name} (Profile: ${profile})`);
      lastScanResults = await axeRunner(page, profile);
      continue;
    }

    const action = allActions[step.action];
    if (!action) {
      console.warn(`[MCP] Unsupported action: ${step.action}`);
      continue;
    }

    try {
      console.log(`[MCP] Executing step: ${step.action} ${step.selector || step.value || ''}`);
      await action(page, step);
    } catch (err) {
      console.error(`[MCP] Step failed ${JSON.stringify(step)} → ${err.message}`);
      throw err;
    }
  }

  // Return last scan results (if any)
  return lastScanResults || { violations: [], jsonReportPath: null, baseReportPath: null };
};