async function initializeMatchHistory() {
  try {
    const userId = localStorage.getItem("user_id");
    const { match_history } = await apiRequest(`users/${userId}/match-history/`, "GET");
    const matches = Array.isArray(match_history) ? match_history : [];

    const container = document.getElementById("user-history");
    if (!container) return;

    if (matches.length === 0) {
      container.innerHTML = "<p>No match history available.</p>";
      return;
    }

    const rows = matches.map(m => {
    const date = m.date ? new Date(m.date).toLocaleDateString() : 'N/A';
    const players = Array.isArray(m.players) ? m.players.join(" vs ") : 'Unknown';
    const winner = m.winner || 'Unknown';
    const score = Array.isArray(m.scores) ? m.scores.join(" - ") : 'N/A';
    return `
      <tr>
        <td>${date}</td>
        <td>${players}</td>
        <td>${winner}</td>
        <td>${score}</td>
      </tr>
    `;
    }).join("");

    container.innerHTML = `
      <table>
        <thead>
          <tr><th>Date</th><th>Players</th><th>Winner</th><th>Score</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  } catch (err) {
    console.error("Failed to load match history:", err);
  }
}

