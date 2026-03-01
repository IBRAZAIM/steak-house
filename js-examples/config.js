// ===================================
// CONFIG.JS - Centralized Configuration
// ===================================

const CONFIG = {
  // API Configuration
  API: {
    BASE_URL: process.env.API_URL || 'http://localhost:3000/api',
    TIMEOUT: 10000,
    ENDPOINTS: {
      PRODUCTS: '/products',
      ORDERS: '/orders',
      USERS: '/users',
      AUTH: '/auth',
      CART: '/cart'
    }
  },

  // App Settings
  APP: {
    NAME: 'PREMIUM STEAK HOUSE',
    VERSION: '1.0.0',
    CURRENCY: '₽',
    CURRENCY_CODE: 'RUB'
  },

  // Storage Keys
  STORAGE: {
    CART: 'cart',
    USER: 'current_user',
    THEME: 'theme',
    LANGUAGE: 'language'
  },

  // Categories
  CATEGORIES: {
    RIBEYE: 'ribeye',
    STRIPLOIN: 'striploin',
    TBONE: 'tbone',
    FILET: 'filet',
    TOMAHAWK: 'tomahawk',
    PORTERHOUSE: 'porterhouse'
  },

  // Order Statuses
  ORDER_STATUS: {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    SHIPPED: 'shipped',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled'
  },

  // Pagination
  PAGINATION: {
    DEFAULT_LIMIT: 12,
    DEFAULT_PAGE: 1
  },

  // Validation Rules
  VALIDATION: {
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE_REGEX: /^\+?7\d{10}$/,
    PASSWORD_MIN_LENGTH: 6
  },

  // Notifications
  NOTIFICATIONS: {
    DURATION: 3000,
    TYPES: {
      SUCCESS: 'success',
      ERROR: 'error',
      WARNING: 'warning',
      INFO: 'info'
    }
  },

  // Features
  FEATURES: {
    ENABLE_CHECKOUT: true,
    ENABLE_LOYALTY_PROGRAM: true,
    ENABLE_REVIEWS: true,
    ENABLE_NEWSLETTER: true
  }
};

export default CONFIG;
