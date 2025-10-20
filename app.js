// TeleBlog Mini App - SIMPLE & PROPER
class TeleBlogApp {
    constructor() {
        this.tg = window.Telegram?.WebApp;
        this.currentUser = null;
    }

    init() {
        console.log('🚀 Starting TeleBlog...');
        
        // NO LOADER - Show welcome screen immediately
        this.showScreen('welcome');
        
        if (this.tg) {
            console.log('📱 Telegram WebApp detected');
            
            // PROPER Telegram initialization
            this.tg.ready();
            this.tg.expand();
            this.tg.disableVerticalSwipes();
            
            // Get user from Telegram IMMEDIATELY
            if (this.tg.initDataUnsafe && this.tg.initDataUnsafe.user) {
                const tgUser = this.tg.initDataUnsafe.user;
                console.log('👤 Telegram User:', tgUser);
                
                this.currentUser = {
                    id: tgUser.id,
                    firstName: tgUser.first_name,
                    lastName: tgUser.last_name,
                    username: tgUser.username,
                    photoUrl: tgUser.photo_url
                };
                
                // Update UI with REAL Telegram user
                this.updateUserInterface();
                
                // In Telegram, go directly to main app (skip welcome)
                this.showScreen('main-app');
                this.loadFeed();
            }
        }

        this.setupEventListeners();
    }

    updateUserInterface() {
        if (!this.currentUser) return;

        const displayName = this.currentUser.firstName + (this.currentUser.lastName ? ' ' + this.currentUser.lastName : '');
        const username = this.currentUser.username ? '@' + this.currentUser.username : 'Telegram User';

        console.log('📝 Setting user:', username);

        // Update PROFILE with REAL Telegram user
        const profileName = document.getElementById('profile-name');
        const profileUsername = document.getElementById('profile-username');
        if (profileName) profileName.textContent = displayName;
        if (profileUsername) profileUsername.textContent = username;

        // Update avatars
        const avatars = [
            document.getElementById('user-avatar'),
            document.getElementById('profile-avatar')
        ];
        
        avatars.forEach(avatar => {
            if (avatar && this.currentUser.photoUrl) {
                avatar.src = this.currentUser.photoUrl;
            }
        });
    }

    setupEventListeners() {
        // Get Started button - SIMPLE
        document.getElementById('start-btn').addEventListener('click', () => {
            if (this.currentUser) {
                // Already have Telegram user
                this.showScreen('main-app');
                this.loadFeed();
            } else {
                // Demo mode - but show it's demo
                this.currentUser = {
                    id: 'demo',
                    firstName: 'Demo',
                    lastName: 'User',
                    username: 'demo_user'
                };
                
                // Update UI to show DEMO clearly
                document.getElementById('profile-name').textContent = 'Demo User';
                document.getElementById('profile-username').textContent = '@demo_user';
                
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
            this.logout();
        });
    }

    showScreen(screenName) {
        // Hide all, show target
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenName).classList.add('active');
    }

    switchTab(tabName) {
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

        // Load data
        if (tabName === 'feed') this.loadFeed();
        if (tabName === 'profile') this.loadProfile();
    }

    loadFeed() {
        const container = document.getElementById('posts-container');
        const author = this.currentUser?.username ? '@' + this.currentUser.username : 'You';
        
        const posts = [
            {
                id: 1,
                title: 'Welcome to TeleBlog! 🎉',
                content: 'Start writing your thoughts and share them with the world.',
                author: author,
                likes: 0,
                views: 1
            }
        ];

        container.innerHTML = posts.map(post => `
            <div class="post-card">
                <div class="post-header">
                    <h3 class="post-title">${post.title}</h3>
                </div>
                <div class="post-content">${post.content}</div>
                <div class="post-meta">
                    <span class="post-author">By ${post.author}</span>
                    <span class="post-stats">❤️ ${post.likes} | 👁️ ${post.views}</span>
                </div>
            </div>
        `).join('');
    }

    loadProfile() {
        // Just update stats
        document.getElementById('posts-count').textContent = '1';
        document.getElementById('likes-count').textContent = '0';
        document.getElementById('views-count').textContent = '1';
    }

    publishPost() {
        const title = document.getElementById('post-title').value;
        const content = document.getElementById('post-content').value;

        if (!title || !content) {
            alert('Please fill both fields');
            return;
        }

        const btn = document.getElementById('publish-btn');
        btn.textContent = 'Published!';
        btn.disabled = true;

        setTimeout(() => {
            document.getElementById('post-title').value = '';
            document.getElementById('post-content').value = '';
            btn.textContent = 'Publish Article';
            btn.disabled = false;
            this.switchTab('feed');
        }, 1000);
    }

    logout() {
        this.currentUser = null;
        this.showScreen('welcome');
    }
}

// Start immediately when DOM loads
document.addEventListener('DOMContentLoaded', () => {
    window.teleBlogApp = new TeleBlogApp();
    window.teleBlogApp.init();
});