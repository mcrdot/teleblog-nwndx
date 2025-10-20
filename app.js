// TeleBlog Mini App - Enhanced Version
class TeleBlogApp {
    constructor() {
        this.tg = window.Telegram?.WebApp;
        this.currentUser = null;
        this.init();
    }

    init() {
        console.log('🚀 Initializing TeleBlog Mini App...');
        
        // Show loading screen briefly (500ms max)
        this.showScreen('loading');
        
        // Initialize Telegram Web App
        if (this.tg) {
            this.tg.ready();
            this.tg.expand();
            this.tg.disableVerticalSwipes(); // Better UX
            
            console.log('📱 Telegram WebApp detected');
            
            // Quick check for user data (no delays)
            if (this.tg.initDataUnsafe?.user) {
                this.handleTelegramUser();
            } else {
                // No user data, show welcome immediately
                setTimeout(() => this.showScreen('welcome'), 300);
            }
        } else {
            // Not in Telegram, show welcome immediately
            setTimeout(() => this.showScreen('welcome'), 300);
        }

        this.setupEventListeners();
        
        // Emergency: Remove loading screen after max 2 seconds
        setTimeout(() => {
            if (document.getElementById('loading').classList.contains('active')) {
                this.showScreen('welcome');
            }
        }, 2000);
    }

    handleTelegramUser() {
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
        
        // Show main app immediately (no welcome screen in Telegram)
        this.showScreen('main-app');
        this.loadFeed();
    }

    updateUserInterface() {
        if (!this.currentUser) return;

        const displayName = this.currentUser.firstName + (this.currentUser.lastName ? ' ' + this.currentUser.lastName : '');
        const username = this.currentUser.username ? '@' + this.currentUser.username : 'Telegram User';

        // Update all user info displays
        document.getElementById('user-name').textContent = displayName;
        document.getElementById('user-username').textContent = username;
        document.getElementById('profile-name').textContent = displayName;
        document.getElementById('profile-username').textContent = username;

        // Set avatar if available
        if (this.currentUser.photoUrl) {
            document.getElementById('user-avatar').src = this.currentUser.photoUrl;
            document.getElementById('profile-avatar').src = this.currentUser.photoUrl;
        } else {
            // Default avatar
            document.getElementById('user-avatar').src = 'https://cdn-icons-png.flaticon.com/512/3177/3177440.png';
            document.getElementById('profile-avatar').src = 'https://cdn-icons-png.flaticon.com/512/3177/3177440.png';
        }
        
        // Show user info in welcome screen
        document.getElementById('user-info').style.display = 'block';
    }

    setupEventListeners() {
        // Start button
        document.getElementById('start-btn').addEventListener('click', () => {
            if (this.tg && this.currentUser) {
                this.showScreen('main-app');
                this.loadFeed();
            } else {
                // Demo mode
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

        // Publish button - silent action
        document.getElementById('publish-btn').addEventListener('click', () => {
            this.publishPost();
        });

        // Logout button - minimal confirmation
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

        // Simulate API call
        setTimeout(() => {
            const demoPosts = [
                {
                    id: 1,
                    title: 'Welcome to TeleBlog! 🎉',
                    content: 'Start writing your thoughts and share them with the world. Your personal blogging space within Telegram.',
                    author: this.currentUser?.username ? '@' + this.currentUser.username : 'You',
                    date: new Date().toISOString(),
                    likes: 0,
                    views: 1
                }
            ];

            this.renderPosts(demoPosts);
        }, 800);
    }

    renderPosts(posts) {
        const container = document.getElementById('posts-container');
        
        if (posts.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="icon">📝</div>
                    <h3>No posts yet</h3>
                    <p>Write your first post to get started!</p>
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
            // Silent validation - just highlight empty fields
            if (!title) document.getElementById('post-title').style.borderColor = 'red';
            if (!content) document.getElementById('post-content').style.borderColor = 'red';
            setTimeout(() => {
                document.getElementById('post-title').style.borderColor = '';
                document.getElementById('post-content').style.borderColor = '';
            }, 1000);
            return;
        }

        const publishBtn = document.getElementById('publish-btn');
        const originalText = publishBtn.textContent;
        
        publishBtn.textContent = 'Publishing...';
        publishBtn.disabled = true;

        // Simulate API call
        setTimeout(() => {
            // Success - clear form and switch to feed
            document.getElementById('post-title').value = '';
            document.getElementById('post-content').value = '';

            // Reset button
            publishBtn.textContent = originalText;
            publishBtn.disabled = false;

            // Switch to feed and show the new post
            this.switchTab('feed');
            
            // Add visual feedback (no popup)
            publishBtn.style.backgroundColor = '#4CAF50';
            setTimeout(() => {
                publishBtn.style.backgroundColor = '';
            }, 1000);

        }, 1000);
    }

    loadProfile() {
        // Update profile stats
        document.getElementById('posts-count').textContent = '1';
        document.getElementById('likes-count').textContent = '0';
        document.getElementById('views-count').textContent = '1';
    }

    logout() {
        // Simple logout without confirmation popup
        this.currentUser = null;
        this.showScreen('welcome');
        
        // Reset UI
        document.getElementById('user-info').style.display = 'none';
        document.getElementById('post-title').value = '';
        document.getElementById('post-content').value = '';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize immediately when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.teleBlogApp = new TeleBlogApp();
    });
} else {
    // DOM already ready
    window.teleBlogApp = new TeleBlogApp();
}