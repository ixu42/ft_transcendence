async function initializeTrends(userId) {
  try {
    const { match_history } = await apiRequest(`users/${userId}/match-history/`, "GET");
    const matches = Array.isArray(match_history) ? match_history : [];

    // Count matches per hour (0-23)
    const matchesByHour = Array(24).fill(0);

    matches.forEach(m => {
      const rawDate = m.date_played;
      if (!rawDate) return;

      const date = new Date(rawDate);
      if (isNaN(date)) return;

      const hour = date.getHours(); // 0–23
      matchesByHour[hour]++;
    });

    const labels = Array.from({ length: 24 }, (_, i) => `${i}:00`);
    const values = matchesByHour;

    const container = document.getElementById("user-trends");
    if (!container) return;
    container.innerHTML = `
      <div style="max-width: 600px; margin: 0 auto;">
        <canvas id="trends-chart"></canvas>
      </div>
    `;

    const canvas = document.getElementById("trends-chart");
    if (window.trendsChart) {
      window.trendsChart.destroy();
    }

    window.trendsChart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: "Matches Per Hour",
          data: values,
          backgroundColor: '#42a5f5'
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true },
          x: { title: { display: true, text: "Hour of Day" } }
        }
      }
    });

  } catch (err) {
    console.error("Error loading user trends:", err);
  }
}

