# ✅ CHECKLIST: Реализация архитектурных улучшений

Используйте этот файл для отслеживания вашего прогресса!

---

## 📋 QUICK WINS (2-3 часа) - Начните ЗДЕСЬ

### 🔵 Этап 1: Config (5-10 минут)

- [ ] **Создать папку** `public/js/`
  ```bash
  mkdir -p public/js
  ```

- [ ] **Скопировать config файл**
  ```bash
  cp js-examples/config.js public/js/config.js
  ```

- [ ] **Обновить app.js** - заменить жестко закодированные значения на `CONFIG.*`
  - [ ] `API_ENDPOINT` → `CONFIG.API.BASE_URL`
  - [ ] Storage ключи → `CONFIG.STORAGE.*`
  - [ ] Категории → `CONFIG.CATEGORIES`
  - [ ] Messages → `CONFIG.MESSAGES.*`

- [ ] **Добавить в HTML** перед app.js:
  ```html
  <script src="js/config.js"></script>
  <script src="js/app.js"></script>
  ```

**Результат:** Все константы в одном месте ✓

---

### 🔵 Этап 2: Utils (10-15 минут)

- [ ] **Создать папку** `public/js/utils/`
  ```bash
  mkdir -p public/js/utils
  ```

- [ ] **Скопировать utils файл**
  ```bash
  cp js-examples/utils-helpers.js public/js/utils/helpers.js
  ```

- [ ] **Заменить в app.js** дублирующиеся функции на импорт:
  - [ ] `formatPrice` → из utils
  - [ ] `createElement` → из utils  
  - [ ] `debounce` → из utils
  - [ ] `formatDate` → из utils

- [ ] **Добавить script**:
  ```html
  <script src="js/utils/helpers.js"></script>
  ```

**Результат:** Код переиспользуется, нет дублирования ✓

---

### 🔵 Этап 3: Store (15-20 минут)

- [ ] **Создать файл** `public/js/store.js`
  ```bash
  cp js-examples/store.js public/js/store.js
  ```

- [ ] **В app.js** заменить localStorage операции на `store.dispatch`:
  - [ ] `getCart()` → `store.getState().cart`
  - [ ] `addToCart()` → `store.dispatch('ADD_TO_CART', ...)`
  - [ ] `removeFromCart()` → `store.dispatch('REMOVE_FROM_CART', ...)`

- [ ] **Добавить script перед app.js**:
  ```html
  <script src="js/store.js"></script>
  ```

- [ ] **Протестировать**:
  - [ ] Добавить товар в корзину
  - [ ] Проверить localstorage - должно работать как раньше
  - [ ] Удалить с корзины
  - [ ] Перезагрузить страницу - корзина должна восстановиться

**Результат:** Единое управление состоянием ✓

---

### 🔵 Этап 4: Services (15-20 минут)

- [ ] **Создать папку** `public/js/services/`
  ```bash
  mkdir -p public/js/services
  ```

- [ ] **Скопировать API service**
  ```bash
  cp js-examples/services-api.js public/js/services/api.js
  ```

- [ ] **Скопировать Storage service**
  ```bash
  mkdir -p public/js/services
  cat > public/js/services/storage.js << 'EOF'
  class StorageService {
    constructor(prefix = 'steakhouse_') {
      this.prefix = prefix;
    }
    
    getItem(key) {
      const item = localStorage.getItem(this.prefix + key);
      try {
        return item ? JSON.parse(item) : null;
      } catch {
        return item;
      }
    }
    
    setItem(key, value) {
      localStorage.setItem(this.prefix + key, JSON.stringify(value));
    }
    
    removeItem(key) {
      localStorage.removeItem(this.prefix + key);
    }
    
    clear() {
      Object.keys(localStorage)
        .filter(key => key.startsWith(this.prefix))
        .forEach(key => localStorage.removeItem(key));
    }
  }
  
  const storage = new StorageService();
  EOF
  ```

- [ ] **В app.js** заменить localStorage на storage service:
  - [ ] `localStorage.getItem()` → `storage.getItem()`
  - [ ] `localStorage.setItem()` → `storage.setItem()`

- [ ] **Добавить scripts**:
  ```html
  <script src="js/services/storage.js"></script>
  <script src="js/services/api.js"></script>
  ```

**Результат:** API и Storage централизованы ✓

---

### 🔵 Этап 5: CSS Разделение (20-30 минут)

- [ ] **Создать папку** `styles/`
  ```bash
  mkdir -p styles/base styles/components styles/pages styles/utilities
  ```

- [ ] **Скопировать переменные**
  ```bash
  cp css-examples/variables.css styles/variables.css
  ```

- [ ] **Создать файл** `styles/main.css`:
  ```css
  @import url('./variables.css');
  @import url('./base/reset.css');
  @import url('./base/typography.css');
  @import url('./base/layout.css');
  @import url('./components/header.css');
  @import url('./components/footer.css');
  @import url('./components/card.css');
  @import url('./components/button.css');
  @import url('./components/form.css');
  @import url('./components/modal.css');
  @import url('./pages/home.css');
  @import url('./pages/catalog.css');
  @import url('./pages/account.css');
  @import url('./pages/about.css');
  @import url('./utilities/responsive.css');
  @import url('./utilities/animations.css');
  ```

- [ ] **Из styles.css** вырезать и распределить:
  - [ ] Reset CSS → `styles/base/reset.css`
  - [ ] Typography → `styles/base/typography.css`
  - [ ] Layout → `styles/base/layout.css`
  - [ ] Header styles → `styles/components/header.css`
  - [ ] Footer styles → `styles/components/footer.css`
  - [ ] Card styles → `styles/components/card.css`
  - [ ] Button styles → `styles/components/button.css`
  - [ ] Form styles → `styles/components/form.css`
  - [ ] Modal styles → `styles/components/modal.css`
  - [ ] Home styles → `styles/pages/home.css`
  - [ ] Catalog styles → `styles/pages/catalog.css`
  - [ ] Account styles → `styles/pages/account.css`
  - [ ] About styles → `styles/pages/about.css`
  - [ ] Responsive → `styles/utilities/responsive.css`
  - [ ] Animations → `styles/utilities/animations.css`

- [ ] **В HTML файлах** заменить:
  ```html
  <!-- ИЗ: -->
  <link rel="stylesheet" href="styles.css">
  
  <!-- НА: -->
  <link rel="stylesheet" href="styles/main.css">
  ```

- [ ] **Протестировать**:
  - [ ] Все страницы загружаются с корректными стилями
  - [ ] Нет ошибок в консоли
  - [ ] Мобильная версия отзывчива

**Результат:** CSS организирован, легче ориентироваться ✓

---

## 🎯 ПРОВЕРКА: После всех 5 этапов

```
✅ Структура папок:
   public/
   ├── js/
   │   ├── config.js
   │   ├── store.js
   │   ├── app.js (обновлён)
   │   ├── utils/
   │   │   └── helpers.js
   │   └── services/
   │       ├── api.js
   │       └── storage.js
   └── styles/
       ├── main.css
       ├── variables.css
       ├── base/
       ├── components/
       ├── pages/
       └── utilities/

✅ Функциональность:
   ☐ Сайт работает как раньше
   ☐ Корзина функционирует
   ☐ Аккаунт работает
   ☐ Стили применяются
   ☐ Мобильная версия работает

✅ Improvement:
   ☐ Код читаемее
   ☐ Нет дублирования
   ☐ Проще найти нужное
   ☐ Больше модульности
```

---

## 🚀 FULL MIGRATION (2-3 недели) - Если хотите больше

После Quick Wins, если захотите полный рефакторинг:

### Неделя 1: JS Архитектура

- [ ] **Создать modules/**
  - [ ] `modules/header/` с header.js, header.html, header.css
  - [ ] `modules/footer/` с footer.js, footer.html, footer.css
  - [ ] `modules/products/` с products.js, products.html, products.css
  - [ ] `modules/cart/` с cart.js, cart.html, cart.css
  - [ ] `modules/account/` с account.js, account.html, account.css

- [ ] **Создать router**
  - [ ] `public/js/router.js` - навигация между модулями

- [ ] **Создать main.js**
  - [ ] `public/js/main.js` - инициализация приложения

### Неделя 2: CSS & Pages

- [ ] **Разделить styles.css на модули** (как в Quick Wins)
- [ ] Каждый модуль имеет свой CSS файл в папке
- [ ] Страницы имеют page-specific CSS в `styles/pages/`

### Неделя 3: Integration & Deploy

- [ ] Тестирование всей архитектуры
- [ ] Документация кода
- [ ] Deploy на production

---

## 📊 Отслеживание времени

### Quick Wins:
| Этап | Задача | Планируемое время | Фактическое | Статус |
|------|--------|------------------|------------|--------|
| 1 | Config | 5-10 мин | ___ | ☐ |
| 2 | Utils | 10-15 мин | ___ | ☐ |
| 3 | Store | 15-20 мин | ___ | ☐ |
| 4 | Services | 15-20 мин | ___ | ☐ |
| 5 | CSS | 20-30 мин | ___ | ☐ |
| **ВСЕГО** | | **65-95 мин** | ___ | ☐ |

### После каждого этапа отмечайте:
- Что заняло больше/меньше времени?
- Какие были трудности?
- Что было легко?

---

## 💾 Резервное копирование

**Перед началом:**
```bash
# Создать резервную копию
cp -r . ../SteakHouse-backup-$(date +%Y%m%d)

# Или в Git:
git checkout -b refactor/quick-wins
```

Так сможете откатиться, если что-то пойдёт не так.

---

## 🆘 Если что-то сломалось

1. **Проверить консоль браузера** (F12) - есть ошибки?
2. **Проверить scripts в HTML** - все ли подключены?
3. **Проверить пути** - относительные пути правильные?
4. **Откатить последний этап** - вернуться к предыдущей версии
5. **Спросить у примеров** - посмотреть js-examples/ и css-examples/

---

## 📚 Справочные документы

- **QUICK_WINS.md** - детальные инструкции для каждого шага
- **ARCHITECTURE.md** - как должна выглядеть новая структура
- **ARCHITECTURE_COMPARISON.md** - сравнение текущей vs новой
- **MIGRATION_GUIDE.md** - полный план на 2-3 недели
- **js-examples/** - примеры кода для копирования
- **css-examples/** - примеры CSS для адаптации

---

## 🎯 Рекомендуемый путь

**Если мало времени (30 минут):**
- ☐ Сделайте этап 1 (Config)
- ☐ Сделайте этап 2 (Utils)

**Если есть пару часов (1-2 часа):**
- ☐ Этапы 1-4 (Config, Utils, Store, Services)
- **Результат:** Код чистый и модульный

**Если есть целый день (4-6 часов):**
- ☐ Все 5 этапов (Quick Wins)
- **Результат:** Профессиональная базовая архитектура

**Если есть неделя:**
- ☐ Quick Wins (1 день)
- ☐ Начните Full Migration (4-5 дней)
- **Результат:** Полная современная архитектура

---

## ✨ После завершения

```javascript
// Это будет выглядеть вместо этого:
app.js (663 строк - всё в одном)

// Станет вот так:
config.js        (80 строк)  - конфигурация
store.js        (120 строк)  - состояние
services/       (300 строк)  - API и Storage
utils/          (150 строк)  - помощники
modules/        (500+ строк) - компоненты
main.js          (50 строк)  - инициализация
```

**Результат: 50 строк вместо 663! Намного проще читать и изменять!**

---

## 🎉 Финальная проверка

После завершения всех этапов:
- ✅ Сайт работает как раньше? 
- ✅ Код более организован?
- ✅ Легче найти нужный код?
- ✅ Проще добавлять новые функции?
- ✅ Готовы к following phase?

**Если ДА на все - поздравляем! Вы готовы масштабировать! 🚀**

---

**Удачи! Начните с Config (этап 1) - это займёт 5 минут и даст сразу результат!**
