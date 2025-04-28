async function initializeUserOverview(userId) {
  try {
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
      const opponent = m.player1 === user.username ? m.player2 : m.player1;
      if (opponent) {
        opponents[opponent] = (opponents[opponent] || 0) + 1;
      }
    });

    const [mostFrequentOpponent, frequency] = Object.entries(opponents).sort((a, b) => b[1] - a[1])[0] || ["N/A", 0];

    console.log("🕓 Raw join date:", user.date_joined);
    const overviewContainer = document.getElementById("user-overview");
    overviewContainer.innerHTML = `
      <p><strong>Username:</strong> ${user.username}</p>
      <p><strong>Total Matches:</strong> ${totalMatches}</p>
      <p><strong>Wins:</strong> ${wins}</p>
      <p><strong>Win Rate:</strong> ${winRate}</p>
      <p><strong>Most Frequent Opponent:</strong> ${mostFrequentOpponent}</p>
      <button id="view-tournament-stats-btn" style="margin-top: 10px; padding: 8px 16px; background-color: #2196f3; color: white; border: none; border-radius: 4px; cursor: pointer;">View Tournament Stats</button>
    `;
    overviewContainer.innerHTML += `
      <div style="max-width: 300px; margin: 20px auto;">
        <canvas id="winloss-chart"></canvas>
      </div>
    `;
    renderWinLossChart(matches, user.username, "winloss-chart");

    // Add event listener for tournament stats button
    document.getElementById("view-tournament-stats-btn").addEventListener("click", () => {
      initializeTournamentOverview(userId, user.username);
    });

  } catch (err) {
    console.error("Error loading user overview:", err);
  }
}

async function initializeTournamentOverview(userId, username) {
  try {
    const tournamentData = await apiRequest(`users/${userId}/tournaments-history/`, "GET");
    const tournaments = Array.isArray(tournamentData) ? tournamentData : [];
    const totalTournaments = tournaments.length;
    console.log("🏆 tournament history raw response:", tournaments);

    // Count completed tournaments
    const completedTournaments = tournaments.filter(t => t.status === "COMPLETED").length;

    // Most frequent opponent in tournaments
    const opponents = {};
    tournaments.forEach(t => {
      if (Array.isArray(t.players)) {
        t.players.forEach(p => {
          if (p !== username) {
            opponents[p] = (opponents[p] || 0) + 1;
          }
        });
      }
    });

    const [mostFrequentOpponent, frequency] = Object.entries(opponents).sort((a, b) => b[1] - a[1])[0] || ["N/A", 0];

    const overviewContainer = document.getElementById("user-overview");
    overviewContainer.innerHTML = `
      <p><strong>Username:</strong> ${username}</p>
      <p><strong>Total Tournaments:</strong> ${totalTournaments}</p>
      <p><strong>Completed Tournaments:</strong> ${completedTournaments}</p>
      <p><strong>Most Frequent Opponent:</strong> ${mostFrequentOpponent}</p>
      <button id="view-match-stats-btn" style="margin-top: 10px; padding: 8px 16px; background-color: #2196f3; color: white; border: none; border-radius: 4px; cursor: pointer;">View Match Stats</button>
    `;
    overviewContainer.innerHTML += `
      <div style="max-width: 300px; margin: 20px auto;">
        <canvas id="tournament-status-chart"></canvas>
      </div>
    `;
    renderTournamentStatusChart(tournaments, "tournament-status-chart");

    // Add event listener to switch back to match stats
    document.getElementById("view-match-stats-btn").addEventListener("click", () => {
      initializeUserOverview(userId);
    });

  } catch (err) {
    console.error("Error loading tournament overview:", err);
    const overviewContainer = document.getElementById("user-overview");
    overviewContainer.innerHTML = `<p>Error loading tournament stats. Please try again later.</p>`;
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

function renderTournamentStatusChart(tournaments, containerId) {
  const statusCounts = {
    COMPLETED: 0,
    ACTIVE: 0,
    PENDING: 0
  };

  tournaments.forEach(t => {
    if (t.status in statusCounts) {
      statusCounts[t.status]++;
    }
  });

  const ctx = document.getElementById(containerId).getContext("2d");
  new Chart(ctx, {
    type: "pie",
    data: {
      labels: ["Completed", "Active", "Pending"],
      datasets: [{
        data: [statusCounts.COMPLETED, statusCounts.ACTIVE, statusCounts.PENDING],
        backgroundColor: ["#4caf50", "#2196f3", "#ff9800"]
      }]
    }
  });
}