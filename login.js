class LoginSystem {
    constructor() {
        this.adminCredentials = {
            username: 'admin',
            password: 'admin123'
        };
        this.settings = {
            logo: ''
        };
        this.initializeApp();
        this.loadSettings();
    }

    initializeApp() {
        // Load admin credentials from localStorage
        const savedCredentials = localStorage.getItem('adminCredentials');
        if (savedCredentials) {
            this.adminCredentials = JSON.parse(savedCredentials);
        }

        // Main login form
        document.getElementById('mainLoginForm').addEventListener('submit', (e) => this.handleMainLogin(e));

        // Load logo if exists
        this.loadLogo();
    }

    loadSettings() {
        const savedSettings = localStorage.getItem('bankBookSettings');
        if (savedSettings) {
            this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
            this.loadLogo();
        }
    }

    loadLogo() {
        const logoImg = document.getElementById('loginLogo');
        if (this.settings.logo) {
            logoImg.src = this.settings.logo;
            logoImg.style.display = 'block';
        } else {
            logoImg.style.display = 'none';
        }
    }

    handleMainLogin(e) {
        e.preventDefault();
        const username = document.getElementById('mainUsername').value;
        const password = document.getElementById('mainPassword').value;

        if (username === this.adminCredentials.username && password === this.adminCredentials.password) {
            // Save login session
            localStorage.setItem('adminLoginSession', 'true');
            localStorage.setItem('adminLoginTime', new Date().getTime().toString());
            
            // Redirect to main application
            window.location.href = 'index.html';
        } else {
            alert('❌ Username atau password salah!');
            // Clear form
            document.getElementById('mainUsername').value = '';
            document.getElementById('mainPassword').value = '';
            document.getElementById('mainUsername').focus();
        }
    }
}

// Initialize login system
const loginSystem = new LoginSystem();