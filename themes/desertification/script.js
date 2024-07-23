document.addEventListener('DOMContentLoaded', function() {
    let lockedPages = new Set(); // 이미 넘긴 페이지를 저장하는 집합
    let restrictedPages = new Set([3, 5, 7, 9]); // 특정 조건을 만족해야 하는 페이지
    let conditionsMet = {}; // 페이지 별 조건 만족 여부를 저장하는 객체

    // 모든 페이지의 조건을 초기화
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
                    document.getElementById('tree').style.display = 'block';
                } else if (page === $("#flipbook").turn("pages") - 1) {
                    document.getElementById('tree').style.display = 'none';
                }
            }
        }
    });

    // 그림판 설정
    const drawingCanvas1 = document.getElementById('drawingCanvas1');
    const drawingCanvas3 = document.getElementById("drawingCanvas3");
    const drawingContext1 = drawingCanvas1.getContext('2d');
    const drawingContext3 = drawingCanvas3.getContext('2d');
    let isDrawing = false;

    drawingContext1.lineWidth = 10;  // 붓의 크기를 10으로 설정
    drawingContext3.lineWidth = 10;  // 붓의 크기를 10으로 설정

    drawingCanvas1.addEventListener('mousedown', startDrawing);
    drawingCanvas1.addEventListener('mouseup', stopDrawing);
    drawingCanvas1.addEventListener('mousemove', draw);
    drawingCanvas3.addEventListener('mousedown', startDrawing);
    drawingCanvas3.addEventListener('mouseup', stopDrawing);
    drawingCanvas3.addEventListener('mousemove', draw);

    function startDrawing(event) {
        isDrawing = true;
        console.log(event.target.id);
        startTimer(event);
        const canvas = event.target.id;
        if (canvas === "drawingCanvas1") {
            drawingContext1.beginPath();
            drawingContext1.moveTo(event.offsetX, event.offsetY);
        } else if (canvas === "drawingCanvas3") {
            drawingContext3.beginPath();
            drawingContext3.moveTo(event.offsetX, event.offsetY);
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
        } else if (canvas === "drawingCanvas3") {
            drawingContext3.lineTo(event.offsetX, event.offsetY);
            drawingContext3.stroke();
        }
    }

    // 캔버스가 충분히 채워졌는지 확인하는 함수
    function checkCanvasFilled(event) {
        let context, canvas;
        if (event.target.id === "drawingCanvas1") {
            canvas = drawingCanvas1;
            context = drawingContext1;
        } else if (event.target.id === "drawingCanvas3") {
            canvas = drawingCanvas3;
            context = drawingContext3;
        }
        const userImageData = context.getImageData(0, 0, canvas.width, canvas.height);

        let filledPixels = 0;
        const totalPixels = userImageData.data.length / 4;

        for (let i = 0; i < userImageData.data.length; i += 4) {
            const alpha = userImageData.data[i + 3]; // Alpha 값 확인
            if (alpha > 0) { // 투명하지 않은 픽셀만 카운트
                filledPixels++;
            }
        }

        const fillRatio = filledPixels / totalPixels;
        return fillRatio >= 0.8;  // 80% 이상 칠해지면 성공
    }

    // 조건 만족 확인 함수
    function checkCondition(page, event) {
        if (checkCanvasFilled(event)) {
            conditionsMet[page] = true;
            alert("조건이 만족되었습니다. 이제 페이지를 넘길 수 있습니다.");
            resetFlipbook();
        } else {
            alert("조건이 만족되지 않았습니다. 다시 시도해 주세요.");
        }
    }

    // 페이지 상태를 다시 설정하는 함수
    function resetFlipbook() {
        $("#flipbook").turn("update");
        console.log("reset!");
    }

    // 페이지 조건 체크 버튼 이벤트 리스너 추가
    document.addEventListener('click', function(event) {
        if (event.target.id === 'checkConditionPage1') {
            checkCondition(3, event);
        }
        if (event.target.id === 'checkConditionPage3') {
            checkCondition(5, event);
        }
        if (event.target.id === 'checkConditionPage5') {
            checkCondition(7, event);
        }
    });

    // 그림 확인 버튼 이벤트 리스너 추가
    document.getElementById('checkButton1').addEventListener('click', function(event) {
        checkCondition(3, event); // 페이지 3의 조건 확인
    });

    document.getElementById('checkButton3').addEventListener('click', function(event) {
        checkCondition(5, event); // 페이지 5의 조건 확인
    });

    // 코너 드래그 이벤트 차단
    $("#flipbook").on("start", function(event, pageObject, corner) {
        if (corner === "tl" || corner === "tr" || corner === "bl" || corner === "br") {
            if (pageObject.page === 1 || pageObject.page === 9 || pageObject.page === $("#flipbook").turn("pages")) {
                return;
            }
            if (!conditionsMet[pageObject.page]) {
                event.preventDefault();
            }
        }
    });

    //타이머
    // 타이머 설정
    let countdown;
    let timeLeft = 10.00; // 타이머 시작 시간 (초)

    const timerDisplay1 = document.getElementById('timer1');
    const timerDisplay3 = document.getElementById('timer3');

    // 타이머 업데이트 함수
    function updateTimer(timerDisplay, event) {
        timerDisplay.textContent = `${timeLeft.toFixed(2)}`;
        if (timeLeft > 0) {
            timeLeft -= 0.01;
            timeLeft = parseFloat(timeLeft.toFixed(2)); // 부동 소수점 문제 해결
        } else {
            clearInterval(countdown);
            timeoutCallback(event);
        }
    }

    // 타이머 시작 함수
    function startTimer(event) {
        clearInterval(countdown); // 기존 타이머 초기화
        timeLeft = 10.00; // 타이머 초기화
        const timerDisplay = event.target.id === "drawingCanvas1" ? timerDisplay1 : timerDisplay3;
        countdown = setInterval(() => updateTimer(timerDisplay, event), 10); // 10밀리초마다 업데이트
    }

    // 타이머 종료 시 호출할 함수
    function timeoutCallback(event) {
        if (event.target.id === "drawingCanvas1") {
            checkCondition(3, event);
        } else if (event.target.id === "drawingCanvas3") {
            checkCondition(5, event);
        }
    }

    // 버튼 클릭 이벤트 리스너 추가
    document.getElementById('startButton1').addEventListener('click', startTimer);
    document.getElementById('startButton3').addEventListener('click', startTimer);
});
