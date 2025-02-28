const setupLeaderboard = async () => {
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

    const sortedPlayers = playersData.sort((a, b) => b.score - a.score || a.rank - b.rank);
    const start = (currentPage - 1) * playersPerPage;
    const playersToShow = sortedPlayers.slice(start, start + playersPerPage);

    leaderboardList.innerHTML = `
        <li class="leaderboard-header">
            <span class="rank-header">Rank</span>
            <span class="score-header">Score</span>
        </li>
        ${playersToShow.map(player => `
            <li class="leaderboard-item">
                <span class="rank">${player.score > 0 ? `#${player.rank}` : '?'}</span>
                <span class="player-id">ID: ${player.id}</span>
                <img src="${fixAvatarURL(player.avatar)}" alt="${player.username}'s avatar" class="avatar">
                <span class="username">${player.username}</span>
                <span class="score">${player.score} points</span>
            </li>
        `).join('')}
    `;

    prevButton.disabled = currentPage === 1;
    nextButton.disabled = start + playersPerPage >= sortedPlayers.length;

    prevButton.style.display = currentPage > 1 ? "inline-block" : "none";

    prevButton.onclick = () => renderLeaderboard(playersData, currentPage - 1);
    nextButton.onclick = () => renderLeaderboard(playersData, currentPage + 1);
};

const fixAvatarURL = (avatarPath) => {

    if (avatarPath.startsWith("avatars/")){
        return `api/media/${avatarPath}`;
    }
    else if (avatarPath.startsWith("/static/")) {
        return `/api/${avatarPath}`;
    }
    return avatarPath;
};
