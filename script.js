// Baza de date cu cuvinte
const activities = [
    { type: "DESEN", word: "Umbrelă", points: 1 },
    { type: "MIMĂ", word: "Fotbalist", points: 2 },
    { type: "VORBEȘTE", word: "Vacanta", points: 1 },
    { type: "DESEN", word: "Pizza", points: 1 },
    { type: "MIMĂ", word: "Maimuță", points: 3 },
    { type: "VORBEȘTE", word: "Calculator", points: 2 },
    { type: "DESEN", word: "Fantoma", points: 3 },
    { type: "MIMĂ", word: "Chitarist", points: 2 },
    { type: "VORBEȘTE", word: "Scoala", points: 1 },
];

let usedCards = [];
let teams = [];
let currentTeamIndex = 0;
let timerInterval;
let timeLeft = 60;
let currentCard = {};
const BOARD_SIZE = 40;

// Elemente DOM
const setupScreen = document.getElementById('setup-screen');
const gameScreen = document.getElementById('game-screen');
const winScreen = document.getElementById('win-screen');
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
const scoreboard = document.getElementById('scoreboard');
const board = document.getElementById('board');
const winnerName = document.getElementById('winner-name');
const alarmSound = document.getElementById('alarm-sound');

document.getElementById('add-team-btn').addEventListener('click', () => {
    const name = teamInput.value.trim();
    if (name) {
        teams.push({ name, score: 0, position: 0 });
        const li = document.createElement('li');
        li.textContent = `${name} (0 pct)`;
        teamList.appendChild(li);
        teamInput.value = '';
        startGameBtn.disabled = false;
    }
});

startGameBtn.addEventListener('click', () => {
    setupScreen.classList.remove('active');
    gameScreen.classList.add('active');
    renderBoard();
    updateHeader();
    updateScoreboard();
});

function renderBoard(){
    board.innerHTML = "";
    for(let i=0;i<BOARD_SIZE;i++){
        const tile = document.createElement('div');
        tile.classList.add('board-tile');
        tile.textContent = i+1;
        board.appendChild(tile);
    }
}

function updateHeader(){
    currentTeamName.textContent = teams[currentTeamIndex].name;
    currentScoreDisplay.textContent = teams[currentTeamIndex].score;
}

function updateScoreboard(){
    scoreboard.innerHTML = teams.map((t,i)=>`
        <b>${t.name}</b>: ${t.score}p — poziție ${t.position}/${BOARD_SIZE}
    `).join("<br>");

    document.querySelectorAll(".pawn").forEach(p=>p.remove());

    teams.forEach((t,i)=>{
        const pos = Math.min(t.position, BOARD_SIZE-1);
        const tile = board.children[pos];
        const pawn = document.createElement("div");
        pawn.classList.add("pawn",`pawn-${i}`);
        tile.appendChild(pawn);
    });
}

function getCard(){
    if(usedCards.length === activities.length) usedCards = [];
    let card;
    do {
        card = activities[Math.floor(Math.random()*activities.length)];
    } while(usedCards.includes(card));
    usedCards.push(card);
    return card;
}

startRoundBtn.addEventListener('click', startRound);

function startRound(){
    currentCard = getCard();
    activityType.textContent = currentCard.type;
    activityWord.textContent = currentCard.word;
    activityPoints.textContent = `${currentCard.points} puncte`;

    startRoundBtn.classList.add('hidden');
    decisionButtons.classList.remove('hidden');

    timeLeft = 60;
    timerDisplay.textContent = timeLeft;

    timerInterval = setInterval(()=>{
        timeLeft--;
        timerDisplay.textContent = timeLeft;

        if(timeLeft <= 0){
            clearInterval(timerInterval);
            endRound(false);
        }
    },1000);
}

document.getElementById('success-btn').addEventListener('click', ()=>endRound(true));
document.getElementById('fail-btn').addEventListener('click', ()=>endRound(false));

function endRound(success){
    clearInterval(timerInterval);

    if(success){
        teams[currentTeamIndex].score += currentCard.points;
        teams[currentTeamIndex].position += currentCard.points;

        if(teams[currentTeamIndex].position >= BOARD_SIZE){
            winGame();
            return;
        }
    }

    currentTeamIndex = (currentTeamIndex+1)%teams.length;

    updateHeader();
    updateScoreboard();

    startRoundBtn.classList.remove('hidden');
    decisionButtons.classList.add('hidden');
    activityWord.textContent = "????";
    activityType.textContent = "Pregătit?";
    activityPoints.textContent = "";
    timerDisplay.textContent = "60";
}

function winGame(){
    gameScreen.classList.remove("active");
    winScreen.classList.add("active");
    winnerName.textContent = `🏆 ${teams[currentTeamIndex].name} a câștigat!`;
}
