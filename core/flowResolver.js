const { chromium } = require('playwright');
const genericFlow = require('../flows/genericFlow');

let browserInstance = null;
let contextInstance = null;
let pageInstance = null;

/**
 * Resolves and executes a flow configuration using Playwright and Axe.
 *
 * @param {Object} flowConfig - The test flow config (url, steps, profile, etc.)
 * @param {boolean} [isLastFlow=true] - Whether this is the last flow (to close browser)
 */
module.exports = async (flowConfig, isLastFlow = true) => {
  try {
    const { steps, profile = 'quick', url, name } = flowConfig;
    if (!steps || !url) {
      throw new Error('Invalid flow structure: Missing steps or URL');
    }

    console.log(`[MCP] Executing flow for: ${name || 'Unnamed Page'}`);
    console.log(`[MCP] Profile: ${profile}`);

    // Launch browser if not already running
    if (!browserInstance) {
      browserInstance = await chromium.launch();
      contextInstance = await browserInstance.newContext();
      pageInstance = await contextInstance.newPage();
      console.log(`[MCP] Starting browser session at ${url}`);
    }

    // Always navigate to the given URL for this flow
    await pageInstance.goto(url);

    // Execute the generic flow (includes scan steps internally)
    const { jsonReportPath, baseReportPath, violations } = await genericFlow({
      page: pageInstance,
      steps,
      name: name || 'Unnamed Page',
      profile
    });

    // Close the browser if this is the last flow
    if (isLastFlow) {
      console.log('[MCP] Closing browser session.');
      await browserInstance.close();
      browserInstance = null;
      contextInstance = null;
      pageInstance = null;
    }

    return {
      name: name || 'Unnamed Page',
      profile,
      totalViolations: violations.length,
      summary: violations.map(v => ({
        id: v.id,
        impact: v.impact,
        description: v.description,
        help: v.help,
        nodes: v.nodes.map(n => n.target).flat()
      })),
      jsonReportPath,
      htmlReportPath: baseReportPath
    };
  } catch (error) {
    console.error('flowResolver failed:', error);
    throw new Error(`Flow execution error: ${error.message}`);
  }
};