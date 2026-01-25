// --- WORD SCRAMBLE LOGIC ---

function initGame() {
    state.word = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
    state.scrambled = scramble(state.word);
    state.attempts = 0;
    
    // UI Reset
    el('scramble-display').innerText = state.scrambled;
    el('inp-guess').value = '';
    el('hints-area').innerHTML = '';
    el('game-state-start').classList.add('hidden');
    el('game-state-end').classList.add('hidden');
    el('game-state-play').classList.remove('hidden');
    el('inp-guess').focus();
    renderDots();
}

function scramble(word) {
    let arr = word.split(''), n = arr.length;
    while(n) { let i = Math.floor(Math.random() * n--); [arr[n], arr[i]] = [arr[i], arr[n]]; }
    return arr.join('') === word ? scramble(word) : arr.join('').toUpperCase();
}

function renderDots() {
    const container = el('progress-dots');
    container.innerHTML = '';
    for(let i=0; i<state.maxAttempts; i++) {
        const dot = document.createElement('div');
        dot.className = `dot ${i < state.attempts ? 'active' : ''}`;
        container.appendChild(dot);
    }
}

function handleGuess() {
    const guess = el('inp-guess').value.toLowerCase().trim();
    if(guess.length !== state.word.length) return showToast(`Need ${state.word.length} letters`, 'error');
    
    state.attempts++;
    renderDots();
    
    // Hints Logic
    const row = document.createElement('div');
    row.className = 'hint-row';
    const ansArr = state.word.split('');
    const res = Array(state.word.length).fill('h-absent');
    
    // Check Exact
    guess.split('').forEach((c, i) => {
        if(c === ansArr[i]) { res[i] = 'h-correct'; ansArr[i] = null; }
    });
    // Check Present
    guess.split('').forEach((c, i) => {
        if(res[i] !== 'h-correct' && ansArr.includes(c)) {
            res[i] = 'h-present';
            ansArr[ansArr.indexOf(c)] = null;
        }
    });
    
    // Render Visual Hints
    res.forEach(r => {
        const cell = document.createElement('div');
        cell.className = `hint-cell ${r}`;
        row.appendChild(cell);
    });
    el('hints-area').appendChild(row);
    
    if(guess === state.word) endGame(true);
    else if(state.attempts >= state.maxAttempts) endGame(false);
    
    el('inp-guess').value = '';
    el('inp-guess').focus();
}

function endGame(win) {
    state.games++;
    let addedScore = 0;
    
    if(win) {
        addedScore = Math.max(1, Math.floor((11-state.attempts) * (state.word.length/2)));
        state.score += addedScore;
    }
    
    // --- CRITICAL FIX: Save Data Immediately ---
    // This updates the user list in localStorage so the leaderboard sees it.
    saveUserProgress(); 
    updateProfile(); // Refresh profile UI
    
    el('game-state-play').classList.add('hidden');
    el('game-state-end').classList.remove('hidden');
    el('end-word').innerText = state.word.toUpperCase();
    el('end-icon').innerText = win ? 'emoji_events' : 'sentiment_dissatisfied';
    el('end-score').innerText = win ? `+${addedScore} PTS` : '0 PTS';
    el('end-icon').style.color = win ? '#4ade80' : '#f87171';
}

// Game Event Listeners
if(el('btn-start')) el('btn-start').onclick = initGame;
if(el('btn-restart')) el('btn-restart').onclick = initGame;
if(el('btn-quit')) el('btn-quit').onclick = () => { el('game-state-play').classList.add('hidden'); el('game-state-start').classList.remove('hidden'); };
if(el('btn-submit')) el('btn-submit').onclick = handleGuess;
if(el('inp-guess')) el('inp-guess').onkeypress = (e) => e.key === 'Enter' ? handleGuess() : null;


