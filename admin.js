// ===================================
// PREMIUM STEAK HOUSE - ADMIN.JS
// Extracted from admin.html + Bug Fixes
// ===================================

// Global DB instance (from app.js)
let db;

// Init function - call from admin.html
async function initAdmin() {
  if (typeof window.db === 'undefined') {
    console.error('Database not loaded. Ensure app.js loads first.');
    return false;
  }
  db = window.db;
  
  if (!checkAdminAuth()) return false;
  
  // Set username
  const username = localStorage.getItem('adminUsername') || 'admin';
  document.getElementById('adminUsername').textContent = username;
  
  // Load all data
  await Promise.all([
    loadDashboardStats(),
    loadAdminProducts(),
    loadAdminOrders()
  ]);
  
  // Setup listeners
  setupEventListeners();
  return true;
}

// Auth check
function checkAdminAuth() {
  if (localStorage.getItem('adminLoggedIn') !== 'true') {
    window.location.href = 'admin-login.html';
    return false;
  }
  return true;
}

// Event listeners setup
function setupEventListeners() {
  // Logout
  document.getElementById('logoutBtn')?.addEventListener('click', logout);
  
  // Sidebar tabs
  document.querySelectorAll('.admin-sidebar-menu a[data-tab]')?.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      switchTab(link.dataset.tab);
    });
  });
  
  // Add product
  document.getElementById('addProductBtn')?.addEventListener('click', () => openProductModal());
  
  // Product modal
  document.getElementById('closeProductModal')?.addEventListener('click', closeProductModal);
  document.getElementById('cancelProductBtn')?.addEventListener('click', closeProductModal);
  document.getElementById('productForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    saveProduct();
  });
  
  // Order modal
  document.getElementById('closeOrderModal')?.addEventListener('click', closeOrderModal);
  document.getElementById('updateOrderStatusBtn')?.addEventListener('click', updateOrderStatus);
  document.getElementById('deleteOrderBtn')?.addEventListener('click', deleteCurrentOrder);
  
  // Search/filters
  document.getElementById('productSearch')?.addEventListener('input', debounce(filterProducts, 300));
  document.getElementById('categoryFilter')?.addEventListener('change', filterProducts);
  document.getElementById('orderSearch')?.addEventListener('input', debounce(filterOrders, 300));
  document.getElementById('statusFilter')?.addEventListener('change', filterOrders);
  
  // Modal backdrop close
  document.getElementById('productModal')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeProductModal();
  });
  document.getElementById('orderModal')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeOrderModal();
  });
}

// Logout
function logout() {
  localStorage.removeItem('adminLoggedIn');
  localStorage.removeItem('adminUsername');
  window.location.href = 'admin-login.html';
}

// Tab switching
function switchTab(tabName) {
  // Update active link
  document.querySelectorAll('.admin-sidebar-menu a').forEach(link => link.classList.remove('active'));
  document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');
  
  // Switch content
  document.querySelectorAll('.admin-tab-content').forEach(content => {
    content.style.display = 'none';
  });
  document.getElementById(tabName + '-tab')?.style.display = 'block';
}

// Dashboard stats
async function loadDashboardStats() {
  try {
    const products = await db.getAdminProducts();
    const orders = await db.getAdminOrders();
    
    document.getElementById('totalProducts').textContent = products.length;
    if (document.getElementById('totalOrders')) document.getElementById('totalOrders').textContent = orders.length;
    if (document.getElementById('totalRevenue')) document.getElementById('totalRevenue').textContent = orders.reduce((sum, o) => sum + (o.total || 0), 0).toLocaleString() + ' ₸';
    document.getElementById('pendingOrders').textContent = orders.filter(o => o.status === 'Новый').length;
    
    loadRecentOrders(orders.slice(0, 5));
  } catch (error) {
    console.error('Dashboard error:', error);
    showNotification('Ошибка загрузки статистики', true);
  }
}

function loadRecentOrders(orders) {
  const tbody = document.getElementById('recentOrdersBody');
  if (!tbody || orders.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="empty-state">Нет заказов</td></tr>';
    return;
  }
  
  tbody.innerHTML = orders.map(order => `
    <tr>
      <td>#${order.id}</td>
      <td>${formatDate(order.createdAt)}</td>
      <td><span class="status-badge status-${getStatusClass(order.status)}">${order.status}</span></td>
      <td>${(order.total || 0).toLocaleString()} ₸</td>
      <td><button class="btn-table-action btn-view" onclick="viewOrder(${order.id})"><i class="fas fa-eye"></i></button></td>
    </tr>
  `).join('');
}

// Products management
async function loadAdminProducts() {
  showLoading('productsTableBody');
  try {
    const products = await db.getAdminProducts();
    renderAdminProducts(products);
  } catch (error) {
    console.error('Products load error:', error);
    showNotification('Ошибка загрузки товаров', true);
  } finally {
    hideLoading('productsTableBody');
  }
}

function renderAdminProducts(products) {
  const tbody = document.getElementById('productsTableBody');
  if (!tbody) return;
  
  if (products.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="empty-state">Нет товаров</td></tr>';
    return;
  }
  
  tbody.innerHTML = products.map(p => `
    <tr>
      <td>#${p.id}</td>
      <td><img src="${p.image}" alt="${p.name}" class="table-img" onerror="this.src='https://via.placeholder.com/60?text=🥩'"></td>
      <td>${p.name}</td>
      <td>${getCategoryName(p.category)}</td>
      <td>${(p.price || 0).toLocaleString()} ₸</td>
      <td>${p.weight || '-'}</td>
      <td>${p.badge || '-'}</td>
      <td>
        <button class="btn-table-action btn-edit" onclick="editAdminProduct(${p.id})" title="Редактировать">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn-table-action btn-delete" onclick="deleteAdminProduct(${p.id})" title="Удалить">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

// Product CRUD globals (window scope for onclick)
window.editAdminProduct = async function(id) {
  try {
    const products = await db.getAdminProducts();
    const product = products.find(p => p.id === id);
    if (product) openProductModal(product);
  } catch (e) {
    showNotification('Ошибка загрузки товара', true);
  }
};

window.deleteAdminProduct = async function(id) {
  if (confirm('Удалить товар?')) {
    try {
      await db.deleteProduct(id);
      showNotification('Товар удален');
      loadAdminProducts();
      loadDashboardStats();
    } catch (e) {
      showNotification('Ошибка удаления', true);
    }
  }
};

let editingProductId = null;
function openProductModal(product = null) {
  const modal = document.getElementById('productModal');
  const form = document.getElementById('productForm');
  const title = document.getElementById('productModalTitle');
  
  editingProductId = product?.id || null;
  title.innerHTML = product ? '<i class="fas fa-edit"></i> Редактировать' : '<i class="fas fa-plus"></i> Добавить';
  
  if (product) {
    document.getElementById('productId').value = product.id;
    document.getElementById('productName').value = product.name;
    document.getElementById('productDescription').value = product.description;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productImage').value = product.image;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productWeight').value = product.weight;
    document.getElementById('productBadge').value = product.badge || '';
  } else {
    form.reset();
    document.getElementById('productId').value = '';
  }
  
  modal.classList.add('open');
}

function closeProductModal() {
  document.getElementById('productModal').classList.remove('open');
  editingProductId = null;
}

async function saveProduct() {
  const name = document.getElementById('productName').value.trim();
  const price = parseInt(document.getElementById('productPrice').value);
  const weight = document.getElementById('productWeight').value.trim();
  const image = document.getElementById('productImage').value.trim();

  if (!name || !price || !weight || !image) {
    showNotification('Пожалуйста, заполните обязательные поля (Имя, Цена, Вес, Фото)', true);
    return;
  }

  const productData = {
    name,
    description: document.getElementById('productDescription').value.trim() || 'Нет описания',
    price,
    image,
    category: document.getElementById('productCategory').value,
    weight,
    badge: document.getElementById('productBadge').value.trim() || null
  };
  
  try {
    if (editingProductId) {
      const success = await db.updateProduct(editingProductId, productData);
      if (!success) throw new Error('Update failed');
      showNotification('Товар обновлен');
    } else {
      await db.addProduct(productData);
      showNotification('Товар добавлен');
    }
    closeProductModal();
    loadAdminProducts();
    loadDashboardStats();
  } catch (e) {
    showNotification('Ошибка сохранения', true);
  }
}

// Orders management
async function loadAdminOrders() {
  showLoading('ordersTableBody');
  try {
    const orders = await db.getAdminOrders();
    renderAdminOrders(orders);
  } catch (error) {
    console.error('Orders load error:', error);
  } finally {
    hideLoading('ordersTableBody');
  }
}

function renderAdminOrders(orders) {
  const tbody = document.getElementById('ordersTableBody');
  if (!tbody) return;
  
  tbody.dataset.allOrders = JSON.stringify(orders);
  
  if (orders.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="empty-state">Нет заказов</td></tr>';
    return;
  }
  
  orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  tbody.innerHTML = orders.map(o => `
    <tr>
      <td>#${o.id}</td>
      <td>${formatDate(o.createdAt)}</td>
      <td>${o.items?.length || 0}</td>
      <td>${(o.total || 0).toLocaleString()} ₸</td>
      <td><span class="status-badge ${getStatusClass(o.status)}">${o.status}</span></td>
      <td>
        <button class="btn-table-action btn-view" onclick="viewOrder(${o.id})"><i class="fas fa-eye"></i></button>
        <button class="btn-table-action btn-delete" onclick="deleteOrder(${o.id})"><i class="fas fa-trash"></i></button>
      </td>
    </tr>
  `).join('');
}

let currentOrderId = null;
window.viewOrder = async function(id) {
  try {
    const order = await db.getAdminOrderById(id);
    if (!order) return showNotification('Заказ не найден', true);
    
    currentOrderId = id;
    document.getElementById('orderDetailId').textContent = order.id;
    document.getElementById('orderDetailDate').textContent = formatDate(order.createdAt);
    document.getElementById('orderStatusSelect').value = order.status;
    document.getElementById('orderDetailTotal').textContent = (order.total || 0).toLocaleString() + ' ₸';
    
    document.getElementById('orderItems').innerHTML = (order.items || []).map(item => `
      <div class="order-item">
        <span>${item.name} × ${item.quantity}</span>
        <span>${(item.price || 0).toLocaleString()} ₸</span>
      </div>
    `).join('');
    
    document.getElementById('orderModal').classList.add('open');
  } catch (e) {
    showNotification('Ошибка загрузки заказа', true);
  }
};

function closeOrderModal() {
  document.getElementById('orderModal').classList.remove('open');
  currentOrderId = null;
}

async function updateOrderStatus() {
  if (!currentOrderId) return;
  
  const status = document.getElementById('orderStatusSelect').value;
  try {
    await db.updateAdminOrderStatus(currentOrderId, status);
    showNotification('Статус обновлен');
    closeOrderModal();
    loadAdminOrders();
    loadDashboardStats();
  } catch (e) {
    showNotification('Ошибка обновления', true);
  }
}

window.deleteOrder = async function(id) {
  if (confirm('Удалить заказ?')) {
    try {
      await db.deleteAdminOrder(id);
      showNotification('Заказ удален');
      loadAdminOrders();
      loadDashboardStats();
    } catch (e) {
      showNotification('Ошибка удаления', true);
    }
  }
};

async function deleteCurrentOrder() {
  if (currentOrderId) window.deleteOrder(currentOrderId);
}

// Filters
async function filterProducts() {
  const search = document.getElementById('productSearch').value.toLowerCase();
  const category = document.getElementById('categoryFilter').value;
  
  try {
    let products = await db.getAdminProducts();
    
    if (search) {
      products = products.filter(p => 
        p.name.toLowerCase().includes(search) || 
        p.description.toLowerCase().includes(search)
      );
    }
    if (category !== 'all') {
      products = products.filter(p => p.category === category);
    }
    
    renderAdminProducts(products);
  } catch (e) {
    showNotification('Ошибка фильтрации', true);
  }
}

function filterOrders() {
  const search = document.getElementById('orderSearch').value;
  const status = document.getElementById('statusFilter').value;
  
  const tbody = document.getElementById('ordersTableBody');
  const allOrders = JSON.parse(tbody?.dataset.allOrders || '[]');
  
  let filtered = allOrders;
  if (search) {
    filtered = filtered.filter(o => o.id.toString().includes(search));
  }
  if (status !== 'all') {
    filtered = filtered.filter(o => o.status === status);
  }
  
  renderAdminOrders(filtered);
}

// Utilities
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('ru-RU', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
}

function getStatusClass(status) {
  return {
    'Новый': 'status-new',
    'В обработке': 'status-processing', 
    'Выполнен': 'status-completed',
    'Отменен': 'status-cancelled'
  }[status] || 'status-new';
}

function getCategoryName(cat) {
  return {
    'ribeye': 'Ribeye',
    'striploin': 'Striploin',
    'tbone': 'T-Bone',
    'filet': 'Filet',
    'tomahawk': 'Tomahawk',
    'porterhouse': 'Porterhouse'
  }[cat] || cat;
}

function showNotification(msg, isError = false) {
  const notif = document.getElementById('adminNotification');
  const text = document.getElementById('adminNotificationText');
  if (!notif || !text) return;
  
  text.textContent = msg;
  notif.classList.toggle('error', isError);
  notif.classList.add('show');
  setTimeout(() => notif.classList.remove('show'), 3000);
}

function showLoading(id) {
  const el = document.getElementById(id);
  const colspan = id.includes('products') ? 8 : 6;
  if (el) el.innerHTML = `<tr><td colspan="${colspan}" style="text-align:center;padding:40px"><i class="fas fa-spinner fa-spin"></i> Загрузка...</td></tr>`;
}

function hideLoading(id) {
  // No-op - render functions handle
}

function debounce(fn, ms) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), ms);
  };
}

// Auto-init on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAdmin);
} else {
  initAdmin();
}

// Expose globals for onclick handlers
window.initAdmin = initAdmin;
window.viewOrder = window.viewOrder;
window.deleteOrder = window.deleteOrder;
window.editAdminProduct = window.editAdminProduct;
window.deleteAdminProduct = window.deleteAdminProduct;
