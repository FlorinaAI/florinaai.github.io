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

function formatDate(dateStr) {
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
}

async function getMarkdownFiles() {
    try {
        const files = [];
        let index = 1;
        
        while (true) {
            try {
                const url = `/blog/posts/${index}.md`;
                console.log('Trying to fetch:', url);
                const response = await fetch(url);
                
                if (!response.ok) {
                    console.log('Response not ok:', response.status, 'for URL:', url);
                    break;
                }
                files.push(`${index}.md`);
                index++;
            } catch (error) {
                console.error('Fetch error:', error);
                break;
            }
        }
        
        console.log('Found files:', files);
        return files;
    } catch (error) {
        console.error('Error getting markdown files:', error);
        return [];
    }
}

async function loadBlogPosts() {
    const blogPostsContainer = document.getElementById('blog-posts');
    if (!blogPostsContainer) {
        console.error('Blog posts container not found');
        return;
    }
    
    blogPostsContainer.innerHTML = '';
    
    try {
        const files = await getMarkdownFiles();
        const loadedPosts = [];
        
        for (const file of files) {
            try {
                const url = `/blog/posts/${file}`;
                console.log('Loading post:', url);
                const response = await fetch(url);
                
                if (response.ok) {
                    const markdown = await response.text();
                    const [, frontMatter, content] = markdown.split('---');
                    const meta = parseFrontMatter(frontMatter.trim());
                    
                    loadedPosts.push({
                        file,
                        meta,
                        date: new Date(meta.date)
                    });
                } else {
                    console.log('Failed to load post:', url, 'Status:', response.status);
                }
            } catch (error) {
                console.error(`Error loading ${file}:`, error);
            }
        }
        
        loadedPosts.sort((a, b) => b.date - a.date);
        
        if (loadedPosts.length === 0) {
            console.log('No posts were loaded');
            blogPostsContainer.innerHTML = '<p class="error-message">No blog posts found. Please check the console for details.</p>';
            return;
        }
        
        for (const post of loadedPosts) {
            const slug = post.file.replace(/\.md$/, '');
            
            const postElement = document.createElement('div');
            postElement.className = 'blog-post';
            
            postElement.innerHTML = `
                <div class="post-header">
                    <img src="https://cdn.discordapp.com/avatars/335882105181569024/${discordUser.avatar || ''}" alt="Avatar" class="post-avatar">
                    <div class="post-info">
                        <div class="post-author">${discordUser.global_name || 'Florina'}</div>
                        <div class="post-date">${formatDate(post.meta.date)}</div>
                    </div>
                </div>
                <div class="post-content">
                    <h2>${post.meta.title}</h2>
                    <p>${post.meta.summary}</p>
                    <a href="post.html?post=${slug}" class="read-more">Read More →</a>
                </div>
            `;
            
            blogPostsContainer.appendChild(postElement);
        }
    } catch (error) {
        console.error('Error in loadBlogPosts:', error);
        blogPostsContainer.innerHTML = '<p class="error-message">Failed to load blog posts. Please check the console for details.</p>';
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

document.addEventListener('DOMContentLoaded', async () => {
    try {
        await loadLanyardData();
    } catch (error) {
        console.error('Error in initialization:', error);
    }
    await loadBlogPosts();
});
