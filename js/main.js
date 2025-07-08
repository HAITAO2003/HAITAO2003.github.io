// Add active class to current page nav link
document.addEventListener('DOMContentLoaded', function() {
    const currentLocation = location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('nav a');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentLocation || (currentLocation === '' && href === 'index.html')) {
            link.classList.add('active');
        }
    });
    
    // Initialize KaTeX rendering if on a page with math
    if (typeof renderMathInElement !== 'undefined') {
        renderMathInElement(document.body, {
            delimiters: [
                {left: '$$', right: '$$', display: true},
                {left: '$', right: '$', display: false}
            ]
        });
    }
});

// Forum functionality (only loaded on forum.html)
if (document.getElementById('forum-posts')) {
    let forumPosts = [];
    
    // Initialize forum with sample data
    function initializeForum() {
        // Check if we have stored posts in sessionStorage
        const storedPosts = sessionStorage.getItem('forumPosts');
        
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
            // Store in sessionStorage
            sessionStorage.setItem('forumPosts', JSON.stringify(forumPosts));
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
        sessionStorage.setItem('forumPosts', JSON.stringify(forumPosts));
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
            
            sessionStorage.setItem('forumPosts', JSON.stringify(forumPosts));
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
