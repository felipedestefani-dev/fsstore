// Admin da Swag Gang - painel de produtos
(function () {
  const AUTH_KEY = 'swaggang_admin_auth';
  const AUTH_USER_KEY = 'swaggang_admin_user';
  const PRODUCTS_KEY = 'swaggang_products';
  const VENDAS_KEY = 'swaggang_vendas';

  function isAuthed() {
    return localStorage.getItem(AUTH_KEY) === '1';
  }

  if (!isAuthed()) {
    window.location.replace('admin-login.html');
    return;
  }

  function formatPrice(value) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }

  function safeParseJson(value, fallback) {
    try {
      return JSON.parse(value);
    } catch (e) {
      return fallback;
    }
  }

  function loadProducts() {
    const data = safeParseJson(localStorage.getItem(PRODUCTS_KEY) || '[]', []);
    if (!Array.isArray(data)) return [];
    return data
      .filter(function (p) {
        return p && typeof p === 'object';
      })
      .map(function (p) {
        return {
          id: String(p.id || ''),
          name: String(p.name || ''),
          category: String(p.category || ''),
          price: typeof p.price === 'number' ? p.price : Number(p.price || 0),
          image: String(p.image || ''),
        };
      })
      .filter(function (p) {
        return p.id && p.name && isFinite(p.price) && p.price >= 0 && p.image;
      });
  }

  function saveProducts(list) {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(list));
  }

  function loadVendas() {
    var data = safeParseJson(localStorage.getItem(VENDAS_KEY) || '[]', []);
    if (!Array.isArray(data)) return [];
    return data.filter(function (v) {
      return v && typeof v === 'object' && v.id && v.nome && v.cliente && v.tipo && isFinite(v.valor);
    });
  }

  function saveVendas(list) {
    localStorage.setItem(VENDAS_KEY, JSON.stringify(list));
  }

  function makeId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
    return String(Date.now());
  }

  var products = loadProducts();

  var welcome = document.getElementById('admin-welcome');
  var logoutBtn = document.getElementById('admin-logout');
  var user = localStorage.getItem(AUTH_USER_KEY);
  if (welcome && user) {
    welcome.textContent = 'Bem-vindo, ' + user + '.';
  }
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function () {
      localStorage.removeItem(AUTH_KEY);
      localStorage.removeItem(AUTH_USER_KEY);
      window.location.replace('admin-login.html');
    });
  }

  // Tabs
  var tabCatalogo = document.getElementById('tab-catalogo');
  var tabFinanceiro = document.getElementById('tab-financeiro');
  var panelCatalogo = document.getElementById('panel-catalogo');
  var panelFinanceiro = document.getElementById('panel-financeiro');

  function switchTab(tabId) {
    var isCatalogo = tabId === 'catalogo';
    if (tabCatalogo) tabCatalogo.classList.toggle('is-active', isCatalogo);
    if (tabFinanceiro) tabFinanceiro.classList.toggle('is-active', !isCatalogo);
    if (tabCatalogo) tabCatalogo.setAttribute('aria-selected', isCatalogo);
    if (tabFinanceiro) tabFinanceiro.setAttribute('aria-selected', !isCatalogo);
    if (panelCatalogo) {
      panelCatalogo.classList.toggle('is-active', isCatalogo);
      panelCatalogo.hidden = !isCatalogo;
    }
    if (panelFinanceiro) {
      panelFinanceiro.classList.toggle('is-active', !isCatalogo);
      panelFinanceiro.hidden = isCatalogo;
      if (!isCatalogo) updateFinanceiro();
    }
  }

  function updateFinanceiro() {
    var prods = loadProducts();
    var vendas = loadVendas();
    var receitaCatalogo = prods.reduce(function (acc, p) {
      return acc + (p.price || 0);
    }, 0);
    var lucros = vendas.reduce(function (acc, v) {
      return acc + (v.valor || 0);
    }, 0);
    var receitaTotal = receitaCatalogo + lucros;
    var receitaEl = document.getElementById('financeiro-receita');
    var lucrosEl = document.getElementById('financeiro-lucros');
    var produtosEl = document.getElementById('financeiro-produtos');
    var carrinhosEl = document.getElementById('financeiro-carrinhos');
    if (receitaEl) receitaEl.textContent = formatPrice(receitaTotal);
    if (lucrosEl) lucrosEl.textContent = formatPrice(lucros);
    if (produtosEl) produtosEl.textContent = String(prods.length);
    var cart = safeParseJson(localStorage.getItem('swaggang_cart') || '[]', []);
    var cartTotal = cart.reduce(function (acc, item) {
      return acc + (item.price || 0) * (item.qty || 1);
    }, 0);
    if (carrinhosEl) carrinhosEl.textContent = formatPrice(cartTotal);
    renderVendasTable();
  }

  var vendasForm = document.getElementById('venda-form');
  var vendasTbody = document.getElementById('vendas-tbody');
  var vendasEmpty = document.getElementById('vendas-empty');

  function renderVendasTable() {
    if (!vendasTbody) return;
    var vendas = loadVendas();
    if (vendasEmpty) vendasEmpty.hidden = vendas.length !== 0;
    vendasTbody.innerHTML = vendas
      .map(function (v) {
        return (
          '<tr data-id="' +
          v.id +
          '">' +
          '<td>' +
          v.nome +
          '</td>' +
          '<td>' +
          v.cliente +
          '</td>' +
          '<td>' +
          v.tipo +
          '</td>' +
          '<td><strong>' +
          formatPrice(v.valor) +
          '</strong></td>' +
          '<td>' +
          '<button type="button" class="btn btn--secondary admin-btn admin-btn--danger" data-delete-venda="' +
          v.id +
          '">Excluir</button>' +
          '</td>' +
          '</tr>'
        );
      })
      .join('');
  }

  function addVenda(nome, cliente, tipo, valor) {
    var vendas = loadVendas();
    var id = makeId();
    vendas.unshift({
      id: id,
      nome: nome,
      cliente: cliente,
      tipo: tipo,
      valor: valor,
    });
    saveVendas(vendas);
    updateFinanceiro();
  }

  function deleteVenda(id) {
    var vendas = loadVendas().filter(function (v) {
      return v.id !== id;
    });
    saveVendas(vendas);
    updateFinanceiro();
  }

  if (vendasForm) {
    vendasForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var nome = (document.getElementById('venda-nome') || {}).value.trim();
      var cliente = (document.getElementById('venda-cliente') || {}).value.trim();
      var tipo = (document.getElementById('venda-tipo') || {}).value;
      var valor = Number((document.getElementById('venda-valor') || {}).value || 0);
      if (!nome || !cliente || !tipo || !isFinite(valor) || valor < 0) return;
      addVenda(nome, cliente, tipo, valor);
      vendasForm.reset();
    });
  }

  if (vendasTbody) {
    vendasTbody.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-delete-venda]');
      if (!btn) return;
      var id = btn.getAttribute('data-delete-venda');
      if (!id) return;
      if (window.confirm('Excluir esta venda?')) deleteVenda(id);
    });
  }

  if (tabCatalogo) {
    tabCatalogo.addEventListener('click', function () {
      switchTab('catalogo');
    });
  }
  if (tabFinanceiro) {
    tabFinanceiro.addEventListener('click', function () {
      switchTab('financeiro');
    });
  }

  var tbody = document.getElementById('products-tbody');
  var emptyEl = document.getElementById('products-empty');
  var clearBtn = document.getElementById('products-clear');

  var form = document.getElementById('product-form');
  var idInput = document.getElementById('product-id');
  var nameInput = document.getElementById('product-name');
  var categoryInput = document.getElementById('product-category');
  var priceInput = document.getElementById('product-price');
  var imageInput = document.getElementById('product-image');
  var imageCurrentInput = document.getElementById('product-image-current');
  var cancelBtn = document.getElementById('product-cancel');

  function setEditing(isEditing) {
    if (cancelBtn) cancelBtn.hidden = !isEditing;
  }

  function resetForm() {
    if (idInput) idInput.value = '';
    if (nameInput) nameInput.value = '';
    if (categoryInput) categoryInput.value = '';
    if (priceInput) priceInput.value = '';
    if (imageInput) imageInput.value = '';
    if (imageCurrentInput) imageCurrentInput.value = '';
    setEditing(false);
  }

  function renderTable() {
    if (!tbody) return;
    if (emptyEl) emptyEl.hidden = products.length !== 0;

    tbody.innerHTML = products
      .map(function (p) {
        return (
          '<tr data-id="' +
          p.id +
          '">' +
          '<td class="admin-table__product">' +
          '<div class="admin-table__thumb">' +
          '<img src="' +
          p.image +
          '" alt="' +
          p.name +
          '" loading="lazy" />' +
          '</div>' +
          '<div class="admin-table__meta">' +
          '<div class="admin-table__name">' +
          p.name +
          '</div>' +
          '<div class="admin-table__id">' +
          p.id +
          '</div>' +
          '</div>' +
          '</td>' +
          '<td>' +
          (p.category || '-') +
          '</td>' +
          '<td><strong>' +
          formatPrice(p.price) +
          '</strong></td>' +
          '<td class="admin-table__actions">' +
          '<button type="button" class="btn btn--secondary admin-btn" data-edit="' +
          p.id +
          '">Editar</button>' +
          '<button type="button" class="btn btn--secondary admin-btn admin-btn--danger" data-delete="' +
          p.id +
          '">Excluir</button>' +
          '</td>' +
          '</tr>'
        );
      })
      .join('');
  }

  function upsertProduct(next) {
    var existingIndex = products.findIndex(function (p) {
      return p.id === next.id;
    });
    if (existingIndex >= 0) products[existingIndex] = next;
    else products.unshift(next);
    saveProducts(products);
    renderTable();
    updateFinanceiro();
  }

  function deleteProduct(id) {
    products = products.filter(function (p) {
      return p.id !== id;
    });
    saveProducts(products);
    renderTable();
    updateFinanceiro();
  }

  function getImageData(callback) {
    if (!imageInput) {
      callback((imageCurrentInput ? imageCurrentInput.value : '').trim());
      return;
    }
    var file = imageInput.files && imageInput.files[0];
    if (file) {
      var reader = new FileReader();
      reader.onload = function () {
        callback(String(reader.result || ''));
      };
      reader.onerror = function () {
        alert('Erro ao ler a imagem. Tente outra.');
        callback('');
      };
      reader.readAsDataURL(file);
    } else {
      callback((imageCurrentInput ? imageCurrentInput.value : '').trim());
    }
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var id = (idInput ? idInput.value : '').trim() || makeId();
      var name = (nameInput ? nameInput.value : '').trim();
      var category = (categoryInput ? categoryInput.value : '').trim();
      var price = Number(priceInput ? priceInput.value : 0);

      getImageData(function (image) {
        if (!name || !image || !isFinite(price) || price < 0) {
          alert('Preencha nome, preço válido e selecione uma imagem.');
          return;
        }
        upsertProduct({ id: id, name: name, category: category, price: price, image: image });
        resetForm();
      });
    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener('click', resetForm);
  }

  if (tbody) {
    tbody.addEventListener('click', function (e) {
      var target = e.target;
      if (!target) return;

      var editBtn = target.closest('[data-edit]');
      if (editBtn) {
        var id = editBtn.getAttribute('data-edit');
        var p = products.find(function (x) {
          return x.id === id;
        });
        if (!p) return;
        if (idInput) idInput.value = p.id;
        if (nameInput) nameInput.value = p.name;
        if (categoryInput) categoryInput.value = p.category || '';
        if (priceInput) priceInput.value = String(p.price);
        if (imageInput) imageInput.value = '';
        if (imageCurrentInput) imageCurrentInput.value = p.image;
        setEditing(true);
        if (nameInput) nameInput.focus();
        return;
      }

      var delBtn = target.closest('[data-delete]');
      if (delBtn) {
        var delId = delBtn.getAttribute('data-delete');
        if (!delId) return;
        var prod = products.find(function (x) {
          return x.id === delId;
        });
        var name = prod && prod.name ? prod.name : 'produto';
        var ok = window.confirm('Excluir "' + name + '"?');
        if (!ok) return;
        deleteProduct(delId);
      }
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', function () {
      if (products.length === 0) return;
      var ok = window.confirm('Tem certeza que deseja limpar todo o catálogo?');
      if (!ok) return;
      products = [];
      saveProducts(products);
      renderTable();
      resetForm();
      updateFinanceiro();
    });
  }

  renderTable();
})();
