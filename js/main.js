// Add active class to current page nav link
document.addEventListener('DOMContentLoaded', function() {
    const currentLocation = location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-links a');

    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentLocation || (currentLocation === '' && href === 'index.html')) {
            link.classList.add('active');
        }
    });

    // Initialize blog data from sessionStorage
    initializeBlogData();

    // Initialize KaTeX rendering if on a page with math
    if (typeof renderMathInElement !== 'undefined') {
        renderMathInElement(document.body, {
            delimiters: [
                {left: '$$', right: '$$', display: true},
                {left: '$', right: '$', display: false}
            ]
        });
    }

    // Add scroll effect to header
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
});

// Blog functionality
let blogData = {};

function initializeBlogData() {
    const storedData = localStorage.getItem('blogData');
    if (storedData) {
        blogData = JSON.parse(storedData);
    } else {
        // Initialize with default data
        blogData = {
            likes: {
                1: { count: 42, liked: false },
                2: { count: 38, liked: false },
                3: { count: 56, liked: false },
                4: { count: 62, liked: false },
                5: { count: 28, liked: false }  // Add this line
            },
            views: {
                1: 1234,
                2: 980,
                3: 1567,
                4: 2145,
                5: 247  // Add this line
            },
            comments: {
                1: [
                    { name: "Sarah Chen", date: "2 days ago", text: "Great introduction! The step-by-step breakdown of the Bellman equation really helped me understand the concept." },
                    { name: "Alex Kumar", date: "1 week ago", text: "Would love to see a follow-up on Double Q-Learning to address the overestimation bias!" }
                ],
                2: [
                    { name: "Michael Park", date: "3 days ago", text: "The visualization of the replay buffer really helped me understand why it's crucial for stability!" }
                ],
                3: [
                    { name: "Emily Zhang", date: "1 week ago", text: "Finally understood why we need baselines! The variance reduction section was particularly helpful." }
                ],
                4: [
                    { name: "David Liu", date: "4 days ago", text: "The comparison table between different actor-critic variants was super useful. Looking forward to the PPO post!" }
                ],
                5: [  // Add this section
                    { name: "Dr. Elena Rodriguez", date: "2 hours ago", text: "Excellent mathematical exposition! The car racing example really helps bridge the gap between theory and practice. Looking forward to the next chapter on analytical solutions." },
                    { name: "James Park", date: "1 day ago", text: "The belief state update equations in the POMDP section are beautifully explained. This is exactly what I needed to understand how partial observability is handled mathematically." }
                ]
            }
        };
        saveBlogData();
    }

    // Increment view count if on blog post page
    const postElement = document.querySelector('[data-post-id]');
    if (postElement && window.location.pathname.includes('intro-to-q-learning.html')) {
        const postId = postElement.getAttribute('data-post-id');
        if (blogData.views[postId]) {
            blogData.views[postId]++;
            saveBlogData();
        }
    }

    updateBlogUI();
}

function saveBlogData() {
    localStorage.setItem('blogData', JSON.stringify(blogData));
}

function updateBlogUI() {
    // Update like counts and states
    Object.keys(blogData.likes).forEach(postId => {
        const likeBtn = document.querySelector(`[data-post-id="${postId}"] .like-btn`);
        const likeCount = document.querySelector(`[data-post-id="${postId}"] .like-count`);

        if (likeBtn && likeCount) {
            likeCount.textContent = blogData.likes[postId].count;
            if (blogData.likes[postId].liked) {
                likeBtn.classList.add('liked');
                likeBtn.querySelector('i').classList.remove('far');
                likeBtn.querySelector('i').classList.add('fas');
            }
        }

        // Update comment counts
        const commentCount = document.querySelector(`[data-post-id="${postId}"] .comment-count`);
        if (commentCount && blogData.comments[postId]) {
            commentCount.textContent = blogData.comments[postId].length;
        }

        // Update view counts
        const viewCount = document.querySelector(`[data-post-id="${postId}"] .view-count`);
        if (viewCount && blogData.views[postId]) {
            viewCount.textContent = formatViewCount(blogData.views[postId]);
        }
    });
}

function formatViewCount(count) {
    if (count >= 1000) {
        return (count / 1000).toFixed(1) + 'k';
    }
    return count.toString();
}

function updateBlogUI() {
    // Update like counts and states
    Object.keys(blogData.likes).forEach(postId => {
        const likeBtn = document.querySelector(`[data-post-id="${postId}"] .like-btn`);
        const likeCount = document.querySelector(`[data-post-id="${postId}"] .like-count`);

        if (likeBtn && likeCount) {
            likeCount.textContent = blogData.likes[postId].count;
            if (blogData.likes[postId].liked) {
                likeBtn.classList.add('liked');
                likeBtn.querySelector('i').classList.remove('far');
                likeBtn.querySelector('i').classList.add('fas');
            }
        }

        // Update comment counts
        const commentCount = document.querySelector(`[data-post-id="${postId}"] .comment-count`);
        if (commentCount && blogData.comments[postId]) {
            commentCount.textContent = blogData.comments[postId].length;
        }
    });
}

function toggleLike(postId) {
    const likeBtn = document.querySelector(`[data-post-id="${postId}"] .like-btn`);
    const likeCount = document.querySelector(`[data-post-id="${postId}"] .like-count`);
    const icon = likeBtn.querySelector('i');

    if (!blogData.likes[postId]) {
        blogData.likes[postId] = { count: 0, liked: false };
    }

    if (blogData.likes[postId].liked) {
        blogData.likes[postId].count--;
        blogData.likes[postId].liked = false;
        likeBtn.classList.remove('liked');
        icon.classList.remove('fas');
        icon.classList.add('far');
    } else {
        blogData.likes[postId].count++;
        blogData.likes[postId].liked = true;
        likeBtn.classList.add('liked');
        icon.classList.remove('far');
        icon.classList.add('fas');
    }

    likeCount.textContent = blogData.likes[postId].count;
    saveBlogData();

    // Add animation
    likeBtn.style.transform = 'scale(1.2)';
    setTimeout(() => {
        likeBtn.style.transform = 'scale(1)';
    }, 200);
}

function toggleComments(postId) {
    const commentsSection = document.getElementById(`comments-${postId}`);

    // For blog post pages, the comments section is always visible
    if (window.location.pathname.includes('intro-to-q-learning.html')) {
        // Scroll to comments section on blog post page
        const commentSection = document.querySelector('.post-comment-section');
        if (commentSection) {
            commentSection.scrollIntoView({ behavior: 'smooth' });
        }
        return;
    }

    // For blog listing page, toggle visibility
    if (commentsSection) {
        const isVisible = commentsSection.style.display !== 'none';

        if (isVisible) {
            commentsSection.style.display = 'none';
        } else {
            commentsSection.style.display = 'block';
            // Load comments
            loadComments(postId);
        }
    }
}

function loadComments(postId) {
    const commentsList = document.getElementById(`comments-list-${postId}`);
    if (!blogData.comments[postId]) {
        blogData.comments[postId] = [];
    }

    commentsList.innerHTML = blogData.comments[postId].map(comment => `
        <div class="comment">
            <div class="comment-header">
                <strong>${comment.name}</strong>
                <span class="comment-date">${comment.date}</span>
            </div>
            <p>${comment.text}</p>
        </div>
    `).join('');
}

function addComment(postId) {
    const nameInput = document.getElementById(`comment-name-${postId}`);
    const textInput = document.getElementById(`comment-text-${postId}`);

    if (!nameInput.value.trim() || !textInput.value.trim()) {
        alert('Please enter both your name and comment.');
        return;
    }

    if (!blogData.comments[postId]) {
        blogData.comments[postId] = [];
    }

    const newComment = {
        name: nameInput.value.trim(),
        date: 'just now',
        text: textInput.value.trim()
    };

    blogData.comments[postId].unshift(newComment);
    saveBlogData();

    // Update UI
    loadComments(postId);
    const commentCount = document.querySelector(`[data-post-id="${postId}"] .comment-count`);
    commentCount.textContent = blogData.comments[postId].length;

    // Clear form
    nameInput.value = '';
    textInput.value = '';

    // Add animation to new comment
    const commentsList = document.getElementById(`comments-list-${postId}`);
    const firstComment = commentsList.firstElementChild;
    if (firstComment) {
        firstComment.style.animation = 'slideDown 0.3s ease-out';
    }
}

// Forum functionality (only loaded on forum.html)
if (document.getElementById('forum-posts')) {
    let forumPosts = [];

    // Initialize forum with sample data
    function initializeForum() {
        // Check if we have stored posts in localStorage
        const storedPosts = localStorage.getItem('forumPosts');

        if (storedPosts) {
            forumPosts = JSON.parse(storedPosts);
        } else {
            // Sample data for demonstration
            forumPosts = [
                {
                    id: 1,
                    title: "How to handle continuous action spaces in RL?",
                    author: "Alex Chen",
                    date: "2024-01-10",
                    content: "I'm working on a robotics project where the action space is continuous. What are the best algorithms to use? I've heard about DDPG and SAC but not sure which to choose.",
                    answers: [
                        {
                            author: "Sarah Liu",
                            date: "2024-01-11",
                            content: "For continuous action spaces, SAC (Soft Actor-Critic) is generally more stable and sample-efficient than DDPG. It uses entropy regularization which helps with exploration."
                        }
                    ]
                },
                {
                    id: 2,
                    title: "Best practices for reward shaping?",
                    author: "Mike Johnson",
                    date: "2024-01-08",
                    content: "I'm finding that my agent takes too long to learn with sparse rewards. What are some good practices for reward shaping without introducing bias?",
                    answers: []
                }
            ];
            // Store in localStorage
            localStorage.setItem('forumPosts', JSON.stringify(forumPosts));
        }

        displayForumPosts();
    }

    function displayForumPosts() {
        const container = document.getElementById('forum-posts');
        container.innerHTML = '';

        forumPosts.forEach(post => {
            const postElement = document.createElement('div');
            postElement.className = 'forum-post';
            postElement.innerHTML = `
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
            `;
            container.appendChild(postElement);
        });
    }

    window.openNewQuestionModal = function() {
        document.getElementById('questionModal').style.display = 'block';
    }

    window.closeModal = function() {
        document.getElementById('questionModal').style.display = 'none';
    }

    window.submitQuestion = function(event) {
        event.preventDefault();

        const newPost = {
            id: forumPosts.length + 1,
            title: document.getElementById('questionTitle').value,
            author: document.getElementById('questionAuthor').value,
            content: document.getElementById('questionContent').value,
            date: new Date().toISOString().split('T')[0],
            answers: []
        };

        forumPosts.unshift(newPost);
        localStorage.setItem('forumPosts', JSON.stringify(forumPosts));
        displayForumPosts();
        closeModal();

        // Reset form
        document.getElementById('questionTitle').value = '';
        document.getElementById('questionAuthor').value = '';
        document.getElementById('questionContent').value = '';
    }

    window.showAnswerForm = function(postId) {
        document.getElementById(`answer-form-${postId}`).style.display = 'block';
    }

    window.hideAnswerForm = function(postId) {
        document.getElementById(`answer-form-${postId}`).style.display = 'none';
    }

    window.submitAnswer = function(postId) {
        const author = document.getElementById(`answer-author-${postId}`).value;
        const content = document.getElementById(`answer-content-${postId}`).value;

        if (author && content) {
            const post = forumPosts.find(p => p.id === postId);
            post.answers.push({
                author: author,
                date: new Date().toISOString().split('T')[0],
                content: content
            });

            localStorage.setItem('forumPosts', JSON.stringify(forumPosts));
            displayForumPosts();
        }
    }

    // Close modal when clicking outside
    window.onclick = function(event) {
        const modal = document.getElementById('questionModal');
        if (event.target == modal) {
            closeModal();
        }
    }

    // Initialize forum on page load
    initializeForum();
}

// Share functionality
window.sharePost = function() {
    if (navigator.share) {
        navigator.share({
            title: document.title,
            text: 'Check out this great article on reinforcement learning!',
            url: window.location.href
        });
    } else {
        // Fallback - copy to clipboard
        navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
    }
}