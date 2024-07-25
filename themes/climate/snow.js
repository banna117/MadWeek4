const snowIcon = document.getElementById('snow');
let isSnowing = false;
let snowflakes = [];
let isGathering = false;
let gatherX = 0;
let gatherY = 0;
let gatheredSnowflakes = [];
let snowLevel = 0;
let snowAccumulated = 0; // 실제 쌓인 눈의 양을 추적
let meltingStarted = false;
let startTime;
let fallingSnowball = null;

snowIcon.addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('text/plain', 'snow');
});

document.addEventListener('dragover', (e) => {
    e.preventDefault();
});

document.addEventListener('drop', (e) => {
    e.preventDefault();
    if (e.dataTransfer.getData('text/plain') === 'snow') {
        isSnowing = true;
        startTime = new Date().getTime(); // 눈이 내리기 시작하는 시간 기록
        createSnowflakes();
        checkEasterEgg('snow'); // 이스터에그 순서 체크
    }
});

function createSnowflakes() {
    const canvas = document.getElementById('climateCanvas');
    const ctx = canvas.getContext('2d');

    function drawSnowflake(x, y, radius) {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2, true);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.closePath();
    }

    function generateSnowflake() {
        const currentTime = new Date().getTime();
        const elapsedTime = (currentTime - startTime) / 1000; // 경과 시간 (초 단위)
        const maxRadius = Math.min(elapsedTime / 10 + 15, 15); // 초기 눈송이 크기를 증가시킴
        const x = Math.random() * canvas.width;
        const y = -10; // Start above the canvas
        const radius = Math.random() * maxRadius + 2; // 눈송이 크기 증가
        const speed = Math.random() * 1 + 0.5;
        snowflakes.push({ x, y, radius, speed });
    }

    function updateSnowflakes() {
        const canvas = document.getElementById('climateCanvas');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Redraw house
        drawHouse();

        // Draw accumulated snow
        snowAccumulation.forEach(snow => {
            ctx.beginPath();
            ctx.ellipse(snow.x, snow.y, snow.radius * 1.5, snow.radius, 0, 0, Math.PI * 2); // 가로로 퍼진 눈송이
            ctx.fillStyle = 'white';
            ctx.fill();
            ctx.closePath();
        });

        for (let i = 0; i < snowflakes.length; i++) {
            const snowflake = snowflakes[i];
            snowflake.y += snowflake.speed;

            drawSnowflake(snowflake.x, snowflake.y, snowflake.radius);

            // Snow accumulates on the ground or gather point
            if (isGathering) {
                if (snowflake.y + snowflake.radius > gatherY - 20 && snowflake.y + snowflake.radius < gatherY + 20 &&
                    snowflake.x + snowflake.radius > gatherX - 20 && snowflake.x + snowflake.radius < gatherX + 20) {
                    gatheredSnowflakes.push(snowflake);
                    snowflakes.splice(i, 1);
                    i--;
                }
            }

            // Snow accumulates on the ground
            if (snowflake.y + snowflake.radius > canvas.height - snowLevel - 122) { // Adjust for bottom bar and snow level
                snowAccumulation.push({ x: snowflake.x, y: canvas.height - snowLevel - 122, radius: snowflake.radius });
                snowflakes.splice(i, 1);
                i--;
                snowAccumulated += snowflake.radius * 0.008; // 실제 쌓인 눈의 양을 증가
                snowLevel = Math.min(snowAccumulated, canvas.height / 2); // snowLevel을 실제 눈 쌓인 양에 맞게 조정
            }
        }

        // Draw gathered snowflakes
        if (isGathering) {
            let totalRadius = 0;
            gatheredSnowflakes.forEach(snowflake => {
                totalRadius += snowflake.radius;
            });
            const averageRadius = totalRadius / gatheredSnowflakes.length;
            const gatherRadius = Math.min(averageRadius * Math.sqrt(gatheredSnowflakes.length), 50);
            drawSnowflake(gatherX, gatherY, gatherRadius);
        }

        // Draw falling snowball if it exists
        if (fallingSnowball) {
            drawSnowflake(fallingSnowball.x, fallingSnowball.y, fallingSnowball.radius);
            fallingSnowball.y += 5; // Adjust the falling speed

            if (fallingSnowball.y >= canvas.height - snowLevel - 122) {
                snowAccumulation.push({ x: fallingSnowball.x, y: canvas.height - snowLevel - 122, radius: fallingSnowball.radius });
                fallingSnowball = null;
            }
        }

        // Check if snow covers the house
        if (snowAccumulated > 10 && !meltingStarted) { // Adjust the threshold as needed
            meltingStarted = true;
            isSnowing = false; // 눈을 멈춤
            setTimeout(startMelting, 15000); // 5초 후에 녹기 시작
        }

        if (isSnowing) {
            generateSnowflake();
        }

        requestAnimationFrame(updateSnowflakes);
    }

    updateSnowflakes();
}

document.addEventListener('mousedown', (e) => {
    isGathering = true;
    gatherX = e.clientX;
    gatherY = e.clientY;
    gatheredSnowflakes = []; // Initialize the array to gather snowflakes
});

document.addEventListener('mousemove', (e) => {
    if (isGathering) {
        gatherX = e.clientX;
        gatherY = e.clientY;
    }
});

document.addEventListener('mouseup', (e) => {
    if (isGathering) {
        isGathering = false;
        dropGatheredSnow(e.clientX, e.clientY);
    }
});

function dropGatheredSnow(x, y) {
    let totalRadius = 0;
    gatheredSnowflakes.forEach(snowflake => {
        totalRadius += snowflake.radius;
    });
    const averageRadius = totalRadius / gatheredSnowflakes.length;
    const gatherRadius = Math.min(averageRadius * Math.sqrt(gatheredSnowflakes.length), 50);

    fallingSnowball = { x: gatherX, y: gatherY, radius: gatherRadius };
    gatheredSnowflakes = []; // Clear gathered snowflakes
}

function checkHouseBuried() {
    // Implement logic to check if the house is buried and start melting process
    startMelting();
}

function startMelting() {
    const sunElement = createSunElement(window.innerWidth - 80, -30); // 화면 오른쪽 상단에 해를 고정
    document.body.appendChild(sunElement);

    const meltingInterval = setInterval(() => {
        snowAccumulation.forEach((snow, index) => {
            snow.radius *= 0.99;
            if (snow.y < canvas.height - 122) { // 땅보다는 안내려가게
                snow.y += 0.5; // 위에서부터 녹도록 이동
            } else {
                snow.y = canvas.height - 122; // 땅보다 아래로 내려가지 않도록 고정
            }
            if (snow.radius < 0.1) {
                snowAccumulation.splice(index, 1);
            }
        });

        snowAccumulated *= 0.99; // 전체 쌓인 눈의 양을 서서히 줄임

        if (snowAccumulation.length === 0) {
            clearInterval(meltingInterval);
            snowAccumulated = 0; // 실제 쌓인 눈의 양 초기화
            snowLevel = 0; // Reset snow level
            document.body.removeChild(sunElement);
            drawHouse(); // Redraw the house
        }
    }, 16); // 약 60fps로 눈을 녹임
}

function createSunElement(x, y) {
    const element = document.createElement('img');
    element.src = '../../assets/sun.png';
    element.className = 'heatEffect';
    element.style.left = `${x - 100}px`;
    element.style.top = `${y - 100}px`;
    element.style.width = '300px';
    element.style.height = '300px';
    element.style.position = 'absolute';

    return element;
}

// function drawHouse() {
//     const canvas = document.getElementById('climateCanvas');
//     const ctx = canvas.getContext('2d');
//     const centerX = canvas.width / 2;
//     const centerY = canvas.height / 2 + 110; // Move the house down

//     const houseWidth = 400;
//     const houseHeight = 300;
//     const roofHeight = 200;
//     const doorWidth = 100;
//     const doorHeight = 150;
//     const windowWidth = 80;
//     const windowHeight = 80;

//     // Draw roof
//     ctx.fillStyle = 'brown';
//     ctx.beginPath();
//     ctx.moveTo(centerX - houseWidth / 2, centerY - houseHeight / 2);
//     ctx.lineTo(centerX + houseWidth / 2, centerY - houseHeight / 2);
//     ctx.lineTo(centerX, centerY - houseHeight / 2 - roofHeight);
//     ctx.closePath();
//     ctx.fill();

//     // Draw house body
//     ctx.fillStyle = 'white';
//     ctx.fillRect(centerX - houseWidth / 2, centerY - houseHeight / 2, houseWidth, houseHeight);

//     // Draw door
//     ctx.fillStyle = 'brown';
//     ctx.fillRect(centerX - doorWidth / 2, centerY + houseHeight / 2 - doorHeight, doorWidth, doorHeight);

//     // Draw door knob
//     ctx.fillStyle = 'black';
//     ctx.beginPath();
//     ctx.arc(centerX - doorWidth / 4, centerY + houseHeight / 2 - doorHeight / 2, 10, 0, Math.PI * 2);
//     ctx.fill();

//     // Draw windows
//     ctx.fillStyle = 'lightblue';
//     ctx.fillRect(centerX + houseWidth / 4 - windowWidth / 2, centerY - houseHeight / 4 - windowHeight / 2, windowWidth, windowHeight);
//     ctx.fillRect(centerX - houseWidth / 4 - windowWidth / 2, centerY - houseHeight / 4 - windowHeight / 2, windowWidth, windowHeight);
//     ctx.strokeStyle = 'black';
//     ctx.lineWidth = 5;
//     ctx.strokeRect(centerX + houseWidth / 4 - windowWidth / 2, centerY - houseHeight / 4 - windowHeight / 2, windowWidth, windowHeight);
//     ctx.strokeRect(centerX - houseWidth / 4 - windowWidth / 2, centerY - houseHeight / 4 - windowHeight / 2, windowWidth, windowHeight);

//     // Draw window crosses
//     ctx.beginPath();
//     ctx.moveTo(centerX + houseWidth / 4 - windowWidth / 2, centerY - houseHeight / 4);
//     ctx.lineTo(centerX + houseWidth / 4 + windowWidth / 2, centerY - houseHeight / 4);
//     ctx.moveTo(centerX + houseWidth / 4, centerY - houseHeight / 4 - windowHeight / 2);
//     ctx.lineTo(centerX + houseWidth / 4, centerY - houseHeight / 4 + windowHeight / 2);

//     ctx.moveTo(centerX - houseWidth / 4 - windowWidth / 2, centerY - houseHeight / 4);
//     ctx.lineTo(centerX - houseWidth / 4 + windowWidth / 2, centerY - houseHeight / 4);
//     ctx.moveTo(centerX - houseWidth / 4, centerY - houseHeight / 4 - windowHeight / 2);
//     ctx.lineTo(centerX - houseWidth / 4, centerY - houseHeight / 4 + windowHeight / 2);
//     ctx.stroke();
// }
