document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded and parsed");

    const drawingCanvas1 = document.getElementById('drawingCanvas1');
    const drawingCanvas3 = document.getElementById("drawingCanvas3");
    const drawingCanvas5 = document.getElementById("drawingCanvas5");

    if (!drawingCanvas1) console.error("drawingCanvas1 not found");
    if (!drawingCanvas3) console.error("drawingCanvas3 not found");
    if (!drawingCanvas5) console.error("drawingCanvas5 not found");

    const drawingContext1 = drawingCanvas1 ? drawingCanvas1.getContext('2d', { willReadFrequently: true }) : null;
    const drawingContext3 = drawingCanvas3 ? drawingCanvas3.getContext('2d', { willReadFrequently: true }) : null;
    const drawingContext5 = drawingCanvas5 ? drawingCanvas5.getContext('2d', { willReadFrequently: true }) : null;

    if (!drawingContext1) console.error("drawingContext1 not created");
    if (!drawingContext3) console.error("drawingContext3 not created");
    if (!drawingContext5) console.error("drawingContext5 not created");

    const timerDisplay1 = document.getElementById('timer1');
    const timerDisplay3 = document.getElementById('timer3');
    const timerDisplay5 = document.getElementById('timer5');
    if(!timerDisplay5) console.error("timerdisplay5 error");

    let lockedPages = new Set();
    let restrictedPages = new Set([3, 5, 7, 9]);
    let conditionsMet = {};

    let isDrawing = false;

    drawingContext1.lineWidth = 10;
    drawingContext3.lineWidth = 10;
    drawingContext5.lineWidth = 10;

    restrictedPages.forEach(page => {
        conditionsMet[page] = false;
    });

    $("#flipbook").turn({
        width: 800,
        height: 600,
        autoCenter: true,
        when: {
            turning: function(event, page, view) {
                if (page === 1) {
                    return;
                }

                if (lockedPages.has(page)) {
                    event.preventDefault();
                    return;
                }

                if (restrictedPages.has(page) && !conditionsMet[page]) {
                    event.preventDefault();
                    alert('이 페이지로 넘어가기 위해서는 특정 조건을 만족해야 합니다.');
                    return;
                }

                if (page === 1 && lockedPages.has(2)) {
                    event.preventDefault();
                    return;
                }
            },
            turned: function(event, page, view) {
                if (page === 1) {
                    return;
                }

                lockedPages.add(page);

                if (page === 1) {
                    document.getElementById('tree').style.display = 'none';
                    
                } else if (page === $("#flipbook").turn("pages")) {
                    setTimeout(console.log(3),500);
                    document.getElementById("flipbook").style.display = 'none';
                    document.getElementById('tree').style.display = 'block';
                    
                    // 애니메이션 시작
                    startAnimation();
                    
                } else if (page === $("#flipbook").turn("pages") - 1) {
                    document.getElementById('tree').style.display = 'none';
                }
            }
        }
    });

    if (drawingCanvas1) {
        drawingCanvas1.addEventListener('mousedown', startDrawing);
        drawingCanvas1.addEventListener('mouseup', stopDrawing);
        drawingCanvas1.addEventListener('mousemove', draw);
    }
    if (drawingCanvas3) {
        drawingCanvas3.addEventListener('mousedown', startDrawing);
        drawingCanvas3.addEventListener('mouseup', stopDrawing);
        drawingCanvas3.addEventListener('mousemove', draw);
    }
    if (drawingCanvas5) {
        drawingCanvas5.addEventListener('mousedown', startDrawing);
        drawingCanvas5.addEventListener('mouseup', stopDrawing);
        drawingCanvas5.addEventListener('mousemove', draw);
    }

    function startDrawing(event) {
        isDrawing = true;
        startTimer(event);
        const canvas = event.target.id;
        if (canvas === "drawingCanvas1") {
            drawingContext1.beginPath();
            drawingContext1.moveTo(event.offsetX, event.offsetY);
        } else if (canvas === "drawingCanvas3") {
            drawingContext3.beginPath();
            drawingContext3.moveTo(event.offsetX, event.offsetY);
        } else if (canvas === "drawingCanvas5") {
            drawingContext5.beginPath();
            drawingContext5.moveTo(event.offsetX, event.offsetY);
        }
    }

    function stopDrawing() {
        isDrawing = false;
    }

    function draw(event) {
        if (!isDrawing) return;
        const canvas = event.target.id;
        if (canvas === "drawingCanvas1") {
            drawingContext1.lineTo(event.offsetX, event.offsetY);
            drawingContext1.stroke();
            updateBackgroundTexture(drawingCanvas1);
        } else if (canvas === "drawingCanvas3") {
            drawingContext3.lineTo(event.offsetX, event.offsetY);
            drawingContext3.stroke();
            updateBackgroundTexture(drawingCanvas3);
        } else if (canvas === "drawingCanvas5") {
            drawingContext5.lineTo(event.offsetX, event.offsetY);
            drawingContext5.stroke();
            updateBackgroundTexture(drawingCanvas5);
        }
    }

    function checkCanvasFilled(event) {
        let context, canvas;
        if (event.target.id === "drawingCanvas1") {
            canvas = drawingCanvas1;
            context = drawingContext1;
        } else if (event.target.id === "drawingCanvas3") {
            canvas = drawingCanvas3;
            context = drawingContext3;
        } else if (event.target.id === "drawingCanvas5") {
            canvas = drawingCanvas5;
            context = drawingContext5;
        }
        const userImageData = context.getImageData(0, 0, canvas.width, canvas.height);

        let filledPixels = 0;
        const totalPixels = userImageData.data.length / 4;

        for (let i = 0; i < userImageData.data.length; i += 4) {
            const alpha = userImageData.data[i + 3];
            if (alpha > 0) {
                filledPixels++;
            }
        }

        const fillRatio = filledPixels / totalPixels;
        return fillRatio;
    }

    const texture = '구겨짐 2.png';

    function updateBackgroundTexture(canvas) {
        const fillRatio = checkCanvasFilled({target: canvas});
        const opacity = Math.min(fillRatio, 1);

        const pageElement = canvas.closest('.page');
        if (pageElement) {
            const imageContainer = pageElement.querySelector('.image-container');
            let overlay = imageContainer.querySelector('.crumple-overlay');
            if (!overlay) {
                overlay = document.createElement('img');
                overlay.classList.add('crumple-overlay');
                overlay.src = texture;
                imageContainer.appendChild(overlay);
            }
            overlay.style.opacity = opacity;
        }
    }

    function checkCondition(page, event) {
        let threshold;
        if (page === 3) threshold = 0.5;
        if (page === 5) threshold = 0.75;
        if (page === 7) threshold = 0.9;
        const canvas = event.target;
        if (checkCanvasFilled(event) >= threshold) {
            conditionsMet[page] = true;
            showMessage("성공!");
            canvas.removeEventListener('mousedown', startDrawing);
            canvas.removeEventListener('mouseup', stopDrawing);
            canvas.removeEventListener('mousemove', draw);
            resetFlipbook();
        } else {
            showMessage("실패! 다시 도전하세요:)");
            if (event.target.id === "drawingCanvas1") {
                drawingContext1.clearRect(0, 0, drawingCanvas1.width, drawingCanvas1.height);
                updateBackgroundTexture(event.target);
            } else if (event.target.id === "drawingCanvas3") {
                drawingContext3.clearRect(0, 0, drawingCanvas3.width, drawingCanvas3.height);
                updateBackgroundTexture(event.target);
            } else if (event.target.id === "drawingCanvas5") {
                drawingContext5.clearRect(0, 0, drawingCanvas5.width, drawingCanvas5.height);
                updateBackgroundTexture(event.target);
            }
        }
    }

    function resetFlipbook() {
        $("#flipbook").turn("update");
    }

    $("#flipbook").on("start", function(event, pageObject, corner) {
        if (corner === "tl" || corner === "tr" || corner === "bl" || corner === "br") {
            if (pageObject.page === 1 || pageObject.page === 3 || pageObject.page === 5 || pageObject.page === 7 || pageObject.page === 9 || pageObject.page === $("#flipbook").turn("pages")) {
                return;
            }
            if (!conditionsMet[pageObject.page]) {
                event.preventDefault();
            }
        }
    });

    function showMessage(message) {
        const messageElement = document.getElementById('message');
        messageElement.textContent = message;
        messageElement.style.display = 'block';
        setTimeout(() => {
            messageElement.style.display = 'none';
        }, 1500);
    }

    let countdown = null;
    let timeLeft = 10.00;
    let isTimerRunning = false;

    function updateTimer(timerDisplay, event) {
        timerDisplay.textContent = `${timeLeft.toFixed(2)}`;
        if (timeLeft > 0) {
            timeLeft -= 0.01;
            timeLeft = parseFloat(timeLeft.toFixed(2));
        } else {
            clearInterval(countdown);
            timeoutCallback(event);
        }
    }

    function startTimer(event) {
        if (isTimerRunning) return;
        isTimerRunning = true;
        timeLeft = 10.00;
        const timerDisplay = event.target.id === "drawingCanvas1" ? timerDisplay1 : 
                             event.target.id === "drawingCanvas3" ? timerDisplay3 : timerDisplay5;
        countdown = setInterval(() => updateTimer(timerDisplay, event), 10);
    }

    function timeoutCallback(event) {
        isTimerRunning = false;
        isDrawing = false;
        if (event.target.id === "drawingCanvas1") {
            checkCondition(3, event);
        } else if (event.target.id === "drawingCanvas3") {
            checkCondition(5, event);
        } else if (event.target.id === "drawingCanvas5") {
            checkCondition(7, event);
        }
    }

    function startAnimation() {
        const canvas = document.getElementById('animationCanvas');
        if (!canvas) {
            console.error("animationCanvas not found");
            return;
        }
        canvas.style.display = 'block'; // 애니메이션 시작 시 canvas 표시
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    
        const { Engine, Render, Runner, Bodies, Composite, Events, Mouse, MouseConstraint, Body } = Matter;
    
        const engine = Engine.create();
        const world = engine.world;
    
        const render = Render.create({
            canvas: canvas,
            engine: engine,
            options: {
                width: canvas.width,
                height: canvas.height,
                wireframes: false,
                background: '#f0f0f000'
            }
        });
    
        Render.run(render);
        const runner = Runner.create();
        Runner.run(runner, engine);
    
        // Load images
        // const treeImg = new Image();
        const paperImg = new Image();
        // const barrenLandImg = new Image();
        // treeImg.src = '푸르른나무.png';
        paperImg.src = '구겨진종이2.png';
        // barrenLandImg.src = '가뭄.png';
    
        // let treeVisible = true;
        // let barrenLandVisible = false;
        const maxPapers = 2000;
        const paperSize = 40;
    
        const papers = [];
    
        // Create ground and walls
        const ground = Bodies.rectangle(canvas.width / 2, canvas.height + 10, canvas.width, 20, { isStatic: true });
        const leftWall = Bodies.rectangle(-10, canvas.height / 2, 20, canvas.height, { isStatic: true });
        const rightWall = Bodies.rectangle(canvas.width + 10, canvas.height / 2, 20, canvas.height, { isStatic: true });
        Composite.add(world, [ground, leftWall, rightWall]);
    
    // Create papers
    function addPaper() {
        const x = Math.random() * canvas.width;
        const y = -paperSize;
        const size = Math.random() * 30 + 50;
        const paper = Bodies.rectangle(x, y, size, size, {
            restitution: 0.5,
            render: {
                sprite: {
                    texture: '구겨진종이2.png',
                    xScale: size / paperSize,
                    yScale: size / paperSize
                }
            }
        });
        papers.push(paper);
        Composite.add(world, paper);

        if(papers.length>400){
            document.getElementById('tree').src = '가뭄.png'; // 황폐화된 땅 이미지로 변경

        }
    }

    // Add papers rapidly
    for (let i = 0; i < maxPapers; i++) {
        setTimeout(addPaper, i * 10);
    }

// Monitor paper heights
Events.on(engine, 'afterUpdate', () => {
    let highPapersCount = 0;
    const thresholdHeight = canvas.height * 0.7; // 높이 임계값 설정

    papers.forEach(paper => {
        if (paper.position.y > thresholdHeight) {
            highPapersCount++;
        }
    });

});



        
        // // Render images
        // Events.on(render, 'afterRender', () => {
        //     const ctx = render.context;

        //     papers.forEach(paper => {
        //         const { position, render: { sprite } } = paper;
        //         ctx.drawImage(sprite.texture, position.x - (sprite.xScale * paperSize / 2), position.y - (sprite.yScale * paperSize / 2), sprite.xScale * paperSize, sprite.yScale * paperSize);
        //     });

        // });
    
        // Add mouse control
        const mouse = Mouse.create(render.canvas);
        const mouseConstraint = MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: {
                stiffness: 0.2,
                render: {
                    visible: false
                }
            }
        });
        Composite.add(world, mouseConstraint);
    
        // Wind effect on click
        // Wind effect on click
        Events.on(mouseConstraint, 'mousedown', () => {
            const forceMagnitude = 1; // 적용할 힘의 크기
            papers.forEach(paper => {
                Body.applyForce(paper, paper.position, {
                    x: forceMagnitude,
                    y: -forceMagnitude
                });
            });

            // 모든 종이가 날아간 후 황폐화된 땅을 표시
            setTimeout(() => {
                canvas.style.display = 'none';
                localStorage.setItem('desertification', 'visited');
            }, 1000); // 1초 후에 황폐화된 땅을 표시
        });

    
    }
    
});
