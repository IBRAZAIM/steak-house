// ===================================
// PREMIUM STEAK HOUSE - APP.JS
// Database simulation using localStorage
// ===================================

// ===================================
// DATABASE CONFIGURATION
// ===================================

const DB_NAME = 'SteakHouseDB';
const PRODUCTS_KEY = 'products';
const CART_KEY = 'cart';
const ORDERS_KEY = 'orders';

// ===================================
// INITIAL DATABASE SEED
// ===================================

const defaultProducts = [

  {
    id: 1,
    name: 'Ribeye Prime',
    description: 'Мраморная говядина высшей категории. Максимальная мраморность и насыщенный вкус.',
    price: 4900,
    image: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400&h=300&fit=crop',
    category: 'ribeye',
    badge: 'Хит',
    weight: '350 г'
  },
  {
    id: 2,
    name: 'Striploin Premium',
    description: 'Идеальный баланс сочности и текстуры. Классический стейк.',
    price: 4300,
    image: 'https://images.unsplash.com/photo-1558030006-450675393462?w=400&h=300&fit=crop',
    category: 'striploin',
    badge: null,
    weight: '300 г'
  },
  {
    id: 3,
    name: 'T-Bone Classic',
    description: 'Два вкуса в одном легендарном стейке. Филейная часть и стейк.',
    price: 5600,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop',
    category: 'tbone',
    badge: 'Премиум',
    weight: '450 г'
  },
  {
    id: 4,
    name: 'Filet Mignon',
    description: 'Нежнейшая вырезка. Самая мягкая часть говядины.',
    price: 6200,
    image: 'https://images.unsplash.com/photo-1551248429-40975aa4de74?w=400&h=300&fit=crop',
    category: 'filet',
    badge: 'Эксклюзив',
    weight: '280 г'
  },
  {
    id: 5,
    name: 'Tomahawk',
    description: 'Впечатляющий стейк на кости. Для настоящих ценителей.',
    price: 7800,
    image: 'https://images.unsplash.com/photo-1615937657715-bc7b4b7962c1?w=400&h=300&fit=crop',
    category: 'tomahawk',
    badge: 'Хит',
    weight: '800 г'
  },
  {
    id: 6,
    name: 'Porterhouse',
    description: 'Большая версия T-Bone. Максимум вкуса.',
    price: 6400,
    image: 'https://images.unsplash.com/photo-1606850780554-b55ea4dd0b70?w=400&h=300&fit=crop',
    category: 'porterhouse',
    badge: null,
    weight: '600 г'
  },
  {
    id: 7,
    name: 'Ribeye Dry Aged 45 дней',
    description: 'Говядина выдержанная 45 дней. Интенсивный вкус.',
    price: 8900,
    image: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=400&h=300&fit=crop',
    category: 'ribeye',
    badge: 'Dry Aged',
    weight: '350 г'
  },
  {
    id: 8,
    name: 'Chateaubriand',
    description: 'Центральная часть вырезки. Блюдо для особых случаев.',
    price: 9500,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop',
    category: 'filet',
    badge: 'Премиум',
    weight: '400 г'
  }
];

// ===================================
// DATABASE FUNCTIONS
// ===================================

class Database {
  constructor() {
    this.init();
  }

  // Initialize database
  init() {
    // Initialize products if not exists
    if (!localStorage.getItem(PRODUCTS_KEY)) {
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(defaultProducts));
    }

    // Initialize cart if not exists
    if (!localStorage.getItem(CART_KEY)) {
      localStorage.setItem(CART_KEY, JSON.stringify([]));
    }

    // Initialize orders if not exists
    if (!localStorage.getItem(ORDERS_KEY)) {
      localStorage.setItem(ORDERS_KEY, JSON.stringify([]));
    }
  }

  // Get all products
  getProducts() {
    return JSON.parse(localStorage.getItem(PRODUCTS_KEY));
  }

  // Get product by ID
  getProductById(id) {
    const products = this.getProducts();
    return products.find(p => p.id === id);
  }

  // Get products by category
  getProductsByCategory(category) {
    const products = this.getProducts();
    return products.filter(p => p.category === category);
  }

  // Add new product (admin function)
  addProduct(product) {
    const products = this.getProducts();
    const maxId = products.reduce((max, p) => p.id > max ? p.id : max, 0);
    const newProduct = {
      ...product,
      id: maxId + 1
    };
    products.push(newProduct);
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
    return newProduct;
  }

  // Update product (admin function)
  updateProduct(id, productData) {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === id);
    
    if (index === -1) return null;
    
    products[index] = { ...products[index], ...productData, id };
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
    return products[index];
  }

  // Delete product (admin function)
  deleteProduct(id) {
    const products = this.getProducts();
    const filteredProducts = products.filter(p => p.id !== id);
    
    if (filteredProducts.length === products.length) return false;
    
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(filteredProducts));
    return true;
  }

  // Get order by ID
  getOrderById(id) {
    const orders = this.getOrders();
    return orders.find(o => o.id === id);
  }

  // Update order status (admin function)
  updateOrderStatus(id, status) {
    const orders = this.getOrders();
    const index = orders.findIndex(o => o.id === id);
    
    if (index === -1) return null;
    
    orders[index].status = status;
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    return orders[index];
  }

  // Delete order (admin function)
  deleteOrder(id) {
    const orders = this.getOrders();
    const filteredOrders = orders.filter(o => o.id !== id);
    
    if (filteredOrders.length === orders.length) return false;
    
    localStorage.setItem(ORDERS_KEY, JSON.stringify(filteredOrders));
    return true;
  }

  // Get cart
  getCart() {
    return JSON.parse(localStorage.getItem(CART_KEY));
  }

  // Add to cart
  addToCart(productId) {
    const cart = this.getCart();
    const product = this.getProductById(productId);
    
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

  // Remove from cart
  removeFromCart(productId) {
    let cart = this.getCart();
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    return cart;
  }

  // Update cart item quantity
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

  // Clear cart
  clearCart() {
    localStorage.setItem(CART_KEY, JSON.stringify([]));
    return [];
  }

  // Get cart total
  getCartTotal() {
    const cart = this.getCart();
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  // Get cart count
  getCartCount() {
    const cart = this.getCart();
    return cart.reduce((count, item) => count + item.quantity, 0);
  }

  // Create order
  createOrder(orderData) {
    const cart = this.getCart();
    if (cart.length === 0) return null;

    const orders = JSON.parse(localStorage.getItem(ORDERS_KEY));
    
    const order = {
      id: orders.length + 1,
      items: [...cart],
      total: this.getCartTotal(),
      status: 'Новый',
      date: new Date().toISOString(),
      customer: orderData
    };

    orders.push(order);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    
    // Clear cart after order
    this.clearCart();
    
    return order;
  }

  // Get orders
  getOrders() {
    return JSON.parse(localStorage.getItem(ORDERS_KEY));
  }

  // Reset database (for testing)
  resetDatabase() {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(defaultProducts));
    localStorage.setItem(CART_KEY, JSON.stringify([]));
    localStorage.setItem(ORDERS_KEY, JSON.stringify([]));
  }
}

// ===================================
// UI FUNCTIONS
// ===================================

const db = new Database();

// DOM Elements (will be initialized in initApp after components are loaded)
let cartModal, cartOverlay, closeCartBtn, cartBtn, cartCount, cartItems;
let cartTotal, clearCartBtn, checkoutBtn, notification, notificationText;
let mobileMenuBtn, mobileMenu;

// Initialize DOM elements
function initDOMElements() {
  cartModal = document.getElementById('cartModal');
  cartOverlay = document.getElementById('cartOverlay');
  closeCartBtn = document.getElementById('closeCart');
  cartBtn = document.getElementById('cartBtn');
  cartCount = document.getElementById('cartCount');
  cartItems = document.getElementById('cartItems');
  cartTotal = document.getElementById('cartTotal');
  clearCartBtn = document.getElementById('clearCart');
  checkoutBtn = document.getElementById('checkoutBtn');
  notification = document.getElementById('notification');
  notificationText = document.getElementById('notificationText');
  mobileMenuBtn = document.getElementById('mobileMenuBtn');
  mobileMenu = document.getElementById('mobileMenu');
}

// Initialize app
function initApp() {
  // Load components first (for pages that use dynamic components like index.html)
  // This ensures all required DOM elements exist before we try to access them
  if (typeof loadComponents === 'function') {
    // Check if we're on a page with container elements (index.html uses components)
    const headerContainer = document.getElementById('header-container');
    if (headerContainer) {
      loadComponents({ showAdminLink: true });
    }
  }
  
  // Initialize DOM elements first
  initDOMElements();
  
  updateCartCount();
  renderProducts();
  
  // Event listeners
  if (cartBtn) cartBtn.addEventListener('click', openCart);
  if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);
  if (clearCartBtn) clearCartBtn.addEventListener('click', clearCart);
  if (checkoutBtn) checkoutBtn.addEventListener('click', checkout);
  if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', toggleMobileMenu);
  
  // Header scroll effect
  window.addEventListener('scroll', headerScroll);
}

// Export initApp for use in components.js
window.initApp = initApp;

// Render products
function renderProducts(containerId = 'productsGrid', products = null) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const productsToRender = products || db.getProducts();
  
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
<span class="price">${product.price.toLocaleString()} ₽</span>
          <button class="btn-add" onclick="addToCart(${product.id})">В корзину</button>
        </div>
      </div>
    </div>
  `).join('');
}

// Handle image load success
function handleImageLoad(img) {
  img.classList.add('loaded');
  const placeholder = img.parentElement.querySelector('.image-placeholder');
  if (placeholder) {
    placeholder.classList.add('hidden');
  }
  const errorDiv = img.parentElement.querySelector('.image-error');
  if (errorDiv) {
    errorDiv.style.display = 'none';
  }
}

// Handle image load error
function handleImageError(img) {
  img.classList.add('error');
  img.style.display = 'none';
  const placeholder = img.parentElement.querySelector('.image-placeholder');
  if (placeholder) {
    placeholder.classList.add('hidden');
  }
  const errorDiv = img.parentElement.querySelector('.image-error');
  if (errorDiv) {
    errorDiv.style.display = 'flex';
  }
}

// Add to cart
function addToCart(productId) {
  db.addToCart(productId);
  updateCartCount();
  showNotification('Товар добавлен в корзину');
}

// Update cart count
function updateCartCount() {
  const count = db.getCartCount();
  if (cartCount) {
    cartCount.textContent = count;
    cartCount.style.display = count > 0 ? 'flex' : 'none';
  }
}

// Open cart
function openCart(e) {
  e.preventDefault();
  renderCartItems();
  cartModal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

// Close cart
function closeCart() {
  cartModal.classList.remove('open');
  document.body.style.overflow = '';
}

// Render cart items
function renderCartItems() {
  const cart = db.getCart();
  
  if (cart.length === 0) {
    cartItems.innerHTML = `
      <div class="cart-empty">
        <i class="fas fa-shopping-basket"></i>
        <p>Корзина пуста</p>
      </div>
    `;
cartTotal.textContent = '0 ₽';
    if (checkoutBtn) checkoutBtn.disabled = true;
    return;
  }

  if (checkoutBtn) checkoutBtn.disabled = false;

  cartItems.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
<div class="cart-item-price">${item.price.toLocaleString()} ₽ × ${item.quantity}</div>
      </div>
      <button class="cart-item-remove" onclick="removeFromCart(${item.id})">
        <i class="fas fa-trash"></i>
      </button>
    </div>
  `).join('');

cartTotal.textContent = db.getCartTotal().toLocaleString() + ' ₽';
}

// Remove from cart
function removeFromCart(productId) {
  db.removeFromCart(productId);
  updateCartCount();
  renderCartItems();
}

// Clear cart
function clearCart() {
  db.clearCart();
  updateCartCount();
  renderCartItems();
  showNotification('Корзина очищена');
}

// Checkout
function checkout() {
  const cart = db.getCart();
  
  if (cart.length === 0) {
    showNotification('Корзина пуста');
    return;
  }

  // Simple checkout - create order and show success
  const order = db.createOrder({
    name: 'Клиент',
    phone: '',
    address: ''
  });

  if (order) {
    updateCartCount();
    renderCartItems();
    closeCart();
    showNotification('Заказ успешно оформлен!');
  }
}

// Show notification
function showNotification(message) {
  notificationText.textContent = message;
  notification.classList.add('show');
  
  setTimeout(() => {
    notification.classList.remove('show');
  }, 3000);
}

// Header scroll effect
function headerScroll() {
  const header = document.querySelector('header');
  if (window.scrollY > 50) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
}

// Mobile menu toggle
function toggleMobileMenu() {
  mobileMenu.classList.toggle('open');
}

// Filter products
function filterProducts(category, containerId = 'productsGrid') {
  let products;
  
  if (category === 'all') {
    products = db.getProducts();
  } else {
    products = db.getProductsByCategory(category);
  }
  
  renderProducts(containerId, products);
}

// Sort products
function sortProducts(sortBy, containerId = 'productsGrid') {
  let products = db.getProducts();
  
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

// ===================================
// INITIALIZE ON DOM READY
// ===================================

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

// Export functions for global use
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.filterProducts = filterProducts;
window.sortProducts = sortProducts;
window.handleImageError = handleImageError;
window.handleImageLoad = handleImageLoad;
