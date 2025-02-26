let connectedUsers = ['User1', 'User2', 'User3'];

function updateUserList() {
    const userList = document.getElementById('user-list');
    userList.innerHTML = '';

    connectedUsers.forEach(user => {
        const li = document.createElement('li');
        li.textContent = user;
        userList.appendChild(li);
    });
}

function sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    
    if (message !== '') {
        displayMessage('You', message);
        input.value = '';
    }
}

function displayMessage(user, message) {
    const chatContainer = document.getElementById('chat-container');
    
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('chat-message');
    messageDiv.innerHTML = `<strong>${user}: </strong>${message}`;
    
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

window.addEventListener('hashchange', function () {
    const currentHash = window.location.hash;

    if (currentHash === '#live-chat') {
        document.getElementById('chat').style.display = 'block';
        document.getElementById('menu-container').style.display = 'none';
        updateUserList();
    } else {
        document.getElementById('chat').style.display = 'none';
        document.getElementById('menu-container').style.display = 'block';
    }
});
