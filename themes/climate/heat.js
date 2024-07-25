const heatIcon = document.getElementById('heat');
let heatElement = null;
let isHeatActive = false;
let heatIntervals = {};
let rainContainer;
let raindrops = [];
let isRaining = false;

// 드래그 시작 이벤트 리스너 추가
heatIcon.addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('text/plain', 'heat');
    console.log('Drag started');
});

// 드래그 오버 이벤트 리스너 추가
document.addEventListener('dragover', (e) => {
    e.preventDefault();
    console.log('Drag over');
});

// 드롭 이벤트 리스너 추가
document.addEventListener('drop', (e) => {
    e.preventDefault();
    console.log('Drop event detected');

    if (e.dataTransfer.getData('text/plain') === 'heat') {
        if (heatElement) {
            heatElement.remove();
        }
        heatElement = createHeatElement(e.clientX, e.clientY);
        console.log('Heat element created by drop event');
        document.body.appendChild(heatElement);
        isHeatActive = true;
        activeDisaster = 'heat';
        checkEasterEgg('heat'); // 이스터에그 순서 체크
    }
});

// heatElement 생성 함수
function createHeatElement(x, y) {
    console.log('Entering createHeatElement');  // 진입 로그
    let element;  // element 변수를 함수 맨 위에서 선언
    try {
        element = document.createElement('img');
        element.src = '../../assets/sun.png';
        console.log('Creating heat element at:', x, y);  // 1번 로그
        element.className = 'heatEffect';
        element.style.left = `${x - 100}px`;
        element.style.top = `${y - 100}px`;
        element.style.position = 'absolute';
        document.body.appendChild(element);
        console.log('Heat element appended to body');  // 4번 로그

        // 이미지 로드 확인
        element.onload = () => {
            console.log('Heat element image loaded');  // 2번 로그

            // mousemove 이벤트 리스너를 한 번만 추가
            document.addEventListener('mousemove', moveHeatElement);
            monitorHeat(element);
        };

        // 이미지 로드 실패 확인
        element.onerror = () => {
            console.log('Failed to load heat element image');  // 3번 로그
        };
    } catch (error) {
        console.error('Error in createHeatElement:', error);  // 에러 로그
    }

    return element;
}

// heatElement를 마우스 커서를 따라 움직이게 하는 함수
function moveHeatElement(e) {
    if (isHeatActive && heatElement) {
        heatElement.style.left = `${e.clientX - 100}px`;
        heatElement.style.top = `${e.clientY - 100}px`;
    }
}

// 각 파트의 열 상태를 모니터링하는 함수
function monitorHeat(element) {
    Object.keys(houseParts).forEach(part => {
        heatIntervals[part] = setInterval(() => {
            if (activeDisaster === 'heat' && isColliding(element, houseParts[part])) {
                houseParts[part].heatDuration = (houseParts[part].heatDuration || 0) + 1;
                if (houseParts[part].heatDuration > 100 && !houseParts[part].onFire) {
                    houseParts[part].onFire = true;
                    startFire(part);
                }
            } else {
                houseParts[part].heatDuration = 0;
            }
        }, 100);
    });
}

// 불을 시작하는 함수
function startFire(part) {
    const fireImage = document.createElement('img');
    fireImage.src = '../../assets/fire_1.png';
    fireImage.className = 'fireEffect';
    fireImage.style.left = `${houseParts[part].x + houseParts[part].width / 2 - 50}px`;
    fireImage.style.top = `${houseParts[part].y + houseParts[part].height / 2 - 50}px`;
    fireImage.style.position = 'absolute';
    document.body.appendChild(fireImage);

    const fireInterval = setInterval(() => {
        if (activeDisaster !== 'heat') {
            clearInterval(fireInterval);
            fireImage.remove();
            return;
        }

        houseParts[part].damage += 1;
        if (houseParts[part].damage > 50) {
            houseParts[part].heatBroken = true;
            drawScene(); // 이미지를 다시 그리도록 요청
        }
        if (houseParts[part].damage > 100) {
            clearInterval(fireInterval);
            fireImage.remove();
        }

        // Spread fire to adjacent parts
        spreadFire(part);
    }, 100);
}

// 불이 다른 파트로 번지게 하는 함수
function spreadFire(part) {
    Object.keys(houseParts).forEach(otherPart => {
        if (!houseParts[otherPart].onFire && isAdjacent(part, otherPart)) {
            houseParts[otherPart].onFire = true;
            startFire(otherPart);
        }
    });
}

// 두 파트가 인접해 있는지 확인하는 함수
function isAdjacent(part1, part2) {
    const rect1 = {
        left: houseParts[part1].x,
        top: houseParts[part1].y,
        right: houseParts[part1].x + houseParts[part1].width,
        bottom: houseParts[part1].y + houseParts[part1].height
    };
    const rect2 = {
        left: houseParts[part2].x,
        top: houseParts[part2].y,
        right: houseParts[part2].x + houseParts[part2].width,
        bottom: houseParts[part2].y + houseParts[part2].height
    };

    return !(rect1.right < rect2.left ||
        rect1.left > rect2.right ||
        rect1.bottom < rect2.top ||
        rect1.top > rect2.bottom);
}

// 요소와 파트가 충돌하는지 확인하는 함수
function isColliding(element, part) {
    const heatRect = element.getBoundingClientRect();
    const partRect = {
        left: part.x,
        top: part.y,
        right: part.x + part.width,
        bottom: part.y + part.height
    };

    return !(heatRect.right < partRect.left ||
        heatRect.left > partRect.right ||
        heatRect.bottom < partRect.top ||
        heatRect.top > partRect.bottom);
}

// 파트의 불탄 상태를 주기적으로 확인하는 함수
function checkBurnStatus() {
    if (activeDisaster !== 'heat') {
        return;
    }

    let burntParts = 0;
    Object.keys(houseParts).forEach(part => {
        if (houseParts[part].heatBroken) {
            burntParts++;
        }
    });

    if (burntParts / Object.keys(houseParts).length > 0.8) {
        // Burnt more than 80%
        document.body.style.backgroundColor = 'black';
        Object.keys(houseParts).forEach(part => {
            houseParts[part].heatBroken = false;
            drawScene(); // 이미지를 다시 그리도록 요청
        });

        setTimeout(() => {
            raindropEffect();
        }, 3000);
    }
}


// 빗방울 효과를 시작하는 함수
function raindropEffect() {
    console.log("Inside raindropEffect function"); // 디버깅 메시지 추가

    rainContainer = document.createElement('div');
    rainContainer.className = 'rainContainer';
    rainContainer.style.position = 'absolute';
    rainContainer.style.left = '0';
    rainContainer.style.top = '0';
    rainContainer.style.width = '100%';
    rainContainer.style.height = '100%';
    rainContainer.style.overflow = 'hidden';
    rainContainer.style.pointerEvents = 'none';

    document.body.appendChild(rainContainer);
    isRaining = true;

    // 빗방울 생성
    function createRaindrop() {
        if (!isRaining) return;

        const rainDrop = document.createElement('img');
        const raindropImages = ['../../assets/raindrop_1.png', '../../assets/raindrop_2.png', '../../assets/raindrop_3.png'];
        const randomImage = raindropImages[Math.floor(Math.random() * raindropImages.length)];
        rainDrop.src = randomImage;
        rainDrop.className = 'raindropEffect';
        rainDrop.style.left = `${Math.random() * 100}vw`;
        rainDrop.style.top = `-50px`; // 화면 위에서 시작
        rainContainer.appendChild(rainDrop);

        // 빗방울을 아래로 이동
        const fallDuration = 2000 + Math.random() * 1000;
        rainDrop.animate([
            { transform: 'translateY(0px)' },
            { transform: `translateY(${window.innerHeight + 50}px)` }
        ], {
            duration: fallDuration,
            easing: 'linear',
            iterations: 1,
            fill: 'forwards'
        });

        // 애니메이션이 끝난 후 빗방울 제거
        setTimeout(() => {
            rainDrop.remove();
        }, fallDuration);

        if (isRaining) {
            setTimeout(createRaindrop, 100); // 비가 내리는 동안 새로운 빗방울 생성 주기 설정
        }
    }

    createRaindrop();

    // heatElement를 즉시 제거
    if (heatElement) {
        heatElement.remove();
    }
    isHeatActive = false;

    // 4초 후에 비를 멈추고 집을 복원
    setTimeout(() => {
        isRaining = false;
        setTimeout(() => {
            rainContainer.remove();
            restoreHouse();
        }, 2000); // 남아있는 빗방울 애니메이션이 완료될 시간을 준다
    }, 4000);
}

// 집을 원래 상태로 복원하는 함수
function restoreHouse() {
    Object.keys(houseParts).forEach(part => {
        houseParts[part].broken = false;
        houseParts[part].damage = 0; // Reset damage
        houseParts[part].flying = false;
    });
    drawScene();
}

// checkBurnStatus 함수를 주기적으로 호출하여 불탄 상태를 확인
setInterval(checkBurnStatus, 1000);
