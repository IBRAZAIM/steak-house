// ===================================
// MODULES/HEADER/HEADER.JS - Component Module
// ===================================

import store from '../../store.js';
import { createElement } from '../../utils/helpers.js';

class HeaderComponent {
  constructor() {
    this.element = null;
    this.template = this.getTemplate();
    this.init();
  }

  /**
   * Initialize component
   */
  init() {
    this.mount();
    this.bindEvents();
    this.subscribe();
  }

  /**
   * Mount to DOM
   */
  mount(container = document.querySelector('header') || document.body) {
    this.element = createElement('div', 'header', this.template);
    container.appendChild(this.element);
  }

  /**
   * Get HTML template
   */
  getTemplate() {
    const state = store.getState();
    const cartCount = store.getCartCount();
    const isLoggedIn = !!state.user;

    return `
      <div class="container nav">
        <a href="#/" class="logo">PREMIUM <span>STEAK HOUSE</span></a>
        
        <nav class="menu">
          <a href="#/catalog">Каталог</a>
          <a href="#/about">О нас</a>
          <a href="#/delivery">Доставка</a>
          <a href="#/contacts">Контакты</a>
        </nav>

        <div class="header-controls">
          ${isLoggedIn ? `
            <div class="user-menu">
              <span class="user-name">${state.user.name}</span>
              <button class="btn-icon" data-action="profile" title="Профиль">
                <i class="fas fa-user-circle"></i>
              </button>
            </div>
          ` : `
            <button class="btn-text" data-action="login">Вход</button>
          `}

          <button class="btn-icon cart-btn" data-action="toggle-cart">
            <i class="fas fa-shopping-cart"></i>
            ${cartCount > 0 ? `<span class="cart-count">${cartCount}</span>` : ''}
          </button>

          <button class="btn-icon mobile-menu" data-action="toggle-menu">
            <i class="fas fa-bars"></i>
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    if (!this.element) return;

    // Cart button
    this.element.querySelector('[data-action="toggle-cart"]')
      ?.addEventListener('click', () => this.emit('openCart'));

    // Mobile menu
    this.element.querySelector('[data-action="toggle-menu"]')
      ?.addEventListener('click', () => this.emit('toggleMenu'));

    // Profile button
    this.element.querySelector('[data-action="profile"]')
      ?.addEventListener('click', () => this.navigateTo('/account'));

    // Login button
    this.element.querySelector('[data-action="login"]')
      ?.addEventListener('click', () => this.emit('showLoginModal'));
  }

  /**
   * Subscribe to state changes
   */
  subscribe() {
    store.subscribe((newState, oldState) => {
      // Re-render if user or cart changed
      if (newState.user !== oldState.user || 
          newState.cart.length !== oldState.cart.length) {
        this.update();
      }
    });
  }

  /**
   * Update component
   */
  update() {
    if (!this.element) return;
    
    const newTemplate = this.getTemplate();
    const newElement = createElement('div', 'header', newTemplate);
    
    this.element.replaceWith(newElement);
    this.element = newElement;
    this.bindEvents();
  }

  /**
   * Emit custom event
   */
  emit(eventName, detail = null) {
    const event = new CustomEvent(eventName, { detail });
    this.element?.dispatchEvent(event);
  }

  /**
   * Navigation helper
   */
  navigateTo(path) {
    window.location.hash = path;
  }
}

export default HeaderComponent;
