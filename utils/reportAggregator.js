// utils/reportAggregator.js
const fs = require('fs');
const path = require('path');
const { buildChartBlock } = require('./chartUtils');

const reportsDir = path.join(__dirname, '../reports');
const combinedReportPath = path.join(reportsDir, 'combined-accessibility-report.html');

let scanResults = []; // Holds results from each scan action

function addScanResult(pageName, result) {
  scanResults.push({
    pageName,
    profile: result.profile,
    violations: result.summary || [],
    totalViolations: result.totalViolations
  });
}

function generateCombinedReport() {
  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

  // Calculate overall severity counts
  const impactCounts = { critical: 0, serious: 0, moderate: 0, minor: 0 };
  scanResults.forEach(res => {
    res.violations.forEach(v => {
      if (v.impact === 'critical') impactCounts.critical++;
      else if (v.impact === 'serious') impactCounts.serious++;
      else if (v.impact === 'moderate') impactCounts.moderate++;
      else if (v.impact === 'minor') impactCounts.minor++;
    });
  });

  // Build chart HTML
  const chartHTML = buildChartBlock(impactCounts, []);

  // Build page sections
  const pageSections = scanResults.map(res => {
    const pageViolations = res.violations.map(v => `
      <tr>
        <td>${v.id}</td>
        <td>${v.impact}</td>
        <td>${v.description}</td>
        <td>${v.nodes.join(', ')}</td>
      </tr>`).join('');

    return `
      <section>
        <h2>${res.pageName} (Profile: ${res.profile})</h2>
        <table border="1" cellspacing="0" cellpadding="5" style="width: 100%;">
          <thead>
            <tr>
              <th>ID</th><th>Impact</th><th>Description</th><th>Nodes</th>
            </tr>
          </thead>
          <tbody>${pageViolations || '<tr><td colspan="4">No Violations</td></tr>'}</tbody>
        </table>
      </section>`;
  }).join('');

  const html = `
    <html>
      <head>
        <title>Overall Accessibility Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { text-align: center; }
          section { margin-top: 30px; }
          table { border-collapse: collapse; margin-top: 10px; }
          th, td { padding: 8px; }
        </style>
      </head>
      <body>
        <h1>Accessibility Report (All Pages)</h1>
        ${chartHTML}
        ${pageSections}
      </body>
    </html>`;

  fs.writeFileSync(combinedReportPath, html);
  console.log(`[REPORT] Combined report generated: ${combinedReportPath}`);
  scanResults = []; // Reset for next run
}

module.exports = { addScanResult, generateCombinedReport };