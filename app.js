// TeleBlog Mini App - PROPER Telegram Init Data Handling
class TeleBlogApp {
    constructor() {
        this.tg = window.Telegram?.WebApp;
        this.currentUser = null;
        this.initData = null;
    }

    async init() {
        console.log('🚀 Initializing TeleBlog Mini App...');
        
        // Show loading screen first
        this.showScreen('loading');
        
        if (this.tg) {
            console.log('📱 Telegram WebApp detected');
            
            // PROPER Telegram initialization
            this.tg.ready();
            this.tg.expand();
            
            // Wait for Telegram to fully initialize
            await this.waitForTelegramInit();
            
            // Get initData properly
            this.initData = this.tg.initData || '';
            console.log('📋 Init Data available:', !!this.initData);
            
            if (this.initData) {
                await this.handleTelegramAuth();
            } else {
                console.log('❌ No initData available');
                this.showScreen('welcome');
            }
        } else {
            console.log('🌐 Regular browser environment');
            this.showScreen('welcome');
        }

        this.setupEventListeners();
    }

    async waitForTelegramInit() {
        return new Promise((resolve) => {
            if (this.tg.initData) {
                resolve();
            } else {
                // Wait for initData to be available
                const checkInterval = setInterval(() => {
                    if (this.tg.initData) {
                        clearInterval(checkInterval);
                        resolve();
                    }
                }, 100);
                
                // Timeout after 3 seconds
                setTimeout(() => {
                    clearInterval(checkInterval);
                    resolve();
                }, 3000);
            }
        });
    }

    async handleTelegramAuth() {
        try {
            console.log('🔐 Processing Telegram authentication...');
            
            // Parse initData to get user information
            const userData = this.parseInitData(this.initData);
            
            if (userData) {
                this.currentUser = {
                    id: userData.id,
                    firstName: userData.first_name,
                    lastName: userData.last_name,
                    username: userData.username,
                    photoUrl: userData.photo_url,
                    languageCode: userData.language_code
                };

                console.log('✅ User authenticated:', this.currentUser);
                
                // Update UI with user data
                this.updateUserInterface();
                
                // Show main app directly in Telegram
                this.showScreen('main-app');
                this.loadFeed();
            } else {
                throw new Error('Could not parse user data from initData');
            }
            
        } catch (error) {
            console.error('❌ Telegram auth error:', error);
            this.showScreen('welcome');
        }
    }

    parseInitData(initData) {
        try {
            // Parse the initData string (format: key=value&key2=value2)
            const params = new URLSearchParams(initData);
            const userStr = params.get('user');
            
            if (userStr) {
                const userData = JSON.parse(decodeURIComponent(userStr));
                console.log('👤 Parsed user data:', userData);
                return userData;
            }
            
            // Fallback to initDataUnsafe if available
            if (this.tg.initDataUnsafe?.user) {
                console.log('🔄 Using initDataUnsafe as fallback');
                return this.tg.initDataUnsafe.user;
            }
            
            return null;
        } catch (error) {
            console.error('Error parsing initData:', error);
            return null;
        }
    }

    updateUserInterface() {
        if (!this.currentUser) return;

        const displayName = this.currentUser.firstName + (this.currentUser.lastName ? ' ' + this.currentUser.lastName : '');
        const username = this.currentUser.username ? '@' + this.currentUser.username : 'Telegram User';

        console.log('📝 Updating UI for:', username);

        // Update ALL user info displays
        const elementsToUpdate = {
            'profile-name': displayName,
            'profile-username': username,
            'user-name': displayName,
            'user-username': username
        };

        Object.entries(elementsToUpdate).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
                console.log(`✅ Updated ${id}: ${value}`);
            }
        });

        // Show user info in welcome screen
        const userInfo = document.getElementById('user-info');
        if (userInfo) userInfo.style.display = 'block';

        // Update avatars
        const avatarUrls = [
            document.getElementById('user-avatar'),
            document.getElementById('profile-avatar')
        ];

        avatarUrls.forEach(avatar => {
            if (avatar) {
                if (this.currentUser.photoUrl) {
                    avatar.src = this.currentUser.photoUrl;
                } else {
                    // Default avatar
                    avatar.src = 'https://cdn-icons-png.flaticon.com/512/3177/3177440.png';
                }
            }
        });
    }

    setupEventListeners() {
        // Get Started button
        const startBtn = document.getElementById('start-btn');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                console.log('🎯 Get Started button clicked');
                
                if (this.currentUser) {
                    // User is authenticated, go to main app
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
                if (confirm('Are you sure you want to logout?')) {
                    this.logout();
                }
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
        
        // Update tabs
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');

        // Load content
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
                },
                {
                    id: 2,
                    title: 'Getting Started Guide',
                    content: 'Click the Write tab to create your first post. Your content will be saved and you can view it anytime in your feed.',
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
                    <p>Be the first to write something amazing!</p>
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
            alert('Please fill in both title and content');
            return;
        }

        const btn = document.getElementById('publish-btn');
        const originalText = btn.textContent;
        
        btn.textContent = 'Publishing...';
        btn.disabled = true;

        setTimeout(() => {
            // Clear form
            document.getElementById('post-title').value = '';
            document.getElementById('post-content').value = '';
            
            // Reset button
            btn.textContent = originalText;
            btn.disabled = false;
            
            // Show success and switch to feed
            alert('Post published successfully!');
            this.switchTab('feed');
        }, 1000);
    }

    loadProfile() {
        // Update profile stats
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
        
        // Hide user info
        const userInfo = document.getElementById('user-info');
        if (userInfo) userInfo.style.display = 'none';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM Content Loaded - Starting TeleBlog...');
    window.teleBlogApp = new TeleBlogApp();
    window.teleBlogApp.init();
});

// Also initialize if DOM is already loaded
if (document.readyState === 'interactive' || document.readyState === 'complete') {
    console.log('📄 DOM already ready - Starting TeleBlog immediately...');
    window.teleBlogApp = new TeleBlogApp();
    window.teleBlogApp.init();
}