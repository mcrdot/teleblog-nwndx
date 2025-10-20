// TeleBlog Mini App - Fixed User Display
class TeleBlogApp {
    constructor() {
        this.tg = window.Telegram?.WebApp;
        this.currentUser = null;
        this.init();
    }

    init() {
        console.log('🚀 Initializing TeleBlog Mini App...');
        
        // Show loading screen briefly
        this.showScreen('loading');
        
        // Initialize Telegram Web App
        if (this.tg) {
            this.tg.ready();
            this.tg.expand();
            
            console.log('📱 Telegram WebApp detected');
            console.log('User data:', this.tg.initDataUnsafe?.user);
            
            // Immediate user detection
            if (this.tg.initDataUnsafe?.user) {
                this.handleTelegramUser();
            } else {
                // No user data, show welcome immediately
                setTimeout(() => this.showScreen('welcome'), 100);
            }
        } else {
            // Not in Telegram, show welcome immediately
            setTimeout(() => this.showScreen('welcome'), 100);
        }

        this.setupEventListeners();
    }

    handleTelegramUser() {
        const user = this.tg.initDataUnsafe.user;
        console.log('👤 Telegram user detected:', user);
        
        this.currentUser = {
            id: user.id,
            firstName: user.first_name,
            lastName: user.last_name,
            username: user.username,
            photoUrl: user.photo_url
        };

        // UPDATE PROFILE USERNAME IMMEDIATELY
        this.updateProfileWithTelegramUser();
        
        // Show main app directly in Telegram
        this.showScreen('main-app');
        this.loadFeed();
    }

    updateProfileWithTelegramUser() {
        if (!this.currentUser) return;

        const displayName = this.currentUser.firstName + (this.currentUser.lastName ? ' ' + this.currentUser.lastName : '');
        const username = this.currentUser.username ? '@' + this.currentUser.username : 'Telegram User';

        console.log('Updating profile with:', { displayName, username });

        // UPDATE THE PROFILE USERNAME ELEMENT
        const profileNameElement = document.getElementById('profile-name');
        const profileUsernameElement = document.getElementById('profile-username');
        
        if (profileNameElement) {
            profileNameElement.textContent = displayName;
        }
        
        if (profileUsernameElement) {
            profileUsernameElement.textContent = username;
        }

        // Also update welcome screen user info
        const userNameElement = document.getElementById('user-name');
        const userUsernameElement = document.getElementById('user-username');
        const userInfoElement = document.getElementById('user-info');
        
        if (userNameElement) userNameElement.textContent = displayName;
        if (userUsernameElement) userUsernameElement.textContent = username;
        if (userInfoElement) userInfoElement.style.display = 'block';

        // Set avatar if available
        const avatarElements = [
            document.getElementById('user-avatar'),
            document.getElementById('profile-avatar')
        ];
        
        avatarElements.forEach(avatar => {
            if (avatar && this.currentUser.photoUrl) {
                avatar.src = this.currentUser.photoUrl;
            }
        });
    }

    setupEventListeners() {
        // Start button
        document.getElementById('start-btn').addEventListener('click', () => {
            if (this.tg && this.currentUser) {
                this.showScreen('main-app');
                this.loadFeed();
            } else {
                // Demo mode - show welcome screen
                this.showScreen('welcome');
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
        console.log('Switching to screen:', screenName);
        
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Show target screen
        const targetScreen = document.getElementById(screenName);
        if (targetScreen) {
            targetScreen.classList.add('active');
        }
        
        // If switching to profile, make sure user data is updated
        if (screenName === 'profile' && this.currentUser) {
            this.updateProfileWithTelegramUser();
        }
    }

    switchTab(tabName) {
        console.log('Switching to tab:', tabName);
        
        // Update active tab
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
        }

        // Update active content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        const activeContent = document.getElementById(tabName);
        if (activeContent) {
            activeContent.classList.add('active');
        }

        // Load tab-specific data
        if (tabName === 'feed') {
            this.loadFeed();
        } else if (tabName === 'profile') {
            this.loadProfile();
        }
    }

    loadFeed() {
        const container = document.getElementById('posts-container');
        
        if (!container) {
            console.error('Posts container not found');
            return;
        }

        container.innerHTML = `
            <div class="empty-state">
                <div class="loader"></div>
                <p>Loading posts...</p>
            </div>
        `;

        // Simulate loading posts
        setTimeout(() => {
            const authorName = this.currentUser?.username ? '@' + this.currentUser.username : 'You';
            
            const demoPosts = [
                {
                    id: 1,
                    title: 'Welcome to TeleBlog! 🎉',
                    content: 'This is your personal blogging space within Telegram. Start writing your thoughts and share them with the world.',
                    author: authorName,
                    date: new Date().toISOString(),
                    likes: 0,
                    views: 1
                },
                {
                    id: 2,
                    title: 'Getting Started',
                    content: 'Switch to the Write tab to create your first post. Your content will be saved and can be viewed anytime.',
                    author: authorName,
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
            // Visual feedback for empty fields
            if (!title) document.getElementById('post-title').classList.add('input-error');
            if (!content) document.getElementById('post-content').classList.add('input-error');
            
            setTimeout(() => {
                document.getElementById('post-title').classList.remove('input-error');
                document.getElementById('post-content').classList.remove('input-error');
            }, 1000);
            return;
        }

        const publishBtn = document.getElementById('publish-btn');
        const originalText = publishBtn.textContent;
        
        publishBtn.textContent = 'Publishing...';
        publishBtn.disabled = true;

        // Simulate API call
        setTimeout(() => {
            // Success - clear form
            document.getElementById('post-title').value = '';
            document.getElementById('post-content').value = '';

            // Reset button
            publishBtn.textContent = originalText;
            publishBtn.disabled = false;

            // Visual feedback
            publishBtn.classList.add('success');
            setTimeout(() => {
                publishBtn.classList.remove('success');
            }, 1000);

            // Switch to feed
            this.switchTab('feed');

        }, 1000);
    }

    loadProfile() {
        // Make sure profile is updated with current user data
        if (this.currentUser) {
            this.updateProfileWithTelegramUser();
        }
        
        // Update stats
        const postsCount = document.getElementById('posts-count');
        const likesCount = document.getElementById('likes-count');
        const viewsCount = document.getElementById('views-count');
        
        if (postsCount) postsCount.textContent = '2';
        if (likesCount) likesCount.textContent = '0';
        if (viewsCount) viewsCount.textContent = '2';
    }

    logout() {
        this.currentUser = null;
        this.showScreen('welcome');
        
        // Reset UI
        const userInfo = document.getElementById('user-info');
        if (userInfo) userInfo.style.display = 'none';
        
        document.getElementById('post-title').value = '';
        document.getElementById('post-content').value = '';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    window.teleBlogApp = new TeleBlogApp();
});