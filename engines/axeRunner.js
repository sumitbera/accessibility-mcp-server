const { injectAxe, getViolations } = require('axe-playwright');
const fs = require('fs');
const path = require('path');
const { createHtmlReport } = require('axe-html-reporter');
const { ensureDir, clearDir } = require('../utils/fsUtils');
const config = require('../profiles/accessibility.config.json');
const { getImpactCount, updateHistory } = require('../utils/historyUtils');
const { buildChartBlock } = require('../utils/chartUtils');

const reportsDir = path.join(__dirname, '../reports');

module.exports = async function runAxe(page, profile) {
    if (!profile) throw new Error("Accessibility profile is required for Axe runner.");

    // Ensure reports folder is clean
    ensureDir(reportsDir);
    clearDir(reportsDir);

    const axeOptions = config[profile] || config.quick;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    console.log(`[A11Y] Running Axe with profile: ${profile}`);
    await injectAxe(page);
    const violations = await getViolations(page, axeOptions);

    // Save JSON report
    const jsonReportPath = path.join(reportsDir, `axe-results-${timestamp}.json`);
    fs.writeFileSync(jsonReportPath, JSON.stringify(violations, null, 2));

    // Update history.json
    const history = updateHistory(profile, violations.length);

    // Generate default Axe HTML report
    let htmlReport = createHtmlReport({
        results: { violations },
        options: {
            projectKey: 'Accessibility MCP',
            reportTitle: `Axe Accessibility Report - ${profile}`,
            showOnlyViolations: true
        }
    });

    // Generate chart block using modularized chartUtils
    const impactCounts = getImpactCount(violations);
    const chartBlock = buildChartBlock(impactCounts, history);

    // Inject chart block into the HTML
    const insertPoint = htmlReport.includes('</body>') ? '</body>' : '</html>';
    htmlReport = htmlReport.replace(insertPoint, `${chartBlock}${insertPoint}`);

    console.log("[A11Y] Chart block successfully injected into HTML report.");

    // Save enhanced HTML report
    const htmlReportPath = path.join(reportsDir, `axe-report-${timestamp}.html`);
    fs.writeFileSync(htmlReportPath, htmlReport);

    console.log(`[A11Y] Reports generated:`);
    console.log(`   - JSON: ${jsonReportPath}`);
    console.log(`   - HTML: ${htmlReportPath}`);

    // Create summary for response
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