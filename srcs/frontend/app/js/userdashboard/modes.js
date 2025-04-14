export async function initializeModes(userId) {
  const response = await fetch(`/api/user-mode-stats/`);
  const data = await response.json();

  const app = document.getElementById("app");
  app.innerHTML = `
    <h2>🎮 Stats by Game Mode</h2>
    <ul>
      ${data.modes.map(mode => `
        <li><strong>${mode.name}</strong>: ${mode.wins} Wins / ${mode.losses} Losses</li>
      `).join("")}
    </ul>
  `;
}

