const typhoonIcon = document.getElementById('typhoon');
let typhoons = [];
let isTyphoonActive = false;

typhoonIcon.addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('text/plain', 'typhoon');
});

document.addEventListener('dragover', (e) => {
    e.preventDefault();
});

document.addEventListener('drop', (e) => {
    e.preventDefault();
    if (e.dataTransfer.getData('text/plain') === 'typhoon') {
        checkEasterEgg('typhoon'); // 이스터에그 순서 체크

        const typhoonElement = createTyphoonElement(e.clientX, e.clientY);
        document.body.appendChild(typhoonElement);
        typhoons.push(typhoonElement);
        isTyphoonActive = true;
        activeDisaster = 'typhoon';
    }
});

function createTyphoonElement(x, y) {
    const element = document.createElement('img');
    element.src = '../../assets/typhoon_icon.png';
    element.className = 'typhoonEffect';
    element.style.width = '800px';
    element.style.height = '800px';
    element.style.position = 'absolute';
    element.style.left = `${x - 400}px`;
    element.style.top = `${y - 400}px`;

    element.dataset.size = '800';
    element.dataset.scale = '1';
    element.dataset.scaleDirection = 'up';
    element.dataset.directionX = x < window.innerWidth / 2 ? 'right' : 'left';

    moveTyphoon(element);
    return element;
}

function moveTyphoon(element) {
    const moveInterval = setInterval(() => {
        if (!isTyphoonActive || parseInt(element.dataset.size) <= 0) {
            clearInterval(moveInterval);
            element.remove();
            typhoons = typhoons.filter(ty => ty !== element);

            if (typhoons.length === 0) {
                restoreHouse();
                isTyphoonActive = false;
                activeDisaster = null;
            }
            return;
        }

        const directionX = element.dataset.directionX === 'right' ? 1 : -1;
        const randomDirectionY = (Math.random() - 0.5) * 2;

        let moveX = directionX * 10;
        let moveY = randomDirectionY * 10;

        let newLeft = parseInt(element.style.left) + moveX;
        let newTop = parseInt(element.style.top) + moveY;

        if (newLeft < 0) newLeft = 0;
        if (newTop < 0) newTop = 0;
        if (newLeft > window.innerWidth - parseInt(element.dataset.size)) newLeft = window.innerWidth - parseInt(element.dataset.size);
        if (newTop > window.innerHeight - parseInt(element.dataset.size)) newTop = window.innerHeight - parseInt(element.dataset.size);

        element.style.left = `${newLeft}px`;
        element.style.top = `${newTop}px`;

        let scale = parseFloat(element.dataset.scale);
        let scaleDirection = element.dataset.scaleDirection;

        if (scaleDirection === 'up') {
            scale += 0.02;
            if (scale >= 1.2) {
                scaleDirection = 'down';
            }
        } else {
            scale -= 0.02;
            if (scale <= 0.8) {
                scaleDirection = 'up';
            }
        }

        element.dataset.scale = scale.toString();
        element.dataset.scaleDirection = scaleDirection;
        element.style.transform = `scale(${scale})`;

        let size = parseInt(element.dataset.size);
        size -= 5;
        element.dataset.size = size.toString();
        element.style.width = `${size}px`;
        element.style.height = `${size}px`;

        Object.keys(houseParts).forEach(part => {
            if (!houseParts[part].broken && activeDisaster === 'typhoon') {
                if (isColliding(element, houseParts[part])) {
                    houseParts[part].damage += 1;
                    if (houseParts[part].damage > houseParts[part].threshold) {
                        houseParts[part].broken = true;
                        // partFlyingEffect(houseParts[part]);
                    }
                }
            }
        });
    }, 50);
}

function isColliding(element, part) {
    const typhoonRect = element.getBoundingClientRect();
    const partRect = {
        left: part.x,
        top: part.y,
        right: part.x + part.width,
        bottom: part.y + part.height
    };

    return !(typhoonRect.right < partRect.left ||
        typhoonRect.left > partRect.right ||
        typhoonRect.bottom < partRect.top ||
        typhoonRect.top > partRect.bottom);
}

// function partFlyingEffect(part) {
//     if (part.flying) return; // 이미 날아가고 있는 파트는 다시 처리하지 않음
//     part.flying = true;
//     flyingParts.push(part);
//     let angle = Math.random() * Math.PI * 2;
//     const speed = 5 + Math.random() * 5;

//     const flyingInterval = setInterval(() => {
//         if (!part.flying) {
//             clearInterval(flyingInterval);
//             return;
//         }
//         part.x += Math.cos(angle) * speed;
//         part.y += Math.sin(angle) * speed;

//         if (part.x < -part.width || part.x > canvas.width || part.y < -part.height || part.y > canvas.height) {
//             part.flying = false;
//             flyingParts = flyingParts.filter(p => p !== part); // 화면을 벗어나면 flyingParts 배열에서 제거
//         }

//         console.log(`Flying part: ${part.x}, ${part.y}`);
//     }, 50);
// }
