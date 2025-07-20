function getImpactChartHTML(impactCounts) {
  return `
    <section style="margin:20px 0;">
      <h2>Accessibility Violations Breakdown</h2>
      <canvas id="violationsChart" width="400" height="200" style="border:1px solid #ddd; padding:10px;"></canvas>
      <script>
        const impactCtx = document.getElementById('violationsChart').getContext('2d');
        new Chart(impactCtx, {
          type: 'bar',
          data: {
            labels: ['Critical', 'Serious', 'Moderate', 'Minor'],
            datasets: [{
              label: 'Violations',
              data: [${impactCounts.critical}, ${impactCounts.serious}, ${impactCounts.moderate}, ${impactCounts.minor}],
              backgroundColor: ['#d32f2f', '#f57c00', '#fbc02d', '#1976d2']
            }]
          },
          options: { responsive: true }
        });
      </script>
    </section>
  `;
}

function getTrendChartHTML(history) {
  return `
    <section style="margin-top: 40px;">
      <h2>Historic Trend</h2>
      <canvas id="trendChart" width="400" height="200" style="border:1px solid #ddd; padding:10px;"></canvas>
      <script>
        const trendCtx = document.getElementById('trendChart').getContext('2d');
        const historyData = ${JSON.stringify(history)};
        new Chart(trendCtx, {
          type: 'line',
          data: {
            labels: historyData.map(h => new Date(h.timestamp).toLocaleString()),
            datasets: [{
              label: 'Total Violations',
              data: historyData.map(h => h.totalViolations),
              borderColor: '#1976d2',
              fill: false,
              tension: 0.1
            }]
          },
          options: { responsive: true }
        });
      </script>
    </section>
  `;
}

function buildChartBlock(impactCounts, history) {
  return `
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    ${getImpactChartHTML(impactCounts)}
    ${getTrendChartHTML(history)}
  `;
}

module.exports = {
  getImpactChartHTML,
  getTrendChartHTML,
  buildChartBlock
};