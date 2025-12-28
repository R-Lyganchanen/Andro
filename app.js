document.addEventListener('DOMContentLoaded', () => {
  openDB(() => {
  console.log('DB: открыта');
  getCodes((codes) => console.log('DB: история', codes));

  });

  const dots = document.querySelectorAll('.dot');
  const keypad = document.querySelector('.keypad');
  let code = '';

  function updateDots() {
    dots.forEach((dot, i) => dot.classList.toggle('filled', i < code.length));
  }

  keypad?.addEventListener('click', (e) => {
    if (e.target.tagName !== 'BUTTON') return;
    const val = e.target.textContent.trim();
    if (val === '⌫') code = code.slice(0, -1);
    else if (code.length < dots.length) code += val;
    updateDots();
    if (code.length === dots.length) {
      saveCode(code);
      console.log('DB: сохранено', code);
    }
  });
});
