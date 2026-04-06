// ===================================
// ACCOUNT PAGE FUNCTIONALITY
// ===================================

class AccountManager {
  constructor() {
    this.db = typeof Database !== 'undefined' ? new Database() : null;
    this.currentUser = this.getCurrentUser();
    this.init();
  }

  getCurrentUser() {
    const userEmail = localStorage.getItem('currentUserEmail');
    if (!userEmail) return null;
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    return users.find(u => u.email === userEmail) || null;
  }

  // ─── Собирает заказы пользователя из ВСЕХ возможных ключей localStorage ───
  getUserOrders() {
    const email = this.currentUser?.email;
    if (!email) return [];

    // Все ключи, под которыми разные части сайта могут хранить заказы
    const candidates = [
      ...JSON.parse(localStorage.getItem('orders')     || '[]'),
      ...JSON.parse(localStorage.getItem('userOrders') || '[]'),
      ...JSON.parse(localStorage.getItem('allOrders')  || '[]'),
    ];

    // Дедупликация по id
    const seen = new Set();
    const all  = candidates.filter(o => {
      if (seen.has(o.id)) return false;
      seen.add(o.id);
      return true;
    });

    // Фильтруем по email — проверяем все поля, где он может быть записан
    return all.filter(o => {
      const oEmail =
        o.userEmail        ||
        o.customerEmail    ||
        o.email            ||
        o.customer?.email  ||
        '';
      return oEmail.toLowerCase() === email.toLowerCase();
    });
  }

  init() {
    const container = document.getElementById('accountContainer');
    if (!this.currentUser) {
      container.innerHTML = this.getLoginHTML();
      this.bindLoginEvents();
    } else {
      const userOrders = this.getUserOrders();
      container.innerHTML = this.getProfileHTML(userOrders);
      this.bindProfileEvents();
      this.loadServerOrders(); // попытка обновить с сервера поверх
    }
  }

  // ─── LOGIN FORM ────────────────────────────────────────────────────────────
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
            <p class="login-help"><a href="#">Забыли пароль?</a></p>
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

  // ─── PROFILE PAGE ──────────────────────────────────────────────────────────
  getProfileHTML(userOrders) {
    const totalSpent = userOrders.reduce((sum, o) => sum + (o.total || 0), 0);

    return `
      <div class="profile-wrapper">
        <div class="profile-sidebar">
          <div class="profile-header">
            <div class="profile-avatar"><i class="fas fa-user-circle"></i></div>
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

          <!-- Профиль -->
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

          <!-- Заказы — всегда рендерим контейнер #ordersList -->
          <div class="profile-section" id="orders">
            <h2>История заказов</h2>
            <div id="ordersList">
              ${this.renderOrdersList(userOrders)}
            </div>
          </div>

          <!-- Адреса -->
          <div class="profile-section" id="addresses">
            <h2>Адреса доставки</h2>
            <div class="addresses-list">
              ${this.currentUser.addresses && this.currentUser.addresses.length > 0
                ? this.currentUser.addresses.map(addr => `
                    <div class="address-card">
                      <h4>${addr.title}</h4>
                      <p>${addr.city}, ${addr.street}</p>
                      <p>${addr.building}, кв. ${addr.apartment}</p>
                      ${addr.isDefault ? '<span class="badge">По умолчанию</span>' : ''}
                    </div>`).join('')
                : '<p>Адреса не добавлены</p>'}
            </div>
            <button class="btn btn-outline" id="addAddressBtn">Добавить адрес</button>
          </div>

          <!-- Параметры -->
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

  // ─── Рендер списка заказов (используется и при первой отрисовке, и при обновлении) ───
  renderOrdersList(orders) {
    if (!orders || orders.length === 0) {
      return `
        <div class="empty-state">
          <i class="fas fa-inbox"></i>
          <h3>Нет заказов</h3>
          <p>У вас ещё нет заказов. <a href="catalog.html">Перейти в каталог</a></p>
        </div>`;
    }

    // Сортируем — свежие сверху
    const sorted = [...orders].sort((a, b) => {
      const da = new Date(a.date || a.createdAt || a.created_at || 0);
      const db = new Date(b.date || b.createdAt || b.created_at || 0);
      return db - da;
    });

    return sorted.map(order => {
      const dateRaw = order.date || order.createdAt || order.created_at;
      const dateStr = dateRaw
        ? new Date(dateRaw).toLocaleDateString('ru-RU')
        : '—';

      const items = order.items || [];

      return `
        <div class="order-card">
          <div class="order-header">
            <div class="order-info">
              <h4>Заказ #${order.id}</h4>
              <p class="order-date">${dateStr}</p>
            </div>
            <div class="order-status status-${order.status || 'pending'}">
              ${this.getStatusLabel(order.status)}
            </div>
          </div>
          <div class="order-items">
            ${items.length > 0
              ? items.map(item => {
                  const qty   = item.quantity || item.qty || 1;
                  const price = item.price || 0;
                  return `
                    <div class="order-item">
                      <span>${item.name || 'Товар'}</span>
                      <span>${qty}x ${price.toLocaleString('ru-RU')} ₸</span>
                    </div>`;
                }).join('')
              : '<div class="order-item"><span>—</span></div>'}
          </div>
          <div class="order-footer">
            <span class="order-total">Итого: ${(order.total || 0).toLocaleString('ru-RU')} ₸</span>
            <button class="btn btn-small"
              onclick="window.location.href='order-tracking.html?order=${order.id}'">
              <i class="fas fa-map-marker-alt"></i> Отследить
            </button>
          </div>
        </div>`;
    }).join('');
  }

  getStatusLabel(status) {
    const labels = {
      'pending':    'Ожидание',
      'confirmed':  'Подтверждено',
      'processing': 'В процессе',
      'shipped':    'Отправлено',
      'delivered':  'Доставлено',
      'cancelled':  'Отменено',
      // Русские статусы из admin-панели
      'Новый':        'Новый',
      'В обработке':  'В обработке',
      'Выполнен':     'Выполнен',
      'Отменён':      'Отменён',
    };
    return labels[status] || status || 'Новый';
  }

  // ─── Попытка получить актуальные заказы с сервера ─────────────────────────
  async loadServerOrders() {
    if (!this.currentUser?.email) return;
    try {
      const r = await fetch(`/api/orders?email=${encodeURIComponent(this.currentUser.email)}`);
      if (!r.ok) return;
      const serverOrders = await r.json();
      if (!Array.isArray(serverOrders) || serverOrders.length === 0) return;

      // Мержим серверные заказы с локальными (серверные имеют приоритет)
      const local = this.getUserOrders();
      const merged = [...serverOrders];
      const serverIds = new Set(serverOrders.map(o => o.id));
      local.forEach(o => { if (!serverIds.has(o.id)) merged.push(o); });

      this.refreshOrdersUI(merged);
    } catch (err) {
      console.warn('Server orders unavailable:', err.message);
    }
  }

  // ─── Обновляет UI заказов без перезагрузки страницы ──────────────────────
  refreshOrdersUI(orders) {
    const count      = orders.length;
    const totalSpent = orders.reduce((s, o) => s + (o.total || 0), 0);

    const el = id => document.getElementById(id);
    if (el('ordersCount'))   el('ordersCount').textContent   = count;
    if (el('statOrders'))    el('statOrders').textContent    = count;
    if (el('statTotalSpent'))
      el('statTotalSpent').textContent = totalSpent.toLocaleString('ru-RU') + ' ₸';

    const list = el('ordersList');
    if (list) list.innerHTML = this.renderOrdersList(orders);
  }

  // ─── EVENT BINDINGS ────────────────────────────────────────────────────────
  bindLoginEvents() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        const tab = e.target.dataset.tab;
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        e.target.classList.add('active');
        document.getElementById(`${tab}-tab`).classList.add('active');
      });
    });

    document.getElementById('loginForm').addEventListener('submit', e => {
      e.preventDefault();
      this.loginUser(
        document.getElementById('loginEmail').value,
        document.getElementById('loginPassword').value
      );
    });

    document.getElementById('registerForm').addEventListener('submit', e => {
      e.preventDefault();
      const pw  = document.getElementById('registerPassword').value;
      const pw2 = document.getElementById('registerConfirmPassword').value;
      if (pw !== pw2) { this.showNotification('Пароли не совпадают!', 'error'); return; }
      this.registerUser(
        document.getElementById('registerFirstName').value,
        document.getElementById('registerLastName').value,
        document.getElementById('registerEmail').value,
        pw
      );
    });
  }

  bindProfileEvents() {
    // Меню навигации
    document.querySelectorAll('.profile-menu .menu-item').forEach(btn => {
      btn.addEventListener('click', e => {
        const section = e.currentTarget.dataset.section;
        document.querySelectorAll('.profile-menu .menu-item').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.profile-section').forEach(s => s.classList.remove('active'));
        e.currentTarget.classList.add('active');
        document.getElementById(section).classList.add('active');
      });
    });

    document.getElementById('logoutBtn').addEventListener('click', () => {
      if (confirm('Вы уверены, что хотите выйти?')) this.logoutUser();
    });

    document.getElementById('profileForm')?.addEventListener('submit', e => {
      e.preventDefault();
      this.updateUserProfile(
        document.querySelector('[name="firstName"]').value,
        document.querySelector('[name="lastName"]').value,
        document.querySelector('[name="phone"]').value
      );
    });

    document.getElementById('savePreferencesBtn')?.addEventListener('click', () => {
      this.savePreferences();
    });

    document.getElementById('deleteAccountBtn')?.addEventListener('click', () => {
      if (confirm('Вы точно хотите удалить аккаунт? Это действие необратимо.'))
        this.deleteAccount();
    });
  }

  // ─── AUTH ──────────────────────────────────────────────────────────────────
  loginUser(email, password) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user  = users.find(u => u.email === email && u.password === password);
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
      id: Date.now(), firstName, lastName, email, password,
      createdAt: new Date().toISOString(),
      addresses: [], newsletter: true, notifications: true
    };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUserEmail', email);
    this.showNotification('Аккаунт создан! Вы авторизованы.', 'success');
    setTimeout(() => location.reload(), 1000);
  }

  logoutUser() {
    localStorage.removeItem('currentUserEmail');
    this.showNotification('Вы вышли из аккаунта', 'success');
    setTimeout(() => location.reload(), 1000);
  }

  updateUserProfile(firstName, lastName, phone) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const idx   = users.findIndex(u => u.email === this.currentUser.email);
    if (idx !== -1) {
      users[idx] = { ...users[idx], firstName, lastName, phone };
      localStorage.setItem('users', JSON.stringify(users));
      this.showNotification('Профиль обновлён!', 'success');
    }
  }

  savePreferences() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const idx   = users.findIndex(u => u.email === this.currentUser.email);
    if (idx !== -1) {
      users[idx].newsletter    = document.querySelector('[name="newsletter"]').checked;
      users[idx].notifications = document.querySelector('[name="notifications"]').checked;
      users[idx].sms           = document.querySelector('[name="sms"]').checked;
      localStorage.setItem('users', JSON.stringify(users));
      this.showNotification('Параметры сохранены!', 'success');
    }
  }

  deleteAccount() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    localStorage.setItem('users', JSON.stringify(users.filter(u => u.email !== this.currentUser.email)));
    localStorage.removeItem('currentUserEmail');
    this.showNotification('Аккаунт удалён. До встречи!', 'success');
    setTimeout(() => location.href = 'index.html', 1000);
  }

  // ─── NOTIFICATION ──────────────────────────────────────────────────────────
  showNotification(message, type = 'info') {
    const container = document.getElementById('notification-container');
    if (!container) return;
    const n = document.createElement('div');
    n.className = `notification notification-${type}`;
    const icon = type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle';
    n.innerHTML = `<div class="notification-content"><i class="fas fa-${icon}"></i><span>${message}</span></div>`;
    container.appendChild(n);
    setTimeout(() => n.classList.add('show'), 10);
    setTimeout(() => { n.classList.remove('show'); setTimeout(() => n.remove(), 300); }, 3000);
  }
}

// ─── INIT ──────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  new AccountManager();
  if (typeof updateCartCount === 'function') updateCartCount();
});