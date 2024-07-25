document.addEventListener("DOMContentLoaded", function() {
  const islands = document.querySelectorAll('.island-image');
  const resetButton = document.getElementById('reset-storage');
  const bellIcon = document.querySelector('.bell-icon');
  const whiteContainer = document.querySelector('.white-container');

  function checkAllVisited() {
    const allVisited = ['animal', 'climate', 'desertification', 'trash'].every(id => localStorage.getItem(id) === 'visited');
    if (allVisited) {
      bellIcon.classList.remove('hidden');
      bellIcon.classList.add('ringing');
      bellIcon.addEventListener('click', handleBellClick);
    } else {
      bellIcon.classList.add('hidden');
      bellIcon.classList.remove('ringing');
      bellIcon.removeEventListener('click', handleBellClick);
    }
  }

  function handleBellClick() {
    // 종 클릭 시 흰색 컨테이너 안에 요소를 추가하는 로직
    const newElement = document.createElement('div');
    newElement.textContent = "All islands visited!";
    newElement.style.fontSize = '24px';
    newElement.style.color = 'black';
    newElement.style.textAlign = 'center';
    newElement.style.marginTop = '20px';
    whiteContainer.appendChild(newElement);
    bellIcon.classList.remove('ringing');
    bellIcon.removeEventListener('click', handleBellClick);
  }

  islands.forEach(island => {
    island.addEventListener('click', () => {
      const id = island.id;
      localStorage.setItem(id, 'visited');
      window.location.href = `./themes/${id}/${id}.html`;
    });

    const visited = localStorage.getItem(island.id);
    if (visited) {
      island.classList.add('visited');
    }
  });

  resetButton.addEventListener('click', () => {
    localStorage.clear();
    islands.forEach(island => {
      island.classList.remove('visited');
      island.style.filter = 'grayscale(100%)';
    });
    bellIcon.classList.add('hidden');
    bellIcon.classList.remove('ringing');
    bellIcon.removeEventListener('click', handleBellClick);
  });

  checkAllVisited();
});
