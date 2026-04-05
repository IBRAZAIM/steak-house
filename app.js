// ===================================
// PREMIUM STEAK HOUSE - APP.JS
// Server-based + Local Cart Storage
// ===================================

const CART_KEY = 'cart';

class Database {
  constructor() {
    this.init();
  }

  // Initialize database
  init() {
    if (!localStorage.getItem(CART_KEY)) {
      localStorage.setItem(CART_KEY, JSON.stringify([]));
    }
  }

  // === PRODUCTS - SERVER ONLY ===

  async getProducts() {
    try {
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      return await response.json();
    } catch (error) {
      console.error('Error loading products:', error);
      alert('Не удалось загрузить каталог. Проверьте соединение с сервером.');
      return [];
    }
  }

  async getProductById(id) {
    try {
      const response = await fetch(`/api/products/${id}`);
      if (!response.ok) throw new Error('Product not found');
      return await response.json();
    } catch (error) {
      console.error('Error loading product:', error);
      return null;
    }
  }

  async filterByCategory(category) {
    try {
      const response = await fetch(`/api/products/category/${encodeURIComponent(category)}`);
      if (!response.ok) throw new Error('Category not found');
      return await response.json();
    } catch (error) {
      console.error('Error filtering products:', error);
      return [];
    }
  }

  async searchProducts(query, products) {
    if (!query) return products;
    const q = query.toLowerCase();
    return products.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.description.toLowerCase().includes(q)
    );
  }

  // === CART - LOCAL STORAGE ===

  getCart() {
    return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
  }

  async addToCart(productId) {
    const cart = this.getCart();
    const product = await this.getProductById(productId);
    
    if (!product) return null;

    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1
      });
    }

    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    return cart;
  }

  removeFromCart(productId) {
    let cart = this.getCart();
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    return cart;
  }

  updateCartQuantity(productId, quantity) {
    const cart = this.getCart();
    const item = cart.find(item => item.id === productId);
    
    if (item) {
      item.quantity = quantity;
      if (item.quantity <= 0) {
        return this.removeFromCart(productId);
      }
    }

    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    return cart;
  }

  clearCart() {
    localStorage.setItem(CART_KEY, JSON.stringify([]));
    return [];
  }

  getCartTotal() {
    const cart = this.getCart();
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  getCartCount() {
    const cart = this.getCart();
    return cart.reduce((count, item) => count + item.quantity, 0);
  }
}

// ===================================
// UI FUNCTIONS
// ===================================

const db = new Database();

let cartModal, cartOverlay, closeCartBtn, cartBtn, cartCount, cartItems;
let cartTotal, cartModalTotal, clearCartBtn, checkoutBtn, notification, notificationText;
let mobileMenuBtn, mobileMenu, closeMobileMenuBtn, mobileMenuOverlay, mobileCartBtn, mobileCartCount;

function initDOMElements() {
  cartModal = document.getElementById('cartModal');
  cartOverlay = document.getElementById('cartOverlay');
  closeCartBtn = document.getElementById('closeCart');
  cartBtn = document.getElementById('cartBtn');
  cartCount = document.getElementById('cartCount');
  cartItems = document.getElementById('cartItems');
  cartTotal = document.getElementById('cartTotal');
  cartModalTotal = document.getElementById('cartModalTotal');
  clearCartBtn = document.getElementById('clearCart');
  checkoutBtn = document.getElementById('checkoutBtn');
  notification = document.getElementById('notification');
  notificationText = document.getElementById('notificationText');
  mobileCartBtn = document.getElementById('mobileCartBtn');
  mobileCartCount = document.getElementById('mobileCartCount');
  mobileMenuBtn = document.getElementById('mobileMenuBtn');
  mobileMenu = document.getElementById('mobileMenu');
  closeMobileMenuBtn = document.getElementById('closeMobileMenuBtn');
  mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
}

async function initApp() {
  if (typeof loadComponents === 'function') {
    const headerContainer = document.getElementById('header-container');
    if (headerContainer) {
      loadComponents({ showAdminLink: true });
    }
  }

  initDOMElements();
  updateCartCount();
  await renderProducts();

  if (cartBtn) cartBtn.addEventListener('click', openCart);
  if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);
  if (clearCartBtn) clearCartBtn.addEventListener('click', clearCart);
  if (checkoutBtn) checkoutBtn.addEventListener('click', checkout);
  if (mobileCartBtn) mobileCartBtn.addEventListener('click', openCart);
  if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', toggleMobileMenu);
  if (closeMobileMenuBtn) closeMobileMenuBtn.addEventListener('click', closeMobileMenu);
  if (mobileMenuOverlay) mobileMenuOverlay.addEventListener('click', closeMobileMenu);

  if (mobileMenu) {
    const links = mobileMenu.querySelectorAll('a');
    links.forEach(link => link.addEventListener('click', closeMobileMenu));
  }

  window.addEventListener('scroll', headerScroll);
}

window.initApp = initApp;

async function renderProducts(containerId = 'productsGrid', products = null) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const productsToRender = products || await db.getProducts();
  
  container.innerHTML = productsToRender.map(product => `
    <div class="product-card" data-id="${product.id}">
      <div class="product-image">
        <img 
          src="${product.image}" 
          alt="${product.name}" 
          loading="lazy"
          onerror="handleImageError(this)"
          onload="handleImageLoad(this)"
        >
        <div class="image-placeholder">
          <i class="fas fa-steak"></i>
        </div>
        <div class="image-error" style="display: none;">
          <i class="fas fa-image"></i>
          <span>Изображение недоступно</span>
        </div>
        ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
      </div>
      <div class="product-info">
        <h3>${product.name}</h3>
        <p class="desc">${product.description}</p>
        <div class="product-bottom">
          <span class="price">${product.price.toLocaleString()} ₸</span>
          <button class="btn-add" onclick="addToCart(${product.id})">В корзину</button>
        </div>
      </div>
    </div>
  `).join('');
}

function handleImageLoad(img) {
  img.classList.add('loaded');
  const placeholder = img.parentElement.querySelector('.image-placeholder');
  if (placeholder) placeholder.classList.add('hidden');
  const errorDiv = img.parentElement.querySelector('.image-error');
  if (errorDiv) errorDiv.style.display = 'none';
}

function handleImageError(img) {
  img.classList.add('error');
  img.style.display = 'none';
  const placeholder = img.parentElement.querySelector('.image-placeholder');
  if (placeholder) placeholder.classList.add('hidden');
  const errorDiv = img.parentElement.querySelector('.image-error');
  if (errorDiv) errorDiv.style.display = 'flex';
}

function addToCart(productId) {
  db.addToCart(productId);
  updateCartCount();
  showNotification('Товар добавлен в корзину');
}

function updateCartCount() {
  const count = db.getCartCount();
  if (cartCount) {
    cartCount.textContent = count;
    cartCount.style.display = count > 0 ? 'flex' : 'none';
  }
  if (mobileCartCount) {
    mobileCartCount.textContent = count;
    mobileCartCount.style.display = count > 0 ? 'flex' : 'none';
  }
}

function openCart(e) {
  e.preventDefault();
  renderCartItems();
  cartModal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  cartModal.classList.remove('open');
  document.body.style.overflow = '';
}

function renderCartItems() {
  const cart = db.getCart();
  
  if (cart.length === 0) {
    cartItems.innerHTML = `
      <div class="cart-empty">
        <i class="fas fa-shopping-basket"></i>
        <p>Корзина пуста</p>
      </div>
    `;
    if (cartTotal) cartTotal.textContent = '0 ₸';
    if (checkoutBtn) checkoutBtn.disabled = true;
    return;
  }

  if (checkoutBtn) checkoutBtn.disabled = false;

  cartItems.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">${item.price.toLocaleString()} ₸ × ${item.quantity}</div>
      </div>
      <button class="cart-item-remove" onclick="removeFromCart(${item.id})">
        <i class="fas fa-trash"></i>
      </button>
    </div>
  `).join('');

  const cartTotalElement = cartModalTotal || cartTotal;
  if (cartTotalElement) {
    cartTotalElement.textContent = db.getCartTotal().toLocaleString() + ' ₸';
  }
}

function removeFromCart(productId) {
  db.removeFromCart(productId);
  updateCartCount();
  renderCartItems();
}

function clearCart() {
  db.clearCart();
  updateCartCount();
  renderCartItems();
  showNotification('Корзина очищена');
}

function checkout() {
  const cart = db.getCart();
  if (cart.length === 0) {
    showNotification('Корзина пуста');
    return;
  }
  window.location.href = 'checkout.html';
}

function showNotification(message) {
  if (!notification) return;
  notificationText.textContent = message;
  notification.classList.add('show');
  setTimeout(() => {
    notification.classList.remove('show');
  }, 3000);
}

function headerScroll() {
  const header = document.querySelector('header');
  if (window.scrollY > 50) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
}

function toggleMobileMenu(e) {
  if (e) e.preventDefault();
  if (mobileMenu.classList.contains('open')) {
    closeMobileMenu();
  } else {
    openMobileMenu();
  }
}

function openMobileMenu() {
  mobileMenu.classList.add('open');
  if (mobileMenuOverlay) mobileMenuOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeMobileMenu() {
  mobileMenu.classList.remove('open');
  if (mobileMenuOverlay) mobileMenuOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

window.toggleMobileMenu = toggleMobileMenu;
window.openMobileMenu = openMobileMenu;
window.closeMobileMenu = closeMobileMenu;

async function filterProducts(category, containerId = 'productsGrid') {
  let products;
  if (category === 'all') {
    products = await db.getProducts();
  } else {
    products = await db.filterByCategory(category);
  }
  
  renderProducts(containerId, products);

  const filterButtons = document.querySelectorAll('.filter-btn[data-category]');
  filterButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.category === category);
  });
}

async function sortProducts(sortBy, containerId = 'productsGrid') {
  let products = await db.getProducts();
  
  switch(sortBy) {
    case 'price-asc':
      products.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      products.sort((a, b) => b.price - a.price);
      break;
    case 'name':
      products.sort((a, b) => a.name.localeCompare(b.name));
      break;
  }
  
  renderProducts(containerId, products);
}

function initNewsletterForm() {
  const form = document.getElementById('newsletterForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = form.querySelector('input[type="email"]').value;
      
      let subscribers = JSON.parse(localStorage.getItem('newsletter_subscribers') || '[]');
      if (!subscribers.includes(email)) {
        subscribers.push(email);
        localStorage.setItem('newsletter_subscribers', JSON.stringify(subscribers));
      }
      
      showNotification('Спасибо за подписку! Проверьте ваш email.');
      form.reset();
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', async () => {
    await initApp();
    initNewsletterForm();
  });
} else {
  initApp().then(initNewsletterForm).catch(console.error);
}

window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.filterProducts = filterProducts;
window.sortProducts = sortProducts;
window.handleImageError = handleImageError;
window.handleImageLoad = handleImageLoad;
