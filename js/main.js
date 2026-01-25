// --- INITIALIZATION ---
function initApp() {
    if (!state.currentUser) {
        // Not logged in: Show Login, Hide Nav
        el('app-nav').classList.add('hidden');
        document.querySelectorAll('.view-container').forEach(v => v.classList.add('hidden'));
        el('view-login').classList.remove('hidden');
    } else {
        // Logged in: Show Nav, Show Game
        el('app-nav').classList.remove('hidden');
        document.querySelectorAll('.view-container').forEach(v => v.classList.add('hidden'));
        el('view-game').classList.remove('hidden');
        
        // Reset Nav Buttons
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        document.querySelector('[data-view="game"]').classList.add('active');
        
        updateProfile();
    }
}

// Run on load
document.addEventListener('DOMContentLoaded', initApp);


// --- NAVIGATION LOGIC ---
document.querySelectorAll('.nav-btn').forEach(btn => {
    if (btn.id === 'btn-logout') return; 
    
    btn.addEventListener('click', () => {
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.querySelectorAll('.view-container').forEach(v => v.classList.add('hidden'));
        el(`view-${btn.dataset.view}`).classList.remove('hidden');
        
        if(btn.dataset.view === 'leaderboard') renderLeaderboard();
        if(btn.dataset.view === 'profile') updateProfile();
    });
});

// --- TRUTH OR DARE LOGIC ---
const todCard = el('tod-card');
const todContent = el('tod-content');
const todTypeIcon = el('tod-type-icon');
let canFlip = true;

function flipCard(reveal = true) {
    if(!canFlip && reveal) return;
    
    if(reveal) {
        const list = state.todMode === 'truth' ? TRUTH_LIST : DARE_LIST;
        todContent.innerText = list[Math.floor(Math.random() * list.length)];
        todTypeIcon.innerText = state.todMode === 'truth' ? 'visibility' : 'local_fire_department';
        todCard.classList.add('flipped');
        canFlip = false;
    } else {
        todCard.classList.remove('flipped');
        setTimeout(() => { canFlip = true; }, 600);
    }
}

if(todCard) todCard.onclick = () => flipCard(true);
if(el('btn-tod-next')) el('btn-tod-next').onclick = () => flipCard(false);

document.querySelectorAll('.switch-btn').forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll('.switch-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.todMode = btn.dataset.mode;
        flipCard(false);
    }
});

// --- LEADERBOARD LOGIC ---
function renderLeaderboard() {
    const list = el('leaderboard-list');
    list.innerHTML = '';
    
    // Fetch latest users from LocalStorage (Live Data)
    const localUsers = JSON.parse(localStorage.getItem('lx_users') || '[]').map(u => ({
        u: u.username, 
        s: u.score
    }));
    
    // Combine with static scores (avoid duplicates)
    const combined = [...localUsers];
    SCORES.forEach(staticUser => {
        // Only add static user if not already in local users (by username)
        if (!combined.find(u => u.u === staticUser.u)) {
            combined.push(staticUser);
        }
    });

    // Sort Descending
    const sorted = combined.sort((a,b) => b.s - a.s).slice(0, 20);
    
    sorted.forEach((p, i) => {
        const row = document.createElement('div');
        row.className = 'rank-row';
        
        let icon = `<span class="font-mono text-dim">${i+1}</span>`;
        if(i===0) icon = `<span class="material-symbols-rounded" style="color:#fbbf24">emoji_events</span>`;
        if(i===1) icon = `<span class="material-symbols-rounded" style="color:#94a3b8">emoji_events</span>`;
        if(i===2) icon = `<span class="material-symbols-rounded" style="color:#b45309">emoji_events</span>`;
        
        row.innerHTML = `
            <div class="rank-icon">${icon}</div>
            <div style="font-weight:600">${p.u}</div>
            <div class="font-mono" style="color:var(--color-primary)">${p.s}</div>
        `;
        list.appendChild(row);
    });
}


