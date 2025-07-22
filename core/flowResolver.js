const genericFlow = require('../flows/genericFlow');
const axeRunner = require('../engines/axeRunner');

let sharedBrowserContext = null; // Persist browser and page across flows

/**
 * Executes a single flow, with optional context reuse.
 * @param {Object} flowConfig - The flow configuration (name, url, steps, profile).
 * @param {boolean} isLastFlow - Indicates if this is the final flow in the sequence.
 * @returns {Object} Accessibility results from the flow.
 */
module.exports = async (flowConfig, isLastFlow = false) => {
  try {
    const { steps, profile = 'quick', url, name } = flowConfig;

    if (!steps || !Array.isArray(steps)) {
      throw new Error('Invalid flow structure: steps array is missing.');
    }
    if (!name) {
      throw new Error('Flow name is required for reporting.');
    }

    let context;

    if (url) {
      // Start a new browser context if a URL is provided (first flow)
      context = await genericFlow({ url, steps, name, profile });
      sharedBrowserContext = context;
    } else {
      if (!sharedBrowserContext) {
        throw new Error('No browser context available. The first flow must include a URL.');
      }
      // Continue using the existing browser context
      console.log(`[MCP] Continuing flow on existing page: ${name}`);
      context = sharedBrowserContext;
      await genericFlow({
        steps,
        name,
        profile,
        pageContext: sharedBrowserContext
      });
    }

    // No need to call axeRunner here — it's invoked via 'scan' step inside genericFlow.

    // Close browser only if this is the last flow
    if (isLastFlow && sharedBrowserContext) {
      console.log('[MCP] Closing browser after final flow.');
      await sharedBrowserContext.browser.close();
      sharedBrowserContext = null;
    }

    return { success: true, name };
  } catch (error) {
    console.error('flowResolver failed:', error);
    throw new Error(`Flow execution error: ${error.message}`);
  }
};