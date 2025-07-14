const promptToFlow = require('./promptToFlow');
const genericFlow = require('../flows/genericFlow');
const axeRunner = require('../engines/axeRunner');

module.exports = async (prompt) => {
    try {
        const flowConfig = await promptToFlow(prompt);
        const { steps, profile, url } = flowConfig;
        if(!steps || !url) throw new Error('Invalid flow strucuture');
    
        const context = await genericFlow({url, steps});
        const results = await axeRunner(context.page, profile);
        await context.browser.close();
        return results;
    } catch (error) {
        console.error('flowResolver failed:', error);
        throw new Error(`Flow execution error: ${error.message}`);

    }
};