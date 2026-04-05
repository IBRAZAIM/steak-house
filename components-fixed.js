// ===================================
 // PREMIUM STEAK HOUSE - COMPONENTS FIXED
 // ===================================

// HEADER COMPONENT
const headerComponent = (showAdminLink = false) => `
<header>
  <div class="container nav">
    <a href="index.html" class="logo">PREMIUM <span>STEAK HOUSE</span></a>
    <nav class="menu">
      <a href="catalog.html">Каталог</a>
      <a href="about.html">О нас</a>
      <a href="delivery.html">Доставка</a>
      <a href="contacts.html">Контакты</a>
      ${showAdminLink ? `
      <a href="admin-login.html" class="admin-link" title="Админ-панель">
        <i class="fas fa-cog"></i>
      </a>` : ''}
      <a href="account.html" class="cart-link" title="Личный кабинет">
        <i class="fas fa-user-circle"></i>
      </a>
      <a href="#" class="cart-link" id="cartBtn">
        <i class="fas fa-shopping-cart"></i>
        <span class="cart-count" id="cartCount">0</span>
      </a>
    </nav>
    <div class="mobile-controls">
      <a href="account.html" class="mobile-cart-btn" title="Личный кабинет">
        <i class="fas fa-user-circle"></i>
      </a>
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

// MOBILE MENU COMPONENT
const mobileMenuComponent = `
<div class="mobile-menu-overlay" id="mobileMenuOverlay"></div>
<div class="mobile-menu" id="mobileMenu">
  <div style="padding: 15px; display: flex; justify-content: flex-end;">
    <button id="closeMobileMenuBtn" style="background: none; border: none; font-size: 24px; cursor: pointer; color: inherit;">
      <i class="fas fa-times"></i>
    </button>
  </div>
  <a href="catalog.html">Каталог</a>
  <a href="about.html">О нас</a>
  <a href="delivery.html">Доставка</a>
  <a href="contacts.html">Контакты</a>
  <a href="account.html">Мой аккаунт</a>
  <div style="margin-top: auto; padding: 20px 30px; border-top: 1px solid rgba(255,255,255,0.1);">
    <div class="social-links" style="justify-content: flex-start; margin-bottom: 15px;">
      <a href="#"><i class="fab fa-instagram"></i></a>
      <a href="#"><i class="fab fa-telegram"></i></a>
      <a href="#"><i class="fab fa-whatsapp"></i></a>
    </div>
    <p style="color: var(--text-muted); font-size: 12px;">+7 (717) 273-00-67</p>
    <p style="color: var(--text-muted); font-size: 12px;">Астана, Казахстан</p>
  </div>
</div>
`;

// FOOTER COMPONENT (Kazakhstan version)
const footerComponent = `
<footer>
  <div class="container">
    <div class="footer-content">
      <div class="footer-section">
        <h4>PREMIUM STEAK HOUSE</h4>
        <p>Отборная мраморная говядина с доставкой по всему Казахстану. Астана - наша главная база.</p>
      </div>
      <div class="footer-section">
        <h4>Навигация</h4>
        <a href="catalog.html">Каталог</a>
        <a href="about.html">О нас</a>
        <a href="delivery.html">Доставка</a>
        <a href="contacts.html">Контакты</a>
      </div>
      <div class="footer-section">
        <h4>Контакты</h4>
        <p><i class="fas fa-phone"></i> <a href="tel:+77172730067">+7 (717) 273-00-67</a></p>
        <p><i class="fas fa-envelope"></i> <a href="mailto:info@steakhouse.kz">info@steakhouse.kz</a></p>
        <p><i class="fas fa-map-marker-alt"></i> Астана, Казахстан</p>
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

// CART MODAL
const cartModalComponent = `
<div class="cart-modal" id="cartModal">
  <div class="cart-overlay" id="cartOverlay"></div>
  <div class="cart-sidebar">
    <div class="cart-header">
      <h3>Корзина</h3>
      <button class="close-cart" id="closeCart"><i class="fas fa-times"></i></button>
    </div>
    <div class="cart-items" id="cartItems">
    </div>
    <div class="cart-footer">
      <div class="cart-total">
        <span>Итого:</span>
        <span id="cartTotal">0 ₸</span>
      </div>
      <button class="btn checkout-btn" id="checkoutBtn">Оформить заказ</button>
      <button class="btn-clear" id="clearCart">Очистить корзину</button>
    </div>
  </div>
</div>
`;

// NOTIFICATION
const notificationComponent = `
<div class="notification" id="notification">
  <i class="fas fa-check-circle"></i>
  <span id="notificationText">Товар добавлен в корзину</span>
</div>
`;

// LOAD COMPONENTS
function loadComponents(options = {}) {
  const { showAdminLink = false } = options;

  const headerContainer = document.getElementById('header-container');
  if (headerContainer) headerContainer.innerHTML = headerComponent(showAdminLink);

  const mobileMenuContainer = document.getElementById('mobile-menu-container');
  if (mobileMenuContainer) mobileMenuContainer.innerHTML = mobileMenuComponent;

  const footerContainer = document.getElementById('footer-container');
  if (footerContainer) footerContainer.innerHTML = footerComponent;

  const cartModalContainer = document.getElementById('cart-modal-container');
  if (cartModalContainer) cartModalContainer.innerHTML = cartModalComponent;

  const notificationContainer = document.getElementById('notification-container');
  if (notificationContainer) notificationContainer.innerHTML = notificationComponent;
}

window.loadComponents = loadComponents;

console.log('Components.js loaded successfully');

