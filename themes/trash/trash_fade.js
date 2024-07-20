function startFadeOut() {
    setTimeout(() => {
        const fade = document.getElementById('fade');
        fade.style.pointerEvents = 'auto'; // 페이드 아웃 시작 전 클릭 이벤트를 막음
        fade.style.opacity = 1; // 화면을 검은색으로 페이드 아웃
        fade.addEventListener('transitionend', () => {
            showMessages();
        });
    }, 26000); // 10초 후에 페이드 아웃 시작
}

function showMessages() {
    const messages = [
        "눈에 보이지만 않으면 해결되는 것일까요?",
        "우리는 '쓰레기 식민주의' 시대에 살고 있습니다.",
        "<img src='../../assets/trash_example.jpg' alt='Trash' style='width: 50%; height: auto;'>#We'reNotADumpster",
        "아이들을 쓰레기 세상에서 구해주세요."
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
