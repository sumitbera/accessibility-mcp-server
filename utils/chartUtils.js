// utils/chartUtils.js
function buildChartBlock(impactCounts) {
  return `
    <canvas id="impactChart" width="400" height="300"></canvas>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script>
      const ctxImpact = document.getElementById('impactChart').getContext('2d');
      new Chart(ctxImpact, {
        type: 'bar',
        data: {
          labels: ['Critical', 'Serious', 'Moderate', 'Minor'],
          datasets: [{
            label: 'Violations',
            data: [${impactCounts.critical}, ${impactCounts.serious}, ${impactCounts.moderate}, ${impactCounts.minor}],
            backgroundColor: [
              'rgba(255, 0, 0, 0.7)',
              'rgba(255, 165, 0, 0.7)',
              'rgba(255, 206, 86, 0.7)',
              'rgba(75, 192, 192, 0.7)'
            ],
            borderColor: [
              'rgba(255, 0, 0, 1)',
              'rgba(255, 165, 0, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)'
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false },
            title: {
              display: true,
              text: 'Accessibility Violations by Severity',
              font: { size: 16 }
            }
          },
          scales: { y: { beginAtZero: true } }
        }
      });
    </script>
  `;
}

function buildTrendChartBlock(history) {
  const labels = history.map(h => new Date(h.timestamp).toLocaleString());
  const dataPoints = history.map(h => h.totalViolations);

  return `
    <canvas id="trendChart" width="400" height="300"></canvas>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script>
      const ctxTrend = document.getElementById('trendChart').getContext('2d');
      new Chart(ctxTrend, {
        type: 'line',
        data: {
          labels: ${JSON.stringify(labels)},
          datasets: [{
            label: 'Total Violations',
            data: ${JSON.stringify(dataPoints)},
            borderColor: 'rgba(54, 162, 235, 1)',
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            fill: true,
            tension: 0.3
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Accessibility Violations Trend',
              font: { size: 16 }
            }
          },
          scales: { y: { beginAtZero: true } }
        }
      });
    </script>
  `;
}

module.exports = { buildChartBlock, buildTrendChartBlock };