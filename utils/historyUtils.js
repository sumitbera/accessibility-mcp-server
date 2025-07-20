// utils/historyUtils.js

const fs = require('fs');
const path = require('path');

const historyFile = path.join(__dirname, '../history.json');

// Count violations by total nodes affected for each impact level
function getImpactCount(violations) {
  const impactLevels = ['critical', 'serious', 'moderate', 'minor'];
  const counts = { critical: 0, serious: 0, moderate: 0, minor: 0 };

  for (const v of violations) {
    if (impactLevels.includes(v.impact)) {
      counts[v.impact] += v.nodes.length; // count nodes, not just rules
    }
  }
  return counts;
}

// Maintain history.json with timestamped results
function updateHistory(profile, totalViolations) {
  let history = [];
  if (fs.existsSync(historyFile)) {
    history = JSON.parse(fs.readFileSync(historyFile, 'utf-8'));
  }

  history.push({
    timestamp: new Date().toISOString(),
    profile,
    totalViolations
  });

  fs.writeFileSync(historyFile, JSON.stringify(history, null, 2));
  return history;
}

module.exports = {
  getImpactCount,
  updateHistory
};