const genericFlow = require('../flows/genericFlow');
const axeRunner = require('../engines/axeRunner');

module.exports = async (flowConfig) => {
    try {
        // Expecting flowConfig to be a JSON string from the LLM
        const { steps, profile = 'quick', url } = flowConfig;
        if(!steps || !url) throw new Error('Invalid flow strucuture');
    
        // Execute generic playwright flow
        const context = await genericFlow({url, steps});
        
        // Run accessibility checks using Axe
        const results = await axeRunner(context.page, profile);
        
        //Close the browser
        await context.browser.close();
        
        return results;
    } catch (error) {
        console.error('flowResolver failed:', error);
        throw new Error(`Flow execution error: ${error.message}`);

    }
};