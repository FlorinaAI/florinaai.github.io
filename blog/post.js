let discordUser = null;

async function loadLanyardData() {
    try {
        const response = await fetch('https://api.lanyard.rest/v1/users/335882105181569024');
        const data = await response.json();
        discordUser = data.data.discord_user;
    } catch (error) {
        console.error('Error loading Lanyard data:', error);
    }
}

async function loadPost() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const postSlug = urlParams.get('post');
        const basePath = window.location.pathname.includes('github.io') ? '/florinaai.github.io' : '';
        
        if (!postSlug) {
            window.location.href = `${basePath}/blog/`;
            return;
        }

        const response = await fetch(`${basePath}/blog/posts/${postSlug}.md`);
        const markdown = await response.text();
        
        const [, frontMatter, content] = markdown.split('---');
        const meta = parseFrontMatter(frontMatter);
        
        document.title = `Florina - ${meta.title}`;
        
        const blogHeader = document.querySelector('.blog-header');
        blogHeader.className = 'post-page-header';
        
        blogHeader.innerHTML = '';
        
        const backButton = document.createElement('button');
        backButton.className = 'pages-button back-button';
        backButton.onclick = () => window.location.href = `${basePath}/blog/`;
        backButton.textContent = 'Back to Blog';
        blogHeader.appendChild(backButton);
        
        const titleElement = document.createElement('h1');
        titleElement.className = 'post-page-title';
        titleElement.textContent = meta.title;
        blogHeader.appendChild(titleElement);
        
        const postContent = document.getElementById('post-content');
        const htmlContent = marked.parse(content);
        
        postContent.innerHTML = `
            <div class="blog-post">
                <div class="post-header">
                    <img src="https://cdn.discordapp.com/avatars/335882105181569024/${discordUser.avatar}" alt="Avatar" class="post-avatar">
                    <div class="post-info">
                        <div class="post-author">${discordUser.global_name}</div>
                        <div class="post-date">${formatDate(meta.date)}</div>
                    </div>
                </div>
                <div class="post-content">
                    ${htmlContent}
                </div>
            </div>
        `;

        document.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightBlock(block);
        });
        
    } catch (error) {
        console.error('Error loading post:', error);
        window.location.href = '/blog/';
    }
}

function parseFrontMatter(frontMatter) {
    const meta = {};
    const lines = frontMatter.trim().split('\n');
    for (const line of lines) {
        const [key, value] = line.split(': ');
        if (key && value) {
            meta[key.trim()] = value.trim();
        }
    }
    return meta;
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
}

document.addEventListener('DOMContentLoaded', async () => {
    await loadLanyardData();
    loadPost();
}); 