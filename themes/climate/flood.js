const floodIcon = document.getElementById('flood');
let isDragging = false;
let cloudCount = 0;

floodIcon.addEventListener('dragstart', (e) => {
    isDragging = true;
    e.dataTransfer.setData('text/plain', 'flood');
});

document.addEventListener('dragover', (e) => {
    e.preventDefault();
});

document.addEventListener('drop', (e) => {
    e.preventDefault();

    if (isDragging) {
        const rainElement = createRainElement(e.clientX, e.clientY, 400, 300); // Doubled size
        rainElement.dataset.divisionCount = '0'; // Initialize division count
        document.body.appendChild(rainElement);
        isFlooding = true;
        floodSpeed = 0.5; // 홍수 시작 시 초기 홍수 속도 설정
        waterLevel = 0; // 홍수 시작 시 초기 물레벨 설정
        isDragging = false;
        cloudCount++;
        checkEasterEgg('flood'); // 이스터에그 순서 체크
    }
});

function createRainElement(x, y, width, height) {
    const rainElement = document.createElement('img');
    rainElement.src = '../../assets/rain.png';
    rainElement.className = 'rainEffect';
    rainElement.style.width = `${width}px`;
    rainElement.style.height = `${height}px`;
    rainElement.style.left = `${x - width / 2}px`;
    rainElement.style.top = `${y - height / 2}px`;

    rainElement.dataset.divisionCount = '0'; // Initialize division count

    rainElement.addEventListener('mousedown', (e) => {
        let offsetX = e.clientX - rainElement.getBoundingClientRect().left;
        let offsetY = e.clientY - rainElement.getBoundingClientRect().top;
        function mouseMoveHandler(e) {
            rainElement.style.left = `${e.clientX - offsetX}px`;
            rainElement.style.top = `${e.clientY - offsetY}px`;
        }
        function mouseUpHandler() {
            document.removeEventListener('mousemove', mouseMoveHandler);
            document.removeEventListener('mouseup', mouseUpHandler);
        }
        document.addEventListener('mousemove', mouseMoveHandler);
        document.addEventListener('mouseup', mouseUpHandler);
    });

    rainElement.addEventListener('dblclick', () => {
        let divisionCount = parseInt(rainElement.dataset.divisionCount);

        if (divisionCount < 2) {
            const smallerWidth = width * 0.7;
            const smallerHeight = height * 0.72;

            // Random offsets for splitting direction
            const offsetX1 = (Math.random() - 0.5) * 2 * smallerWidth;
            const offsetY1 = (Math.random() - 0.5) * 2 * smallerHeight;
            const offsetX2 = (Math.random() - 0.5) * 2 * smallerWidth;
            const offsetY2 = (Math.random() - 0.5) * 2 * smallerHeight;

            const newLeft1 = Math.min(Math.max(rainElement.getBoundingClientRect().left + offsetX1, 0), window.innerWidth - smallerWidth);
            const newTop1 = Math.min(Math.max(rainElement.getBoundingClientRect().top + offsetY1, 0), window.innerHeight - smallerHeight);
            const newLeft2 = Math.min(Math.max(rainElement.getBoundingClientRect().left + offsetX2, 0), window.innerWidth - smallerWidth);
            const newTop2 = Math.min(Math.max(rainElement.getBoundingClientRect().top + offsetY2, 0), window.innerHeight - smallerHeight);

            const smallRain1 = createRainElement(newLeft1 + smallerWidth / 2, newTop1 + smallerHeight / 2, smallerWidth, smallerHeight);
            smallRain1.dataset.divisionCount = (divisionCount + 1).toString(); // Set division count

            const smallRain2 = createRainElement(newLeft2 + smallerWidth / 2, newTop2 + smallerHeight / 2, smallerWidth, smallerHeight);
            smallRain2.dataset.divisionCount = (divisionCount + 1).toString(); // Set division count

            floodSpeed *= 1.25; // Gradually increase flood speed when the rain element is clicked
            document.body.appendChild(smallRain1);
            document.body.appendChild(smallRain2);
            document.body.removeChild(rainElement);
            cloudCount++;
        } else {
            cloudCount--;
            floodSpeed /= 1.2; // Decrease flood speed when cloud disappears
            rainElement.remove(); // Correct way to remove the element
            if (cloudCount === 0) {
                isFlooding = false; // Stop flooding when all clouds are removed
            }
        }
    });

    return rainElement;
}
