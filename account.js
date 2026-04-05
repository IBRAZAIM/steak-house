// ===================================
// ACCOUNT PAGE FUNCTIONALITY
// ===================================

class AccountManager {
  constructor() {
    this.db = new Database();
    this.currentUser = this.getCurrentUser();
    this.init();
  }

  getCurrentUser() {
    const userEmail = localStorage.getItem('currentUserEmail');
    if (!userEmail) return null;
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    return users.find(u => u.email === userEmail);
  }

  init() {
    const container = document.getElementById('accountContainer');
    
    if (!this.currentUser) {
      // Show login/registration forms
      container.innerHTML = this.getLoginHTML();
      this.bindLoginEvents();
    } else {
      // Show account profile
      container.innerHTML = this.getProfileHTML();
      this.bindProfileEvents();
      this.loadServerOrders();
    }
  }

  getLoginHTML() {
    return `
      <div class="account-login">
        <div class="login-tabs">
          <button class="tab-btn active" data-tab="login">Вход</button>
          <button class="tab-btn" data-tab="register">Регистрация</button>
        </div>

        <div class="tab-content active" id="login-tab">
          <h2>Вход в аккаунт</h2>
          <form id="loginForm">
            <div class="form-group">
              <label>Email</label>
              <input type="email" name="email" id="loginEmail" required />
            </div>
            <div class="form-group">
              <label>Пароль</label>
              <input type="password" name="password" id="loginPassword" required />
            </div>
            <button type="submit" class="btn btn-full">Войти</button>
            <p class="login-help">
              <a href="#">Забыли пароль?</a>
            </p>
          </form>
        </div>

        <div class="tab-content" id="register-tab">
          <h2>Создать аккаунт</h2>
          <form id="registerForm">
            <div class="form-row">
              <div class="form-group">
                <label>Имя</label>
                <input type="text" name="firstName" id="registerFirstName" required />
              </div>
              <div class="form-group">
                <label>Фамилия</label>
                <input type="text" name="lastName" id="registerLastName" required />
              </div>
            </div>
            <div class="form-group">
              <label>Email</label>
              <input type="email" name="email" id="registerEmail" required />
            </div>
            <div class="form-group">
              <label>Пароль</label>
              <input type="password" name="password" id="registerPassword" required />
            </div>
            <div class="form-group">
              <label>Подтвердите пароль</label>
              <input type="password" name="confirmPassword" id="registerConfirmPassword" required />
            </div>
            <div class="form-group checkbox">
              <input type="checkbox" name="terms" id="agreeTerms" required />
              <label for="agreeTerms">Я согласен(-на) с условиями использования</label>
            </div>
            <button type="submit" class="btn btn-full">Создать аккаунт</button>
          </form>
        </div>
      </div>
    `;
  }

  getProfileHTML() {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const userOrders = orders.filter(o => o.userEmail === this.currentUser.email);
    const totalSpent = userOrders.reduce((sum, o) => sum + (o.total || 0), 0);

    return `
      <div class="profile-wrapper">
        <div class="profile-sidebar">
          <div class="profile-header">
            <div class="profile-avatar">
              <i class="fas fa-user-circle"></i>
            </div>
            <h2>${this.currentUser.firstName} ${this.currentUser.lastName}</h2>
            <p>${this.currentUser.email}</p>
            <button class="btn btn-small" id="logoutBtn">Выход</button>
          </div>

          <div class="profile-menu">
            <button class="menu-item active" data-section="profile">
              <i class="fas fa-user"></i> Профиль
            </button>
            <button class="menu-item" data-section="orders">
              <i class="fas fa-file-invoice"></i> Заказы (<span id="ordersCount">${userOrders.length}</span>)
            </button>
            <button class="menu-item" data-section="addresses">
              <i class="fas fa-map-marker-alt"></i> Адреса
            </button>
            <button class="menu-item" data-section="preferences">
              <i class="fas fa-cog"></i> Параметры
            </button>
          </div>
        </div>

        <div class="profile-content">
          <!-- Profile Section -->
          <div class="profile-section active" id="profile">
            <h2>Информация профиля</h2>
            <div class="profile-stats">
              <div class="stat">
                <i class="fas fa-shopping-bag"></i>
                <div class="stat-info">
                  <span class="stat-number" id="statOrders">${userOrders.length}</span>
                  <span class="stat-label">Заказов</span>
                </div>
              </div>
              <div class="stat">
                <i class="fas fa-tenge-sign"></i>
                <div class="stat-info">
                  <span class="stat-number" id="statTotalSpent">${totalSpent.toLocaleString('ru-RU')} ₸</span>
                  <span class="stat-label">Потрачено</span>
                </div>
              </div>
              <div class="stat">
                <i class="fas fa-star"></i>
                <div class="stat-info">
                  <span class="stat-number">${Math.floor(totalSpent / 1000)}</span>
                  <span class="stat-label">Бонусов</span>
                </div>
              </div>
            </div>

            <div class="profile-form">
              <h3>Личные данные</h3>
              <form id="profileForm">
                <div class="form-row">
                  <div class="form-group">
                    <label>Имя</label>
                    <input type="text" name="firstName" value="${this.currentUser.firstName}" />
                  </div>
                  <div class="form-group">
                    <label>Фамилия</label>
                    <input type="text" name="lastName" value="${this.currentUser.lastName}" />
                  </div>
                </div>
                <div class="form-group">
                  <label>Телефон</label>
                  <input type="tel" name="phone" value="${this.currentUser.phone || ''}" placeholder="+7 (999) 000-00-00" />
                </div>
                <button type="submit" class="btn">Сохранить изменения</button>
              </form>
            </div>
          </div>

          <!-- Orders Section -->
          <div class="profile-section" id="orders">
            <h2>История заказов</h2>
            ${userOrders.length > 0 ? `
              <div class="orders-list" id="ordersList">
                ${userOrders.map(order => `
                  <div class="order-card">
                    <div class="order-header">
                      <div class="order-info">
                        <h4>Заказ #${order.id}</h4>
                        <p class="order-date">${new Date(order.date).toLocaleDateString('ru-RU')}</p>
                      </div>
                      <div class="order-status status-${order.status}">
                        ${this.getStatusLabel(order.status)}
                      </div>
                    </div>
                    <div class="order-items">
                      ${order.items.map(item => `
                        <div class="order-item">
                          <span>${item.name}</span>
                          <span>${item.quantity}x ${item.price.toLocaleString('ru-RU')} ₸</span>
                        </div>
                      `).join('')}
                    </div>
                    <div class="order-footer">
                      <span class="order-total">Итого: ${order.total.toLocaleString('ru-RU')} ₸</span>
                      <button class="btn btn-small" onclick="window.location.href='order-tracking.html?order=${order.id}'">
                        <i class="fas fa-tracking"></i> Отследить
                      </button>
                    </div>
                  </div>
                `).join('')}
              </div>
            ` : `
              <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <h3>Нет заказов</h3>
                <p>У вас еще нет заказов. <a href="catalog.html">Перейти в каталог</a></p>
              </div>
            `}
          </div>

          <!-- Addresses Section -->
          <div class="profile-section" id="addresses">
            <h2>Адреса доставки</h2>
            <div class="addresses-list">
              ${this.currentUser.addresses && this.currentUser.addresses.length > 0 ? `
                ${this.currentUser.addresses.map((addr, idx) => `
                  <div class="address-card">
                    <h4>${addr.title}</h4>
                    <p>${addr.city}, ${addr.street}</p>
                    <p>${addr.building}, кв. ${addr.apartment}</p>
                    ${addr.isDefault ? '<span class="badge">По умолчанию</span>' : ''}
                  </div>
                `).join('')}
              ` : `
                <p>Адреса не добавлены</p>
              `}
            </div>
            <button class="btn btn-outline" id="addAddressBtn">Добавить адрес</button>
          </div>

          <!-- Preferences Section -->
          <div class="profile-section" id="preferences">
            <h2>Параметры</h2>
            <div class="preferences-form">
              <div class="preference-group">
                <label>
                  <input type="checkbox" name="newsletter" ${this.currentUser.newsletter ? 'checked' : ''} />
                  Получать новости и предложения
                </label>
              </div>
              <div class="preference-group">
                <label>
                  <input type="checkbox" name="notifications" ${this.currentUser.notifications !== false ? 'checked' : ''} />
                  Уведомления о заказах
                </label>
              </div>
              <div class="preference-group">
                <label>
                  <input type="checkbox" name="sms" ${this.currentUser.sms ? 'checked' : ''} />
                  Уведомления по SMS
                </label>
              </div>
              <button class="btn" id="savePreferencesBtn">Сохранить параметры</button>
            </div>

            <div class="danger-zone">
              <h3>Опасная зона</h3>
              <button class="btn btn-danger" id="deleteAccountBtn">Удалить аккаунт</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  getStatusLabel(status) {
    const labels = {
      'pending': 'Ожидание',
      'confirmed': 'Подтверждено',
      'processing': 'В процессе',
      'shipped': 'Отправлено',
      'delivered': 'Доставлено',
      'cancelled': 'Отменено'
    };
    return labels[status] || status;
  }

  async loadServerOrders() {
    if (!this.currentUser || !this.currentUser.email) return;
    try {
      const response = await fetch(`/api/orders?email=${encodeURIComponent(this.currentUser.email)}`);
      if (!response.ok) return;
      const orders = await response.json();
      if (!Array.isArray(orders) || orders.length === 0) return;
      this.updateOrderUI(orders);
    } catch (error) {
      console.warn('Server orders unavailable:', error.message);
    }
  }

  updateOrderUI(orders) {
    const count = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + (order.total || 0), 0);

    const ordersCountElement = document.getElementById('ordersCount');
    const statOrdersElement = document.getElementById('statOrders');
    const statTotalSpentElement = document.getElementById('statTotalSpent');
    if (ordersCountElement) ordersCountElement.textContent = count;
    if (statOrdersElement) statOrdersElement.textContent = count;
    if (statTotalSpentElement) statTotalSpentElement.textContent = totalSpent.toLocaleString('ru-RU') + ' ₸';

    const ordersList = document.getElementById('ordersList');
    if (!ordersList) return;

    ordersList.innerHTML = orders.map(order => `
      <div class="order-card">
        <div class="order-header">
          <div class="order-info">
            <h4>Заказ #${order.id}</h4>
            <p class="order-date">${new Date(order.createdAt).toLocaleDateString('ru-RU')}</p>
          </div>
          <div class="order-status status-${order.status}">
            ${this.getStatusLabel(order.status)}
          </div>
        </div>
        <div class="order-items">
          ${(order.items || []).map(item => `
            <div class="order-item">
              <span>${item.name}</span>
              <span>${item.quantity}x ${item.price.toLocaleString('ru-RU')} ₸</span>
            </div>
          `).join('')}
        </div>
        <div class="order-footer">
          <span class="order-total">Итого: ${order.total.toLocaleString('ru-RU')} ₸</span>
          <button class="btn btn-small" onclick="window.location.href='order-tracking.html?order=${order.id}'">
            <i class="fas fa-tracking"></i> Отследить
          </button>
        </div>
      </div>
    `).join('');
  }

  bindLoginEvents() {
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tabName = e.target.dataset.tab;
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        e.target.classList.add('active');
        document.getElementById(`${tabName}-tab`).classList.add('active');
      });
    });

    // Login
    document.getElementById('loginForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value;
      const password = document.getElementById('loginPassword').value;
      
      this.loginUser(email, password);
    });

    // Register
    document.getElementById('registerForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const firstName = document.getElementById('registerFirstName').value;
      const lastName = document.getElementById('registerLastName').value;
      const email = document.getElementById('registerEmail').value;
      const password = document.getElementById('registerPassword').value;
      const confirmPassword = document.getElementById('registerConfirmPassword').value;

      if (password !== confirmPassword) {
        alert('Пароли не совпадают!');
        return;
      }

      this.registerUser(firstName, lastName, email, password);
    });
  }

  bindProfileEvents() {
    // Menu navigation
    document.querySelectorAll('.profile-menu .menu-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const section = e.currentTarget.dataset.section;
        document.querySelectorAll('.profile-menu .menu-item').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.profile-section').forEach(s => s.classList.remove('active'));
        e.currentTarget.classList.add('active');
        document.getElementById(section).classList.add('active');
      });
    });

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
      if (confirm('Вы уверены, что хотите выйти?')) {
        this.logoutUser();
      }
    });

    // Profile form
    document.getElementById('profileForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const firstName = document.querySelector('[name="firstName"]').value;
      const lastName = document.querySelector('[name="lastName"]').value;
      const phone = document.querySelector('[name="phone"]').value;

      this.updateUserProfile(firstName, lastName, phone);
    });

    // Save preferences
    document.getElementById('savePreferencesBtn')?.addEventListener('click', () => {
      this.savePreferences();
    });

    // Delete account
    document.getElementById('deleteAccountBtn')?.addEventListener('click', () => {
      if (confirm('Вы точно хотите удалить аккаунт? Это действие необратимо.')) {
        this.deleteAccount();
      }
    });
  }

  loginUser(email, password) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
      localStorage.setItem('currentUserEmail', email);
      this.showNotification('Вы успешно вошли!', 'success');
      setTimeout(() => location.reload(), 1000);
    } else {
      this.showNotification('Неправильный email или пароль', 'error');
    }
  }

  registerUser(firstName, lastName, email, password) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    if (users.find(u => u.email === email)) {
      this.showNotification('Пользователь с таким email уже существует', 'error');
      return;
    }

    const newUser = {
      id: Date.now(),
      firstName,
      lastName,
      email,
      password,
      createdAt: new Date().toISOString(),
      addresses: [],
      newsletter: true,
      notifications: true
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUserEmail', email);

    this.showNotification('Аккаунт создан! Вы авторизованы.', 'success');
    setTimeout(() => location.reload(), 1000);
  }

  updateUserProfile(firstName, lastName, phone) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const index = users.findIndex(u => u.email === this.currentUser.email);

    if (index !== -1) {
      users[index].firstName = firstName;
      users[index].lastName = lastName;
      users[index].phone = phone;
      localStorage.setItem('users', JSON.stringify(users));
      this.showNotification('Профиль обновлен!', 'success');
    }
  }

  savePreferences() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const index = users.findIndex(u => u.email === this.currentUser.email);

    if (index !== -1) {
      users[index].newsletter = document.querySelector('[name="newsletter"]').checked;
      users[index].notifications = document.querySelector('[name="notifications"]').checked;
      users[index].sms = document.querySelector('[name="sms"]').checked;
      localStorage.setItem('users', JSON.stringify(users));
      this.showNotification('Параметры сохранены!', 'success');
    }
  }

  deleteAccount() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const filteredUsers = users.filter(u => u.email !== this.currentUser.email);
    localStorage.setItem('users', JSON.stringify(filteredUsers));
    localStorage.removeItem('currentUserEmail');
    this.showNotification('Аккаунт удален. До встречи!', 'success');
    setTimeout(() => location.href = 'index.html', 1000);
  }

  logoutUser() {
    localStorage.removeItem('currentUserEmail');
    this.showNotification('Вы вышли из аккаунта', 'success');
    setTimeout(() => location.reload(), 1000);
  }

  showNotification(message, type = 'info') {
    const container = document.getElementById('notification-container');
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
      </div>
    `;
    container.appendChild(notification);

    setTimeout(() => {
      notification.classList.add('show');
    }, 10);

    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  new AccountManager();
  updateCartCount();
});
