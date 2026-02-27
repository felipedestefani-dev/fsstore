// ===== SWAG GANG — Produtos =====
// ===== Loader (tela de carregamento) =====
(function initPageLoader() {
  const loader = document.getElementById('page-loader');
  const fill = document.getElementById('page-loader-fill');
  if (!loader || !fill) return;

  const bar = fill.parentElement;
  let progress = 0;
  const minDurationMs = 4000;
  const startMs = performance.now();
  let loadFired = false;
  let done = false;

  function setProgress(value) {
    const v = Math.max(0, Math.min(100, value));
    fill.style.width = `${v}%`;
    if (bar) bar.setAttribute('aria-valuenow', String(Math.round(v)));
  }

  function doFinish() {
    if (done) return;
    done = true;
    window.clearInterval(tick);
    setProgress(100);

    window.setTimeout(() => {
      loader.classList.add('is-hidden');
      window.setTimeout(() => loader.setAttribute('hidden', ''), 280);
    }, 220);
  }

  setProgress(8);
  const tick = window.setInterval(() => {
    const elapsed = performance.now() - startMs;
    if (loadFired) {
      // depois do load, continua progredindo devagar até bater 4s
      progress = Math.min(99, progress + (1 + Math.random() * 4));
      if (elapsed >= minDurationMs) doFinish();
      else setProgress(progress);
      return;
    }

    progress = Math.min(92, progress + (3 + Math.random() * 8));
    setProgress(progress);
  }, 120);

  window.addEventListener(
    'load',
    () => {
      loadFired = true;
      const elapsed = performance.now() - startMs;
      if (elapsed >= minDurationMs) doFinish();
    },
    { once: true }
  );

  // fallback (caso o load trave por algum motivo)
  window.setTimeout(doFinish, 8000);
})();

const products = [
  { id: '1', name: 'Hoodie Oversized SG', category: 'Hoodies', price: 299.90, image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&h=500&fit=crop' },
  { id: '2', name: 'T-Shirt Logo Preto', category: 'Camisetas', price: 129.90, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop' },
  { id: '3', name: 'Cap Trucker', category: 'Acessórios', price: 89.90, image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500&h=500&fit=crop' },
  { id: '4', name: 'Hoodie Zip Cinza', category: 'Hoodies', price: 329.90, image: 'https://images.unsplash.com/photo-1548126032-079a0fb0099d?w=500&h=500&fit=crop' },
  { id: '5', name: 'T-Shirt Branca Básica', category: 'Camisetas', price: 99.90, image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500&h=500&fit=crop' },
  { id: '6', name: 'Jogger Cargo', category: 'Calças', price: 249.90, image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500&h=500&fit=crop' },
  { id: '7', name: 'Moletom Cropped', category: 'Moletons', price: 279.90, image: 'https://images.unsplash.com/photo-1578768079052-aa76e52d6e7f?w=500&h=500&fit=crop' },
  { id: '8', name: 'Bucket Hat SG', category: 'Acessórios', price: 79.90, image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500&h=500&fit=crop' },
];

// ===== Estado =====
let cart = JSON.parse(localStorage.getItem('swaggang_cart') || '[]');

// ===== Elementos =====
const productsEl = document.getElementById('products');
const cartBtn = document.getElementById('cart-btn');
const cartPanel = document.getElementById('cart-panel');
const cartOverlay = document.getElementById('cart-overlay');
const cartClose = document.getElementById('cart-close');
const cartCount = document.getElementById('cart-count');
const cartList = document.getElementById('cart-list');
const cartEmpty = document.getElementById('cart-empty');
const cartFooter = document.getElementById('cart-footer');
const cartTotal = document.getElementById('cart-total');
const cartCheckout = document.getElementById('cart-checkout');

// ===== Helpers =====
function formatPrice(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function saveCart() {
  localStorage.setItem('swaggang_cart', JSON.stringify(cart));
}

// ===== Renderizar produtos =====
function renderProducts() {
  productsEl.innerHTML = products
    .map(
      (p) => `
    <article class="product-card" data-id="${p.id}">
      <div class="product-card__image">
        <img src="${p.image}" alt="${p.name}" loading="lazy" />
      </div>
      <div class="product-card__body">
        <h3 class="product-card__name">${p.name}</h3>
        <span class="product-card__category">${p.category}</span>
        <p class="product-card__price">${formatPrice(p.price)}</p>
        <button type="button" class="product-card__btn" data-add="${p.id}">Adicionar</button>
      </div>
    </article>
  `
    )
    .join('');
}

// ===== Carrinho =====
function updateCartCount() {
  cartCount.textContent = cart.reduce((acc, item) => acc + item.qty, 0);
}

function updateCartUI() {
  updateCartCount();
  if (cart.length === 0) {
    cartEmpty.hidden = false;
    cartFooter.hidden = true;
    cartList.innerHTML = '';
    return;
  }
  cartEmpty.hidden = true;
  cartFooter.hidden = false;
  cartList.innerHTML = cart
    .map(
      (item) => `
    <li class="cart-item" data-id="${item.id}">
      <div class="cart-item__image">
        <img src="${item.image}" alt="${item.name}" />
      </div>
      <div class="cart-item__info">
        <div class="cart-item__name">${item.name}</div>
        <div class="cart-item__price">${formatPrice(item.price)} ${item.qty > 1 ? '× ' + item.qty : ''}</div>
      </div>
      <button type="button" class="cart-item__remove" data-remove="${item.id}">Remover</button>
    </li>
  `
    )
    .join('');
  const total = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  cartTotal.textContent = formatPrice(total);
}

function addToCart(productId) {
  const product = products.find((p) => p.id === productId);
  if (!product) return;
  const existing = cart.find((i) => i.id === productId);
  if (existing) existing.qty += 1;
  else cart.push({ id: product.id, name: product.name, price: product.price, image: product.image, qty: 1 });
  saveCart();
  updateCartUI();
}

function removeFromCart(productId) {
  cart = cart.filter((i) => i.id !== productId);
  saveCart();
  updateCartUI();
}

function openCart() {
  cartPanel.classList.add('is-open');
}

function closeCart() {
  cartPanel.classList.remove('is-open');
}

// ===== Eventos =====
document.addEventListener('click', (e) => {
  const addBtn = e.target.closest('[data-add]');
  if (addBtn) {
    addToCart(addBtn.dataset.add);
    openCart();
    return;
  }
  const removeBtn = e.target.closest('[data-remove]');
  if (removeBtn) removeFromCart(removeBtn.dataset.remove);
});

cartBtn.addEventListener('click', openCart);
cartOverlay.addEventListener('click', closeCart);
cartClose.addEventListener('click', closeCart);
cartCheckout.addEventListener('click', () => {
  if (cart.length === 0) return;
  alert('Obrigado pelo interesse! Em um site real, você seria redirecionado ao checkout. — Swag Gang');
  cart = [];
  saveCart();
  updateCartUI();
  closeCart();
});

// ===== Inicialização =====
renderProducts();
updateCartUI();
