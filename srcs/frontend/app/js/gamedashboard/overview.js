async function initializeGameStatsOverview(userId) {
  try {
    const { match_history } = await apiRequest(`users/${userId}/match-history/`, "GET");
    const matches = Array.isArray(match_history) ? match_history : [];

    const totalGames = matches.length;
    let totalScores = 0;
    let totalMargins = 0;
    let scoreCount = 0;

    matches.forEach(m => {
      if (Array.isArray(m.scores) && m.scores.length === 2 && m.scores.every(s => typeof s === "number")) {
        const [a, b] = m.scores;
        totalScores += a + b;
        totalMargins += Math.abs(a - b);
        scoreCount++;
      }
    });

    const avgScore = scoreCount ? (totalScores / scoreCount).toFixed(1) : "N/A";
    const avgMargin = scoreCount ? (totalMargins / scoreCount).toFixed(1) : "N/A";

    const container = document.getElementById("game-stats-overview");
    container.innerHTML = `
      <p><strong>Total Games:</strong> ${totalGames}</p>
      <p><strong>Average Score Per Match:</strong> ${avgScore}</p>
      <p><strong>Average Score Margin:</strong> ${avgMargin}</p>
    `;
  } catch (err) {
    console.error("Error loading game stats overview:", err);
  }
}

