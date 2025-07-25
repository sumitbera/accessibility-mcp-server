const { injectAxe, getViolations } = require('axe-playwright');
const { createHtmlReport } = require('axe-html-reporter');
const fs = require('fs');
const path = require('path');
const { ensureDir, clearDir } = require('../utils/fsUtils');
const config = require('../profiles/accessibility.config.json');

module.exports = async function runAxe(page, profile = 'quick') {
    try {
        const axeOptions = config[profile] || config.quick;
        console.log(`[A11Y] Running Axe checks with profile: ${profile}`);

        const reportsDir = path.join(__dirname, '../reports');
        ensureDir(reportsDir);
        clearDir(reportsDir); // clean up reports folder for fresh scan

        // Run axe-core
        await injectAxe(page);
        const violations = await getViolations(page, axeOptions);

        // Save JSON report
        const jsonReportPath = path.join(reportsDir, `a11y-results.json`);
        fs.writeFileSync(jsonReportPath, JSON.stringify(violations, null, 2));

        // Save HTML report
        const baseReportPath = path.join(reportsDir, `a11y-report.html`);
        createHtmlReport({
            results: { violations },
            options: {
                outputDir: reportsDir,
                reportFileName: 'a11y-report',
                reportTitle: `Axe Accessibility Report - ${profile} Profile`,
                showOnlyViolations: true
            }
        });

        console.log(`[A11Y] HTML report saved at ${baseReportPath}`);
        console.log(`[A11Y] JSON report saved at ${jsonReportPath}`);

        return { violations, baseReportPath, jsonReportPath };
    } catch (err) {
        console.error('[A11Y] Axe Runner failed:', err);
        throw new Error(`[A11Y] Failed to run Axe checks: ${err.message}`);
    }
};