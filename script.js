// Baza de date cu cuvinte (Poți adăuga oricâte vrei aici)
const activities = [
    { type: "DESEN", word: "Umbrelă", points: 3 },
    { type: "MIMĂ", word: "Fotbalist", points: 4 },
    { type: "VORBEȘTE", word: "Vacanta", points: 3 },
    { type: "DESEN", word: "Pizza", points: 3 },
    { type: "MIMĂ", word: "Maimuță", points: 5 },
    { type: "VORBEȘTE", word: "Calculator", points: 4 },
    { type: "DESEN", word: "Fantoma", points: 5 },
    { type: "MIMĂ", word: "Chitarist", points: 4 },
    { type: "VORBEȘTE", word: "Scoala", points: 3 },
    // ... adaugă mai multe aici
];

let teams = [];
let currentTeamIndex = 0;
let timerInterval;
let timeLeft = 60;
let currentCard = {};

// Elemente DOM
const setupScreen = document.getElementById('setup-screen');
const gameScreen = document.getElementById('game-screen');
const teamInput = document.getElementById('team-input');
const teamList = document.getElementById('team-list');
const startGameBtn = document.getElementById('start-game-btn');
const currentTeamName = document.getElementById('current-team-name');
const currentScoreDisplay = document.getElementById('current-score');
const activityType = document.getElementById('activity-type');
const activityWord = document.getElementById('activity-word');
const activityPoints = document.getElementById('activity-points');
const timerDisplay = document.getElementById('timer');
const startRoundBtn = document.getElementById('start-round-btn');
const decisionButtons = document.getElementById('decision-buttons');
const alarmSound = document.getElementById('alarm-sound');

// Logica Setup
document.getElementById('add-team-btn').addEventListener('click', () => {
    const name = teamInput.value.trim();
    if (name) {
        teams.push({ name: name, score: 0 });
        const li = document.createElement('li');
        li.textContent = `${name} (0 pct)`;
        teamList.appendChild(li);
        teamInput.value = '';
        startGameBtn.disabled = false;
    }
});

startGameBtn.addEventListener('click', () => {
    if (teams.length > 0) {
        setupScreen.classList.remove('active');
        gameScreen.classList.add('active');
        updateHeader();
    }
});

// Logica Joc
startRoundBtn.addEventListener('click', startRound);

function updateHeader() {
    currentTeamName.textContent = teams[currentTeamIndex].name;
    currentScoreDisplay.textContent = teams[currentTeamIndex].score;
}

function startRound() {
    // 1. Alege un card random
    currentCard = activities[Math.floor(Math.random() * activities.length)];
    
    // 2. Afișează cardul
    activityType.textContent = currentCard.type;
    activityWord.textContent = currentCard.word;
    activityPoints.textContent = `${currentCard.points} Puncte`;
    activityWord.style.filter = "blur(0px)"; // Arată cuvântul

    // 3. Ascunde butonul de start, arată timer
    startRoundBtn.classList.add('hidden');
    decisionButtons.classList.remove('hidden');
    decisionButtons.style.pointerEvents = "auto"; // Activeaza butoanele
    
    // 4. Start Timer
    timeLeft = 60;
    timerDisplay.textContent = timeLeft;
    timerDisplay.style.color = "#e94560";
    
    timerInterval = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = timeLeft;
        if (timeLeft <= 10) {
            timerDisplay.style.color = "red";
        }
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            alarmSound.play();
            alert("Timpul a expirat! ⌛");
        }
    }, 1000);
}

document.getElementById('success-btn').addEventListener('click', () => endRound(true));
document.getElementById('fail-btn').addEventListener('click', () => endRound(false));

function endRound(success) {
    clearInterval(timerInterval);
    
    if (success) {
        teams[currentTeamIndex].score += currentCard.points;
    }

    // Trecem la echipa următoare
    currentTeamIndex++;
    if (currentTeamIndex >= teams.length) {
        currentTeamIndex = 0;
    }

    // Reset UI pentru runda urmatoare
    updateHeader();
    startRoundBtn.classList.remove('hidden');
    decisionButtons.classList.add('hidden');
    activityWord.textContent = "????";
    activityType.textContent = "Pregătit?";
    activityPoints.textContent = "";
    timerDisplay.textContent = "60";
    timerDisplay.style.color = "#e94560";
}