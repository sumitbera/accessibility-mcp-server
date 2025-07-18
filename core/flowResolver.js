const genericFlow = require('../flows/genericFlow');
const axeRunner = require('../engines/axeRunner');

module.exports = async (flowConfig) => {
    try {
        const { steps, profile, url } = flowConfig;

        // Fallback to 'quick' only if profile is missing
        const finalProfile = profile || 'quick';

        if (!steps || !url) {
            throw new Error('Invalid flow structure: missing url or steps[]');
        }

        console.log(`[FlowResolver] Running flow for URL: ${url} with profile: ${finalProfile}`);

        // Execute generic Playwright flow
        const context = await genericFlow({ url, steps });

        // Run accessibility checks with the selected profile
        const results = await axeRunner(context.page, finalProfile);

        // Close the browser
        await context.browser.close();

        return results;
    } catch (error) {
        console.error('flowResolver failed:', error);
        throw new Error(`Flow execution error: ${error.message}`);
    }
};
