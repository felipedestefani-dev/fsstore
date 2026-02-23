// ===== DADOS DOS PRODUTOS =====
const categoryLabels = { pizza: 'Pizza', hamburguer: 'Hambúrguer', esfiha: 'Esfiha', bebida: 'Bebida' };

const products = [
  // Pizzas
  { id: 'p1', name: 'Pizza Margherita', price: 42.90, category: 'pizza', rating: 4.9, image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=400&fit=crop' },
  { id: 'p2', name: 'Pizza Calabresa', price: 38.90, category: 'pizza', rating: 4.8, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=400&fit=crop' },
  { id: 'p3', name: 'Pizza Pepperoni', price: 45.90, category: 'pizza', rating: 4.9, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=400&fit=crop' },
  { id: 'p4', name: 'Pizza 4 Queijos', price: 44.90, category: 'pizza', rating: 4.7, image: 'https://images.unsplash.com/photo-1579751626657-72bc17010498?w=400&h=400&fit=crop' },
  { id: 'p5', name: 'Pizza Portuguesa', price: 46.90, category: 'pizza', rating: 4.6, image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=400&fit=crop' },
  { id: 'p6', name: 'Pizza Frango c/ Catupiry', price: 43.90, category: 'pizza', rating: 4.8, image: 'https://images.unsplash.com/photo-1594007654729-407eedc4be65?w=400&h=400&fit=crop' },
  { id: 'p7', name: 'Pizza Mussarela', price: 36.90, category: 'pizza', rating: 4.7, image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400&h=400&fit=crop' },
  { id: 'p8', name: 'Pizza Napolitana', price: 47.90, category: 'pizza', rating: 4.9, image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&h=400&fit=crop' },
  // Hambúrgueres
  { id: 'h1', name: 'Hambúrguer Artesanal', price: 28.90, category: 'hamburguer', rating: 4.8, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=400&fit=crop' },
  { id: 'h2', name: 'X-Bacon', price: 32.90, category: 'hamburguer', rating: 4.7, image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400&h=400&fit=crop' },
  { id: 'h3', name: 'X-Tudo', price: 36.90, category: 'hamburguer', rating: 4.9, image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=400&h=400&fit=crop' },
  { id: 'h4', name: 'Hambúrguer Duplo', price: 34.90, category: 'hamburguer', rating: 4.6, image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&h=400&fit=crop' },
  // Esfihas
  { id: 'e1', name: 'Esfiha de Carne', price: 6.90, category: 'esfiha', rating: 4.8, image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=400&fit=crop' },
  { id: 'e2', name: 'Esfiha de Frango', price: 6.90, category: 'esfiha', rating: 4.7, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=400&fit=crop' },
  { id: 'e3', name: 'Esfiha de Calabresa', price: 7.50, category: 'esfiha', rating: 4.8, image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=400&fit=crop' },
  { id: 'e4', name: 'Esfiha de Queijo', price: 6.50, category: 'esfiha', rating: 4.6, image: 'https://images.unsplash.com/photo-1579751626657-72bc17010498?w=400&h=400&fit=crop' },
  { id: 'e5', name: 'Esfiha de Pizza', price: 7.90, category: 'esfiha', rating: 4.9, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=400&fit=crop' },
  // Bebidas
  { id: 'b1', name: 'Refrigerante Lata 350ml', price: 5.90, category: 'bebida', rating: 4.5, image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&h=400&fit=crop' },
  { id: 'b2', name: 'Suco Natural 500ml', price: 10.90, category: 'bebida', rating: 4.8, image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&h=400&fit=crop' },
  { id: 'b3', name: 'Água Mineral 500ml', price: 3.90, category: 'bebida', rating: 4.5, image: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&h=400&fit=crop' },
  { id: 'b4', name: 'Cerveja 350ml', price: 8.90, category: 'bebida', rating: 4.6, image: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=400&h=400&fit=crop' },
];

// ===== ESTADO =====
let cart = JSON.parse(localStorage.getItem('dn_pizzaria_cart') || '[]');
let currentCategory = 'all';
let searchQuery = '';

// ===== ELEMENTOS =====
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
const searchInput = document.getElementById('search-input');

// ===== FORMATAR PREÇO =====
function formatPrice(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

// ===== RENDERIZAR PRODUTOS =====
function getFilteredProducts() {
  return products.filter((p) => {
    const matchCategory = currentCategory === 'all' || p.category === currentCategory;
    const matchSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });
}

function renderProducts() {
  const list = getFilteredProducts();
  if (list.length === 0) {
    productsEl.innerHTML = '<p class="products__empty">Nenhum produto cadastrado.</p>';
    return;
  }
  productsEl.innerHTML = list
    .map(
      (p) => `
    <article class="product-card" data-id="${p.id}">
      <div class="product-card__image">
        <img src="${p.image}" alt="${p.name}" loading="lazy" />
      </div>
      <div class="product-card__body">
        <span class="product-card__rating">★ ${p.rating} · ${categoryLabels[p.category] || p.category}</span>
        <h3 class="product-card__name">${p.name}</h3>
        <span class="product-card__price">${formatPrice(p.price)}</span>
        <button type="button" class="product-card__btn" data-add-cart="${p.id}">Adicionar ao carrinho</button>
      </div>
    </article>
  `
    )
    .join('');

  document.querySelectorAll('[data-add-cart]').forEach((btn) => {
    btn.addEventListener('click', () => addToCart(btn.dataset.addCart));
  });
}

// ===== CARRINHO =====
function addToCart(productId) {
  const product = products.find((p) => p.id === productId);
  if (!product) return;
  const existing = cart.find((i) => i.id === productId);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id: product.id, name: product.name, price: product.price, image: product.image, qty: 1 });
  }
  saveCart();
  updateCartUI();
  openCart();
}

function removeFromCart(productId) {
  cart = cart.filter((i) => i.id !== productId);
  saveCart();
  updateCartUI();
}

function saveCart() {
  localStorage.setItem('dn_pizzaria_cart', JSON.stringify(cart));
}

function updateCartUI() {
  const totalItems = cart.reduce((sum, i) => sum + i.qty, 0);
  cartCount.textContent = totalItems;

  if (cart.length === 0) {
    cartEmpty.hidden = false;
    cartList.innerHTML = '';
    cartFooter.hidden = true;
    return;
  }

  cartEmpty.hidden = true;
  cartFooter.hidden = false;
  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  cartTotal.textContent = formatPrice(total);

  cartList.innerHTML = cart
    .map(
      (i) => `
    <li class="cart-item">
      <div class="cart-item__image">
        ${i.image ? `<img src="${i.image}" alt="${i.name}" />` : '<span aria-hidden="true">🍕</span>'}
      </div>
      <div class="cart-item__info">
        <div class="cart-item__name">${i.name}</div>
        <div class="cart-item__price">${formatPrice(i.price)} ${i.qty > 1 ? `× ${i.qty}` : ''}</div>
      </div>
      <button type="button" class="cart-item__remove" data-remove="${i.id}" aria-label="Remover">Remover</button>
    </li>
  `
    )
    .join('');

  cartList.querySelectorAll('[data-remove]').forEach((btn) => {
    btn.addEventListener('click', () => removeFromCart(btn.dataset.remove));
  });
}

function openCart() {
  cartPanel.classList.add('is-open');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  cartPanel.classList.remove('is-open');
  document.body.style.overflow = '';
}

function checkout() {
  if (cart.length === 0) return;
  alert('Obrigado pelo interesse! Esta é uma loja demonstrativa. Em um site real, você seria redirecionado ao pagamento.');
  closeCart();
}

// ===== TÍTULO DA SEÇÃO =====
const sectionTitles = {
  all: 'Cardápio',
  hamburguer: 'Hambúrgueres',
  pizza: 'Pizzas',
  esfiha: 'Esfihas',
  bebida: 'Bebidas',
};

function updateSectionTitle() {
  const el = document.getElementById('section-title');
  if (el) el.textContent = sectionTitles[currentCategory] || 'Cardápio';
}

// ===== CATEGORIAS (SIDEBAR) =====
document.querySelectorAll('.sidebar__item').forEach((btn) => {
  btn.addEventListener('click', () => {
    currentCategory = btn.dataset.category;
    document.querySelectorAll('.sidebar__item').forEach((b) => b.classList.remove('sidebar__item--active'));
    btn.classList.add('sidebar__item--active');
    updateSectionTitle();
    renderProducts();
  });
});

// ===== BUSCA =====
searchInput.addEventListener('input', (e) => {
  searchQuery = e.target.value.trim();
  renderProducts();
});

document.querySelector('.search-bar__btn').addEventListener('click', () => {
  searchQuery = searchInput.value.trim();
  renderProducts();
});

// ===== CARRINHO PANEL =====
cartBtn.addEventListener('click', openCart);
cartClose.addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);
cartCheckout.addEventListener('click', checkout);

// ===== INICIALIZAÇÃO =====
updateCartUI();
updateSectionTitle();
renderProducts();
