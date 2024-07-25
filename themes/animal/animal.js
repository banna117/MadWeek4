const canvas = document.getElementById('animalCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const birdImages = [
    'bird_1.png',
    'bird_2.png',
    'bird_3.png',
    'bird_4.png',
    'bird_5.png'
].map(src => {
    const img = new Image();
    img.src = `../../assets/${src}`;
    return img;
});

const nestImage = new Image();
nestImage.src = '../../assets/nest.png';

const wallImage = new Image();
wallImage.src = '../../assets/wall.png';

const bird = {
    x: canvas.width / 4,
    y: canvas.height / 2,
    width: 140,
    height: 120,
    dy: 0,
    gravity: 0.5,
    lift: -5,
    frame: 0,
    isFalling: false,
    stopX: canvas.width * 0.6  // 벽에 도달하기 전에 멈추도록 조정
};

let obstacles = [];
let obstacleSpeed = 4;
let gameOver = false;
let isFlying = false;
let gameStarted = false;
let showMessage = true;
let stopCreatingObstacles = false;
let nestAppeared = false;
let wallAppeared = false;

const obstacleImages = {
    floor: [
        { src: 'obstacle_1.png', scale: 0.2 },
        { src: 'obstacle_2.png', scale: 0.4 },
        { src: 'obstacle_3.png', scale: 0.5 },
        { src: 'obstacle_4.png', scale: 0.4 },
        { src: 'obstacle_7.png', scale: 0.3 }
    ],
    sky: [
        { src: 'obstacle_5.png', scale: 0.2 },
        { src: 'obstacle_6.png', scale: 0.2 }
    ]
};

function drawBird() {
    const birdImage = bird.isFalling ? birdImages[2] : birdImages[Math.floor(bird.frame) % birdImages.length];
    ctx.drawImage(birdImage, bird.x, bird.y, bird.width, bird.height);
}

function updateBird() {
    if (bird.isFalling) {
        bird.dy = bird.gravity * 10;
        bird.y += bird.dy;
    } else if (nestAppeared) {
        if (bird.x < bird.stopX) {
            bird.x += 2;
            if (bird.y < canvas.height / 2) {
                bird.y += 1;  // 아기새들이 있는 둥지를 향해 내려가기
            } else {
                bird.y -= 1;  // 아기새들이 있는 둥지를 향해 올라가기
            }
        } else {
            fallingSound.play();
            setTimeout(() => {
                bird.isFalling = true;
            }, 10);
        }
    } else {
        if (isFlying) {
            bird.dy = bird.lift;
        } else {
            bird.dy += bird.gravity;
        }
        bird.y += bird.dy;
    }

    bird.frame += 0.1;

    if (bird.y + bird.height > canvas.height) {
        bird.y = canvas.height - bird.height;
        bird.dy = 0;
    } else if (bird.y < 0) {
        bird.y = 0;
        bird.dy = 0;
    }
}

function loadImage(src) {
    const img = new Image();
    img.src = src;
    return img;
}

function createObstacle() {
    if (stopCreatingObstacles) return;

    const type = Math.random() < 0.7 ? 'floor' : 'sky';
    const imageInfo = type === 'floor'
        ? obstacleImages.floor[Math.floor(Math.random() * obstacleImages.floor.length)]
        : obstacleImages.sky[Math.floor(Math.random() * obstacleImages.sky.length)];
    const img = loadImage(`../../assets/${imageInfo.src}`);

    img.onload = () => {
        let yPos;
        if (type === 'floor') {
            if (imageInfo.src === 'obstacle_1.png' || imageInfo.src === 'obstacle_7.png') {
                yPos = canvas.height - img.height * imageInfo.scale + 80;
            } else {
                yPos = canvas.height - img.height * imageInfo.scale;
            }
        } else {
            if (imageInfo.src === 'obstacle_5.png' || imageInfo.src === 'obstacle_6.png') {
                yPos = img.height * imageInfo.scale - 180;
            } else {
                yPos = img.height * imageInfo.scale;
            }
        }

        obstacles.push({
            x: canvas.width,
            y: yPos,
            width: img.width * imageInfo.scale,
            height: img.height * imageInfo.scale,
            img: img,
            scale: imageInfo.scale
        });
    };
}

function drawObstacles() {
    obstacles.forEach(obstacle => {
        ctx.drawImage(obstacle.img, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });
}

function updateObstacles() {
    obstacles.forEach(obstacle => {
        obstacle.x -= obstacleSpeed;
    });

    obstacles = obstacles.filter(obstacle => obstacle.x + obstacle.width > 0);

    if (stopCreatingObstacles && obstacles.length === 0 && !nestAppeared) {
        nestAppeared = true;
    }
}

function checkCollision() {
    for (let obstacle of obstacles) {
        const birdRight = bird.x + bird.width * 0.8;
        const birdBottom = bird.y + bird.height * 0.8;
        const obstacleRight = obstacle.x + obstacle.width * 0.8;
        const obstacleBottom = obstacle.y + obstacle.height * 0.8;

        if (
            bird.x + bird.width * 0.2 < obstacleRight &&
            birdRight > obstacle.x + obstacle.width * 0.2 &&
            bird.y + bird.height * 0.2 < obstacleBottom &&
            birdBottom > obstacle.y + obstacle.height * 0.2
        ) {
            gameOver = true;
            return;
        }
    }
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function displayGameOver() {
    ctx.fillStyle = 'black';
    ctx.font = '48px arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2);
}

function drawNest() {
    const nestWidth = nestImage.width;
    const nestHeight = nestImage.height;
    const nestX = canvas.width - nestWidth + 30; // 절반 정도만 보이게 오른쪽에 위치
    const nestY = canvas.height - nestHeight - 100; // 위치를 조금 아래로 조정
    ctx.drawImage(nestImage, nestX, nestY, nestWidth, nestHeight);
}

function drawWall() {
    const wallWidth = wallImage.width;
    const wallHeight = wallImage.height;
    const wallX = canvas.width * 0.7; // 벽의 위치 조정
    const wallY = canvas.height - wallHeight - 200; // 바닥에 닿지 않도록 위치 조정
    ctx.drawImage(wallImage, wallX, wallY, wallWidth, wallHeight);
}

function gameLoop() {
    clearCanvas();
    ctx.fillStyle = '#7ea6cc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawGround();

    if (!gameStarted) {
        drawBird();
        if (showMessage) {
            const mainMessage = document.getElementById('mainMessage');
            const subMessage = document.getElementById('subMessage');
            mainMessage.style.opacity = 1;
            subMessage.style.opacity = 1;
        }
    } else {
        if (gameOver) {
            drawBird();
            drawObstacles();
            displayGameOver();
            return;
        }

        updateBird();
        updateObstacles();
        checkCollision();
        drawBird();
        drawObstacles();

        if (nestAppeared) {
            drawNest();
            drawWall();
        }

        obstacleSpeed += 0.01;
    }

    requestAnimationFrame(gameLoop);
}

function drawGround() {
    ctx.fillStyle = '#4b6139';
    ctx.fillRect(0, canvas.height - 100, canvas.width, 100);
}

function startGame() {
    const messageContainer = document.getElementById('messageContainer');
    messageContainer.classList.add('fly-away');
    setTimeout(() => {
        messageContainer.style.display = 'none';
        showMessage = false;
        gameStarted = true;
        setInterval(createObstacle, 3000);
        setTimeout(() => {
            stopCreatingObstacles = true;
        }, 25000);
    }, 1000); // 애니메이션 시간과 일치시킴
}

function handleFlyStart() {
    isFlying = true;
    if (!gameStarted && !showMessage) {
        startGame();
    }
}

function handleFlyEnd() {
    isFlying = false;
}

window.addEventListener('mousedown', handleFlyStart);
window.addEventListener('mouseup', handleFlyEnd);
window.addEventListener('touchstart', handleFlyStart);
window.addEventListener('touchend', handleFlyEnd);
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        handleFlyStart();
    }
});
window.addEventListener('keyup', (e) => {
    if (e.code === 'Space') {
        handleFlyEnd();
    }
});
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

function initGame() {
    drawBird();
    const mainMessage = document.getElementById('mainMessage');
    const subMessage = document.getElementById('subMessage');
    mainMessage.style.opacity = 1;
    subMessage.style.opacity = 1;

    const fallingSound = document.getElementById('fallingSound');
    setTimeout(() => {
        showMessage = false;
        startGame();
    }, 2000);
}

initGame();
gameLoop();
