# Практична робота №1–11: Front-end взаємодія з REST API та CRUD операції

## 📋 Про проєкт

Динамічний каталог проектів з повною реалізацією CRUD-операцій (Create, Read, Update, Delete) через REST API.

Проект демонструє професійний підхід до взаємодії фронтенду з сервером:
- Отримання даних через GET запити
- Створення нових записів через POST
- Редагування записів через PATCH
- Видалення записів через DELETE
- Коректне управління станами UI
- Клієнтська валідація форм

---

## 🚀 Як запустити проект

### Передумови
- Node.js (v14+)
- npm або yarn

### Кроки запуску

#### 1. Встановити json-server глобально
```bash
npm install -g json-server
```

#### 2. Запустити REST API сервер
Від кореня проекту:
```bash
json-server --watch db.json --port 3000
```

Сервер буде доступний на `http://localhost:3000`

#### 3. Запустити веб-сервер фронтенду
У другому терміналі:
```bash
# Якщо встановлений live-server:
live-server

# Або використовуйте python:
python -m http.server 8000

# Або інший веб-сервер
```

#### 4. Відкрити сторінку каталогу
```
http://localhost:8000 (або порт вашого сервера)
```

---

## ✅ Реалізовані обов'язкові завдання

### 1. ✓ Підготовка REST API та тестових даних
- **Файл**: `db.json`
- **Ресурс**: `/items` (доступні при запуску json-server)
- **Дані**: 10 проектів з полями: id, title, category, status, rating, description, image, level, featured, date, technologies
- **Категорії**: frontend, backend, design
- **Маршрути**:
  - `GET /items` — отримати всі елементи
  - `GET /items/:id` — отримати один елемент
  - `POST /items` — створити новий елемент
  - `PATCH /items/:id` — оновити елемент
  - `DELETE /items/:id` — видалити елемент

### 2. ✓ REST API шар в окремому файлі
- **Файл**: `js/api.js`
- **Функції**:
  - `getItems(params)` — GET запит
  - `getItemById(id)` — GET запит за ID
  - `createItem(data)` — POST запит
  - `updateItem(id, data)` — PATCH запит
  - `deleteItem(id)` — DELETE запит
  - `buildQueryString(params)` — побудова query string
- **Базова URL**: `http://localhost:3000/items`

### 3. ✓ Отримання і відображення списку (GET)
- Сторінка: `pages/catalog.html`
- **Функція**: `initCatalogPage()` у `catalog.js`
- Список завантажується при завантаженні сторінки
- Карточки рендеруються динамічно з даних сервера
- Показ 6 елементів на сторінці (пагінація)

### 4. ✓ Стани інтерфейсу (Loading, Error, Empty)
- **Loading state**: спінер і текст "Завантаження проектів..."
- **Error state**: повідомлення про помилку з кнопкою "Спробувати знову"
- **Empty state**: повідомлення про відсутність результатів з кнопкою "Очистити фільтри"
- **Success message**: повідомлення після створення/оновлення/видалення

### 5. ✓ Створення запису через форму (POST)
- Сторінка: `pages/item-form.html`
- **Форма включає**: title, category, description, rating, level, image, date, technologies, featured
- **Валідація**: всі обов'язкові поля перевіряються перед відправленням
- **Функція**: `handleFormSubmit()` у `form.js`
- Після успіху — перенаправлення на каталог

### 6. ✓ Клієнтська валідація
- **Файл**: `form.js` функція `validateForm()`
- **Перевіряється**:
  - Обов'язкові поля не порожні
  - Рейтинг між 1 і 5
  - URL зображення коректний
- **Показ помилок**: під кожним полем, біля якого сталася помилка

### 7. ✓ Редагування запису (GET by id + PATCH)
- **URL параметр**: `item-form.html?id=1`
- **Функція**: `loadItemForEdit(id)` у `form.js`
- Форма заповнюється даними елемента
- Заголовок змінюється на "Редагувати проект"
- Кнопка відправлення змінюється на "Оновити"
- Зберігання відправляє PATCH запит

### 8. ✓ Видалення запису (DELETE з підтвердженням)
- **Кнопка**: на кожній карточці в каталозі
- **Підтвердження**: через стандартний `confirm()`
- **Функція**: `handleDelete()` у `form.js`
- Елемент видаляється зі списку без перезавантаження
- Показ повідомлення про успіх

### 9. ✓ Пошук, фільтрація, сортування та пагінація
- **Пошук**: за назвою, описом та технологіями (у реальному часі)
- **Фільтрація**: за категоріями (frontend, backend, design)
- **Сортування**: 7 варіантів (дата, назва, рейтинг, рівень)
- **Пагінація**: 6 елементів на сторінці з кнопками навігації
- **Реалізація**: клієнтська фільтрація після завантаження даних

### 10. ✓ Синхронізація інтерфейсу
- Список оновлюється після кожної CRUD операції
- Стара сторінка каталогу не дублює записи
- Форма очищується після успішного створення
- Повідомлення про успіх показується на 1.5 секунди
- Перенаправлення після операції

---

## 📂 Структура проекту

```
lab01-html/
├── index.html                 # Головна сторінка
├── pages/
│   ├── catalog.html           # Каталог з CRUD інтерфейсом
│   ├── item-form.html         # Форма створення/редагування
│   ├── about.html             # Про мене
│   ├── contact.html           # Контакти
│   ├── favorites.html         # Обране
│   └── data/
│       └── projects.json      # Старі локальні дані (для довідки)
├── assets/
│   ├── styles/
│   │   ├── style.css          # Основні стилі
│   │   └── responsive.css     # Адаптивні стилі
│   ├── img/                   # Зображення
│   └── media/                 # Медіа-файли
├── js/
│   ├── main.js                # Ініціалізація додатку
│   ├── api.js                 # REST API функції (GET, POST, PATCH, DELETE)
│   ├── catalog.js             # Логіка каталогу та рендеринг
│   ├── form.js                # Логіка форми та валідація
│   ├── ui.js                  # UI компоненти (модалі, меню та ін.)
│   ├── contact.js             # Обробка контактної форми
│   └── favorites.js           # Логіка обраного
├── db.json                    # REST API база даних (json-server)
└── README.md                  # Цей файл
```

---

## 🔗 REST API Маршрути

### GET — Отримання даних

```bash
# Всі елементи
GET /items

# За ID
GET /items/1

# З пошуком (json-server)
GET /items?q=проект

# З фільтрацією за категорією
GET /items?category=frontend

# З сортуванням
GET /items?_sort=rating&_order=DESC

# З пагінацією
GET /items?_page=1&_limit=6
```

### POST — Створення

```bash
POST /items
Content-Type: application/json

{
  "title": "Новий проект",
  "category": "frontend",
  "description": "Опис проекту",
  "rating": 4.5,
  "level": "Середній",
  "image": "https://example.com/image.jpg",
  "date": "2026-06-03",
  "technologies": ["HTML", "CSS", "JavaScript"],
  "featured": false
}
```

### PATCH — Оновлення

```bash
PATCH /items/1
Content-Type: application/json

{
  "title": "Оновлена назва",
  "rating": 4.8
}
```

### DELETE — Видалення

```bash
DELETE /items/1
```

---

## 📝 Приклад використання API в коді

### Завантажити дані
```javascript
try {
  const items = await getItems();
  console.log(items);
} catch (error) {
  console.error('Помилка при завантаженні:', error);
}
```

### Створити елемент
```javascript
const newItem = await createItem({
  title: "Новий проект",
  category: "frontend",
  description: "...",
  rating: 4.5,
  level: "Середній",
  image: "...",
  date: "2026-06-03",
  technologies: ["HTML", "CSS"],
  featured: true
});
```

### Оновити елемент
```javascript
const updated = await updateItem(1, {
  title: "Оновлена назва",
  rating: 4.8
});
```

### Видалити елемент
```javascript
await deleteItem(1);
```

---

## 🎨 Інтерфейс каталогу

### Сторінка каталогу (catalog.html)
- Список проектів карточками
- Пошук, фільтрація, сортування
- Пагінація (6 на сторінку)
- Кнопки: Редагувати, Видалити
- Посилання на форму для створення нового проекту

### Форма керування (item-form.html)
- 9 полів для вводу даних
- Валідація усіх полів
- Режими: Створення (POST) та Редагування (PATCH)
- Кнопка видалення при редаганні
- Повідомлення про статус операції

---

## 🔍 Технічні особливості

### Async/Await та Error Handling
```javascript
async function getItems(params = {}) {
  try {
    const query = buildQueryString(params);
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Помилка: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Помилка в getItems:', error);
    throw error;
  }
}
```

### Headers для REST
```javascript
headers: {
  'Content-Type': 'application/json'
}
```

### FormData та JSON.stringify()
```javascript
const formData = new FormData(form);
const data = Object.fromEntries(formData.entries());
const response = await fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});
```

### Event Listeners (без inline обробників)
```javascript
form.addEventListener('submit', handleFormSubmit);
btn.addEventListener('click', handleDelete);
modal.addEventListener('click', handleModalClick);
```

---

## 🎯 Додаткові можливості (Бонусні завдання)

- ✓ Клієнтська валідація форм
- ✓ DELETE з підтвердженням (confirm())
- ✓ Пошук, фільтрація, сортування
- ✓ Пагінація з кнопками
- ✓ UI стани (loading, error, success, empty)
- ✓ Адаптивний дизайн
- ✓ Темна/світла тема
- ✓ Модульна структура коду

---

## 💡 Поради при розширенні

1. **Додати параметри URL**: Збережіть стан фільтрів у URL через `URLSearchParams`
2. **Оптимістичне оновлення**: Оновіть DOM до отримання відповіді сервера
3. **Сторінка деталей**: Створіть `item-details.html?id=1` для повної інформації
4. **Користувацькі підтвердження**: Замініть `confirm()` на кастомне модальне вікно
5. **JWT автентифікація**: Додайте headers з токеном для захищених операцій

---

## ✨ Тестування

### Тестові операції
1. Відкрити каталог — повинні завантажитися проекти
2. Клікнути "Редагувати" на будь-якому проекті
3. Змінити дані і натиснути "Оновити"
4. Повернутися на каталог — зміни повинні бути видимі
5. Клікнути "Видалити" — повинно попросити підтвердження
6. Після видалення — проект повинен зникнути зі списку

---

## 📚 Ресурси

- [JSON Server документація](https://github.com/typicode/json-server)
- [Fetch API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [Async/Await](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous/Async_await)
- [REST API Best Practices](https://restfulapi.net/)

---

**Дата завершення**: Червень 2026  
**Мова**: Українська  
**Автор**: Студент

#### ✅ 6. Фільтрація за категоріями
- Select для вибору категорії (Frontend, Backend, Design, Усі)
- Динамічне оновлення сітки
- Empty-state при відсутності результатів

#### ✅ 7. Сортування
- 7 варіантів сортування:
  - По даті (новіші/старіші)
  - По назві (А-Я / Я-А)
  - По рейтингу (спадаючи/зростаючи)
  - По рівню складності

#### ✅ 8. Система обраного (Favorites) з localStorage
- Кнопка серця на кожній карточці
- Збереження в localStorage ключ `projectFavorites`
- Перевірка стану при рендерингу
- Можливість додавання/видалення

#### ✅ 9. Пагінація
- Відображення по 6 елементів на сторінці
- Кнопки "Назад" / "Далі" та номери сторінок
- Коректна робота з фільтрами та пошуком

#### ✅ 10. Модальне вікно з деталями проекту
- Нажатя кнопки "Детально" відкриває модальне вікно
- Повна інформація про проект
- Кнопка додавання в обране
- Закриття на Escape та клік за межами вікна

## Структура проєкту

```
lab01-html/
├── index.html                    # Головна сторінка
├── README.md                     # Цей файл
├── pages/
│   ├── about.html               # Сторінка про мене (медіа)
│   ├── contact.html             # Сторінка контактної форми
│   ├── catalog.html             # Сторінка каталогу проектів
│   └── favorites.html           # Сторінка обраного
├── assets/
│   ├── img/                     # Зображення
│   │   └── test.jpg
│   ├── media/                   # Відео та аудіо
│   └── styles/
│       ├── style.css            # Основні стилі
│       └── responsive.css       # Адаптивність
├── js/
│   ├── main.js                  # Ініціалізація (меню, тема, модалі)
│   ├── api.js                   # Функції для роботи з даними
│   ├── catalog.js               # Логіка каталогу (рендеринг, фільтри)
│   ├── ui.js                    # (порожній)
│   ├── contact.js               # (порожній)
├── data/
│   └── projects.json            # JSON з даними каталогу
└── .git/                        # Git репозиторій
```

## Як використовувати

### Перегляд каталогу
1. Перейдіть на сторінку **Каталог** з головного меню
2. Використовуйте пошук для пошуку за назвою чи технологією
3. Фільтруйте за категоріями
4. Сортуйте за різними параметрами
5. Натисніть серце (♡) щоб додати в обране
6. Натисніть "Детально" для перегляду повної інформації

### Перегляд обраного
1. Перейдіть на сторінку **Обране**
2. Оглядайте збережені проекти
3. Видаліть з обраного натисканням на серце (♥)

### Функціональність localStorage
- **Тема**: зберігається тема користувача при перемиканні
- **Обране**: список ID обраних проектів
- **Чернетки форми**: дані форми контакту зберігаються автоматично

## Технології

- **HTML5** — Семантична розмітка
- **CSS3** — Стилізація з дизайн-системою з переменними
- **JavaScript** (Vanilla) — Асинхронність, DOM API, localStorage
- **JSON** — Структура даних
- **Fetch API** — Асинхронне завантаження

## Пояснення коду

### Асинхронна загрузка даних
```javascript
// api.js
async function loadProjects() {
  const response = await fetch('./data/projects.json');
  if (!response.ok) throw new Error('Помилка завантаження');
  return response.json();
}
```

### Рендеринг карток з масиву
```javascript
// catalog.js
const html = projects.map(project => `
  <article class="project-card">
    <h3>${project.title}</h3>
    <p>${project.description}</p>
  </article>
`).join('');
```

### Пошук та фільтрація
```javascript
function filterProjects(projects, query, category) {
  return projects.filter(p => {
    const matchQuery = p.title.toLowerCase().includes(query.toLowerCase());
    const matchCategory = category === 'all' || p.category === category;
    return matchQuery && matchCategory;
  });
}
```

### Система обраного
```javascript
// api.js
function toggleFavorite(projectId) {
  const favorites = getFavorites(); // Читання з localStorage
  const index = favorites.indexOf(projectId);
  index === -1 ? favorites.push(projectId) : favorites.splice(index, 1);
  saveFavorites(favorites); // Запис у localStorage
}
```

## Додаткові можливості для розширення

- Підключення реального API замість JSON
- Пошук за словом в URL параметрах
- Експорт обраного (CSV, PDF)
- Коментарі користувачів на проектах
- Рейтинг за голосуванням
- Темна тема за замовчуванням

## Автор

Практична робота для курсу JavaScript / Front-End розробки

