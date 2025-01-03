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
                const response = await fetch(`/blog/posts/${index}.md`);
                if (!response.ok) break;
                files.push(`${index}.md`);
                index++;
            } catch {
                break;
            }
        }
        
        return files;
    } catch (error) {
        console.error('Error getting markdown files:', error);
        return [];
    }
}

async function loadBlogPosts() {
    const blogPostsContainer = document.getElementById('blog-posts');
    blogPostsContainer.innerHTML = '';
    
    try {
        const files = await getMarkdownFiles();
        const loadedPosts = [];
        
        for (const file of files) {
            try {
                const response = await fetch(`/blog/posts/${file}`);
                if (response.ok) {
                    const markdown = await response.text();
                    const [, frontMatter, content] = markdown.split('---');
                    const meta = parseFrontMatter(frontMatter.trim());
                    
                    loadedPosts.push({
                        file,
                        meta,
                        date: new Date(meta.date)
                    });
                }
            } catch (error) {
                console.error(`Error loading ${file}:`, error);
            }
        }
        
        loadedPosts.sort((a, b) => b.date - a.date);
        
        for (const post of loadedPosts) {
            const slug = post.file.replace(/\.md$/, '');
            
            const postElement = document.createElement('div');
            postElement.className = 'blog-post';
            
            postElement.innerHTML = `
                <div class="post-header">
                    <img src="https://cdn.discordapp.com/avatars/335882105181569024/${discordUser?.avatar || ''}" alt="Avatar" class="post-avatar">
                    <div class="post-info">
                        <div class="post-author">${discordUser?.global_name || 'Author'}</div>
                        <div class="post-date">${formatDate(post.meta.date)}</div>
                    </div>
                </div>
                <div class="post-content">
                    <h2>${post.meta.title}</h2>
                    <p>${post.meta.summary}</p>
                    <a href="/blog/post.html?post=${slug}" class="read-more">Read More →</a>
                </div>
            `;
            
            blogPostsContainer.appendChild(postElement);
        }
    } catch (error) {
        console.error('Error in loadBlogPosts:', error);
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
    await loadLanyardData();
    await loadBlogPosts();
});
