const { injectAxe, getViolations } = require('axe-playwright');
const fs = require('fs');
const path = require('path');
const { createHtmlReport } = require('axe-html-reporter');
const { ensureDir, clearDir } = require('../utils/fsUtils');
const config = require('../profiles/accessibility.config.json');

const reportsDir = path.join(__dirname, '../reports');

module.exports = async function runAxe(page, profile = 'quick') {
    ensureDir(reportsDir);
    clearDir(reportsDir); // Clean old reports before execution

    const axeOptions = config[profile] || config.quick;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    console.log(`[A11Y] Running Axe with profile: ${profile}`);
    await injectAxe(page);
    const violations = await getViolations(page, axeOptions);

    // Save JSON report
    const jsonReportPath = path.join(reportsDir, `axe-results-${timestamp}.json`);
    fs.writeFileSync(jsonReportPath, JSON.stringify(violations, null, 2));

    // Generate HTML content as a string
    const reportHTML = createHtmlReport({
        results: { violations },
        options: {
            projectKey: 'Accessibility MCP',
            reportTitle: `Axe Accessibility Report - ${profile}`,
            showOnlyViolations: true
        }
    });

    // Save HTML report manually
    const htmlReportPath = path.join(reportsDir, `axe-report-${timestamp}.html`);
    fs.writeFileSync(htmlReportPath, reportHTML);

    console.log(`[A11Y] Reports generated:`);
    console.log(`   - JSON: ${jsonReportPath}`);
    console.log(`   - HTML: ${htmlReportPath}`);

    const summary = violations.map(v => ({
        id: v.id,
        impact: v.impact,
        description: v.description,
        help: v.help,
        nodes: v.nodes.map(n => n.target).flat()
    }));

    return {
        profile,
        totalViolations: violations.length,
        summary,
        jsonReportPath,
        htmlReportPath
    };
};