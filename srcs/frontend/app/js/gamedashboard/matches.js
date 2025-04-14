export async function initializeGameHistory(userId) {
  const response = await fetch(`/api/all-games/`);
  const games = await response.json();

  const app = document.getElementById("app");
  app.innerHTML = `
    <h2>📜 All Game Sessions</h2>
    <table>
      <thead>
        <tr>
          <th>#</th><th>Player 1</th><th>Score</th><th>Player 2</th><th>Score</th><th>Date</th>
        </tr>
      </thead>
      <tbody>
        ${games.map((game, i) => `
          <tr>
            <td>${i + 1}</td>
            <td>${game.player1}</td>
            <td>${game.score1}</td>
            <td>${game.player2}</td>
            <td>${game.score2}</td>
            <td>${game.date}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

