// ===================================
// SERVICES/API.JS - API Layer
// ===================================

import CONFIG from '../config.js';

class APIService {
  constructor() {
    this.baseURL = CONFIG.API.BASE_URL;
    this.timeout = CONFIG.API.TIMEOUT;
  }

  /**
   * Make HTTP request
   */
  async request(method, endpoint, data = null) {
    const url = `${this.baseURL}${endpoint}`;
    
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new APIError(
          response.statusText,
          response.status,
          await response.json()
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof APIError) throw error;
      throw new APIError('Network error', 0, error.message);
    }
  }

  /**
   * GET request
   */
  get(endpoint) {
    return this.request('GET', endpoint);
  }

  /**
   * POST request
   */
  post(endpoint, data) {
    return this.request('POST', endpoint, data);
  }

  /**
   * PUT request
   */
  put(endpoint, data) {
    return this.request('PUT', endpoint, data);
  }

  /**
   * DELETE request
   */
  delete(endpoint) {
    return this.request('DELETE', endpoint);
  }

  /**
   * Get auth token
   */
  getAuthToken() {
    const user = localStorage.getItem(CONFIG.STORAGE.USER);
    return user ? JSON.parse(user).token : null;
  }

  // ===== PRODUCTS =====
  
  async getProducts(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.get(`${CONFIG.API.ENDPOINTS.PRODUCTS}?${params}`);
  }

  async getProductById(id) {
    return this.get(`${CONFIG.API.ENDPOINTS.PRODUCTS}/${id}`);
  }

  // ===== ORDERS =====

  async getOrders() {
    return this.get(CONFIG.API.ENDPOINTS.ORDERS);
  }

  async getOrder(id) {
    return this.get(`${CONFIG.API.ENDPOINTS.ORDERS}/${id}`);
  }

  async createOrder(orderData) {
    return this.post(CONFIG.API.ENDPOINTS.ORDERS, orderData);
  }

  async updateOrder(id, data) {
    return this.put(`${CONFIG.API.ENDPOINTS.ORDERS}/${id}`, data);
  }

  // ===== USERS =====

  async getUser(id) {
    return this.get(`${CONFIG.API.ENDPOINTS.USERS}/${id}`);
  }

  async updateUser(id, data) {
    return this.put(`${CONFIG.API.ENDPOINTS.USERS}/${id}`, data);
  }

  // ===== AUTH =====

  async login(email, password) {
    return this.post(`${CONFIG.API.ENDPOINTS.AUTH}/login`, { email, password });
  }

  async register(userData) {
    return this.post(`${CONFIG.API.ENDPOINTS.AUTH}/register`, userData);
  }

  async logout() {
    return this.post(`${CONFIG.API.ENDPOINTS.AUTH}/logout`);
  }
}

/**
 * Custom API Error
 */
class APIError extends Error {
  constructor(message, status, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

// Create singleton
const api = new APIService();

export default api;
export { APIError };
