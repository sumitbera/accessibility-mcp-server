const { injectAxe, getViolations } = require('axe-playwright');
const fs = require('fs');
const path = require('path');
const { createHtmlReport } = require('axe-html-reporter');
const { ensureDir, clearDir } = require('../utils/fsUtils');
const config = require('../profiles/accessibility.config.json');

const allureResultsDir = path.join(__dirname, '../reports/allure-results');
ensureDir(allureResultsDir); // Ensure the directory exists

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

    // Create Allure results
    const allureFile = path.join(allureResultsDir, `result-${timestamp}.json`);
    const allureData = {
        name: `Accessibility Check - ${profile}`,
        status: violations.length ? 'failed' : 'passed',
        stage: 'finished',
        steps: violations.map(v => ({
            name: `Violation: ${v.id}`,
            status: 'failed',
            attachments: [
                { name: 'Description', source: v.description, type: 'text/plain' }
            ]
        })),
        attachments: [
            { name: 'Full Report', source: jsonReportPath, type: 'application/json' }
        ]
    };
    fs.writeFileSync(allureFile, JSON.stringify(allureData, null, 2));

    console.log(`[A11Y] Allure result saved: ${allureFile}`);

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
        allureResults: allureFile
    };
};
