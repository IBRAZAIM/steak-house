// ===================================
// UTILS/HELPERS.JS - Utility Functions
// ===================================

/**
 * Create DOM element from HTML string
 */
export function createElement(tag, className, innerHTML = '') {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (innerHTML) element.innerHTML = innerHTML;
  return element;
}

/**
 * Format price
 */
export function formatPrice(price, currency = '₽') {
  return `${price.toLocaleString('ru-RU')} ${currency}`;
}

/**
 * Format date
 */
export function formatDate(date, locale = 'ru-RU') {
  return new Date(date).toLocaleDateString(locale);
}

/**
 * Debounce function
 */
export function debounce(func, delay) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Throttle function
 */
export function throttle(func, delay) {
  let lastCall = 0;
  return (...args) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      func(...args);
      lastCall = now;
    }
  };
}

/**
 * Deep clone object
 */
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Get query parameter
 */
export function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

/**
 * Remove falsy values from object
 */
export function cleanObject(obj) {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v != null)
  );
}

/**
 * Convert object to query string
 */
export function objectToQuery(obj) {
  return Object.entries(obj)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');
}

/**
 * Parse JSON safely
 */
export function parseJSON(json, fallback = null) {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

/**
 * Storage helper
 */
export const storage = {
  set: (key, value) => localStorage.setItem(key, JSON.stringify(value)),
  get: (key) => parseJSON(localStorage.getItem(key)),
  remove: (key) => localStorage.removeItem(key),
  clear: () => localStorage.clear()
};

/**
 * Event delegation
 */
export function delegate(parent, selector, eventType, handler) {
  parent.addEventListener(eventType, (event) => {
    const target = event.target.closest(selector);
    if (target) {
      handler.call(target, event);
    }
  });
}

/**
 * Retry async function
 */
export async function retry(fn, maxAttempts = 3, delay = 1000) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxAttempts - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
