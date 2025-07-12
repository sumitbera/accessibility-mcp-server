const { injectAxe, getViolations } = require('axe-playwright');
const fs = require('fs');
const path = require('path');
const {createHtlmReport} = require('axe-html-reporter');

const config = require('../profiles/accessibility.config.json');
const { json } = require('stream/consumers');

module.exports = async function runAxe(page, profile = 'quick') {
    const axeOptions = config[profile] || config.quick;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    console.log(`[A11Y] Injecting Axe and running with profile: ${profile}`);
    await injectAxe(page);
    const violations = await getViolations(page, axeOptions);

    //Create reports folder if not exists
    const reportsDir = path.join(__dirname, '../reports');
    if(!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

    //Save JSON report
    const jsonReportPath = path.join(reportsDir, `axe-report-${profile}-${timestamp}.json`);

    //Generate HTML report
    const htmlReportPath = path.join(reportsDir, `axe-report-${profile}-${timestamp}.html`);
    createHtlmReport({
        results: violations,
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