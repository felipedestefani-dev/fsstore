(() => {
  const buttons = Array.from(document.querySelectorAll('.tabs__btn'));
  const main = document.querySelector('.main');
  const panels = {
    turma: document.getElementById('panel-turma'),
    rifas: document.getElementById('panel-rifas'),
    camisas: document.getElementById('panel-camisas'),
  };
  let activeTab = 'turma';

  function setActive(tab) {
    if (!panels[tab]) return;
    activeTab = tab;

    buttons.forEach((btn) => {
      const isActive = btn.dataset.tab === tab;
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-selected', String(isActive));
    });

    Object.entries(panels).forEach(([key, el]) => {
      if (!el) return;
      el.classList.toggle('is-hidden', key !== tab);
    });

    const current = panels[tab];
    if (main && current) {
      // Keep layout stable while panels are absolutely positioned
      main.style.minHeight = `${current.offsetHeight}px`;
    }
  }

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => setActive(btn.dataset.tab));
  });

  setActive('turma');
})();

