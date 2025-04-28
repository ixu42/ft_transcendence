const setupLeaderboardJs = async () => {
    try {
        const response = await fetch('/api/users/leaderboard/', {
            method: 'GET',
            credentials: 'include',
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("❌ Failed to fetch leaderboard data:", data.errors || response.status);
            return;
        }

        console.log("✅ Leaderboard data fetched:", data);
        renderLeaderboard(data, 1);
    } catch (error) {
        console.error("❌ Error fetching leaderboard data:", error);
    }
};

const renderLeaderboard = (playersData, currentPage) => {
    const playersPerPage = 5;
    const leaderboardList = document.getElementById('leaderboard-list');
    const prevButton = document.getElementById('leaderboard-prev-btn');
    const nextButton = document.getElementById('leaderboard-next-btn');

    const sortedPlayers = playersData.sort((a, b) => b.total_wins - a.total_wins || a.rank - b.rank);
    const start = (currentPage - 1) * playersPerPage;
    const playersToShow = sortedPlayers.slice(start, start + playersPerPage);

    leaderboardList.innerHTML = `
        <li class="leaderboard-header">
            <span class="rank-header">Rank</span>
            <span class="player-id-header">ID</span>
            <span class="avatar-header"></span>
            <span class="username-header">Username</span>
            <span class="score-header">Wins</span>
            <span class="win-rate-header">Win Rate</span>
        </li>
        ${playersToShow.map(player => `
            <li class="leaderboard-item">
                <span class="rank">${
                    player.total_wins > 0 
                        ? `#${player.rank}` 
                        : '<span class="rank-tooltip">?<span class="tooltip-text">Play a game to get ranked!</span></span>'
                }</span>
                <span class="player-id">${player.id}</span>
                <img src="${fixAvatarURL(player.avatar)}" alt="${player.username}'s avatar" class="avatar">
                <span class="username">${player.username}</span>
                <span class="score">${player.total_wins}</span>
                <span class="win-rate">${player.win_rate.toFixed(1)}%</span>
            </li>
        `).join('')}
    `;

    prevButton.disabled = currentPage === 1;
    nextButton.disabled = start + playersPerPage >= sortedPlayers.length;

    prevButton.style.display = currentPage > 1 ? "inline-block" : "none";

    prevButton.onclick = () => renderLeaderboard(playersData, currentPage - 1);
    nextButton.onclick = () => renderLeaderboard(playersData, currentPage + 1);
};
