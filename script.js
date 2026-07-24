// Get canvas and context
const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Game objects
const paddleWidth = 10;
const paddleHeight = 80;
const ballSize = 8;

const player = {
    x: 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 6,
    score: 0
};

const computer = {
    x: canvas.width - paddleWidth - 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 4,
    score: 0
};

const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    dx: 0,
    dy: 0,
    size: ballSize,
    speed: 4,
    maxSpeed: 7
};

// Game state
let gameRunning = false;
const keys = {};
let mouseY = canvas.height / 2;

// Event listeners
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    
    if (e.key === ' ') {
        e.preventDefault();
        startGame();
    }
    if (e.key.toLowerCase() === 'r') {
        resetGame();
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

document.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseY = e.clientY - rect.top;
});

// Start game function
function startGame() {
    if (!gameRunning) {
        gameRunning = true;
        ball.dx = (Math.random() > 0.5 ? 1 : -1) * ball.speed;
        ball.dy = (Math.random() - 0.5) * ball.speed;
        gameLoop();
    }
}

// Reset game function
function resetGame() {
    gameRunning = false;
    player.score = 0;
    computer.score = 0;
    resetBall();
    updateScoreboard();
}

// Reset ball to center
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * ball.speed;
    ball.dy = (Math.random() - 0.5) * ball.speed;
}

// Update player paddle position
function updatePlayer() {
    // Mouse control
    if (mouseY - paddleHeight / 2 !== player.y) {
        player.y = Math.max(0, Math.min(canvas.height - paddleHeight, mouseY - paddleHeight / 2));
    }
    
    // Arrow keys control (alternative/additional control)
    if (keys['ArrowUp']) {
        player.y = Math.max(0, player.y - player.speed);
    }
    if (keys['ArrowDown']) {
        player.y = Math.min(canvas.height - paddleHeight, player.y + player.speed);
    }
}

// Update computer paddle position (AI)
function updateComputer() {
    const computerCenter = computer.y + computer.height / 2;
    const ballCenter = ball.y;
    
    // Simple AI: move towards the ball
    if (computerCenter < ballCenter - 30) {
        computer.y = Math.min(canvas.height - paddleHeight, computer.y + computer.speed);
    } else if (computerCenter > ballCenter + 30) {
        computer.y = Math.max(0, computer.y - computer.speed);
    }
}

// Update ball position
function updateBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;
    
    // Wall collision (top and bottom)
    if (ball.y - ball.size < 0 || ball.y + ball.size > canvas.height) {
        ball.dy = -ball.dy;
        ball.y = Math.max(ball.size, Math.min(canvas.height - ball.size, ball.y));
    }
    
    // Paddle collision - Player
    if (ball.dx < 0 && 
        ball.x - ball.size < player.x + player.width &&
        ball.y > player.y &&
        ball.y < player.y + player.height) {
        ball.dx = -ball.dx;
        ball.x = player.x + player.width + ball.size;
        
        // Add spin based on where ball hits paddle
        const hitPos = (ball.y - player.y) / player.height;
        ball.dy = (hitPos - 0.5) * 8;
        ball.dx = Math.min(ball.maxSpeed, Math.abs(ball.dx) + 0.5);
    }
    
    // Paddle collision - Computer
    if (ball.dx > 0 &&
        ball.x + ball.size > computer.x &&
        ball.y > computer.y &&
        ball.y < computer.y + computer.height) {
        ball.dx = -ball.dx;
        ball.x = computer.x - ball.size;
        
        // Add spin based on where ball hits paddle
        const hitPos = (ball.y - computer.y) / computer.height;
        ball.dy = (hitPos - 0.5) * 8;
        ball.dx = -Math.min(ball.maxSpeed, Math.abs(ball.dx) + 0.5);
    }
    
    // Ball out of bounds - left side (computer scores)
    if (ball.x < 0) {
        computer.score++;
        updateScoreboard();
        resetBall();
    }
    
    // Ball out of bounds - right side (player scores)
    if (ball.x > canvas.width) {
        player.score++;
        updateScoreboard();
        resetBall();
    }
}

// Update scoreboard display
function updateScoreboard() {
    document.getElementById('playerScore').textContent = player.score;
    document.getElementById('computerScore').textContent = computer.score;
}

// Draw functions
function drawPaddle(paddle) {
    ctx.fillStyle = '#00d4ff';
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 2;
    ctx.strokeRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

function drawBall() {
    ctx.fillStyle = '#ff00ff';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffff00';
    ctx.lineWidth = 2;
    ctx.stroke();
}

function drawCenterLine() {
    ctx.strokeStyle = 'rgba(0, 212, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

function drawStartMessage() {
    if (!gameRunning) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#00d4ff';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Press SPACE to start', canvas.width / 2, canvas.height / 2 - 20);
        
        ctx.font = '16px Arial';
        ctx.fillStyle = '#b0b0b0';
        ctx.fillText('Use mouse or arrow keys to move', canvas.width / 2, canvas.height / 2 + 30);
    }
}

// Main game loop
function gameLoop() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw center line
    drawCenterLine();
    
    // Update
    if (gameRunning) {
        updatePlayer();
        updateComputer();
        updateBall();
    }
    
    // Draw
    drawPaddle(player);
    drawPaddle(computer);
    drawBall();
    drawStartMessage();
    
    // Continue loop
    requestAnimationFrame(gameLoop);
}

// Start the game loop
gameLoop();