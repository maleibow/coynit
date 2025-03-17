
const canvas = document.getElementById('snake-game');
const ctx = canvas.getContext('2d');

const size = Math.min(400, Math.min(window.innerWidth * 0.95, window.innerHeight * 0.6));
canvas.width = size;
canvas.height = size;
const gridSize = 20;

let snake = [{ x: 10, y: 10 }];
let coin = { x: 15, y: 15 };
let direction = 'right';
let coinsCollected = 0;
let snakedAmount = 0;
let leader = { name: 'None', amount: 0 };
let gameLoop;
let gameStarted = false;
let gameOver = false;
let playerName = '';
let snakeLeaderboard = [];

const playerSetup = document.getElementById('player-setup');
const gameContainer = document.getElementById('game-container');
const playerNameInput = document.getElementById('player-name');
const startGameButton = document.getElementById('start-game');
const touchControls = {
    up: document.getElementById('up-btn'),
    down: document.getElementById('down-btn'),
    left: document.getElementById('left-btn'),
    right: document.getElementById('right-btn')
};

function loadLeaderData() {
    const savedMessages = localStorage.getItem('messages');
    if (savedMessages) {
        const messages = JSON.parse(savedMessages);
        if (messages && messages.length > 0) {
            const sortedMessages = messages.sort((a, b) => b.amount - a.amount);
            leader = { 
                name: sortedMessages[0].name || 'None', 
                amount: sortedMessages[0].amount || 0 
            };
        } else {
            leader = { name: 'None', amount: 0 };
        }
        updateLeaderDisplay();
    }
}

function updateLeaderDisplay() {
    document.getElementById('leader-name').textContent = leader.name;
    document.getElementById('leader-score').textContent = leader.amount.toFixed(2);
    document.getElementById('snaked-amount').textContent = snakedAmount.toFixed(2);
    document.getElementById('coins-collected').textContent = coinsCollected;
}

function generateCoin() {
    coin = {
        x: Math.floor(Math.random() * (canvas.width / gridSize)),
        y: Math.floor(Math.random() * (canvas.height / gridSize))
    };
}

function drawSnake() {
    ctx.fillStyle = '#33ff33';
    snake.forEach(segment => {
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
    });
}

function drawCoin() {
    ctx.fillStyle = '#ffcc33';
    ctx.beginPath();
    ctx.arc(
        coin.x * gridSize + gridSize/2,
        coin.y * gridSize + gridSize/2,
        gridSize/2 - 2,
        0,
        Math.PI * 2
    );
    ctx.fill();
    ctx.fillStyle = '#996600';
    ctx.font = '12px "Press Start 2P"';
    ctx.fillText('$', coin.x * gridSize + 5, coin.y * gridSize + 15);
}

function moveSnake() {
    const head = { ...snake[0] };
    
    switch(direction) {
        case 'up': head.y--; break;
        case 'down': head.y++; break;
        case 'left': head.x--; break;
        case 'right': head.x++; break;
    }

    if (head.x < 0 || head.x >= canvas.width/gridSize || 
        head.y < 0 || head.y >= canvas.height/gridSize) {
        endGame();
        return;
    }

    // Check for collision with self
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        endGame();
        return;
    }

    if (head.x === coin.x && head.y === coin.y) {
        coinsCollected++;
        if (coinsCollected % 10 === 0 && leader.amount > 0) {
            snakedAmount += 1;
            leader.amount = Math.max(0, leader.amount - 1);
            updateLeaderInStorage();
            
            // Create snake eye effect
            const eye = document.createElement('div');
            eye.className = 'snake-eye';
            document.querySelector('.snake-container').appendChild(eye);
            
            // Create SNAKED text
            const snakedText = document.createElement('div');
            snakedText.className = 'snaked-text';
            snakedText.textContent = 'SNAKED!';
            document.querySelector('.snake-container').appendChild(snakedText);
            
            // Remove effects after animation
            setTimeout(() => {
                eye.remove();
                snakedText.remove();
            }, 2000);
        }
        generateCoin();
        updateLeaderDisplay();
    } else {
        snake.pop();
    }

    snake.unshift(head);
}

function updateLeaderInStorage() {
    const savedMessages = localStorage.getItem('messages');
    if (savedMessages) {
        const messages = JSON.parse(savedMessages);
        const leaderIndex = messages.findIndex(m => m.name === leader.name);
        if (leaderIndex !== -1) {
            messages[leaderIndex].amount = leader.amount;
            localStorage.setItem('messages', JSON.stringify(messages));
        }
    }
}

function resetGame() {
    snake = [{ x: 10, y: 10 }];
    direction = 'right';
    generateCoin();
}

function updateGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    moveSnake();
    drawSnake();
    drawCoin();
}

document.addEventListener('keydown', (e) => {
    switch(e.key) {
        case 'ArrowUp': if (direction !== 'down') direction = 'up'; break;
        case 'ArrowDown': if (direction !== 'up') direction = 'down'; break;
        case 'ArrowLeft': if (direction !== 'right') direction = 'left'; break;
        case 'ArrowRight': if (direction !== 'left') direction = 'right'; break;
    }
});

function validateAndStartGame() {
    playerName = playerNameInput.value.trim();
    if (!playerName) {
        alert('Please enter your name to play!');
        return;
    }

    // Check if player has posted
    const savedMessages = localStorage.getItem('messages');
    if (savedMessages) {
        const messages = JSON.parse(savedMessages);
        const hasPosted = messages.some(m => m.name.toLowerCase() === playerName.toLowerCase());
        
        if (!hasPosted) {
            alert('You need to make a post on the main page before you can play Snake the Leader!');
            return;
        }
    } else {
        alert('You need to make a post on the main page before you can play Snake the Leader!');
        return;
    }

    playerSetup.style.display = 'none';
    gameContainer.style.display = 'block';
}

function startGame() {
    if (gameStarted) return;
    resetGame();
    gameStarted = true;
    gameOver = false;
    startGameButton.textContent = 'Restart Game';
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(() => {
        if (!gameOver) {
            updateGame();
        }
    }, 100);
}

function updateLeaderboard() {
    // Only update if player collected at least 10 coins
    if (coinsCollected >= 10) {
        // Update snake leaderboard
        const existingPlayer = snakeLeaderboard.find(p => p.name.toLowerCase() === playerName.toLowerCase());
        if (existingPlayer) {
            existingPlayer.snakedAmount += snakedAmount;
        } else {
            snakeLeaderboard.push({ name: playerName, snakedAmount: snakedAmount });
        }
        
        // Sort and limit to top 10
        snakeLeaderboard.sort((a, b) => b.snakedAmount - a.snakedAmount);
        snakeLeaderboard = snakeLeaderboard.slice(0, 10);
        
        // Save snake leaderboard
        localStorage.setItem('snakeLeaderboard', JSON.stringify(snakeLeaderboard));

        // Update player's total in messages if they exist
        const savedMessages = localStorage.getItem('messages');
        if (savedMessages) {
            const messages = JSON.parse(savedMessages);
            const playerMessageIndex = messages.findIndex(m => m.name.toLowerCase() === playerName.toLowerCase());
            if (playerMessageIndex !== -1) {
                messages[playerMessageIndex].amount += snakedAmount;
                localStorage.setItem('messages', JSON.stringify(messages));
            }
        }
    }
    
    // Update display
    const leaderboardList = document.getElementById('snake-leaderboard-list');
    leaderboardList.innerHTML = '';
    snakeLeaderboard.forEach((player, index) => {
        const li = document.createElement('li');
        li.innerHTML = `#${index + 1} ${player.name}: $${player.snakedAmount.toFixed(2)}`;
        leaderboardList.appendChild(li);
    });
}

function loadLeaderboard() {
    const saved = localStorage.getItem('snakeLeaderboard');
    if (saved) {
        snakeLeaderboard = JSON.parse(saved);
        updateLeaderboard();
    }
}

function endGame() {
    gameOver = true;
    gameStarted = false;
    clearInterval(gameLoop);
    if (snakedAmount > 0 && coinsCollected >= 10) {
        updateLeaderboard();
    }
    coinsCollected = 0;
    snakedAmount = 0;
    updateLeaderDisplay();
    ctx.fillStyle = '#ff33ff';
    ctx.font = '24px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over!', canvas.width/2, canvas.height/2);
}

function handleDirection(newDirection) {
    const opposites = {
        'up': 'down',
        'down': 'up',
        'left': 'right',
        'right': 'left'
    };
    if (direction !== opposites[newDirection]) {
        direction = newDirection;
    }
}

// Touch controls
Object.entries(touchControls).forEach(([dir, btn]) => {
    btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        handleDirection(dir);
    });
    btn.addEventListener('click', () => handleDirection(dir));
});

// Keyboard controls
document.addEventListener('keydown', (e) => {
    const keys = {
        'ArrowUp': 'up',
        'ArrowDown': 'down',
        'ArrowLeft': 'left',
        'ArrowRight': 'right'
    };
    if (keys[e.key]) {
        handleDirection(keys[e.key]);
    }
});

startGameButton.addEventListener('click', validateAndStartGame);
document.getElementById('start-button').addEventListener('click', startGame);

loadLeaderData();
loadLeaderboard();
generateCoin();
