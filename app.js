// TeleBlog Mini App - Core Functionality
class TeleBlogApp {
    constructor() {
        this.tg = window.Telegram?.WebApp;
        this.currentUser = null;
        this.isInitialized = false;
        
        this.init();
    }

    init() {
        console.log('🚀 Initializing TeleBlog Mini App...');
        
        // Show loading screen first
        this.showScreen('loading');
        
        // Initialize Telegram Web App
        if (this.tg) {
            this.tg.ready();
            this.tg.expand();
            
            console.log('📱 Telegram WebApp detected:', {
                platform: this.tg.platform,
                version: this.tg.version,
                initData: this.tg.initData ? 'available' : 'missing',
                initDataUnsafe: this.tg.initDataUnsafe ? 'available' : 'missing'
            });

            // Update app status
            document.getElementById('app-status').textContent = '✅ Ready in Telegram';
            
            // Try to get user data
            this.handleTelegramUser();
        } else {
            console.log('🌐 Regular browser environment');
            document.getElementById('app-status').textContent = '🌐 Web Browser Mode';
            this.showScreen('welcome');
        }

        this.setupEventListeners();
    }

    handleTelegramUser() {
        if (this.tg.initDataUnsafe?.user) {
            const user = this.tg.initDataUnsafe.user;
            console.log('👤 Telegram user detected:', user);
            
            this.currentUser = {
                id: user.id,
                firstName: user.first_name,
                lastName: user.last_name,
                username: user.username,
                photoUrl: user.photo_url,
                languageCode: user.language_code
            };

            this.updateUserInterface();
            this.showScreen('main-app');
            
            // Load initial data
            this.loadFeed();
            
        } else {
            console.log('❌ No Telegram user data available');
            this.showScreen('welcome');
        }
    }

    updateUserInterface() {
        if (!this.currentUser) return;

        const displayName = this.currentUser.firstName + (this.currentUser.lastName ? ' ' + this.currentUser.lastName : '');
        const username = this.currentUser.username ? '@' + this.currentUser.username : 'Telegram User';

        // Update welcome screen
        document.getElementById('user-name').textContent = displayName;
        document.getElementById('user-username').textContent = username;
        document.getElementById('user-info').style.display = 'block';

        // Update profile screen
        document.getElementById('profile-name').textContent = displayName;
        document.getElementById('profile-username').textContent = username;

        // Set avatar if available
        if (this.currentUser.photoUrl) {
            document.getElementById('user-avatar').src = this.currentUser.photoUrl;
            document.getElementById('profile-avatar').src = this.currentUser.photoUrl;
        }
    }

    setupEventListeners() {
        // Start button
        document.getElementById('start-btn').addEventListener('click', () => {
            if (this.tg && this.currentUser) {
                this.showScreen('main-app');
                this.loadFeed();
            } else {
                // Demo mode - create fake user
                this.currentUser = {
                    id: 'demo_user',
                    firstName: 'Demo',
                    lastName: 'User',
                    username: 'demouser'
                };
                this.updateUserInterface();
                this.showScreen('main-app');
                this.loadFeed();
            }
        });

        // Tab switching
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.target.getAttribute('data-tab');
                this.switchTab(tabName);
            });
        });

        // Publish button
        document.getElementById('publish-btn').addEventListener('click', () => {
            this.publishPost();
        });

        // Logout button
        document.getElementById('logout-btn').addEventListener('click', () => {
            this.logout();
        });
    }

    showScreen(screenName) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Show target screen
        document.getElementById(screenName).classList.add('active');
    }

    switchTab(tabName) {
        // Update active tab
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update active content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');

        // Load tab-specific data
        if (tabName === 'feed') {
            this.loadFeed();
        } else if (tabName === 'profile') {
            this.loadProfile();
        }
    }

    loadFeed() {
        const container = document.getElementById('posts-container');
        
        // Show loading state
        container.innerHTML = `
            <div class="empty-state">
                <div class="loader"></div>
                <p>Loading posts...</p>
            </div>
        `;

        // Simulate API call delay
        setTimeout(() => {
            // Demo posts for now
            const demoPosts = [
                {
                    id: 1,
                    title: 'Welcome to TeleBlog!',
                    content: 'This is your personal blogging space within Telegram. Start writing your first post!',
                    author: 'TeleBlog Team',
                    date: new Date().toISOString(),
                    likes: 5,
                    views: 23
                },
                {
                    id: 2,
                    title: 'How to Use TeleBlog',
                    content: 'Simply switch to the Write tab and start composing your articles. Your posts will be saved and can be shared with others.',
                    author: 'TeleBlog Team',
                    date: new Date(Date.now() - 86400000).toISOString(),
                    likes: 12,
                    views: 45
                }
            ];

            this.renderPosts(demoPosts);
        }, 1000);
    }

    renderPosts(posts) {
        const container = document.getElementById('posts-container');
        
        if (posts.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="icon">📝</div>
                    <h3>No posts yet</h3>
                    <p>Be the first to write something amazing!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = posts.map(post => `
            <div class="post-card" data-post-id="${post.id}">
                <div class="post-header">
                    <h3 class="post-title">${this.escapeHtml(post.title)}</h3>
                </div>
                <div class="post-content">
                    ${this.escapeHtml(post.content)}
                </div>
                <div class="post-meta">
                    <span class="post-author">By ${this.escapeHtml(post.author)}</span>
                    <span class="post-stats">
                        ❤️ ${post.likes} | 👁️ ${post.views}
                    </span>
                </div>
            </div>
        `).join('');
    }

    publishPost() {
        const title = document.getElementById('post-title').value.trim();
        const content = document.getElementById('post-content').value.trim();

        if (!title || !content) {
            alert('Please fill in both title and content');
            return;
        }

        const publishBtn = document.getElementById('publish-btn');
        publishBtn.textContent = 'Publishing...';
        publishBtn.disabled = true;

        // Simulate API call
        setTimeout(() => {
            // Show success message
            if (this.tg) {
                this.tg.showPopup({
                    title: 'Success!',
                    message: 'Your post has been published successfully.',
                    buttons: [{ type: 'ok' }]
                });
            } else {
                alert('Post published successfully!');
            }

            // Clear form
            document.getElementById('post-title').value = '';
            document.getElementById('post-content').value = '';

            // Reset button
            publishBtn.textContent = 'Publish Article';
            publishBtn.disabled = false;

            // Switch to feed and reload
            this.switchTab('feed');

        }, 1500);
    }

    loadProfile() {
        // Update profile stats (demo data for now)
        document.getElementById('posts-count').textContent = '2';
        document.getElementById('likes-count').textContent = '17';
        document.getElementById('views-count').textContent = '68';
    }

    logout() {
        if (confirm('Are you sure you want to logout?')) {
            this.currentUser = null;
            this.showScreen('welcome');
            
            // Reset UI
            document.getElementById('user-info').style.display = 'none';
            document.getElementById('post-title').value = '';
            document.getElementById('post-content').value = '';
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.teleBlogApp = new TeleBlogApp();
});

// Export for global access
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TeleBlogApp;
}