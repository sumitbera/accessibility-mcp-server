// flows/actions/extendedActions.js
module.exports = {
    expectedVisible: async (page, step) => {
        if (!(await page.isVisible(step.selector))) {
            throw new Error(`Element ${step.selector} not visible`);
        }
    },
    expectedHidden: async (page, step) => {
        if (!(await page.isHidden(step.selector))) {
            throw new Error(`Element ${step.selector} is still visible`);
        }
    },
    expectedText: async (page, step) => {
        const text = await page.textContent(step.selector);
        if (text.trim() !== step.value) {
            throw new Error(`Text mismatch: expected '${step.value}', got '${text.trim()}'`);
        }
    },
    expectedURL: async (page, step) => {
        const currentURL = page.url();
        if (currentURL !== step.value) {
            throw new Error(`URL mismatch: expected '${step.value}', got '${currentURL}'`);
        }
    },
    waitForLoad: async (page) => await page.waitForLoadState('load', { timeout: 60000 }),

    screenshotStep: async (page, step) => {
        const path = step.value || `step-${Date.now()}.png`;
        await page.screenshot({ path, fullPage: true });
    },

    acceptDialog: async (page) => page.once('dialog', dialog => dialog.accept()),
    dismissDialog: async (page) => page.once('dialog', dialog => dialog.dismiss()),
    setDialogValue: async (page, step) => page.once('dialog', dialog => dialog.accept(step.value))
};
