const themeToggle = document.getElementById('themeToggle');
const body = document.body;
const html = document.documentElement;

html.classList.add('dark-mode-transition');

document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        body.classList.add('dark-mode');
        themeToggle.textContent = '☀️';
    } else {
        themeToggle.textContent = '🌙';
    }
    setTimeout(() => {
        html.classList.remove('dark-mode-transition');
    }, 100);
    
    fetchDataAndUpdateAvatar();
    updateTimePassed();
});

themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    
    if (body.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark');
        themeToggle.textContent = '☀️';
    } else {
        localStorage.setItem('theme', 'light');
        themeToggle.textContent = '🌙';
    }
});

async function fetchDataAndUpdateAvatar() {
    try {
        const userId = '335882105181569024';
        const apiUrl = `https://api.lanyard.rest/v1/users/${userId}`;
        
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        if (!data.success) {
            console.error('API request failed');
            return;
        }

        const id = data.data.discord_user.id;
        const avatar = data.data.discord_user.avatar;
        const avatarUrl = `https://cdn.discordapp.com/avatars/${id}/${avatar}`;
        document.querySelector('.avatar-image').src = avatarUrl;

        const statusColors = {
            online: '#43b581',
            idle: '#faa61a',
            dnd: '#f04747',
            offline: '#747f8d'
        };
        
        const status = data.data.discord_status;
        document.documentElement.style.setProperty('--status-color', statusColors[status] || '#747f8d');
        
        const statusText = status === 'offline' ? 'Sleeping' : 'Alive';
        document.querySelector('.status').textContent = `Status: ${statusText}`;
        
        const username = data.data.discord_user.global_name || data.data.discord_user.username;
        document.querySelector('.username').textContent = username;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

function updateTimePassed() {
    const startDate = new Date('2002-02-24T12:40:00Z'); 
    const currentDate = new Date();
    const timeDiff = currentDate - startDate;

    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

    const age = Math.floor(days / 365.25);

    const timePassedElement = document.querySelector('.time-passed');
    timePassedElement.innerHTML = `
        <div>${days}d ${hours}h ${minutes}m ${seconds}s</div>
        <div class="age-text">(${age} years old)</div>
    `;
}

setInterval(fetchDataAndUpdateAvatar, 30000);
setInterval(updateTimePassed, 1000);
