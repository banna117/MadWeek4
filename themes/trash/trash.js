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
        background: '#78C1BC'
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
    kid = Matter.Bodies.rectangle(canvas.width / 2, canvas.height - 110, 80, 150, {
        isStatic: true,
        collisionFilter: {
            category: 0x0001,
            mask: 0x0001 | 0x0002
        },
        render: {
            sprite: {
                texture: '../../assets/kid.png',
                xScale: 0.5,
                yScale: 0.5
            }
        }
    });
    Matter.World.add(engine.world, kid);
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
        setTimeout(startFadeOut, 3000); // 페이드 아웃을 위한 타이머 설정
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
        }    
    }
});

Matter.Events.on(engine, 'beforeUpdate', function() {
    const bodies = Matter.Composite.allBodies(engine.world);
    for (let i = 0; i < bodies.length; i++) {
        const body = bodies[i];
        if (body.position.y > 200 && body.collisionFilter.mask === 0x0001) {
            body.collisionFilter.mask = 0x0001 | 0x0002;
        }
    }
});

function showMessage() {
    const mainMessage = document.getElementById('mainMessage');
    const subMessage = document.getElementById('subMessage');
    mainMessage.style.opacity = 1;
    subMessage.style.opacity = 1;
    createKid();
    setTimeout(() => {
        mainMessage.style.opacity = 0;
        subMessage.style.opacity = 0;
        setTimeout(() => {
            createWallsAndGround();
            startTrashCreation(); // 글씨가 완전히 사라진 후에 쓰레기 생성 시작
        }, 1000); // 글씨가 사라진 후 1초 후에 쓰레기 생성 시작
    }, 2000); // 글씨가 2초 동안 나타났다 사라짐
}

showMessage();
