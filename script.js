// Progresso na programação — app (requer login)
(function () {
  if (typeof getCurrentUser === 'undefined' || !getCurrentUser()) {
    window.location.href = 'login.html';
    return;
  }

  var CURRENT_USER_KEY = 'progresso_current_user';
  var REGISTROS_PREFIX = 'progresso_registros_';
  var ANOTACOES_PREFIX = 'progresso_anotacoes_';
  var CDN = 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons';

  var LINGUAGENS = [
    { id: 'javascript', nome: 'JavaScript', logo: CDN + '/javascript/javascript-original.svg' },
    { id: 'python', nome: 'Python', logo: CDN + '/python/python-original.svg' },
    { id: 'html5', nome: 'HTML', logo: CDN + '/html5/html5-original.svg' },
    { id: 'css3', nome: 'CSS', logo: CDN + '/css3/css3-original.svg' },
    { id: 'react', nome: 'React', logo: CDN + '/react/react-original.svg' },
    { id: 'typescript', nome: 'TypeScript', logo: CDN + '/typescript/typescript-original.svg' },
    { id: 'nodejs', nome: 'Node.js', logo: CDN + '/nodejs/nodejs-original.svg' },
  ];

  var linguagemAtiva = 'todos';

  function sanitizeEmailForKey(email) {
    return (email || '').toLowerCase().replace(/[^a-z0-9]/g, '_');
  }

  function getRegistrosKey() {
    var user = getCurrentUserEmail();
    return user ? REGISTROS_PREFIX + sanitizeEmailForKey(user) : null;
  }

  function getCurrentUserEmail() {
    return localStorage.getItem(CURRENT_USER_KEY);
  }

  function loadRegistros() {
    var key = getRegistrosKey();
    if (!key) return [];
    try {
      var raw = localStorage.getItem(key);
      var data = raw ? JSON.parse(raw) : [];
      return Array.isArray(data) ? data : [];
    } catch (e) {
      return [];
    }
  }

  function saveRegistros(registros) {
    var key = getRegistrosKey();
    if (key) localStorage.setItem(key, JSON.stringify(registros));
  }

  function getAnotacoesKey() {
    var user = getCurrentUserEmail();
    return user ? ANOTACOES_PREFIX + sanitizeEmailForKey(user) : null;
  }

  function loadAnotacoes() {
    var key = getAnotacoesKey();
    if (!key) return '';
    try {
      return localStorage.getItem(key) || '';
    } catch (e) {
      return '';
    }
  }

  function saveAnotacoes(text) {
    var key = getAnotacoesKey();
    if (key) localStorage.setItem(key, text);
  }

  function makeId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
  }

  function formatMinutos(minutos) {
    if (minutos < 60) return minutos + ' min';
    var h = Math.floor(minutos / 60);
    var m = minutos % 60;
    return m ? h + 'h ' + m + 'min' : h + 'h';
  }

  function formatData(isoString) {
    var d = new Date(isoString);
    var hoje = new Date();
    var ontem = new Date(hoje);
    ontem.setDate(ontem.getDate() - 1);
    if (d.toDateString() === hoje.toDateString()) return 'Hoje';
    if (d.toDateString() === ontem.toDateString()) return 'Ontem';
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  }

  function getNomeLinguagem(id) {
    var l = LINGUAGENS.find(function (x) { return x.id === id; });
    return l ? l.nome : id;
  }

  var tabsContainer = document.getElementById('tabs-linguagens');
  var selectLinguagem = document.getElementById('estudo-linguagem');
  var form = document.getElementById('form-estudo');
  var totalHorasEl = document.getElementById('total-horas');
  var totalSessoesEl = document.getElementById('total-sessoes');
  var topicosList = document.getElementById('topicos-list');
  var topicosEmpty = document.getElementById('topicos-empty');
  var historicoList = document.getElementById('historico-list');
  var historicoEmpty = document.getElementById('historico-empty');
  var viewProgresso = document.getElementById('view-progresso');
  var viewAnotacoes = document.getElementById('view-anotacoes');
  var anotacoesTextarea = document.getElementById('anotacoes-textarea');
  var anotacoesStatus = document.getElementById('anotacoes-status');

  function setView(viewName) {
    var isProgresso = viewName === 'progresso';
    if (viewProgresso) viewProgresso.hidden = !isProgresso;
    if (viewAnotacoes) viewAnotacoes.hidden = isProgresso;
    document.querySelectorAll('.view-switcher__btn').forEach(function (btn) {
      var active = btn.getAttribute('data-view') === viewName;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-selected', active);
    });
    if (viewName === 'anotacoes' && anotacoesTextarea) {
      anotacoesTextarea.value = loadAnotacoes();
    }
  }

  function showAnotacoesSaved() {
    if (!anotacoesStatus) return;
    anotacoesStatus.textContent = 'Salvo.';
    clearTimeout(anotacoesStatus._saveTimeout);
    anotacoesStatus._saveTimeout = setTimeout(function () {
      anotacoesStatus.textContent = '';
    }, 2000);
  }

  function renderTabs() {
    if (!tabsContainer) return;
    var html = '<button type="button" class="tabs__btn tabs__btn--todos is-active" data-linguagem="todos"><span>Todos</span></button>';
    LINGUAGENS.forEach(function (l) {
      html += '<button type="button" class="tabs__btn" data-linguagem="' + l.id + '">' +
        '<img src="' + l.logo + '" alt="' + l.nome + '" />' +
        '<span>' + l.nome + '</span></button>';
    });
    tabsContainer.innerHTML = html;

    tabsContainer.querySelectorAll('.tabs__btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        linguagemAtiva = btn.getAttribute('data-linguagem');
        tabsContainer.querySelectorAll('.tabs__btn').forEach(function (b) { b.classList.remove('is-active'); });
        btn.classList.add('is-active');
        render(getRegistros());
      });
    });
  }

  function renderSelect() {
    if (!selectLinguagem) return;
    selectLinguagem.innerHTML = LINGUAGENS.map(function (l) {
      return '<option value="' + l.id + '">' + l.nome + '</option>';
    }).join('');
  }

  function getRegistros() {
    return loadRegistros().map(function (r) {
      var lid = r.linguagem && LINGUAGENS.some(function (l) { return l.id === r.linguagem; }) ? r.linguagem : (LINGUAGENS[0] && LINGUAGENS[0].id);
      return {
        id: r.id || makeId(),
        linguagem: lid,
        tema: (r.tema || '').trim() || 'Outro',
        minutos: typeof r.minutos === 'number' ? r.minutos : parseInt(r.minutos, 10) || 0,
        data: r.data || new Date().toISOString(),
      };
    });
  }

  function filtrarPorLinguagem(registros) {
    if (linguagemAtiva === 'todos') return registros;
    return registros.filter(function (r) { return r.linguagem === linguagemAtiva; });
  }

  function getTotalMinutos(registros) {
    return registros.reduce(function (acc, r) {
      return acc + (r.minutos || 0);
    }, 0);
  }

  function getMinutosPorTema(registros) {
    var porTema = {};
    registros.forEach(function (r) {
      var t = r.tema || 'Outro';
      porTema[t] = (porTema[t] || 0) + (r.minutos || 0);
    });
    return porTema;
  }

  function renderResumo(registros) {
    var totalMin = getTotalMinutos(registros);
    var horas = Math.floor(totalMin / 60);
    var min = totalMin % 60;
    var horasStr = horas ? horas + 'h ' : '';
    if (min) horasStr += min + 'min';
    else if (!horas) horasStr = '0 min';
    if (totalHorasEl) totalHorasEl.textContent = horasStr;
    if (totalSessoesEl) totalSessoesEl.textContent = String(registros.length);
  }

  function renderTopicos(registros) {
    if (!topicosList) return;
    var porTema = getMinutosPorTema(registros);
    var temas = Object.keys(porTema).sort();
    var maxMin = Math.max.apply(null, temas.map(function (t) {
      return porTema[t];
    })) || 1;

    if (temas.length === 0) {
      topicosList.innerHTML = '';
      if (topicosEmpty) topicosEmpty.hidden = false;
      return;
    }

    if (topicosEmpty) topicosEmpty.hidden = true;
    topicosList.innerHTML = temas
      .map(function (tema) {
        var min = porTema[tema];
        var pct = Math.round((min / maxMin) * 100);
        return (
          '<div class="topico-card">' +
          '<div class="topico-card__top">' +
          '<span class="topico-card__nome">' + tema + '</span>' +
          '<span class="topico-card__tempo">' + formatMinutos(min) + '</span>' +
          '</div>' +
          '<div class="topico-card__bar">' +
          '<div class="topico-card__bar-fill" style="width:' + pct + '%"></div>' +
          '</div>' +
          '</div>'
        );
      })
      .join('');
  }

  function renderHistorico(registros) {
    if (!historicoList) return;
    var list = registros
      .slice()
      .sort(function (a, b) {
        return new Date(b.data) - new Date(a.data);
      })
      .slice(0, 30);

    if (list.length === 0) {
      historicoList.innerHTML = '';
      historicoList.setAttribute('data-empty', 'true');
      if (historicoEmpty) historicoEmpty.hidden = false;
      return;
    }

    historicoList.setAttribute('data-empty', 'false');
    if (historicoEmpty) historicoEmpty.hidden = true;
    historicoList.innerHTML = list
      .map(function (r) {
        return (
          '<li class="historico-item" data-id="' + r.id + '">' +
          '<div>' +
          '<div class="historico-item__tema">' + r.tema + ' <span class="historico-item__lang">(' + getNomeLinguagem(r.linguagem) + ')</span></div>' +
          '<div class="historico-item__meta">' + formatData(r.data) + '</div>' +
          '</div>' +
          '<div>' +
          '<span class="historico-item__tempo">' + formatMinutos(r.minutos) + '</span>' +
          '<button type="button" class="btn btn--danger historico-item__del" data-delete="' + r.id + '" aria-label="Excluir">Excluir</button>' +
          '</div>' +
          '</li>'
        );
      })
      .join('');
  }

  function render(allRegistros) {
    var registros = filtrarPorLinguagem(allRegistros);
    renderResumo(registros);
    renderTopicos(registros);
    renderHistorico(registros);
  }

  function initApp() {
    var headerEmail = document.getElementById('header-email');
    if (headerEmail) headerEmail.textContent = getCurrentUserEmail();
    renderTabs();
    renderSelect();
    render(getRegistros());
    if (anotacoesTextarea) {
      anotacoesTextarea.value = loadAnotacoes();
      anotacoesTextarea.addEventListener('input', function () {
        clearTimeout(anotacoesTextarea._saveTimeout);
        anotacoesTextarea._saveTimeout = setTimeout(function () {
          saveAnotacoes(anotacoesTextarea.value);
          showAnotacoesSaved();
        }, 400);
      });
      anotacoesTextarea.addEventListener('blur', function () {
        saveAnotacoes(anotacoesTextarea.value);
        showAnotacoesSaved();
      });
    }
    document.querySelectorAll('.view-switcher__btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        setView(btn.getAttribute('data-view'));
      });
    });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var langInput = document.getElementById('estudo-linguagem');
    var temaInput = document.getElementById('estudo-tema');
    var minInput = document.getElementById('estudo-minutos');
    var linguagem = (langInput && langInput.value) || (LINGUAGENS[0] && LINGUAGENS[0].id);
    var tema = (temaInput && temaInput.value || '').trim() || 'Outro';
    var minutos = parseInt(minInput && minInput.value, 10) || 0;
    if (!linguagem || minutos < 1) return;

    var registros = getRegistros();
    registros.unshift({
      id: makeId(),
      linguagem: linguagem,
      tema: tema,
      minutos: minutos,
      data: new Date().toISOString(),
    });
    saveRegistros(registros);
    render(registros);
    form.reset();
  });

  historicoList.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-delete]');
    if (!btn) return;
    var id = btn.getAttribute('data-delete');
    if (!id) return;
    var registros = getRegistros().filter(function (r) {
      return r.id !== id;
    });
    saveRegistros(registros);
    render(registros);
  });

  var btnLogout = document.getElementById('btn-logout');
  if (btnLogout) {
    btnLogout.addEventListener('click', function () {
      if (typeof clearCurrentUser === 'function') clearCurrentUser();
      window.location.href = 'login.html';
    });
  }

  initApp();
})();
