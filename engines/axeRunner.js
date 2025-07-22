// engines/axeRunner.js
const { injectAxe, getViolations } = require('axe-playwright');
const fs = require('fs');
const path = require('path');
const { ensureDir, clearDir } = require('../utils/fsUtils');
const config = require('../profiles/accessibility.config.json');

const reportsDir = path.join(__dirname, '../reports');

// Ensure reports directory exists and is clean before each run
ensureDir(reportsDir);

module.exports = async function runAxe(page, profile = 'quick') {
  const axeOptions = config[profile] || config.quick;
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

  console.log(`[A11Y] Injecting Axe and running with profile: ${profile}`);
  await injectAxe(page);
  const violations = await getViolations(page, axeOptions);

  // Save JSON report
  const jsonReportPath = path.join(reportsDir, `a11y-results-${timestamp}.json`);
  fs.writeFileSync(jsonReportPath, JSON.stringify(violations, null, 2));

  // Create a summary for report aggregator
  const summary = violations.map(v => ({
    id: v.id,
    impact: v.impact,
    description: v.description,
    help: v.help,
    nodes: v.nodes.map(n => n.target).flat()
  }));

  const severityCount = { critical: 0, serious: 0, moderate: 0, minor: 0 };
  summary.forEach(v => {
    if (v.impact === 'critical') severityCount.critical++;
    else if (v.impact === 'serious') severityCount.serious++;
    else if (v.impact === 'moderate') severityCount.moderate++;
    else if (v.impact === 'minor') severityCount.minor++;
  });

  console.log(`[A11Y] JSON report saved: ${jsonReportPath}`);
  console.log(`[A11Y] Violations detected: ${summary.length}`);

  return {
    profile,
    totalViolations: summary.length,
    severityCount,
    summary,
    jsonReportPath
  };
};