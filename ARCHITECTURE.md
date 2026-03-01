# 🏗️ Рекомендуемая архитектура SteakHouse

## Текущие проблемы
- ❌ Все файлы в одной папке (плохо масштабируется)
- ❌ Смешивание фронтенда, бэкенда, asset'ов
- ❌ Большие монолитные JS файлы (app.js - 663 строки)
- ❌ Нет разделения на модули/компоненты
- ❌ Нет service слоя
- ❌ Нет состояния приложения (state management)
- ❌ Дублирование кода (header в компонентах и HTML)
- ❌ Нет конфигурации/констант

## Рекомендуемая структура

```
steakhouse/
├── public/                      # Статические файлы (фронтенд)
│   ├── index.html
│   ├── pages/
│   │   ├── catalog.html
│   │   ├── about.html
│   │   ├── account.html
│   │   ├── delivery.html
│   │   ├── contacts.html
│   │   └── steaks-guide.html
│   ├── assets/
│   │   ├── images/
│   │   │   ├── products/
│   │   │   ├── team/
│   │   │   └── icons/
│   │   └── fonts/
│   └── js/
│       ├── main.js             # Entry point
│       ├── config.js            # Конфигурация
│       ├── store.js             # State management
│       ├── router.js            # Маршрутизация (SPA)
│       ├── services/
│       │   ├── api.js           # API вызовы
│       │   ├── storage.js       # localStorage операции
│       │   ├── auth.js          # Авторизация
│       │   └── cart.js          # Корзина
│       ├── modules/
│       │   ├── header/
│       │   │   ├── header.js
│       │   │   ├── header.html
│       │   │   └── header.css
│       │   ├── footer/
│       │   ├── cart/
│       │   ├── products/
│       │   ├── account/
│       │   └── navigation/
│       ├── utils/
│       │   ├── helpers.js       # Вспомогательные функции
│       │   ├── validators.js    # Валидация
│       │   └── formatters.js    # Форматирование данных
│       └── middleware/
│           ├── logger.js
│           └── error-handler.js
├── src/                         # Backend
│   ├── server.js
│   ├── config/
│   │   └── database.js
│   ├── models/
│   │   ├── Product.js
│   │   ├── Order.js
│   │   └── User.js
│   ├── routes/
│   │   ├── api/
│   │   │   ├── products.js
│   │   │   ├── orders.js
│   │   │   ├── users.js
│   │   │   └── auth.js
│   │   └── web.js              # Статические страницы
│   ├── controllers/
│   │   ├── ProductController.js
│   │   ├── OrderController.js
│   │   └── UserController.js
│   ├── services/
│   │   ├── ProductService.js
│   │   ├── OrderService.js
│   │   └── AuthService.js
│   └── middleware/
│       ├── auth.js
│       ├── validation.js
│       └── errorHandler.js
├── styles/
│   ├── main.css                # Entry point
│   ├── variables.css           # CSS переменные, цвета
│   ├── base/
│   │   ├── reset.css
│   │   ├── typography.css
│   │   └── layout.css
│   ├── components/
│   │   ├── header.css
│   │   ├── footer.css
│   │   ├── card.css
│   │   ├── button.css
│   │   ├── form.css
│   │   └── modal.css
│   ├── pages/
│   │   ├── home.css
│   │   ├── catalog.css
│   │   ├── account.css
│   │   ├── about.css
│   │   └── contacts.css
│   └── utilities/
│       ├── responsive.css      # Media queries
│       └── animations.css
├── tests/
│   ├── unit/
│   │   ├── services/
│   │   └── utils/
│   └── e2e/
│       └── scenarios/
├── docs/
│   ├── API.md                  # API документация
│   ├── COMPONENTS.md           # Компоненты
│   └── CONTRIBUTING.md
├── .env.example
├── .eslintrc.js
├── .prettierrc
├── package.json
├── webpack.config.js           # (опционально для bundling)
└── README.md
```

## Ключевые улучшения

### 1️⃣ **Модульная архитектура**
Каждый компонент/модуль в отдельной папке со своим HTML, CSS, JS

### 2️⃣ **Разделение фронт/бэк**
- `public/` - фронтенд приложение
- `src/` - серверный код

### 3️⃣ **State Management**
Единое хранилище состояния вместо localStorage операций везде

### 4️⃣ **Service Layer**
Отделено от логики отображения:
- API вызовы
- Авторизация
- Работа с хранилищем
- Бизнес-логика

### 5️⃣ **Правильная CSS организация**
- Variables для цветов
- Base стили
- Component-scoped CSS
- Utilities/helpers
- Responsive модули

### 6️⃣ **Конфигурация**
Константы в отдельном файле (API endpoints, цены, тексты)

### 7️⃣ **Тестирование**
Структура под unit и e2e тесты

### 8️⃣ **Документация**
API, компоненты, гайды

## Приоритет внедрения

1. ✅ **Высокий приоритет** (Срочно)
   - Переструктурировать файлы по папкам
   - Создать service layer
   - State management (store.js)

2. 🟡 **Средний приоритет** (В течение недели)
   - Разделить CSS по компонентам
   - Модульная архитектура JS
   - Конфигурация/константы

3. 🟢 **Низкий приоритет** (Для будущего)
   - Тесты
   - Build tools (webpack/vite)
   - Docker контейнеризация
   - CI/CD pipeline

## Быстрый старт внедрения
1. Создать новую папочную структуру
2. Переместить файлы
3. Рефакторить JS на модули
4. Убрать дублирование
5. Добавить конфигурацию
