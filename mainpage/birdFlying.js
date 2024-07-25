document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('animationCanvas');
    const ctx = canvas.getContext('2d');

    const imageFiles = [
        '../assets/bird1.png',
        '../assets/bird2.png',
        '../assets/bird3.png',
        '../assets/bird4.png',
        '../assets/bird5.png'
    ];

    const images = [];
    let loadedImages = 0;
    let currentFrame = 0;
    let xPos = 0;
    const speed = 25;
    const frameInterval = 200; // 프레임 간격 (밀리초 단위)
    const imageWidth = 100; // 이미지의 너비
    const imageHeight = 100; // 이미지의 높이

    let poop = null; // 똥의 위치를 저장하는 객체
    let birdGone = false; // 새가 화면 밖으로 나갔는지 여부를 저장하는 변수
    const poopStopHeight = 400; // 똥이 멈추는 높이
    let poopGrown = false; // 똥이 커졌는지 여부
    const poopMaxSize = 30; // 똥의 최대 크기
    const poopGrowSpeed = 0.5; // 똥이 커지는 속도
    const poopGrowTime = 500; // 똥이 커지는 시간 (밀리초 단위)

    // 모든 이미지를 미리 로드
    imageFiles.forEach((src, index) => {
        const img = new Image();
        img.src = src;
        img.onload = function() {
            loadedImages++;
            if (loadedImages === imageFiles.length) {
                // 모든 이미지가 로드되면 애니메이션 시작
                animate();
            }
        };
        images[index] = img;
    });

    canvas.addEventListener('click', function(event) {
        handleClick(event);
    });

    function handleClick(event) {
        if (poop !== null && poopGrown) {
            const rect = canvas.getBoundingClientRect();
            const clickX = event.clientX - rect.left;
            const clickY = event.clientY - rect.top;

            const dx = clickX - poop.x;
            const dy = clickY - poop.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < poop.size) {
                alert('똥을 클릭했습니다!');
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // 캔버스 지우기

        // 새가 화면 밖으로 나가지 않았을 때만 새를 그림
        if (!birdGone) {
            // 현재 프레임의 이미지를 그리기 (크기를 조절)
            ctx.drawImage(images[currentFrame], xPos, imageHeight / 2, imageWidth, imageHeight);

            // 다음 프레임으로 넘어가기
            currentFrame = (currentFrame + 1) % images.length;
            xPos += speed;

            // 새가 화면 중앙을 지날 때 똥을 떨어뜨림
            if (xPos >= (canvas.width / 2 - speed) && xPos < (canvas.width / 2 + speed) && poop === null) {
                poop = { x: xPos + imageWidth / 2, y: imageHeight / 2 + imageHeight, size: 15 }; // 똥의 초기 위치와 크기
            }

            // 새가 화면을 벗어나면 새를 없앰
            if (xPos > canvas.width) {
                birdGone = true;
            }
        }

        // 똥 그리기
        if (poop !== null) {
            if (poop.y < poopStopHeight) {
                poop.y += 10; // 똥이 떨어지는 속도
            } else if (!poopGrown) {
                setTimeout(() => {
                    // 똥을 일정 시간 동안 커지게 함
                    const growInterval = setInterval(() => {
                        if (poop.size < poopMaxSize) {
                            poop.size += poopGrowSpeed;
                        } else {
                            clearInterval(growInterval);
                            poopGrown = true; // 똥이 커지는 과정이 끝났음을 표시
                        }
                    }, frameInterval / 10);
                }, poopGrowTime);
            }

            ctx.fillStyle = 'brown';
            ctx.beginPath();
            ctx.arc(poop.x, poop.y, poop.size, 0, Math.PI * 2); // 똥을 원으로 그림
            ctx.fill();
        }

        setTimeout(animate, frameInterval); // 일정 시간 후에 다시 애니메이션 함수 호출
    }
});
