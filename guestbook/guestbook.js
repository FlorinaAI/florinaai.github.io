const GITHUB_OWNER = 'florinaai';
const GITHUB_REPO = 'florinaai.github.io';
const ISSUE_NUMBER = '1';

const md = window.markdownit({
    html: true,
    linkify: true,
    typographer: true,
    breaks: true
}).use(window.markdownitEmoji);

function updateCreateMessageButton() {
    const createMessageButton = document.querySelector('.github-link');
    if (createMessageButton) {
        createMessageButton.href = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/issues/${ISSUE_NUMBER}`;
    }
}

async function loadMessages() {
    try {
        const commentsResponse = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/issues/${ISSUE_NUMBER}/comments`);

        if (!commentsResponse.ok) {
            throw new Error('Failed to fetch comments');
        }

        const comments = await commentsResponse.json();
        
        const allMessages = comments.sort((a, b) => 
            new Date(b.created_at) - new Date(a.created_at)
        );
        
        const messagesContainer = document.getElementById('guestbook-messages');
        messagesContainer.innerHTML = '';
        
        for (const message of allMessages) {
            const messageElement = document.createElement('div');
            messageElement.className = 'message';
            
            const date = new Date(message.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            const messageContent = md.render(message.body || '');
            
            messageElement.innerHTML = `
                <div class="message-header">
                    <img src="${message.user.avatar_url}" alt="Avatar" class="message-avatar">
                    <div class="message-info">
                        <div class="message-author">${message.user.login}</div>
                        <div class="message-date">${date}</div>
                    </div>
                </div>
                <div class="message-content markdown-body">${messageContent}</div>
            `;
            
            messageElement.querySelectorAll('a').forEach(link => {
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
            });
            
            messagesContainer.appendChild(messageElement);
        }
    } catch (error) {
        console.error('Error loading comments:', error);
        const messagesContainer = document.getElementById('guestbook-messages');
        messagesContainer.innerHTML = `
            <div class="error-message">
                Failed to load comments. Please try again later.<br>
                <small>${error.message}</small>
            </div>
        `;
    }
}

window.onload = function() {
    updateCreateMessageButton();
    loadMessages();
};
