async function initializeGameStatsOverview(userId) {
  try {
    const { sum_of_scores, total_games } = await apiRequest(`users/${userId}/scores/`, "GET");

    const avgScore = total_games ? (sum_of_scores / total_games).toFixed(1) : "N/A";

    const container = document.getElementById("game-stats-overview");
    container.innerHTML = `
      <p><strong>Total Games:</strong> ${total_games}</p>
      <p><strong>Average Score Per Match:</strong> ${avgScore}</p>
      <button class="basicbutton menu-btn" onclick="window.location.hash='dashy'" style="margin-top: 10px;">Back</button>
    `;
  } catch (err) {
    console.error("Error loading game stats overview:", err);
    const container = document.getElementById("game-stats-overview");
    container.innerHTML = `
      <p>Error loading game stats. Please try again later.</p>
      <button class="basicbutton menu-btn" onclick="window.location.hash='dashy'" style="margin-top: 10px;">Back</button>
    `;
  }
}

