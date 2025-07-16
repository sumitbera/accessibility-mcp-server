const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { ensureDir, clearDir } = require('../utils/fsUtils');

const screenDir = path.join(__dirname, '../reports/steps');

const supportedActions = {
    goto: async (page, step) => await page.goto(step.value),
    fill: async (page, step) => await page.fill(step.selector, step.value),
    type: async (page, step) => await page.type(step.selector, step.value, { delay: step.delay || 50 }),
    click: async (page, step) => await page.click(step.selector),
    check: async (page, step) => await page.check(step.selector),
    uncheck: async (page, step) => await page.uncheck(step.selector),
    selectOption: async (page, step) => await page.selectOption(step.selector, step.value),
    hover: async (page, step) => await page.hover(step.selector),
    waitForSelector: async (page, step) => await page.waitForSelector(step.selector),
    waitForTimeout: async (page, step) => await page.waitForTimeout(step.value),
    press: async (page, step) => await page.press(step.selector, step.value),
    close: async (page) => await page.close(),
    evaluate: async (page, step) => await page.evaluate(step.value),
    expectedVisible: async (page, step) => {
        const isVisible = await page.isVisible(step.selector);
        if (!isVisible) throw new Error(`Element ${step.selector} not visible`);
    },
    screenshot: async (page, step) => {
        const screenshotPath = step.value || path.join(screenDir, `step-${Date.now()}.png`);
        await page.screenshot({ path: screenshotPath, fullPage: true });
    }
};

module.exports = async ({ url, steps }) => {
    ensureDir(screenDir);
    clearDir(screenDir);
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    console.log(`[MCP] Navigating to ${url}`);
    await page.goto(url);

    for (const step of steps) {
        const action = supportedActions[step.action];
        if (!action) {
            console.warn(`[MCP] Unsupported action: ${step.action}`);
            continue;
        }
        try {
            console.log(`[MCP] Executing: ${step.action} ${step.selector || step.value}`);
            await action(page, step);
        } catch (err) {
            console.error(`[MCP] Step failed ${JSON.stringify(step)} → ${err.message}`);
            throw err; // Re-throw to stop execution on error
        }
    }

    return { browser, page };
}
