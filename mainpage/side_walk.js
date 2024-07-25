document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('walking-animation');
    const ctx = canvas.getContext('2d');

    const frameCount = 4; // 프레임 수 (걷는 모션의 이미지 수)
    let frameWidth, frameHeight;
    let currentFrame = 0;
    let xPos = 0;
    const speed = 15; // 걷는 속도
    const frameInterval = 200; // 프레임 간격 (밀리초 단위)

    // 추가된 변수들
    let boxX = null;
    let boxY = null;
    let boxSize = 20; // 박스 크기
    let boxDropped = false;
    let boxGrowing = false;
    const boxGrowSpeed = 2; // 박스 크기 증가 속도
    const maxBoxSize = 50; // 박스 최대 크기

    // 이미지 로드
    const walkingImage = new Image();
    walkingImage.src = 'boy_walk.png'; // 걷는 모션 스프라이트 시트 이미지 경로

    walkingImage.onload = function() {
        // 이미지의 크기 가져오기
        frameWidth = walkingImage.width / frameCount;
        frameHeight = walkingImage.height;

        // 애니메이션 시작
        animate();
    };

    function drawFrame(frameX, frameY, canvasX, canvasY) {
        ctx.drawImage(walkingImage, frameX * frameWidth, frameY * frameHeight, frameWidth, frameHeight, canvasX, canvasY, frameWidth, frameHeight);
    }

    canvas.addEventListener('click', function(event) {
        if (boxDropped) {
            const rect = canvas.getBoundingClientRect();
            const clickX = event.clientX - rect.left;
            const clickY = event.clientY - rect.top;

            if (clickX >= boxX - boxSize / 2 && clickX <= boxX + boxSize / 2 &&
                clickY >= boxY - boxSize / 2 && clickY <= boxY + boxSize / 2) {
                alert('박스를 클릭했습니다!');
            }
        }
    });

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // 캔버스 지우기

        if (xPos <= canvas.width) {
            drawFrame(currentFrame, 0, xPos, canvas.height / 2 - frameHeight / 2);
            currentFrame = (currentFrame + 1) % frameCount; // 다음 프레임으로 넘어가기
            xPos += speed; // 걷는 사람 이동

            // 걷는 아이가 화면 중앙을 지날 때 박스를 떨어뜨림
            if (!boxDropped && xPos >= (canvas.width / 2 - frameWidth / 2) && xPos < (canvas.width / 2 - frameWidth / 2) + speed) {
                boxX = canvas.width / 2;
                boxY = canvas.height / 2 + frameHeight / 2;
                boxDropped = true;
            }
        } else {
            boxGrowing = true; // 아이가 화면을 벗어나면 박스가 커지기 시작
        }

        // 박스를 그리기
        if (boxDropped) {
            if (boxGrowing && boxSize < maxBoxSize) {
                boxSize += boxGrowSpeed; // 박스 크기 증가
            }
            ctx.fillStyle = 'red';
            ctx.fillRect(boxX - boxSize / 2, boxY - boxSize / 2, boxSize, boxSize);
        }

        setTimeout(animate, frameInterval); // 일정 시간 후에 다시 애니메이션 함수 호출
    }
});
