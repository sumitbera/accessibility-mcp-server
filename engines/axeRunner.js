const { injectAxe, getViolations } = require('axe-playwright');
const fs = require('fs');
const path = require('path');
const { createHtmlReport } = require('axe-html-reporter');
const { ensureDir } = require('../utils/fsUtils');
const config = require('../profiles/accessibility.config.json');

const reportsDir = path.join(__dirname, '../reports');

/**
 * Runs Axe accessibility checks on the given Playwright page.
 * @param {import('playwright').Page} page - Playwright page instance
 * @param {string} profile - Accessibility profile (quick|full|strict etc.)
 * @returns {Promise<{jsonReportPath: string, htmlReportPath: string, violations: Array}>}
 */
module.exports = async function axeRunner(page, profile = 'quick') {
  if (!profile) throw new Error("Accessibility profile is required for Axe runner.");

  // Ensure reports folder exists
  ensureDir(reportsDir);

  const axeOptions = config[profile] || config.quick;
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

  console.log(`[A11Y] Running Axe with profile: ${profile}`);
  await injectAxe(page);
  const violations = await getViolations(page, axeOptions);

  // Save JSON report
  const jsonReportPath = path.join(reportsDir, `axe-results-${timestamp}.json`);
  fs.writeFileSync(jsonReportPath, JSON.stringify(violations, null, 2));

  // Generate Axe HTML report
  const htmlReportContent = createHtmlReport({
    results: { violations },
    options: {
      reportTitle: `Axe Accessibility Report - ${profile}`,
      showOnlyViolations: true
    }
  });

  const htmlReportPath = path.join(reportsDir, `axe-report-${timestamp}.html`);
  fs.writeFileSync(htmlReportPath, htmlReportContent);

  console.log(`[A11Y] Reports generated:`);
  console.log(`   - JSON: ${jsonReportPath}`);
  console.log(`   - HTML: ${htmlReportPath}`);

  return {
    profile,
    totalViolations: violations.length,
    violations,
    jsonReportPath,
    htmlReportPath
  };
};