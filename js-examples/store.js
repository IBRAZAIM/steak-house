// ===================================
// STORE.JS - Application State Management
// ===================================

class Store {
  constructor() {
    this.state = {
      user: null,
      cart: [],
      products: [],
      orders: [],
      notifications: [],
      loading: false,
      errors: {},
      filters: {
        category: 'all',
        sort: 'name',
        search: ''
      }
    };

    this.listeners = [];
    this.middleware = [];
  }

  /**
   * Get current state
   */
  getState() {
    return { ...this.state };
  }

  /**
   * Get specific state value
   */
  getStateValue(path) {
    return path.split('.').reduce((obj, key) => obj?.[key], this.state);
  }

  /**
   * Update state
   */
  setState(updates) {
    const oldState = { ...this.state };
    this.state = { ...this.state, ...updates };
    
    // Notify listeners
    this.listeners.forEach(listener => listener(this.state, oldState));
  }

  /**
   * Update nested state
   */
  setNestedState(path, value) {
    const keys = path.split('.');
    const newState = JSON.parse(JSON.stringify(this.state));
    
    let obj = newState;
    for (let i = 0; i < keys.length - 1; i++) {
      obj = obj[keys[i]];
    }
    obj[keys[keys.length - 1]] = value;
    
    this.setState(newState);
  }

  /**
   * Subscribe to state changes
   */
  subscribe(listener) {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Add middleware
   */
  addMiddleware(middleware) {
    this.middleware.push(middleware);
  }

  /**
   * Dispatch action
   */
  async dispatch(action, payload) {
    // Run middleware
    for (const mw of this.middleware) {
      await mw({ getState: () => this.state, setState: (s) => this.setState(s) }, action, payload);
    }

    // Run action
    switch (action) {
      case 'SET_USER':
        this.setState({ user: payload });
        break;
      
      case 'ADD_TO_CART':
        this.addToCart(payload);
        break;
      
      case 'REMOVE_FROM_CART':
        this.removeFromCart(payload);
        break;
      
      case 'CLEAR_CART':
        this.setState({ cart: [] });
        break;
      
      case 'SET_PRODUCTS':
        this.setState({ products: payload });
        break;
      
      case 'SET_FILTERS':
        this.setState({ filters: payload });
        break;
      
      case 'SHOW_NOTIFICATION':
        this.showNotification(payload);
        break;
    }
  }

  /**
   * Cart operations
   */
  addToCart(product) {
    const item = this.state.cart.find(item => item.id === product.id);
    
    if (item) {
      item.quantity += 1;
    } else {
      this.state.cart.push({ ...product, quantity: 1 });
    }
    
    this.setState({ cart: [...this.state.cart] });
  }

  removeFromCart(productId) {
    this.setState({
      cart: this.state.cart.filter(item => item.id !== productId)
    });
  }

  getCartTotal() {
    return this.state.cart.reduce((total, item) => 
      total + (item.price * item.quantity), 0
    );
  }

  getCartCount() {
    return this.state.cart.reduce((count, item) => 
      count + item.quantity, 0
    );
  }

  /**
   * Notification system
   */
  showNotification(notification) {
    const id = Date.now();
    const notif = { id, ...notification };
    
    this.setState({
      notifications: [...this.state.notifications, notif]
    });

    // Auto remove after timeout
    setTimeout(() => {
      this.setState({
        notifications: this.state.notifications.filter(n => n.id !== id)
      });
    }, notification.duration || 3000);
  }

  /**
   * Filter products
   */
  filterProducts() {
    const { category, search, sort } = this.state.filters;
    let filtered = [...this.state.products];

    // Filter by category
    if (category !== 'all') {
      filtered = filtered.filter(p => p.category === category);
    }

    // Search
    if (search) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Sort
    if (sort === 'price-asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-desc') {
      filtered.sort((a, b) => b.price - a.price);
    }

    return filtered;
  }
}

// Create global store instance
const store = new Store();

export default store;
