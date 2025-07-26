const basicActions = require('./actions/basicActions');
const extendedActions = require('./actions/extendedActions');
const axeRunner = require('../engines/axeRunner');

const allActions = { ...basicActions, ...extendedActions };

/**
 * Executes the steps using Playwright and runs Axe scans when `scan` step is encountered.
 *
 * @param {Object} params
 * @param {Object} params.page - Playwright page instance.
 * @param {Array} params.steps - Steps to execute.
 * @param {string} params.name - Page name.
 * @param {string} [params.profile] - Accessibility profile.
 * @returns {Promise<{violations: Array, jsonReportPath: string, htmlReportPath: string}>}
 */
module.exports = async ({ page, steps, name = 'Unnamed Page', profile = 'quick' }) => {
  console.log(`[MCP] Starting execution for flow: ${name}`);

  let allViolations = [];
  let lastJsonReport = null;
  let lastHtmlReport = null;

  for (const step of steps) {
    if (step.action === 'scan') {
      console.log(`[MCP] Running accessibility scan on: ${name} (Profile: ${profile})`);
      const results = await axeRunner(page, profile);

      allViolations = allViolations.concat(results.violations || []);
      lastJsonReport = results.jsonReportPath;
      lastHtmlReport = results.htmlReportPath;
      continue;
    }

    const action = allActions[step.action];
    if (!action) {
      console.warn(`[MCP] Unsupported action: ${step.action}`);
      continue;
    }

    try {
      console.log(`[MCP] Executing step: ${step.action} ${step.selector || step.value}`);
      await action(page, step);
    } catch (err) {
      console.error(`[MCP] Step failed ${JSON.stringify(step)} → ${err.message}`);
      throw err;
    }
  }

  return {
    violations: allViolations,
    jsonReportPath: lastJsonReport,
    htmlReportPath: lastHtmlReport
  };
};
