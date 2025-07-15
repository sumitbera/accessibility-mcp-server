const { injectAxe, getViolations } = require('axe-playwright');
const fs = require('fs');
const path = require('path');
const { createHtmlReport } = require('axe-html-reporter');
const { ensureDir, clearDir } = require('../utils/fsUtils');
const config = require('../profiles/accessibility.config.json');


module.exports = async function runAxe(page, profile = 'quick') {
    const axeOptions = config[profile] || config.quick;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    const reportsDir = path.join(__dirname, '../reports/a11y');
    ensureDir(reportsDir);
    clearDir(reportsDir); //Clean old a11y reports before this run

    console.log(`[A11Y] Injecting Axe and running with profile: ${profile}`);
    await injectAxe(page);
    const violations = await getViolations(page, axeOptions);

    //Save JSON report
    const jsonReportPath = path.join(reportsDir, `a11y-results-${timestamp}.json`);
    fs.writeFileSync(jsonReportPath, JSON.stringify(violations, null, 2));

    //Generate HTML report
    const htmlReportPath = path.join(reportsDir, `axe-report-${timestamp}.html`);
    createHtmlReport({
        results: { violations },
        options: {
            outputDir: reportsDir,
            reportFileName: `axe-report-${profile}-${timestamp}`,
            reportTitle: `Axe Accessibility Report - ${profile} Profile`,
            theme: 'dark',
            showOnlyViolations: true
        }
    });

    console.log(`[A11Y] Axe report saved to ${htmlReportPath}`);
    console.log(`[A11Y] Axe JSON report saved to ${jsonReportPath}`);

    // Create a summary for LLM
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
        jsonReportPath: jsonReportPath,
        htmlReportPath: htmlReportPath
    };
};