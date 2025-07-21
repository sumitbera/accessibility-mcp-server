// utils/chartUtils.js

function buildChartBlock(impactCounts, history) {
  const totalViolations =
    impactCounts.critical + impactCounts.serious + impactCounts.moderate + impactCounts.minor;

  const impactData = [
    impactCounts.critical,
    impactCounts.serious,
    impactCounts.moderate,
    impactCounts.minor
  ];
  const historyData = JSON.stringify(history);

  return `
    <style>
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 20px;
        background-color: #fff;
        color: #000;
      }
      .summary-cards {
        display: flex;
        justify-content: space-around;
        margin-bottom: 20px;
        gap: 20px;
      }
      .card {
        flex: 1;
        border-radius: 8px;
        padding: 15px;
        text-align: center;
        color: #fff;
        font-size: 18px;
        font-weight: bold;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }
      .card h3 {
        margin: 0 0 10px;
        font-size: 20px;
        color: #fff;
      }
    </style>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

    <section class="summary-cards">
      <div class="card" style="background-color:#d32f2f;">
        <h3>Critical</h3>
        ${impactCounts.critical}
      </div>
      <div class="card" style="background-color:#f57c00;">
        <h3>Serious</h3>
        ${impactCounts.serious}
      </div>
      <div class="card" style="background-color:#fbc02d; color:#000;">
        <h3>Moderate</h3>
        ${impactCounts.moderate}
      </div>
      <div class="card" style="background-color:#1976d2;">
        <h3>Minor</h3>
        ${impactCounts.minor}
      </div>
      <div class="card" style="background-color:#424242;">
        <h3>Total</h3>
        ${totalViolations}
      </div>
    </section>

    <section style="display: flex; justify-content: space-between; align-items: flex-start; gap: 30px; margin: 20px 0;">
      <div style="flex: 1; padding: 10px;">
        <canvas id="violationsChart" width="450" height="250"></canvas>
      </div>
      <div style="flex: 1; padding: 10px;">
        <canvas id="trendChart" width="450" height="250"></canvas>
      </div>
    </section>

    <script>
      const impactCtx = document.getElementById('violationsChart').getContext('2d');
      new Chart(impactCtx, {
        type: 'bar',
        data: {
          labels: ['Critical', 'Serious', 'Moderate', 'Minor'],
          datasets: [{
            label: 'Violations',
            data: ${JSON.stringify(impactData)},
            backgroundColor: ['#d32f2f', '#f57c00', '#fbc02d', '#1976d2']
          }]
        },
        options: {
          responsive: false,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Accessibility Violations Breakdown',
              font: { size: 18 },
              color: '#000'
            },
            legend: { labels: { font: { size: 12 }, color: '#000' } }
          },
          scales: {
            x: {
              ticks: { font: { size: 12 }, color: '#000' },
              grid: { color: '#ccc' }
            },
            y: {
              ticks: { font: { size: 12 }, color: '#000' },
              grid: { color: '#ccc' }
            }
          }
        }
      });

      const trendCtx = document.getElementById('trendChart').getContext('2d');
      const parsedHistory = ${historyData};
      new Chart(trendCtx, {
        type: 'line',
        data: {
          labels: parsedHistory.map(h => new Date(h.timestamp).toLocaleString()),
          datasets: [{
            label: 'Total Violations',
            data: parsedHistory.map(h => h.totalViolations),
            borderColor: '#1976d2',
            fill: false,
            tension: 0.1
          }]
        },
        options: {
          responsive: false,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Historic Trend',
              font: { size: 18 },
              color: '#000'
            },
            legend: { labels: { font: { size: 12 }, color: '#000' } }
          },
          scales: {
            x: {
              ticks: { font: { size: 12 }, color: '#000' },
              grid: { color: '#ccc' }
            },
            y: {
              ticks: { font: { size: 12 }, color: '#000' },
              grid: { color: '#ccc' }
            }
          }
        }
      });
    </script>
  `;
}

module.exports = { buildChartBlock };