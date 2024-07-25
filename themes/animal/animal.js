const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const bird = {
    x: canvas.width / 4,
    y: canvas.height / 2,
    width: 40,
    height: 30,
    dy: 0,
    gravity: 0.5,
    lift: -10
};

let isFlying = false;

function drawBird() {
    ctx.fillStyle = 'yellow';
    ctx.fillRect(bird.x, bird.y, bird.width, bird.height);
}

function updateBird() {
    if (isFlying) {
        bird.dy = bird.lift;
    } else {
        bird.dy += bird.gravity;
    }
    bird.y += bird.dy;

    // Prevent the bird from going off the screen
    if (bird.y + bird.height > canvas.height) {
        bird.y = canvas.height - bird.height;
        bird.dy = 0;
    } else if (bird.y < 0) {
        bird.y = 0;
        bird.dy = 0;
    }
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function gameLoop() {
    clearCanvas();
    updateBird();
    drawBird();
    requestAnimationFrame(gameLoop);
}

window.addEventListener('mousedown', () => {
    isFlying = true;
});

window.addEventListener('mouseup', () => {
    isFlying = false;
});

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

gameLoop();
