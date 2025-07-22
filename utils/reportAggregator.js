// utils/reportAggregator.js
const fs = require('fs');
const path = require('path');
const { buildChartBlock, buildTrendChartBlock } = require('./chartUtils');

const reportsDir = path.join(__dirname, '../reports');
const combinedReportPath = path.join(reportsDir, 'combined-accessibility-report.html');
const historyFilePath = path.join(__dirname, '../history.json');

let scanResults = []; // Holds results from each scan action

function addScanResult(pageName, result) {
  scanResults.push({
    pageName,
    profile: result.profile,
    violations: result.summary || [],
    totalViolations: result.totalViolations
  });
}

function updateHistory(impactCounts) {
  let history = [];
  if (fs.existsSync(historyFilePath)) {
    history = JSON.parse(fs.readFileSync(historyFilePath, 'utf-8'));
  }

  const entry = {
    timestamp: new Date().toISOString(),
    totalViolations: impactCounts.total,
    pages: scanResults.map(r => ({
      name: r.pageName,
      totalViolations: r.totalViolations
    })),
    impactCounts
  };

  history.push(entry);
  fs.writeFileSync(historyFilePath, JSON.stringify(history, null, 2));
  return history;
}

function generateCombinedReport() {
  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

  // Calculate overall severity counts
  const impactCounts = { critical: 0, serious: 0, moderate: 0, minor: 0, total: 0 };
  scanResults.forEach(res => {
    res.violations.forEach(v => {
      if (v.impact === 'critical') impactCounts.critical++;
      else if (v.impact === 'serious') impactCounts.serious++;
      else if (v.impact === 'moderate') impactCounts.moderate++;
      else if (v.impact === 'minor') impactCounts.minor++;
    });
  });
  impactCounts.total =
    impactCounts.critical + impactCounts.serious + impactCounts.moderate + impactCounts.minor;

  // Update history and prepare trend data
  const history = updateHistory(impactCounts);

  // Build charts
  const chartHTML = buildChartBlock(impactCounts, scanResults);
  const trendHTML = buildTrendChartBlock(history);

  // Build page sections
  const pageSections = scanResults
    .map(res => {
      const pageViolations = res.violations
        .map(
          v => `
          <tr>
            <td>${v.id}</td>
            <td>${v.impact}</td>
            <td>${v.description}</td>
            <td>${v.nodes.join(', ')}</td>
          </tr>`
        )
        .join('');

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
    })
    .join('');

  const html = `
    <html>
      <head>
        <title>Combined Accessibility Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; background: #fff; color: #333; }
          h1 { text-align: center; }
          section { margin-top: 30px; }
          table { border-collapse: collapse; margin-top: 10px; width: 100%; }
          th, td { padding: 8px; border: 1px solid #ccc; }
          .charts { display: flex; justify-content: space-between; gap: 20px; }
          .chart-container { width: 48%; }
        </style>
      </head>
      <body>
        <h1>Accessibility Report (All Pages)</h1>
        <div class="charts">
          <div class="chart-container">
            <h2>Violations Overview</h2>
            ${chartHTML}
          </div>
          <div class="chart-container">
            <h2>Trend Over Time</h2>
            ${trendHTML}
          </div>
        </div>
        ${pageSections}
      </body>
    </html>`;

  fs.writeFileSync(combinedReportPath, html);
  console.log(`[REPORT] Combined report generated: ${combinedReportPath}`);
  scanResults = []; // Reset for next run
}

module.exports = { addScanResult, generateCombinedReport };