let discordUser = {
    avatar: '',
    global_name: 'Florina'
};

async function loadLanyardData() {
    try {
        const response = await fetch('https://api.lanyard.rest/v1/users/335882105181569024');
        if (!response.ok) {
            throw new Error('Lanyard API response was not ok');
        }
        const data = await response.json();
        if (data && data.data && data.data.discord_user) {
            discordUser = data.data.discord_user;
        }
    } catch (error) {
        console.error('Error loading Lanyard data:', error);
    }
}

async function loadPost() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const postSlug = urlParams.get('post');
        
        if (!postSlug) {
            window.location.href = './';
            return;
        }

        const response = await fetch(`/blog/posts/${postSlug}.md`);
        console.log('Fetching post:', `/blog/posts/${postSlug}.md`);
        
        if (!response.ok) {
            throw new Error(`Failed to load post: ${response.status}`);
        }
        
        const markdown = await response.text();
        
        const [, frontMatter, content] = markdown.split('---');
        if (!frontMatter || !content) {
            throw new Error('Invalid markdown format');
        }
        
        const meta = parseFrontMatter(frontMatter);
        
        document.title = `Florina - ${meta.title || 'Blog Post'}`;
        
        const blogHeader = document.querySelector('.blog-header');
        if (!blogHeader) {
            throw new Error('Blog header element not found');
        }
        
        blogHeader.className = 'post-page-header';
        blogHeader.innerHTML = '';
        
        const backButton = document.createElement('button');
        backButton.className = 'pages-button back-button';
        backButton.onclick = () => window.location.href = './';
        backButton.textContent = 'Back to Blog';
        blogHeader.appendChild(backButton);
        
        const titleElement = document.createElement('h1');
        titleElement.className = 'post-page-title';
        titleElement.textContent = meta.title || 'Untitled Post';
        blogHeader.appendChild(titleElement);
        
        const postContent = document.getElementById('post-content');
        if (!postContent) {
            throw new Error('Post content element not found');
        }
        
        const htmlContent = marked.parse(content);
        
        postContent.innerHTML = `
            <div class="blog-post">
                <div class="post-header">
                    <img src="https://cdn.discordapp.com/avatars/335882105181569024/${discordUser.avatar || ''}" alt="Avatar" class="post-avatar">
                    <div class="post-info">
                        <div class="post-author">${discordUser.global_name || 'Florina'}</div>
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
        const postContent = document.getElementById('post-content');
        if (postContent) {
            postContent.innerHTML = '<p class="error-message">Failed to load blog post. Please try again later.</p>';
        }
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
    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) {
            return 'Invalid Date';
        }
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
    } catch {
        return 'Invalid Date';
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        await loadLanyardData();
    } catch (error) {
        console.error('Error in initialization:', error);
    }
    await loadPost();
}); 