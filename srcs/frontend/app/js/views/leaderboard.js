const setupLeaderboard = async () => {
    try {
        const response = await fetch('http://localhost:8000/users/', {
            method: 'GET',
            credentials: 'include',
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("❌ Failed to fetch leaderboard data:", data.errors || response.status);
            return;
        }

        console.log("✅ Leaderboard data fetched:", data);
        renderLeaderboard(data);
    } catch (error) {
        console.error("❌ Error fetching leaderboard data:", error);
    }
};

const renderLeaderboard = (players) => {
    const leaderboardContainer = document.getElementById('leaderboard-container');
    const leaderboardList = leaderboardContainer.querySelector('ul');

    leaderboardList.innerHTML = '';

    players.forEach(player => {
        const listItem = document.createElement('li');
        listItem.classList.add('leaderboard-item');

        // Player Avatar
        const playerAvatar = document.createElement('img');
        playerAvatar.src = player.avatar_url;
        playerAvatar.alt = `${player.username}'s avatar`;
        playerAvatar.classList.add('avatar');
        
        // Player Username
        const playerName = document.createElement('span');
        playerName.classList.add('username');
        playerName.textContent = player.username; // Display username without a colon for clarity

        // Player Score
        const playerScore = document.createElement('span');
        playerScore.classList.add('score');
        playerScore.textContent = `${player.score} points`; // Display the score from matches

        // Append the elements to the list item
        listItem.appendChild(playerAvatar);
        listItem.appendChild(playerName);
        listItem.appendChild(playerScore);

        // Append the list item to the leaderboard list
        leaderboardList.appendChild(listItem);
    });
};
