async function initializeUserOverview() {
  try {
    const userId = localStorage.getItem("user_id");
    const [user, matchData] = await Promise.all([
      apiRequest(`users/${userId}/`, "GET"),
      apiRequest(`users/${userId}/match-history/`, "GET"),
    ]);

    const matches = Array.isArray(matchData.match_history) ? matchData.match_history : [];
    const totalMatches = matches.length;
    console.log("📦 match history raw response:", matches);
    const wins = matches.filter(m => m.winner === user.username).length;
    const winRate = totalMatches ? ((wins / totalMatches) * 100).toFixed(1) + '%' : 'N/A';

    // Most frequent opponent
    const opponents = {};
    matches.forEach(m => {
      if (!Array.isArray(m.players)) return;
      m.players.forEach(p => {
        if (p !== user.username) {
          opponents[p] = (opponents[p] || 0) + 1;
        }
      });
    });

    const [mostFrequentOpponent] = Object.entries(opponents).sort((a, b) => b[1] - a[1])[0] || ["N/A"];

    console.log("🕓 Raw join date:", user.date_joined);
    const overviewContainer = document.getElementById("user-overview");
    overviewContainer.innerHTML = `
      <p><strong>Username:</strong> ${user.username}</p>
      <p><strong>Joined:</strong> ${new Date(user.date_joined).toLocaleString()}</p>
      <p><strong>Total Matches:</strong> ${totalMatches}</p>
      <p><strong>Wins:</strong> ${wins}</p>
      <p><strong>Win Rate:</strong> ${winRate}</p>
      <p><strong>Most Frequent Opponent:</strong> ${mostFrequentOpponent}</p>
    `;
    overviewContainer.innerHTML += `
  <div style="max-width: 300px; margin: 20px auto;">
    <canvas id="winloss-chart"></canvas>
  </div>
`;
    renderWinLossChart(matches, user.username, "winloss-chart");

  } catch (err) {
    console.error("Error loading user overview:", err);
  }
}

function renderWinLossChart(matches, username, containerId) {
  const wins = matches.filter(m => m.winner === username).length;
  const losses = matches.length - wins;

  const ctx = document.getElementById(containerId).getContext("2d");
  new Chart(ctx, {
    type: "pie",
    data: {
      labels: ["Wins", "Losses"],
      datasets: [{
        data: [wins, losses],
        backgroundColor: ["#4caf50", "#f44336"]
      }]
    }
  });
}

