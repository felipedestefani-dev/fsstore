(() => {
  const buttons = Array.from(document.querySelectorAll('.tabs__btn'));
  const panels = {
    geral: document.getElementById('panel-geral'),
    eventos: document.getElementById('panel-eventos'),
    trotes: document.getElementById('panel-trotes'),
    interclasse: document.getElementById('panel-interclasse'),
    gebe: document.getElementById('panel-gebe'),
    admin: document.getElementById('panel-admin'),
  };
  let activeTab = 'geral';

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

    requestAnimationFrame(() => {
      const el = panels[tab];
      if (el) void el.offsetHeight;
    });
  }

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => setActive(btn.dataset.tab));
  });

  // Links internos #panel-* trocam de aba
  document.addEventListener('click', (e) => {
    const a = e.target instanceof Element ? e.target.closest('a[href^="#panel-"]') : null;
    if (!a) return;
    const href = a.getAttribute('href');
    if (!href) return;
    const tab = href.replace('#panel-', '');
    if (!panels[tab]) return;
    e.preventDefault();
    setActive(tab);
  });

  setActive('geral');
})();

