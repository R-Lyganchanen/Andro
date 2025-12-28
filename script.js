/* =========================================================
   Блокировка скролла и bounce на iOS
   ========================================================= */
(function lockScrollIOS() {
  const prevent = (e) => e.preventDefault();
  document.addEventListener('touchmove', prevent, { passive: false });
  document.addEventListener('wheel', prevent, { passive: false });

  // Фиксируем корневые контейнеры, чтобы убрать bounce
  document.documentElement.style.position = 'fixed';
  document.documentElement.style.width = '100%';
  document.documentElement.style.height = '100%';
  document.body.style.position = 'fixed';
  document.body.style.width = '100%';
  document.body.style.height = '100%';
})();

/* =========================================================
   Нижнее меню: открытие/закрытие и свайп вниз page3
   ========================================================= */
function toggleMenu() {
  const menu = document.getElementById('menu');
  const overlay = document.getElementById('overlay');
  menu.classList.toggle('open');
  overlay.classList.toggle('open');
}
(function attachMenuSwipe() {
  const menu = document.getElementById('menu');
  if (!menu) return;
  let startY = 0;

  menu.addEventListener('touchstart', (e) => {
    startY = e.touches[0].clientY;
  });

  menu.addEventListener('touchmove', (e) => {
  const currentY = e.touches[0].clientY;
  const diffY = currentY - startY;
  if (diffY > 50) {
    menu.classList.remove('open');
    overlay.classList.remove('open'); // ← добавь это
  }
});
overlay.addEventListener('click', () => {
  menu.classList.remove('open');
  overlay.classList.remove('open');
});
})();

/* =========================================================
   Переворот карточки + обработка кнопки page3
   ========================================================= */
(function () {
  const card = document.getElementById('card'); // вращаемая карточка
  if (!card) return;

  // Переворот по клику на карточку
  card.addEventListener('click', () => {
    card.classList.toggle('flipped');
  });

  // Кнопка "+" открывает меню; не даём клику переворачивать карточку
  const circleBtn = document.querySelector('.form-circle-btn');
  if (circleBtn) {
    circleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMenu();
    });
  }
})();

/* =========================================================
   Открытие и закрытие страницы Inform
   ========================================================= */
// Глобальные функции для inline/внешних обработчиков
(function() {
  const inform = document.getElementById('informPage');
  const overlay = document.getElementById('informOverlay');
  const openBtn = document.getElementById('openInformBtn');
  const closeBtn = document.getElementById('closeInformBtn');

  function openInformPage() {
    inform.classList.add('open');
    overlay?.classList.add('open');
    inform.setAttribute('aria-hidden', 'false');
    overlay?.setAttribute('aria-hidden', 'false');
  }

  function closeInformPage() {
    inform.classList.remove('open');
    overlay?.classList.remove('open');
    inform.setAttribute('aria-hidden', 'true');
    overlay?.setAttribute('aria-hidden', 'true');
  }

  // Экспорт в глобальную область для inline вызовов (на случай, если ты оставишь onclick)
  window.openInformPage = openInformPage;
  window.closeInformPage = closeInformPage;

  // Нормальные обработчики событий (предпочтительный способ)
  openBtn?.addEventListener('click', openInformPage);
  closeBtn?.addEventListener('click', closeInformPage);
  overlay?.addEventListener('click', closeInformPage);

  // Свайп вправо для закрытия
  let startX = 0;
  let startY = 0;

  inform.addEventListener('touchstart', (e) => {
    const t = e.touches[0];
    startX = t.clientX;
    startY = t.clientY;
  });

  inform.addEventListener('touchmove', (e) => {
    const t = e.touches[0];
    const diffX = t.clientX - startX;
    const diffY = t.clientY - startY;

    // Свайп вправо, при этом горизонталь доминирует над вертикалью
    if (diffX > 50 && Math.abs(diffX) > Math.abs(diffY)) {
      closeInformPage();
    }
  });

// Проверка на ноль для цифровой формы
   (function() {
  const inform = document.getElementById('informPage');
  if (!inform) return; // если элемента нет, выходим

  let startX = 0, startY = 0;

  inform.addEventListener('touchstart', (e) => {
    const t = e.touches[0];
    startX = t.clientX;
    startY = t.clientY;
  });

  inform.addEventListener('touchmove', (e) => {
    const t = e.touches[0];
    const diffX = t.clientX - startX;
    const diffY = t.clientY - startY;

    if (diffX > 50 && Math.abs(diffX) > Math.abs(diffY)) {
      closeInformPage();
    }
  });
})();

})();


