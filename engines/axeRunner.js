const { injectAxe, getViolations } = require('axe-playwright');
const fs = require('fs');
const path = require('path');
const { createHtmlReport } = require('axe-html-reporter');
const { ensureDir, clearDir } = require('../utils/fsUtils');
const config = require('../profiles/accessibility.config.json');

module.exports = async function runAxe(page, profile = 'quick') {
    const axeOptions = config[profile] || config.quick;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    const reportsDir = 'reports';  // Use relative path
    clearDir(reportsDir);          // Clean reports folder before each run
    ensureDir(reportsDir);         // Recreate reports folder

    console.log(`[A11Y] Running Axe with profile: ${profile}`);
    await injectAxe(page);
    const violations = await getViolations(page, axeOptions);

    // Save JSON report
    const jsonReportPath = path.join(reportsDir, `a11y-results-${timestamp}.json`);
    fs.writeFileSync(jsonReportPath, JSON.stringify(violations, null, 2));

    // Save HTML report — must include .html extension manually
    const htmlFileName = `axe-report-${profile}-${timestamp}.html`;
    const htmlReportPath = path.join(reportsDir, htmlFileName);

    createHtmlReport({
        results: { violations },
        options: {
            outputDir: reportsDir,
            reportFileName: htmlFileName,  // ✅ Include .html
            reportTitle: `Accessibility Report - ${profile}`,
            theme: 'dark',
            showOnlyViolations: true
        }
    });

    console.log(`[A11Y] Reports saved:`);
    console.log(`- JSON → ${jsonReportPath}`);
    console.log(`- HTML → ${htmlReportPath}`);

    return {
        profile,
        totalViolations: violations.length,
        summary: violations.map(v => ({
            id: v.id,
            impact: v.impact,
            description: v.description,
            help: v.help,
            nodes: v.nodes.map(n => n.target).flat()
        })),
        jsonReportPath,
        htmlReportPath
    };
};
