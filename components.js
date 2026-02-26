// ===================================
// PREMIUM STEAK HOUSE - COMPONENTS
// Reusable HTML components
// ===================================

// ===================================
// HEADER COMPONENT
// ===================================

const headerComponent = (showAdminLink = false) => `
<header>
  <div class="container nav">
    <a href="index.html" class="logo">PREMIUM <span>STEAK HOUSE</span></a>
    <nav class="menu">
<a href="catalog.html">Каталог</a>
      <a href="steaks-guide.html">Гид по стейкам</a>
      <a href="delivery.html">Доставка</a>
      <a href="contacts.html">Контакты</a>
      ${showAdminLink ? `
      <a href="admin-login.html" class="admin-link" id="adminLink" title="Админ-панель">
        <i class="fas fa-cog"></i>
      </a>
      ` : ''}
      <a href="#" class="user-link" id="userBtn" title="Личный кабинет">
        <i class="fas fa-user"></i>
      </a>
      <a href="#" class="cart-link" id="cartBtn">
        <i class="fas fa-shopping-cart"></i>
        <span class="cart-count" id="cartCount">0</span>
      </a>
    </nav>
    
    <!-- Mobile Controls (Cart + Menu) -->
    <div class="mobile-controls">
      <a href="#" class="mobile-cart-btn" id="mobileCartBtn">
        <i class="fas fa-shopping-cart"></i>
        <span class="cart-count" id="mobileCartCount">0</span>
      </a>
      <div class="mobile-menu-btn" id="mobileMenuBtn">
        <i class="fas fa-bars"></i>
      </div>
    </div>
  </div>
</header>
`;

// ===================================
// MOBILE MENU COMPONENT
// ===================================

const mobileMenuComponent = `
<div class="mobile-menu-overlay" id="mobileMenuOverlay"></div>
<div class="mobile-menu" id="mobileMenu">
  <div class="mobile-menu-header" style="padding: 15px; display: flex; justify-content: flex-end;">
    <button id="closeMobileMenuBtn" style="background: none; border: none; font-size: 24px; cursor: pointer; color: inherit;">
      <i class="fas fa-times"></i>
    </button>
  </div>
  <a href="catalog.html">Каталог</a>
  <a href="steaks-guide.html">Гид по стейкам</a>
  <a href="about.html">О нас</a>
  <a href="delivery.html">Доставка</a>
  <a href="contacts.html">Контакты</a>
  
  <div class="mobile-menu-footer" style="margin-top: auto; padding: 20px 30px; border-top: 1px solid rgba(255,255,255,0.1);">
    <div class="social-links" style="justify-content: flex-start; margin-bottom: 15px;">
      <a href="#"><i class="fab fa-instagram"></i></a>
      <a href="#"><i class="fab fa-telegram"></i></a>
      <a href="#"><i class="fab fa-whatsapp"></i></a>
    </div>
    <p style="color: var(--text-muted); font-size: 12px;">+7 (999) 123-45-67</p>
    <p style="color: var(--text-muted); font-size: 12px;">Москва, ул. Примерная 1</p>
  </div>
</div>
`;

// ===================================
// FOOTER COMPONENT
// ===================================

const footerComponent = `
<footer>
  <div class="container">
    <div class="footer-content">
      <div class="footer-section">
        <h4>PREMIUM STEAK HOUSE</h4>
        <p>Отборная мраморная говядина с доставкой по всей России.</p>
      </div>
      <div class="footer-section">
        <h4>Навигация</h4>
        <a href="catalog.html">Каталог</a>
        <a href="delivery.html">Доставка</a>
        <a href="contacts.html">Контакты</a>
      </div>
      <div class="footer-section">
        <h4>Контакты</h4>
        <p><i class="fas fa-phone"></i> +7 (999) 123-45-67</p>
        <p><i class="fas fa-envelope"></i> info@steakhouse.ru</p>
        <p><i class="fas fa-map-marker-alt"></i> Москва, ул. Примерная 1</p>
      </div>
      <div class="footer-section">
        <h4>Соцсети</h4>
        <div class="social-links">
          <a href="#"><i class="fab fa-instagram"></i></a>
          <a href="#"><i class="fab fa-telegram"></i></a>
          <a href="#"><i class="fab fa-whatsapp"></i></a>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <p>© 2026 PREMIUM STEAK HOUSE. Все права защищены.</p>
    </div>
  </div>
</footer>
`;

// ===================================
// CART MODAL COMPONENT
// ===================================

const cartModalComponent = `
<!-- Cart Modal -->
<div class="cart-modal" id="cartModal">
  <div class="cart-overlay" id="cartOverlay"></div>
  <div class="cart-sidebar">
    <div class="cart-header">
      <h3>Корзина</h3>
      <button class="close-cart" id="closeCart"><i class="fas fa-times"></i></button>
    </div>
    <div class="cart-items" id="cartItems">
      <!-- Cart items loaded from database -->
    </div>
    <div class="cart-footer">
      <div class="cart-total">
<span>Итого:</span>
        <span id="cartTotal">0 тг</span>
      </div>
      <button class="btn checkout-btn" id="checkoutBtn">Оформить заказ</button>
      <button class="btn-clear" id="clearCart">Очистить корзину</button>
    </div>
  </div>
</div>
`;

// ===================================
// NOTIFICATION COMPONENT
// ===================================

const notificationComponent = `
<!-- Notification -->
<div class="notification" id="notification">
  <i class="fas fa-check-circle"></i>
  <span id="notificationText">Товар добавлен в корзину</span>
</div>
`;

// ===================================
// LOAD COMPONENTS FUNCTION
// ===================================

/**
 * Load all components into the page
 * @param {Object} options - Configuration options
 * @param {boolean} options.showAdminLink - Whether to show admin link in header
 */
function loadComponents(options = {}) {
  const {
    showAdminLink = false
  } = options;

  // Load header
  const headerContainer = document.getElementById('header-container');
  if (headerContainer) {
    headerContainer.innerHTML = headerComponent(showAdminLink);
  }

  // Load mobile menu
  const mobileMenuContainer = document.getElementById('mobile-menu-container');
  if (mobileMenuContainer) {
    mobileMenuContainer.innerHTML = mobileMenuComponent;
  }

  // Load footer
  const footerContainer = document.getElementById('footer-container');
  if (footerContainer) {
    footerContainer.innerHTML = footerComponent;
  }

  // Load cart modal
  const cartModalContainer = document.getElementById('cart-modal-container');
  if (cartModalContainer) {
    cartModalContainer.innerHTML = cartModalComponent;
  }

  // Load notification
  const notificationContainer = document.getElementById('notification-container');
  if (notificationContainer) {
    notificationContainer.innerHTML = notificationComponent;
  }
}

// ===================================
// INIT COMPONENT LISTENERS
// ===================================

function initComponentListeners() {
  // Listeners are handled in app.js to avoid duplication
  // This function is kept empty to prevent errors if called
}

// Export for global use
window.loadComponents = loadComponents;
