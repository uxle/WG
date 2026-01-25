// --- APP STATE ---
const state = {
    view: 'game',
    todMode: 'truth',
    currentUser: JSON.parse(localStorage.getItem('lx_current_user')), // Load session
    score: 0,
    games: 0,
    word: '',
    scrambled: '',
    attempts: 0,
    maxAttempts: 10,
    theme: localStorage.getItem('lx_theme') || 'dark'
};

// Initialize Score/Games from currentUser if exists
if (state.currentUser) {
    state.score = state.currentUser.score || 0;
    state.games = state.currentUser.games || 0;
}

// --- DOM HELPER ---
const el = id => document.getElementById(id);

// --- TOAST NOTIFICATION ---
const showToast = (msg, icon='info') => {
    const t = el('toast');
    if(!t) return;
    el('toast-msg').innerText = msg;
    el('toast-icon').innerText = icon;
    t.style.opacity = '1';
    t.style.transform = 'translateX(-50%) translateY(0)';
    setTimeout(() => {
        t.style.opacity = '0';
        t.style.transform = 'translateX(-50%) translateY(100px)';
    }, 2500);
};

// --- DATA PERSISTENCE ---
function saveUserProgress() {
    if (!state.currentUser) return;

    // 1. Update state object
    state.currentUser.score = state.score;
    state.currentUser.games = state.games;

    // 2. Update Session
    localStorage.setItem('lx_current_user', JSON.stringify(state.currentUser));

    // 3. Update Database (lx_users)
    const storedUsers = JSON.parse(localStorage.getItem('lx_users') || '[]');
    const userIndex = storedUsers.findIndex(u => u.username === state.currentUser.username);
    
    if (userIndex !== -1) {
        storedUsers[userIndex] = state.currentUser;
        localStorage.setItem('lx_users', JSON.stringify(storedUsers));
    } else {
        // Fallback: If user oddly missing from array, re-add them
        storedUsers.push(state.currentUser);
        localStorage.setItem('lx_users', JSON.stringify(storedUsers));
    }
}

// --- PROFILE HELPERS ---
function updateProfile() {
    if (state.currentUser) {
        if(el('profile-name')) el('profile-name').innerText = state.currentUser.username;
        if(el('profile-email')) el('profile-email').innerText = state.currentUser.email;
    }
    if(el('profile-score')) el('profile-score').innerText = state.score;
    if(el('profile-games')) el('profile-games').innerText = state.games;
}

// --- THEME HANDLING ---
function initTheme() {
    const btn = el('btn-theme-toggle');
    if(!btn) return;
    
    const icon = btn.querySelector('span');

    // Apply saved theme
    if (state.theme === 'light') {
        document.documentElement.classList.add('light-theme');
        icon.innerText = 'light_mode';
    } else {
        document.documentElement.classList.remove('light-theme');
        icon.innerText = 'dark_mode';
    }

    // Toggle Handler
    btn.onclick = () => {
        if (state.theme === 'dark') {
            state.theme = 'light';
            document.documentElement.classList.add('light-theme');
            icon.innerText = 'light_mode';
        } else {
            state.theme = 'dark';
            document.documentElement.classList.remove('light-theme');
            icon.innerText = 'dark_mode';
        }
        localStorage.setItem('lx_theme', state.theme);
    };
}

// Run theme init immediately
document.addEventListener('DOMContentLoaded', initTheme);


