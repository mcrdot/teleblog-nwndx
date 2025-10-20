// TeleBlog Mini App - PROPERLY FIXED
class TeleBlogApp {
    constructor() {
        this.tg = window.Telegram?.WebApp;
        this.currentUser = null;
    }

    init() {
        console.log('🚀 Initializing TeleBlog Mini App...');
        
        // Show loading screen first
        this.showScreen('loading');
        
        // Check if we're in Telegram
        if (this.tg) {
            console.log('📱 Telegram WebApp detected');
            
            // Initialize Telegram WebApp
            this.tg.ready();
            this.tg.expand();
            
            // Check for user data immediately
            if (this.tg.initDataUnsafe?.user) {
                console.log('✅ User data found:', this.tg.initDataUnsafe.user);
                this.handleTelegramUser();
            } else {
                console.log('❌ No user data found');
                // No user data, go to welcome screen
                this.showScreen('welcome');
            }
        } else {
            console.log('🌐 Regular browser environment');
            // Not in Telegram, go to welcome screen
            this.showScreen('welcome');
        }

        this.setupEventListeners();
    }

    handleTelegramUser() {
        const user = this.tg.initDataUnsafe.user;
        console.log('👤 Setting up Telegram user:', user);
        
        this.currentUser = {
            id: user.id,
            firstName: user.first_name,
            lastName: user.last_name,
            username: user.username,
            photoUrl: user.photo_url
        };

        // Update UI with user data
        this.updateUserInterface();
        
        // Show main app directly (skip welcome in Telegram)
        this.showScreen('main-app');
        this.loadFeed();
    }

    updateUserInterface() {
        if (!this.currentUser) return;

        const displayName = this.currentUser.firstName + (this.currentUser.lastName ? ' ' + this.currentUser.lastName : '');
        const username = this.currentUser.username ? '@' + this.currentUser.username : 'Telegram User';

        console.log('📝 Updating UI with:', displayName, username);

        // Update PROFILE section
        const profileName = document.getElementById('profile-name');
        const profileUsername = document.getElementById('profile-username');
        if (profileName) profileName.textContent = displayName;
        if (profileUsername) profileUsername.textContent = username;

        // Update WELCOME screen user info
        const userName = document.getElementById('user-name');
        const userUsername = document.getElementById('user-username');
        const userInfo = document.getElementById('user-info');
        if (userName) userName.textContent = displayName;
        if (userUsername) userUsername.textContent = username;
        if (userInfo) userInfo.style.display = 'block';

        // Update avatars
        const avatars = [
            document.getElementById('user-avatar'),
            document.getElementById('profile-avatar')
        ];
        
        avatars.forEach(avatar => {
            if (avatar) {
                if (this.currentUser.photoUrl) {
                    avatar.src = this.currentUser.photoUrl;
                } else {
                    avatar.src = 'https://cdn-icons-png.flaticon.com/512/3177/3177440.png';
                }
            }
        });
    }

    setupEventListeners() {
        // Get Started button - FIXED
        const startBtn = document.getElementById('start-btn');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                console.log('🎯 Get Started clicked');
                
                if (this.tg && this.currentUser) {
                    // In Telegram with user - go to main app
                    this.showScreen('main-app');
                    this.loadFeed();
                } else {
                    // Not in Telegram or no user - create demo user
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
        }

        // Tab switching
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.target.getAttribute('data-tab');
                this.switchTab(tabName);
            });
        });

        // Publish button
        const publishBtn = document.getElementById('publish-btn');
        if (publishBtn) {
            publishBtn.addEventListener('click', () => {
                this.publishPost();
            });
        }

        // Logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.logout();
            });
        }
    }

    showScreen(screenName) {
        console.log('🔄 Switching to screen:', screenName);
        
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Show target screen
        const targetScreen = document.getElementById(screenName);
        if (targetScreen) {
            targetScreen.classList.add('active');
        }
    }

    switchTab(tabName) {
        console.log('🔀 Switching to tab:', tabName);
        
        // Update active tab buttons
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update active content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');

        // Load content for the tab
        if (tabName === 'feed') {
            this.loadFeed();
        } else if (tabName === 'profile') {
            this.loadProfile();
        }
    }

    loadFeed() {
        const container = document.getElementById('posts-container');
        if (!container) return;

        container.innerHTML = `
            <div class="empty-state">
                <div class="loader"></div>
                <p>Loading posts...</p>
            </div>
        `;

        // Simulate loading
        setTimeout(() => {
            const authorName = this.currentUser?.username ? '@' + this.currentUser.username : 'You';
            
            const posts = [
                {
                    id: 1,
                    title: 'Welcome to TeleBlog! 🎉',
                    content: 'This is your personal blogging space within Telegram. Start writing your thoughts and share them with the world.',
                    author: authorName,
                    likes: 0,
                    views: 1
                }
            ];

            this.renderPosts(posts);
        }, 800);
    }

    renderPosts(posts) {
        const container = document.getElementById('posts-container');
        if (!container) return;

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
            <div class="post-card">
                <div class="post-header">
                    <h3 class="post-title">${this.escapeHtml(post.title)}</h3>
                </div>
                <div class="post-content">
                    ${this.escapeHtml(post.content)}
                </div>
                <div class="post-meta">
                    <span class="post-author">By ${this.escapeHtml(post.author)}</span>
                    <span class="post-stats">❤️ ${post.likes} | 👁️ ${post.views}</span>
                </div>
            </div>
        `).join('');
    }

    publishPost() {
        const title = document.getElementById('post-title').value.trim();
        const content = document.getElementById('post-content').value.trim();

        if (!title || !content) {
            // Visual feedback
            if (!title) document.getElementById('post-title').classList.add('input-error');
            if (!content) document.getElementById('post-content').classList.add('input-error');
            
            setTimeout(() => {
                document.getElementById('post-title').classList.remove('input-error');
                document.getElementById('post-content').classList.remove('input-error');
            }, 1000);
            return;
        }

        const btn = document.getElementById('publish-btn');
        btn.textContent = 'Publishing...';
        btn.disabled = true;

        setTimeout(() => {
            // Clear form
            document.getElementById('post-title').value = '';
            document.getElementById('post-content').value = '';
            
            // Reset button
            btn.textContent = 'Publish Article';
            btn.disabled = false;
            
            // Switch to feed
            this.switchTab('feed');
        }, 1000);
    }

    loadProfile() {
        // Update stats
        document.getElementById('posts-count').textContent = '1';
        document.getElementById('likes-count').textContent = '0';
        document.getElementById('views-count').textContent = '1';
    }

    logout() {
        this.currentUser = null;
        this.showScreen('welcome');
        document.getElementById('user-info').style.display = 'none';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM fully loaded');
    window.teleBlogApp = new TeleBlogApp();
    window.teleBlogApp.init();
});