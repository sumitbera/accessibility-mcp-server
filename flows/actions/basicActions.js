// flows/actions/basicActions.js
module.exports = {
    goto: async (page, step) => {
        console.log(`[MCP] Navigating to ${step.value}`);
        await page.goto(step.value, {
            waitUntil: step.waitUntil || 'load', // Ensure full page load
            timeout: 60000
        });
        // Ensure the page load state is stable
        await page.waitForLoadState('load');
},
    fill: async (page, step) => await page.fill(step.selector, step.value),
    type: async (page, step) => await page.type(step.selector, step.value, { delay: step.delay || 50 }),
    click: async (page, step) => await page.click(step.selector),
    check: async (page, step) => await page.check(step.selector),
    uncheck: async (page, step) => await page.uncheck(step.selector),
    hover: async (page, step) => await page.hover(step.selector),
    focus: async (page, step) => await page.focus(step.selector),
    clearInput: async (page, step) => await page.fill(step.selector, ''),
    waitForSelector: async (page, step) => await page.waitForSelector(step.selector),
    waitForTimeout: async (page, step) => await page.waitForTimeout(step.value),
    press: async (page, step) => await page.press(step.selector, step.value),
    close: async (page) => await page.close()
};
