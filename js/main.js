// ==========================================
// BLOG DATA MANAGEMENT
// ==========================================

// Blog posts metadata - Single source of truth for blog post information
const BLOG_POSTS_DATA = [
    {
        id: 0,
        title: "Introduction to Reinforcement Learning",
        url: "blog/rl_introduction.html",
        category: "Introduction",
        date: "July 17, 2025",
        readTime: 15,
        tags: ["introduction","application"],
        excerpt: "In this blog series, we'll explore the fascinating world of reinforcement learning—how it works, why it matters, and where it's heading. ",
    },

    {
        id: 1,
        title: "Markov Decision Processes and Partially Observable Markov Decision Processes",
        url: "blog/mdp-pomdp-intro.html",
        category: "Theory",
        date: "July 17, 2025",
        readTime: 15,
        tags: ["mdp", "pomdp", "theory"],
        excerpt: "This introductory exploration of Markov Decision Processes and Partially Observable Markov Decision Processes establishes the theoretical foundation for understanding sequential decision-making under uncertainty."
    },
    {
        id: 2,
        title: "Exact MDP Solutions: Value Iteration and Policy Iteration",
        url: "blog/value_and_policy_iteration.html",
        category: "algorithm",
        date: "July 17, 2025",
        readTime: 15,
        tags: ["mdp", "theory", "algorithm"],
        excerpt: "In Chapter 1, we now turn our attention to the classical methods for solving MDPs when the environment dynamics are fully known, and the state-action space is finite and relatively small."
    },
    {
        id: 3,
        title: "From Q-learning to DDQN",
        url: "blog/q-learning.html",
        category: "algorithm",
        date: "July 17, 2025",
        readTime: 15,
        tags: ["theory", "model free", "algorithm"],
        excerpt: " Today, we'll discuss a different algorithm for solving MDPs called Q-learning, which represents a fundamental shift in approach: from model-based to model-free learning"
    },
    {
        id: 4,
        title: "Everything you need to know about Policy Gradient, REINFORCE and Advantage Actor-Critic (A2C)",
        url: "blog/policy_gradient.html",
        category: "algorithm",
        date: "July 17, 2025",
        readTime: 15,
        tags: ["theory", "model free", "algorithm", "policy gradient", "GAE"],
        excerpt: "In this chapter, we will first learn how to derive policy gradient used in\n" +
            "            REINFORCE and all policy gradient based RL algorithms, and then introduce the\n" +
            "            vanilla policy gradient algorithm with baseline estimation (A2C)."
    },


];

// Blog state manager - Handles all blog statistics
class BlogStateManager {
    constructor() {
        this.loadState();
    }

    loadState() {
        const savedState = localStorage.getItem('blogState');
        if (savedState) {
            this.state = JSON.parse(savedState);
            this.ensureAllPostsInitialized();
        } else {
            this.initializeState();
        }
    }

    initializeState() {
        this.state = {
            posts: {}
        };

        BLOG_POSTS_DATA.forEach(post => {
            this.state.posts[post.id] = {
                likes: 0,
                liked: false,
                views: 0,
                comments: []
            };
        });

        this.saveState();
    }

    ensureAllPostsInitialized() {
        // Ensure all posts in BLOG_POSTS_DATA have state entries
        BLOG_POSTS_DATA.forEach(post => {
            if (!this.state.posts[post.id]) {
                this.state.posts[post.id] = {
                    likes: 0,
                    liked: false,
                    views: 0,
                    comments: []
                };
            }
        });
        this.saveState();
    }

    saveState() {
        localStorage.setItem('blogState', JSON.stringify(this.state));
    }

    getPostStats(postId) {
        return this.state.posts[postId] || { likes: 0, liked: false, views: 0, comments: [] };
    }

    toggleLike(postId) {
        const post = this.state.posts[postId];
        if (!post) return;

        if (post.liked) {
            post.likes = Math.max(0, post.likes - 1);
            post.liked = false;
        } else {
            post.likes++;
            post.liked = true;
        }

        this.saveState();
        this.updateUIForPost(postId);
    }

    addComment(postId, name, text) {
        const post = this.state.posts[postId];
        if (!post) return;

        post.comments.unshift({
            name: name,
            text: text,
            date: this.getRelativeTime(new Date())
        });

        this.saveState();
        this.updateUIForPost(postId);
    }

    incrementView(postId) {
        const post = this.state.posts[postId];
        if (!post) return;

        post.views++;
        this.saveState();
    }

    updateUIForPost(postId) {
        const stats = this.getPostStats(postId);

        // Update all instances of this post's stats across the page
        document.querySelectorAll(`[data-post-id="${postId}"]`).forEach(element => {
            // Update likes
            const likeBtn = element.querySelector('.like-btn');
            const likeCount = element.querySelector('.like-count');
            if (likeBtn && likeCount) {
                likeCount.textContent = stats.likes;
                const icon = likeBtn.querySelector('i');
                if (stats.liked) {
                    likeBtn.classList.add('liked');
                    icon.classList.remove('far');
                    icon.classList.add('fas');
                } else {
                    likeBtn.classList.remove('liked');
                    icon.classList.remove('fas');
                    icon.classList.add('far');
                }
            }

            // Update comments count
            const commentCount = element.querySelector('.comment-count');
            if (commentCount) {
                commentCount.textContent = stats.comments.length;
            }

            // Update views
            const viewCount = element.querySelector('.view-count');
            if (viewCount) {
                viewCount.innerHTML = `<i class="far fa-eye"></i> ${this.formatCount(stats.views)}`;
            }
        });

        // Also update standalone view counts (for blog post pages)
        const standaloneViewCount = document.querySelector('.post-actions-bar .view-count');
        if (standaloneViewCount) {
            standaloneViewCount.innerHTML = `<i class="far fa-eye"></i> ${this.formatCount(stats.views)}`;
        }

        // Also update in post cards on home page
        document.querySelectorAll('.post-card').forEach(card => {
            const link = card.getAttribute('href');
            const post = BLOG_POSTS_DATA.find(p => p.url === link);
            if (post && post.id === postId) {
                const postStats = card.querySelector('.post-stats');
                if (postStats) {
                    postStats.innerHTML = `
                        <span><i class="far fa-heart"></i> ${stats.likes}</span>
                        <span><i class="far fa-comment"></i> ${stats.comments.length}</span>
                        <span><i class="far fa-eye"></i> ${this.formatCount(stats.views)}</span>
                    `;
                }
            }
        });
    }

    formatCount(count) {
        if (count >= 1000) {
            return (count / 1000).toFixed(1) + 'k';
        }
        return count.toString();
    }

    getRelativeTime(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;

        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;

        const diffDays = Math.floor(diffHours / 24);
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

        const diffWeeks = Math.floor(diffDays / 7);
        return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`;
    }
}

// ==========================================
// FORUM DATA MANAGEMENT
// ==========================================

class ForumManager {
    constructor() {
        this.loadPosts();
    }

    loadPosts() {
        const savedPosts = localStorage.getItem('forumPosts');
        this.posts = savedPosts ? JSON.parse(savedPosts) : [];

        // Clear any example posts if this is the first time
        if (this.posts.length === 0) {
            this.savePosts();
        }
    }

    savePosts() {
        localStorage.setItem('forumPosts', JSON.stringify(this.posts));
    }

    addPost(title, author, content) {
        const newPost = {
            id: Date.now(), // Use timestamp as unique ID
            title,
            author,
            content,
            date: new Date().toISOString().split('T')[0],
            answers: []
        };

        this.posts.unshift(newPost);
        this.savePosts();
        return newPost;
    }

    addAnswer(postId, author, content) {
        const post = this.posts.find(p => p.id === postId);
        if (!post) return;

        post.answers.push({
            author,
            content,
            date: new Date().toISOString().split('T')[0]
        });

        this.savePosts();
    }

    getPosts() {
        return this.posts;
    }
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

function getBlogPosts() {
    // Combine static data with dynamic stats
    return BLOG_POSTS_DATA.map(post => {
        const stats = blogStateManager.getPostStats(post.id);
        return {
            ...post,
            likes: stats.likes,
            comments: stats.comments.length,
            views: stats.views
        };
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
}

function setActiveNavigation() {
    const currentLocation = location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-links a');

    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentLocation || (currentLocation === '' && href === 'index.html')) {
            link.classList.add('active');
        }
    });
}

function initializeHeaderScroll() {
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        const header = document.querySelector('header');

        if (currentScroll > 100) {
            header.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
        } else {
            header.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
        }

        lastScroll = currentScroll;
    });
}

function initializeBlogPost() {
    const postElement = document.querySelector('[data-post-id]');
    if (!postElement) return;

    const postId = parseInt(postElement.getAttribute('data-post-id'));

    // Increment view count
    blogStateManager.incrementView(postId);

    // Update UI with current stats
    blogStateManager.updateUIForPost(postId);

    // Load comments
    loadCommentsForPost(postId);
}

// ==========================================
// BLOG INTERACTION FUNCTIONS (Global for onclick handlers)
// ==========================================

window.toggleLike = function(postId) {
    blogStateManager.toggleLike(postId);

    // Add animation
    const likeBtn = document.querySelector(`[data-post-id="${postId}"] .like-btn`);
    if (likeBtn) {
        likeBtn.style.transform = 'scale(1.2)';
        setTimeout(() => {
            likeBtn.style.transform = 'scale(1)';
        }, 200);
    }
}

window.toggleComments = function(postId) {
    const commentsSection = document.getElementById(`comments-${postId}`);

    if (!commentsSection) return;

    const isVisible = commentsSection.style.display !== 'none';

    if (isVisible) {
        commentsSection.style.display = 'none';
    } else {
        commentsSection.style.display = 'block';
        loadCommentsForPost(postId);
    }
}

function loadCommentsForPost(postId) {
    const commentsList = document.getElementById(`comments-list-${postId}`);
    if (!commentsList) return;

    const stats = blogStateManager.getPostStats(postId);

    commentsList.innerHTML = stats.comments.map(comment => `
        <div class="comment">
            <div class="comment-header">
                <strong>${comment.name}</strong>
                <span class="comment-date">${comment.date}</span>
            </div>
            <p>${comment.text}</p>
        </div>
    `).join('') || '<p style="color: var(--text-light); text-align: center;">No comments yet. Be the first to comment!</p>';
}

window.addComment = function(postId) {
    const nameInput = document.getElementById(`comment-name-${postId}`);
    const textInput = document.getElementById(`comment-text-${postId}`);

    if (!nameInput || !textInput || !nameInput.value.trim() || !textInput.value.trim()) {
        alert('Please enter both your name and comment.');
        return;
    }

    blogStateManager.addComment(postId, nameInput.value.trim(), textInput.value.trim());

    // Clear form
    nameInput.value = '';
    textInput.value = '';

    // Reload comments
    loadCommentsForPost(postId);

    // Add animation to new comment
    const commentsList = document.getElementById(`comments-list-${postId}`);
    const firstComment = commentsList.firstElementChild;
    if (firstComment && firstComment.classList.contains('comment')) {
        firstComment.style.animation = 'slideDown 0.3s ease-out';
    }
}

// ==========================================
// FORUM FUNCTIONS
// ==========================================

function initializeForum() {
    displayForumPosts();
    updateForumStats();
}

function displayForumPosts() {
    const container = document.getElementById('forum-posts');
    if (!container) return;

    const posts = forumManager.getPosts();

    if (posts.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-light); padding: 40px;">No questions yet. Be the first to ask!</p>';
        return;
    }

    container.innerHTML = posts.map(post => `
        <div class="forum-post">
            <h3>${post.title}</h3>
            <div class="post-meta">Asked by ${post.author} on ${post.date}</div>
            <p>${post.content}</p>
            <div class="answers">
                <h4>Answers (${post.answers.length})</h4>
                ${post.answers.map(answer => `
                    <div class="answer">
                        <strong>${answer.author}</strong> • ${answer.date}<br>
                        ${answer.content}
                    </div>
                `).join('')}
                <button class="btn-secondary" onclick="showAnswerForm(${post.id})">Add Answer</button>
                <div id="answer-form-${post.id}" style="display: none;" class="answer-form">
                    <div class="form-group">
                        <input type="text" placeholder="Your name" id="answer-author-${post.id}">
                    </div>
                    <div class="form-group">
                        <textarea placeholder="Your answer" id="answer-content-${post.id}"></textarea>
                    </div>
                    <button class="btn-secondary" onclick="submitAnswer(${post.id})">Submit</button>
                    <button class="btn-secondary" onclick="hideAnswerForm(${post.id})">Cancel</button>
                </div>
            </div>
        </div>
    `).join('');
}

function updateForumStats() {
    const posts = forumManager.getPosts();
    const totalAnswers = posts.reduce((sum, post) => sum + post.answers.length, 0);
    const answeredPosts = posts.filter(post => post.answers.length > 0).length;
    const answerRate = posts.length > 0 ? Math.round((answeredPosts / posts.length) * 100) : 0;

    // Update stats display
    const statsElements = document.querySelectorAll('.stat-number');
    if (statsElements.length >= 4) {
        statsElements[0].textContent = posts.length; // Total Questions
        statsElements[1].textContent = totalAnswers; // Answers
        statsElements[2].textContent = posts.length + totalAnswers; // Active Members (estimate)
        statsElements[3].textContent = answerRate + '%'; // Questions Answered
    }
}

// Forum global functions
window.openNewQuestionModal = function() {
    const modal = document.getElementById('questionModal');
    if (modal) modal.style.display = 'block';
}

window.closeModal = function() {
    const modal = document.getElementById('questionModal');
    if (modal) modal.style.display = 'none';
}

window.submitQuestion = function(event) {
    event.preventDefault();

    const title = document.getElementById('questionTitle').value;
    const author = document.getElementById('questionAuthor').value;
    const content = document.getElementById('questionContent').value;

    if (!title || !author || !content) {
        alert('Please fill in all fields.');
        return;
    }

    forumManager.addPost(title, author, content);
    displayForumPosts();
    updateForumStats();
    closeModal();

    // Reset form
    document.getElementById('questionTitle').value = '';
    document.getElementById('questionAuthor').value = '';
    document.getElementById('questionContent').value = '';
}

window.showAnswerForm = function(postId) {
    const form = document.getElementById(`answer-form-${postId}`);
    if (form) form.style.display = 'block';
}

window.hideAnswerForm = function(postId) {
    const form = document.getElementById(`answer-form-${postId}`);
    if (form) form.style.display = 'none';
}

window.submitAnswer = function(postId) {
    const author = document.getElementById(`answer-author-${postId}`).value;
    const content = document.getElementById(`answer-content-${postId}`).value;

    if (!author || !content) {
        alert('Please fill in all fields.');
        return;
    }

    forumManager.addAnswer(postId, author, content);
    displayForumPosts();
    updateForumStats();
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('questionModal');
    if (event.target === modal) {
        closeModal();
    }
}

// ==========================================
// SHARE FUNCTIONALITY
// ==========================================

window.sharePost = function() {
    if (navigator.share) {
        navigator.share({
            title: document.title,
            text: 'Check out this great article on reinforcement learning!',
            url: window.location.href
        });
    } else {
        navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
    }
}

// ==========================================
// HOME PAGE BLOG POSTS LOADER
// ==========================================

function loadRecentBlogPosts() {
    const container = document.getElementById('home-recent-posts');
    if (!container) {
        return;
    }

    const blogPosts = getBlogPosts();
    const recentPosts = blogPosts.slice(0, 3);

    if (recentPosts.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-light);">No blog posts yet. Check back soon!</p>';
        return;
    }

    container.innerHTML = recentPosts.map(post => {
        const stats = blogStateManager.getPostStats(post.id);
        return `
            <a href="${post.url}" class="post-card">
                <div class="post-card-header">
                    <span class="post-category">${post.category}</span>
                    <span class="post-date">${post.date}</span>
                </div>
                <h3>${post.title}</h3>
                <p>${post.excerpt}</p>
                <div class="post-stats">
                    <span><i class="far fa-heart"></i> ${stats.likes}</span>
                    <span><i class="far fa-comment"></i> ${stats.comments.length}</span>
                    <span><i class="far fa-eye"></i> ${blogStateManager.formatCount(stats.views)}</span>
                </div>
            </a>
        `;
    }).join('');
}

// ==========================================
// BLOG PAGE POSTS LOADER
// ==========================================

function loadAllBlogPosts() {
    const container = document.getElementById('blog-list-container');
    if (!container) {
        return;
    }

    const blogPosts = getBlogPosts();

    if (blogPosts.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-light); font-size: 1.2rem; margin: 60px 0;">No blog posts yet. Check back soon for exciting content on reinforcement learning!</p>';
        return;
    }

    container.innerHTML = blogPosts.map(post => {
        const stats = blogStateManager.getPostStats(post.id);
        return `
            <article class="blog-item" data-post-id="${post.id}">
                <div class="blog-item-header">
                    <h2 class="blog-title"><a href="${post.url}">${post.title}</a></h2>
                    <span class="blog-category">${post.category}</span>
                </div>
                <div class="blog-meta">
                    <span><i class="far fa-calendar"></i> ${post.date}</span>
                    <span><i class="far fa-clock"></i> ${post.readTime} min read</span>
                    <span class="blog-tags">
                        ${post.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </span>
                </div>
                <p class="blog-excerpt">${post.excerpt}</p>
                <div class="blog-actions">
                    <div class="blog-stats">
                        <button class="like-btn ${stats.liked ? 'liked' : ''}" onclick="toggleLike(${post.id})">
                            <i class="${stats.liked ? 'fas' : 'far'} fa-heart"></i> <span class="like-count">${stats.likes}</span>
                        </button>
                        <button class="comment-btn" onclick="toggleComments(${post.id})">
                            <i class="far fa-comment"></i> <span class="comment-count">${stats.comments.length}</span>
                        </button>
                        <span class="view-count"><i class="far fa-eye"></i> ${blogStateManager.formatCount(stats.views)}</span>
                    </div>
                    <a href="${post.url}" class="read-more">Read More <i class="fas fa-arrow-right"></i></a>
                </div>

                <!-- Comments Section -->
                <div class="comments-section" id="comments-${post.id}" style="display: none;">
                    <h3>Comments</h3>
                    <div class="comment-form">
                        <input type="text" placeholder="Your name" class="comment-name" id="comment-name-${post.id}">
                        <textarea placeholder="Share your thoughts..." class="comment-text" id="comment-text-${post.id}"></textarea>
                        <button class="btn-primary" onclick="addComment(${post.id})">Post Comment</button>
                    </div>
                    <div class="comments-list" id="comments-list-${post.id}">
                        <!-- Comments will be loaded here -->
                    </div>
                </div>
            </article>
        `;
    }).join('');
}

// ==========================================
// INITIALIZATION
// ==========================================

// Initialize managers
const blogStateManager = new BlogStateManager();
const forumManager = new ForumManager();

// ==========================================
// PAGE INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    // Set active navigation
    setActiveNavigation();

    // Initialize page-specific functionality
    const currentPath = window.location.pathname;
    const currentFile = currentPath.split('/').pop();

    if (currentFile === 'index.html' || currentFile === '' || currentPath === '/' || currentPath === '') {
        // Home page - load recent posts
        loadRecentBlogPosts();
    } else if (currentFile === 'blog.html') {
        // Blog page - load all posts
        loadAllBlogPosts();
    } else if (currentPath.includes('blog/') && !currentPath.endsWith('blog.html')) {
        // Individual blog post page
        initializeBlogPost();
    } else if (currentFile === 'forum.html') {
        // Forum page
        initializeForum();
    }

    // Initialize KaTeX if available
    if (typeof renderMathInElement !== 'undefined') {
        renderMathInElement(document.body, {
            delimiters: [
                {left: '$$', right: '$$', display: true},
                {left: '$', right: '$', display: false}
            ]
        });
    }

    // Add header scroll effect
    initializeHeaderScroll();
});