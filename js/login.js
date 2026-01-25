// --- LOGIN & AUTH HANDLER ---

function handleLogin() {
    const userInp = el('login-username');
    const emailInp = el('login-email');
    const errorEl = el('login-error');
    
    const username = userInp.value.trim();
    const email = emailInp.value.trim();

    // 1. Basic Validation
    if (username.length < 4) {
        errorEl.innerText = "Username must be at least 4 letters.";
        return;
    }
    if (!email.includes('@')) {
        errorEl.innerText = "Please enter a valid email.";
        return;
    }

    // 2. Fetch existing users
    const storedUsers = JSON.parse(localStorage.getItem('lx_users') || '[]');
    
    // 3. Strict Account Checks
    const userByName = storedUsers.find(u => u.username.toLowerCase() === username.toLowerCase());
    const userByEmail = storedUsers.find(u => u.email.toLowerCase() === email.toLowerCase());

    // Case A: Username exists
    if (userByName) {
        if (userByName.email.toLowerCase() !== email.toLowerCase()) {
            errorEl.innerText = "Username is taken. Use a different one.";
            return;
        }
        // Login existing user
        loginUser(userByName);
    } 
    // Case B: Email exists (but username didn't match in Case A)
    else if (userByEmail) {
        errorEl.innerText = "This email is already linked to another username (" + userByEmail.username + ").";
        return;
    }
    // Case C: New User
    else {
        const newUser = {
            username: username,
            email: email,
            score: 0,
            games: 0
        };
        storedUsers.push(newUser);
        localStorage.setItem('lx_users', JSON.stringify(storedUsers));
        loginUser(newUser);
    }
}

function loginUser(user) {
    // Save session
    localStorage.setItem('lx_current_user', JSON.stringify(user));
    
    // Update State
    state.currentUser = user;
    state.score = user.score;
    state.games = user.games;
    
    // UI Transition
    el('login-username').value = '';
    el('login-email').value = '';
    if(el('login-error')) el('login-error').innerText = '';
    
    initApp(); // Switch to main view
}

function handleLogout() {
    // Save before exit
    saveUserProgress();
    
    // Clear session
    localStorage.removeItem('lx_current_user');
    state.currentUser = null;
    
    // UI Transition
    el('app-nav').classList.add('hidden');
    document.querySelectorAll('.view-container').forEach(v => v.classList.add('hidden'));
    el('view-login').classList.remove('hidden');
}

// Event Listeners
if(el('btn-login')) el('btn-login').onclick = handleLogin;
if(el('btn-logout-profile')) el('btn-logout-profile').onclick = handleLogout;

// Add 'Enter' key support for login
if(el('login-email')) {
    el('login-email').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleLogin();
    });
}


