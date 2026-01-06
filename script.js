// --- BAZA DE DATE (Extinsă) ---
const wordsDB = {
    DESEN: [
        "Umbrelă", "Pizza", "Fantoma", "Avion", "Soare", "Floare", 
        "Câine", "Casă", "Ochelari", "Bec", "Fluture", "Tort",
        "Mașină", "Copac", "Măr", "Stea", "Barcă", "Cheie"
    ],
    MIMĂ: [
        "Fotbalist", "Maimuță", "Chitarist", "Balet", "Somnuros", 
        "Pescuit", "Dirijor", "Boxer", "Bucătar", "Pinguin",
        "Înotător", "Pianist", "Kangur", "Soldat", "Doctor", "Șofer"
    ],
    VORBA: [
        "Vacanta", "Calculator", "Scoala", "Telefon", "Internet", 
        "Prietenie", "Libertate", "Muzică", "Weekend", "Cinema",
        "Bibliotecă", "Restaurant", "Jurnal", "Cadou", "Examen", "Haos"
    ]
};

// --- SETĂRI JOC ---
const COLORS = ['#ff595e', '#1982c4', '#8ac926', '#ffca3a', '#6a4c93'];
let TARGET_SCORE = 30;
let teams = [];
let currentTeamIndex = 0;
let timerInterval;
let timeLeft = 60;
let currentPoints = 0;

// --- ELEMENTE DOM ---
const screens = {
    setup: document.getElementById('setup-screen'),
    game: document.getElementById('game-screen'),
    win: document.getElementById('win-screen')
};
const boardEl = document.getElementById('board');
const cardsGrid = document.getElementById('cards-grid');
const activeCardPhase = document.getElementById('active-card-phase');
const selectionPhase = document.getElementById('selection-phase');
const timerDisplay = document.getElementById('timer');
const alarmSound = document.getElementById('alarm-sound');

// --- SETUP ---
document.getElementById('add-team-btn').addEventListener('click', addTeam);
document.getElementById('start-game-btn').addEventListener('click', startGame);
document.getElementById('success-btn').addEventListener('click', () => endRound(true));
document.getElementById('fail-btn').addEventListener('click', () => endRound(false));

function addTeam() {
    const input = document.getElementById('team-input');
    const name = input.value.trim();
    if (name && teams.length < 5) {
        const color = COLORS[teams.length];
        teams.push({ name, score: 0, color });
        
        const li = document.createElement('li');
        li.innerHTML = `<span style="display:flex; align-items:center"><span class="team-dot" style="background:${color}"></span>${name}</span> <span>0p</span>`;
        document.getElementById('team-list').appendChild(li);
        
        input.value = '';
        document.getElementById('start-game-btn').disabled = false;
    }
}

function startGame() {
    TARGET_SCORE = parseInt(document.getElementById('win-score-input').value) || 30;
    
    // Generam tabla de joc
    boardEl.innerHTML = '';
    for(let i=0; i<=TARGET_SCORE; i++) {
        const tile = document.createElement('div');
        tile.classList.add('tile');
        tile.id = `tile-${i}`;
        if(i === 0) tile.classList.add('start');
        if(i === TARGET_SCORE) tile.classList.add('finish');
        tile.textContent = i;
        boardEl.appendChild(tile);
    }

    screens.setup.classList.remove('active');
    screens.game.classList.add('active');
    
    updateUI();
    generateSelectionCards();
}

// --- LOGICA JOCULUI ---

function generateSelectionCards() {
    // Afișăm faza de selecție
    selectionPhase.classList.remove('hidden');
    activeCardPhase.classList.add('hidden');
    cardsGrid.innerHTML = '';

    // Generam 6 carduri: 2 Desen, 2 Mimă, 2 Vorbă
    const options = [
        ...getNRandom(wordsDB.DESEN, 2, 'DESEN', '✏️', 'card-desen'),
        ...getNRandom(wordsDB.MIMĂ, 2, 'MIMĂ', '🙊', 'card-mima'),
        ...getNRandom(wordsDB.VORBA, 2, 'VORBEȘTE', '🗣️', 'card-vorba')
    ];
    
    // Amestecăm opțiunile
    options.sort(() => Math.random() - 0.5);

    options.forEach(opt => {
        const card = document.createElement('div');
        card.className = `selection-card ${opt.styleClass}`;
        // Puncte random intre 3, 4, 5
        const points = Math.floor(Math.random() * 3) + 3;
        
        card.innerHTML = `
            <div class="sc-points">${points}</div>
            <div class="sc-icon">${opt.icon}</div>
            <div class="sc-type">${opt.type}</div>
        `;
        
        card.addEventListener('click', () => activateCard(opt, points));
        cardsGrid.appendChild(card);
    });
}

function getNRandom(arr, n, type, icon, styleClass) {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, n).map(word => ({ word, type, icon, styleClass }));
}

function activateCard(cardData, points) {
    currentPoints = points;
    
    selectionPhase.classList.add('hidden');
    activeCardPhase.classList.remove('hidden');
    
    document.getElementById('ac-icon').textContent = cardData.icon;
    document.getElementById('ac-type').textContent = cardData.type;
    document.getElementById('ac-points').textContent = points;
    document.getElementById('ac-word').textContent = cardData.word;
    
    startTimer();
}

function startTimer() {
    timeLeft = 60;
    timerDisplay.textContent = timeLeft;
    timerDisplay.parentElement.style.borderColor = "var(--accent)";
    
    if(timerInterval) clearInterval(timerInterval);
    
    timerInterval = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = timeLeft;
        
        if (timeLeft <= 10) {
            timerDisplay.parentElement.style.borderColor = "red";
            timerDisplay.parentElement.style.color = "red";
        }
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            alarmSound.play();
        }
    }, 1000);
}

function endRound(success) {
    clearInterval(timerInterval);
    
    if (success) {
        teams[currentTeamIndex].score += currentPoints;
        // Limitare la target score
        if (teams[currentTeamIndex].score > TARGET_SCORE) {
            teams[currentTeamIndex].score = TARGET_SCORE;
        }
    }

    updateUI(); // Mută pionii și actualizează scorul
    
    // Verifică victoria
    if (teams[currentTeamIndex].score >= TARGET_SCORE) {
        showWinScreen(teams[currentTeamIndex].name);
        return;
    }

    // Trecem la următoarea echipă
    currentTeamIndex = (currentTeamIndex + 1) % teams.length;
    
    updateUI(); // Actualizează numele echipei curente
    generateSelectionCards(); // Reset pentru runda nouă
}

function updateUI() {
    // Update Header
    const currentTeam = teams[currentTeamIndex];
    const nameEl = document.getElementById('current-team-name');
    nameEl.textContent = currentTeam.name;
    nameEl.style.color = currentTeam.color;

    // Curăță toți pionii vechi
    document.querySelectorAll('.pawn').forEach(p => p.remove());

    // Randează pionii la noile poziții
    teams.forEach(team => {
        const tileId = `tile-${team.score}`;
        const tile = document.getElementById(tileId);
        if(tile) {
            const pawn = document.createElement('div');
            pawn.className = 'pawn';
            pawn.style.backgroundColor = team.color;
            pawn.title = team.name;
            tile.appendChild(pawn);
        }
    });

    // Mini scoreboard update
    const miniScore = document.getElementById('mini-scoreboard');
    miniScore.innerHTML = teams.map(t => 
        `<div class="ms-team" style="border-color:${t.color}">${t.name}: ${t.score}</div>`
    ).join('');
    
    // Auto-scroll la pionul echipei curente
    const currentTile = document.getElementById(`tile-${currentTeam.score}`);
    if(currentTile) {
        currentTile.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

function showWinScreen(winner) {
    screens.game.classList.remove('active');
    screens.win.classList.add('active');
    document.getElementById('winner-name').textContent = winner;
}
