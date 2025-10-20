// Import everything from SDK and check what's available
import * as TelegramSDK from '@telegram-apps/sdk';

console.log('📦 Available Telegram SDK exports:', Object.keys(TelegramSDK));

class TeleBlogApp {
    constructor() {
        this.currentUser = null;
        this.isTelegram = false;
        this.init();
    }

    init() {
        console.log('🚀 Starting TeleBlog...');
        
        // Show welcome screen immediately
        this.showScreen('welcome');
        
        // Try to initialize Telegram with error handling
        this.initializeTelegram();
        
        this.setupEventListeners();
    }

    initializeTelegram() {
        try {
            // Try to initialize Telegram SDK
            if (TelegramSDK.init) {
                TelegramSDK.init();
                console.log('✅ Telegram SDK initialized');
                this.isTelegram = true;
            }
            
            // Check for user data using multiple methods
            this.checkForTelegramUser();
            
        } catch (error) {
            console.log('❌ Telegram SDK init failed, using fallback methods');
            this.checkClassicTelegram();
        }
    }

    checkForTelegramUser() {
        // Method 1: Check SDK initData
        if (TelegramSDK.initData && TelegramSDK.initData.user) {
            console.log('✅ User found via SDK initData:', TelegramSDK.initData.user);
            this.handleTelegramUser(TelegramSDK.initData.user);
            return;
        }
        
        // Method 2: Check if there's a different export name
        const sdk = TelegramSDK;
        for (const key in sdk) {
            if (sdk[key] && sdk[key].user) {
                console.log(`✅ User found via ${key}:`, sdk[key].user);
                this.handleTelegramUser(sdk[key].user);
                return;
            }
        }
        
        // Method 3: Check classic Telegram WebApp
        this.checkClassicTelegram();
    }

    checkClassicTelegram() {
        const classicTg = window.Telegram?.WebApp;
        if (classicTg) {
            console.log('📱 Classic Telegram WebApp detected');
            
            try {
                classicTg.ready();
                classicTg.expand();
                
                if (classicTg.initDataUnsafe?.user) {
                    console.log('✅ User found via classic WebApp:', classicTg.initDataUnsafe.user);
                    this.handleTelegramUser(classicTg.initDataUnsafe.user);
                    return;
                }
                
                // Check if initData is available as string
                if (classicTg.initData) {
                    console.log('📋 Raw initData available');
                    this.parseInitData(classicTg.initData);
                    return;
                }
            } catch (error) {
                console.log('❌ Classic Telegram init failed');
            }
        }
        
        console.log('🌐 No Telegram user data found - using demo mode');
    }

    parseInitData(initDataString) {
        try {
            const params = new URLSearchParams(initDataString);
            const userStr = params.get('user');
            
            if (userStr) {
                const userData = JSON.parse(decodeURIComponent(userStr));
                console.log('👤 Parsed user from initData:', userData);
                this.handleTelegramUser(userData);
            }
        } catch (error) {
            console.error('Error parsing initData:', error);
        }
    }

    handleTelegramUser(tgUser) {
        this.currentUser = {
            id: tgUser.id,
            firstName: tgUser.first_name || tgUser.firstName,
            lastName: tgUser.last_name || tgUser.lastName,
            username: tgUser.username,
            photoUrl: tgUser.photo_url || tgUser.photoUrl
        };

        console.log('✅ Telegram user authenticated:', this.currentUser.username);
        
        // Update UI with REAL Telegram user
        this.updateUserInterface();
        
        // In Telegram, go directly to main app
        this.showScreen('main-app');
        this.loadFeed();
    }

    updateUserInterface() {
        if (!this.currentUser) return;

        const displayName = this.currentUser.firstName + (this.currentUser.lastName ? ' ' + this.currentUser.lastName : '');
        const username = this.currentUser.username ? '@' + this.currentUser.username : 'Telegram User';

        console.log('📝 Updating UI for:', username);

        // Update ALL user displays
        const profileName = document.getElementById('profile-name');
        const profileUsername = document.getElementById('profile-username');
        const profileAvatar = document.getElementById('profile-avatar');
        
        if (profileName) profileName.textContent = displayName;
        if (profileUsername) profileUsername.textContent = username;
        if (profileAvatar && this.currentUser.photoUrl) {
            profileAvatar.src = this.currentUser.photoUrl;
        } else if (profileAvatar) {
            profileAvatar.src = 'https://cdn-icons-png.flaticon.com/512/3177/3177440.png';
        }
    }

    setupEventListeners() {
        // Get Started button
        document.getElementById('start-btn').addEventListener('click', () => {
            console.log('🎯 Get Started clicked');
            
            if (this.currentUser) {
                // Already have Telegram user
                this.showScreen('main-app');
                this.loadFeed();
            } else {
                // Demo mode - but make it clear it's demo
                this.currentUser = {
                    id: 'demo',
                    firstName: 'Demo',
                    lastName: 'User', 
                    username: 'demo_user'
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

        // Publish
        document.getElementById('publish-btn').addEventListener('click', () => {
            this.publishPost();
        });

        // Logout
        document.getElementById('logout-btn').addEventListener('click', () => {
            if (confirm('Are you sure you want to logout?')) {
                this.logout();
            }
        });
    }

    showScreen(screenName) {
        console.log('🔄 Switching to:', screenName);
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenName).classList.add('active');
    }

    switchTab(tabName) {
        console.log('🔀 Switching tab to:', tabName);
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');

        if (tabName === 'feed') this.loadFeed();
        if (tabName === 'profile') this.loadProfile();
    }

    loadFeed() {
        const container = document.getElementById('posts-container');
        const author = this.currentUser?.username ? '@' + this.currentUser.username : 'You';
        
        const posts = [
            {
                title: 'Welcome to TeleBlog! 🎉',
                content: 'Start writing your thoughts and share them with the world.',
                author: author,
                likes: 0,
                views: 1
            },
            {
                title: 'Getting Started Guide',
                content: 'Click the Write tab to create your first post. Your content will be saved automatically.',
                author: author,
                likes: 0,
                views: 1
            }
        ];

        container.innerHTML = posts.map(post => `
            <div class="post-card">
                <h3>${post.title}</h3>
                <p>${post.content}</p>
                <div style="display: flex; justify-content: space-between; margin-top: 10px; font-size: 0.875rem; color: #666;">
                    <span>By ${post.author}</span>
                    <span>❤️ ${post.likes} | 👁️ ${post.views}</span>
                </div>
            </div>
        `).join('');
    }

    loadProfile() {
        // Make sure profile is updated
        if (this.currentUser) {
            this.updateUserInterface();
        }
        
        document.getElementById('posts-count').textContent = '2';
        document.getElementById('likes-count').textContent = '0';
        document.getElementById('views-count').textContent = '2';
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
            document.getElementById('post-title').value = '';
            document.getElementById('post-content').value = '';
            btn.textContent = originalText;
            btn.disabled = false;
            alert('Post published successfully!');
            this.switchTab('feed');
        }, 1000);
    }

    logout() {
        this.currentUser = null;
        this.isTelegram = false;
        this.showScreen('welcome');
        
        // Reset profile to default
        document.getElementById('profile-name').textContent = 'User Name';
        document.getElementById('profile-username').textContent = '@username';
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM ready - starting TeleBlog');
    window.teleBlogApp = new TeleBlogApp();
});

// Also check if Telegram is available globally
if (window.Telegram && window.Telegram.WebApp) {
    console.log('🌍 Global Telegram WebApp detected');
}