const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
const engine = Matter.Engine.create();
engine.world.gravity.y = 0.1;

const render = Matter.Render.create({
    canvas: canvas,
    engine: engine,
    options: {
        width: window.innerWidth,
        height: window.innerHeight,
        wireframes: false,
        background: '#82c5a6'
    }
});

Matter.Render.run(render);
const runner = Matter.Runner.create();
Matter.Runner.run(runner, engine);

let ground, leftWall, rightWall, kid;
const images = [
    { src: '../../assets/trash_1.png', scale: 0.4 },
    { src: '../../assets/trash_2.png', scale: 0.2 },
    { src: '../../assets/trash_3.png', scale: 0.2 },
    { src: '../../assets/trash_4.png', scale: 0.2 },
    { src: '../../assets/trash_5.png', scale: 0.4 },
    { src: '../../assets/trash_6.png', scale: 0.2 }
];
let stopCreatingTrash = false;

const kidImages = [
    '../../assets/kid_1.png',
    '../../assets/kid_2.png',
    '../../assets/kid_3.png',
    '../../assets/kid_4.png',
    '../../assets/kid_5.png',
    '../../assets/kid_disappointed.png'
];
let trashHit = false;

function createWallsAndGround() {
    ground = Matter.Bodies.rectangle(canvas.width / 2, canvas.height + 27, canvas.width, 50, { 
        isStatic: true,
        collisionFilter: {
            category: 0x0001,
            mask: 0x0001 | 0x0002
        }
    });
    leftWall = Matter.Bodies.rectangle(-25, canvas.height / 2, 50, canvas.height, { isStatic: true });
    rightWall = Matter.Bodies.rectangle(canvas.width + 25, canvas.height / 2, 50, canvas.height, { isStatic: true });
    Matter.World.add(engine.world, [ground, leftWall, rightWall]);
}

function createKid() {
    kid = Matter.Bodies.rectangle(canvas.width / 2, canvas.height - 140, 120, 190, {
        isStatic: true,
        collisionFilter: {
            category: 0x0001,
            mask: 0x0001 | 0x0002
        },
        render: {
            sprite: {
                texture: kidImages[0],  // 기본 이미지를 kid_1.png로 설정
                xScale: 0.5,
                yScale: 0.5
            }
        }
    });
    Matter.World.add(engine.world, kid);
}

function updateKidImage(index) {
    kid.render.sprite.texture = kidImages[index];
}

function cycleKidImages() {
    const cycleSequence = [1, 2, 3, 4, 3, 2, 1, 0];
    let cycleIndex = 0;
    const cycleInterval = setInterval(() => {
        updateKidImage(cycleSequence[cycleIndex]);
        cycleIndex++;
        if (cycleIndex >= cycleSequence.length) {
            clearInterval(cycleInterval);
            startCustomFadeOut();
        }
    }, 300); // 0.3초마다 이미지 변경
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    Matter.Render.lookAt(render, {
        min: { x: 0, y: 0 },
        max: { x: canvas.width, y: canvas.height }
    });
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function createTrash() {
    if (stopCreatingTrash) return;
    const size = Math.random() * 20 + 30;
    const x = (canvas.width / 2) + (Math.random() - 0.5) * canvas.width * 0.9;
    const y = -size;
    const imageInfo = images[Math.floor(Math.random() * images.length)];
    const trash = Matter.Bodies.rectangle(x, y, size, size, {
        collisionFilter: {
            category: 0x0002,
            mask: 0x0001
        },
        render: {
            sprite: {
                texture: imageInfo.src,
                xScale: imageInfo.scale,
                yScale: imageInfo.scale
            }
        }
    });
    Matter.World.add(engine.world, trash);
}

let trashInterval;
function startTrashCreation() {
    trashInterval = setInterval(createTrash, 250);

    setTimeout(() => {
        stopCreatingTrash = true;
        clearInterval(trashInterval);
        setTimeout(() => {
            if (!trashHit) {
                cycleKidImages();
            } else {
                startCustomFadeOut();
            }
        }, 4000); // 페이드 아웃을 위한 타이머 설정
    }, 15000);
}

const mouse = Matter.Mouse.create(render.canvas);
const mouseConstraint = Matter.MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: {
        stiffness: 0.2,
        render: {
            visible: false
        }
    }
});

Matter.World.add(engine.world, mouseConstraint);
render.mouse = mouse;

Matter.Events.on(mouseConstraint, "mousedown", function(event) {
    const mousePosition = event.mouse.position;
    const clickedBodies = Matter.Query.point(engine.world.bodies, mousePosition);
    for (let i = 0; i < clickedBodies.length; i++) {
        const body = clickedBodies[i];
        if (body !== kid) {
            Matter.World.remove(engine.world, body);
            popSound.play();
        }    
    }
});

Matter.Events.on(engine, 'beforeUpdate', function() {
    const bodies = Matter.Composite.allBodies(engine.world);
    for (let i = 0; i < bodies.length; i++) {
        const body = bodies[i];
        if (body !== kid && Matter.SAT.collides(body, kid).collided) {
            console.log("아야");
            trashHit = true;
            updateKidImage(5); // 실망한 이미지로 변경
        }
    }
});

function startCustomFadeOut() {
    const fadeCanvas = document.createElement('canvas');
    fadeCanvas.width = canvas.width;
    fadeCanvas.height = canvas.height;
    fadeCanvas.style.position = 'absolute';
    fadeCanvas.style.top = '0';
    fadeCanvas.style.left = '0';
    fadeCanvas.style.zIndex = '1000';
    document.body.appendChild(fadeCanvas);

    const fadeCtx = fadeCanvas.getContext('2d');
    let radius = Math.max(canvas.width, canvas.height);
    const centerX = canvas.width - 200; // 오른쪽 하단을 중심으로 설정
    const centerY = canvas.height - 180;

    const spotlightInterval = setInterval(() => {
        fadeCtx.clearRect(0, 0, fadeCanvas.width, fadeCanvas.height);
        fadeCtx.fillStyle = 'black';
        fadeCtx.fillRect(0, 0, fadeCanvas.width, fadeCanvas.height);

        fadeCtx.save();
        fadeCtx.globalCompositeOperation = 'destination-out';
        fadeCtx.beginPath();
        fadeCtx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
        fadeCtx.fill();
        fadeCtx.restore();

        radius -= 8;
        if (radius <= 200) {
            clearInterval(spotlightInterval);
            setTimeout(() => {
                const finalShrinkInterval = setInterval(() => {
                    fadeCtx.clearRect(0, 0, fadeCanvas.width, fadeCanvas.height);
                    fadeCtx.fillStyle = 'black';
                    fadeCtx.fillRect(0, 0, fadeCanvas.width, fadeCanvas.height);

                    fadeCtx.save();
                    fadeCtx.globalCompositeOperation = 'destination-out';
                    fadeCtx.beginPath();
                    fadeCtx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
                    fadeCtx.fill();
                    fadeCtx.restore();

                    radius -= 5;
                    if (radius < 0) {
                        clearInterval(finalShrinkInterval);
                        setTimeout(() => {
                            window.history.back(); // 이전 페이지로 이동
                        }, 800);
                    }
                }, 5); // 0.05초마다 원 크기를 줄임
            }, 1000); // ; // 잠시 멈춤
        }
    }, 10); // 0.05초마다 원 크기를 줄임
}

function showMessage() {
    const mainMessage = document.getElementById('mainMessage');
    const subMessage = document.getElementById('subMessage');
    mainMessage.style.opacity = 1;
    subMessage.style.opacity = 1;
    createKid();

    const popSound = document.getElementById('popSound');
    
    setTimeout(() => {
        mainMessage.classList.add('pop-animation');
        subMessage.classList.add('pop-animation');
        popSound.play();
        setTimeout(() => {
            mainMessage.style.opacity = 0;
            subMessage.style.opacity = 0;
            setTimeout(() => {
                createWallsAndGround();
                startTrashCreation(); // 글씨가 완전히 사라진 후에 쓰레기 생성 시작
            }, 1000); // 글씨가 사라진 후 1초 후에 쓰레기 생성 시작
        }, 1000); // 팝 애니메이션 후 1초 대기
    }, 2000); // 글씨가 2초 동안 나타났다 사라짐
}

showMessage();