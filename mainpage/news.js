document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('walking-animation');
    const ctx = canvas.getContext('2d');

    const frameCount = 4; // 프레임 수 (걷는 모션의 이미지 수)
    let frameWidth, frameHeight;
    let currentFrame = 0;
    let xPos = canvas.width / 2; // 초기 x 위치를 가운데로 설정
    let yPos = canvas.height / 2; // 초기 y 위치를 가운데로 설정
    let scale = 0.1; // 초기 크기 비율
    const speed = 1; // 걷는 속도
    const scaleSpeed = 0.03; // 크기 증가 속도
    const frameInterval = 200; // 프레임 간격 (밀리초 단위)
    const maxScale = 1.0; // 최대 크기 비율

    // 이미지 로드
    const walkingImage = new Image();
    walkingImage.src = 'WalkingGirl.png'; // 걷는 모션 스프라이트 시트 이미지 경로

    walkingImage.onload = function() {
        // 이미지의 크기 가져오기
        frameWidth = walkingImage.width / frameCount;
        frameHeight = walkingImage.height;

        // 애니메이션 시작
        animate();
    };

    function drawFrame(frameX, frameY, canvasX, canvasY, scale) {
        const scaledWidth = frameWidth * scale;
        const scaledHeight = frameHeight * scale;
        ctx.drawImage(walkingImage, frameX * frameWidth, frameY * frameHeight, frameWidth, frameHeight, canvasX - scaledWidth / 2, canvasY - scaledHeight / 2, scaledWidth, scaledHeight);
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // 캔버스 지우기

        if (scale >= maxScale) {
            // 최대 크기에 도달하면 두 번째 프레임에서 멈춤
            drawFrame(1, 0, xPos, yPos, scale);
        } else {
            // 크기를 점점 증가시키며 걷는 애니메이션 수행
            drawFrame(currentFrame, 0, xPos, yPos, scale);
            currentFrame = (currentFrame + 1) % frameCount; // 다음 프레임으로 넘어가기
            scale += scaleSpeed; // 크기 증가
        }

        setTimeout(animate, frameInterval); // 일정 시간 후에 다시 애니메이션 함수 호출
    }
});
