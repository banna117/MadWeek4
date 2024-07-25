const disasterOrder = ['typhoon', 'snow', 'flood', 'heat'];
let currentOrderIndex = 0;

const easterEggContainer = document.createElement('div');
easterEggContainer.style.position = 'absolute';
easterEggContainer.style.top = '50%';
easterEggContainer.style.left = '50%';
easterEggContainer.style.transform = 'translate(-50%, -50%)';
easterEggContainer.style.display = 'none';
document.body.appendChild(easterEggContainer);

const easterEggImage = document.createElement('img');
easterEggImage.src = '../../assets/easter_egg.png'; // 이스터에그 이미지 경로
easterEggImage.style.width = '300px';
easterEggImage.style.height = '300px';
easterEggContainer.appendChild(easterEggImage);

function checkEasterEgg(disasterType) {
    if (disasterType === disasterOrder[currentOrderIndex]) {
        currentOrderIndex++;
        if (currentOrderIndex === disasterOrder.length) {
            // 순서가 모두 충족되면 이스터에그 이미지 표시
            easterEggContainer.style.display = 'block';
            setTimeout(() => {
                setTimeout(() => {
                    easterEggContainer.style.display = 'none';
                    currentOrderIndex = 0; // 순서를 초기화
                }, 3000);
            }, 20000); // 이스터에그 이미지를 3초 동안 표시
        }
    } else {
        currentOrderIndex = 0; // 순서가 맞지 않으면 초기화
    }
}

const canvas = document.getElementById('climateCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let isFlooding = false;
let waterLevel = 0;
let waveOffset = 0;
let floodSpeed = 0.5;
let activeDisaster = null;
let snowAccumulation = [];
let flyingParts = [];

const houseParts = {
    leftWindow: { x: null, y: null, width: 80, height: 80, damage: 0, broken: false, threshold: 50, flying: false },
    rightWindow: { x: null, y: null, width: 80, height: 80, damage: 0, broken: false, threshold: 50, flying: false },
    door: { x: null, y: null, width: 100, height: 150, damage: 0, broken: false, threshold: 70, flying: false },
    roof: { x: null, y: null, width: 400, height: 200, damage: 0, broken: false, threshold: 100, flying: false },
    body: { x: null, y: null, width: 400, height: 300, damage: 0, broken: false, threshold: 150, flying: false }
};

function restoreHouse() {
    Object.keys(houseParts).forEach(part => {
        houseParts[part].broken = false;
        houseParts[part].damage = 0;
        houseParts[part].flying = false;
    });
    flyingParts = [];
    drawScene();
}

function drawHouse() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2 + 110;

    houseParts.leftWindow.x = centerX - houseParts.body.width / 4 - houseParts.leftWindow.width / 2;
    houseParts.leftWindow.y = centerY - houseParts.body.height / 4 - houseParts.leftWindow.height / 2;
    houseParts.rightWindow.x = centerX + houseParts.body.width / 4 - houseParts.rightWindow.width / 2;
    houseParts.rightWindow.y = centerY - houseParts.body.height / 4 - houseParts.rightWindow.height / 2;
    houseParts.door.x = centerX - houseParts.door.width / 2;
    houseParts.door.y = centerY + houseParts.body.height / 2 - houseParts.door.height;
    houseParts.roof.x = centerX - houseParts.roof.width / 2;
    houseParts.roof.y = centerY - houseParts.body.height / 2 - houseParts.roof.height;
    houseParts.body.x = centerX - houseParts.body.width / 2;
    houseParts.body.y = centerY - houseParts.body.height / 2;

    // 지붕 그리기
    ctx.fillStyle = !houseParts.roof.broken && !houseParts.roof.heatBroken ? 'brown' : 'black';
    ctx.beginPath();
    ctx.moveTo(houseParts.roof.x, houseParts.roof.y + houseParts.roof.height);
    ctx.lineTo(houseParts.roof.x + houseParts.roof.width, houseParts.roof.y + houseParts.roof.height);
    ctx.lineTo(centerX, houseParts.roof.y);
    ctx.closePath();
    ctx.fill();

    // 본체 그리기
    ctx.fillStyle = !houseParts.body.broken && !houseParts.body.heatBroken ? 'white' : 'black';
    ctx.fillRect(houseParts.body.x, houseParts.body.y, houseParts.body.width, houseParts.body.height);

    // 문 그리기
    ctx.fillStyle = !houseParts.door.broken && !houseParts.door.heatBroken ? 'brown' : 'black';
    ctx.fillRect(houseParts.door.x, houseParts.door.y, houseParts.door.width, houseParts.door.height);

    ctx.fillStyle = !houseParts.door.broken && !houseParts.door.heatBroken ? 'black' : 'white';
    ctx.beginPath();
    ctx.arc(houseParts.door.x + houseParts.door.width / 4, houseParts.door.y + houseParts.door.height / 2, 10, 0, Math.PI * 2);
    ctx.fill();

    // 창문 그리기
    ctx.fillStyle = !houseParts.leftWindow.broken && !houseParts.leftWindow.heatBroken ? 'lightblue' : 'black';
    ctx.fillRect(houseParts.leftWindow.x, houseParts.leftWindow.y, houseParts.leftWindow.width, houseParts.leftWindow.height);

    ctx.fillStyle = !houseParts.rightWindow.broken && !houseParts.rightWindow.heatBroken ? 'lightblue' : 'black';
    ctx.fillRect(houseParts.rightWindow.x, houseParts.rightWindow.y, houseParts.rightWindow.width, houseParts.rightWindow.height);

    // 창문 테두리 그리기
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 5;
    if (!houseParts.leftWindow.broken) {
        ctx.strokeRect(houseParts.leftWindow.x, houseParts.leftWindow.y, houseParts.leftWindow.width, houseParts.leftWindow.height);
    }
    if (!houseParts.rightWindow.broken) {
        ctx.strokeRect(houseParts.rightWindow.x, houseParts.rightWindow.y, houseParts.rightWindow.width, houseParts.rightWindow.height);
    }

    // 창문 십자선 그리기
    ctx.beginPath();
    if (!houseParts.leftWindow.broken && !houseParts.leftWindow.heatBroken) {
        ctx.moveTo(houseParts.leftWindow.x, houseParts.leftWindow.y + houseParts.leftWindow.height / 2);
        ctx.lineTo(houseParts.leftWindow.x + houseParts.leftWindow.width, houseParts.leftWindow.y + houseParts.leftWindow.height / 2);
        ctx.moveTo(houseParts.leftWindow.x + houseParts.leftWindow.width / 2, houseParts.leftWindow.y);
        ctx.lineTo(houseParts.leftWindow.x + houseParts.leftWindow.width / 2, houseParts.leftWindow.y + houseParts.leftWindow.height);
    }
    if (!houseParts.rightWindow.broken && !houseParts.rightWindow.heatBroken) {
        ctx.moveTo(houseParts.rightWindow.x, houseParts.rightWindow.y + houseParts.rightWindow.height / 2);
        ctx.lineTo(houseParts.rightWindow.x + houseParts.rightWindow.width, houseParts.rightWindow.y + houseParts.rightWindow.height / 2);
        ctx.moveTo(houseParts.rightWindow.x + houseParts.rightWindow.width / 2, houseParts.rightWindow.y);
        ctx.lineTo(houseParts.rightWindow.x + houseParts.rightWindow.width / 2, houseParts.rightWindow.y + houseParts.rightWindow.height);
    }
    ctx.stroke();
}



function drawScene() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawHouse();

    snowAccumulation.forEach(snow => {
        ctx.beginPath();
        ctx.arc(snow.x, snow.y, snow.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.closePath();
    });

    if (isFlooding) {
        waterLevel += floodSpeed;
        if (waterLevel > canvas.height * 0.8) {
            waterLevel = canvas.height * 0.8;
        }
    } else {
        waterLevel -= 1;
        if (waterLevel < 0) {
            waterLevel = 0;
        }
    }

    if (isFlooding || waterLevel > 0) {
        ctx.fillStyle = '#62d0fb';
        const waveHeight = 10;
        const waveFrequency = 0.01;
        for (let i = 0; i < canvas.width; i++) {
            const waveY = Math.sin(i * waveFrequency + waveOffset) * waveHeight;
            ctx.fillRect(i, canvas.height - waterLevel + waveY, 1, waterLevel - waveY);
        }
        waveOffset += 0.1;
    }

    requestAnimationFrame(drawScene);
}

function showDragMessage() {
    const dragMessage = document.getElementById('dragMessage');
    setTimeout(() => {
        dragMessage.classList.add('fade-out');
        setTimeout(() => {
            dragMessage.remove();
        }, 1000); // fade-out 애니메이션 시간 (1초)과 동일하게 설정
    }, 3000); // 메시지를 3초 동안 표시
}

drawScene();
showDragMessage();
