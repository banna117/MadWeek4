function startFadeOut() {
    setTimeout(() => {
        const fade = document.getElementById('fade');
        fade.style.pointerEvents = 'auto'; // 페이드 아웃 시작 전 클릭 이벤트를 막음
        fade.style.opacity = 1; // 화면을 검은색으로 페이드 아웃
        fade.addEventListener('transitionend', () => {
            showMessages();
        });
    }, 30000); // 10초 후에 페이드 아웃 시작
}

function showMessages() {
    const messages = [
        "사막화는 우리의 문제입니다.",
        "우리는 지속 가능한 미래를 위해 행동해야 합니다.",
        "<img src='../../assets/desertification_example.jpg' alt='Desertification' style='width: 50%; height: auto;'>#StopDesertification",
        "사막화 방지를 위해 함께 노력합시다."
    ];

    const messageContainer = document.getElementById('postFadeMessageContainer');
    let currentMessage = 0;

    function showMessage() {
        if (currentMessage >= messages.length) {
            window.location.href = "../../index.html"; // 메인 페이지로 리다이렉트
            return;
        }

        messageContainer.innerHTML = `<div id="finalMessage" class="fade-messages">${messages[currentMessage]}</div>`;
        const finalMessage = document.getElementById('finalMessage');
        finalMessage.style.opacity = 0;
        finalMessage.style.transition = 'opacity 1s';

        setTimeout(() => {
            finalMessage.style.opacity = 1;
            setTimeout(() => {
                finalMessage.style.opacity = 0;
                setTimeout(() => {
                    currentMessage++;
                    showMessage();
                }, 1000); // 메시지가 사라진 후 다음 메시지를 표시하기까지의 지연 시간
            }, 3000); // 메시지가 나타난 후 머무는 시간
        }, 100); // 짧은 지연 후 메시지 표시
    }

    showMessage();
}

startFadeOut();
