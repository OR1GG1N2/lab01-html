/**
 * catalog.js - Логіка рендеринга та керування каталогом через REST API
 */

const ITEMS_PER_PAGE = 6;
let catalogState = {
  allItems: [],
  filteredItems: [],
  displayedItems: [],
  currentPage: 1,
  searchQuery: '',
  selectedCategory: 'all',
  sortBy: 'date-newest',
  sortOrder: 'DESC',
};

/**
 * Ініціалізація сторінки каталогу
 */
async function initCatalogPage() {
  const container = document.querySelector('[data-catalog]');
  if (!container) return;

  try {
    showLoadingState();

    // Завантажити дані з API
    catalogState.allItems = await getItems();

    if (catalogState.allItems.length === 0) {
      showEmptyState();
      return;
    }

    // Ініціалізувати контролі фільтрації
    initCatalogControls();

    // Відобразити перший набір
    applyFiltersAndSearch();
  } catch (error) {
    showErrorState(error.message);
  }
}

/**
 * Показати стан завантаження
 */
function showLoadingState() {
  const container = document.querySelector('[data-catalog]');
  if (!container) return;

  container.innerHTML = `
    <div class="loading-state">
      <p>Завантаження проектів...</p>
      <div class="spinner"></div>
    </div>
  `;
}

/**
 * Показати стан помилки
 */
function showErrorState(error) {
  const container = document.querySelector('[data-catalog]');
  if (!container) return;

  container.innerHTML = `
    <div class="error-state" role="alert">
      <h3>⚠️ Помилка при завантаженні</h3>
      <p>${error}</p>
      <button class="btn-primary" type="button" id="retry-button">Спробувати знову</button>
      <a href="item-form.html" class="btn-primary">+ Додати новий проект</a>
    </div>
  `;

  document.getElementById('retry-button')?.addEventListener('click', initCatalogPage);
}

/**
 * Показати стан порожнього результату
 */
function showEmptyState() {
  const container = document.querySelector('[data-catalog]');
  if (!container) return;

  container.innerHTML = `
    <div class="empty-state">
      <h3>😔 Нічого не знайдено</h3>
      <p>Спробуйте змінити параметри пошуку або фільтрів</p>
      <button class="btn-primary" type="button" id="clear-filters-button">Очистити фільтри</button>
      <a href="item-form.html" class="btn-primary">+ Додати новий проект</a>
    </div>
  `;

  document.getElementById('clear-filters-button')?.addEventListener('click', resetFilters);
}

/**
 * Рендерити картки проектів
 */
function renderProjects(items) {
  const container = document.querySelector('[data-catalog]');
  if (!container) return;

  if (items.length === 0) {
    showEmptyState();
    return;
  }

  const cardsHTML = items
    .map((item) => {
      const technologiesHTML = Array.isArray(item.technologies)
        ? item.technologies.map((tech) => `<span class="tech-tag">${tech}</span>`).join('')
        : '';

      return `
        <article class="project-card" data-project-id="${item.id}">
          <div class="project-card__image">
            <img src="${item.image}" alt="${item.title}" loading="lazy">
            <div class="project-card__badge">${item.level}</div>
          </div>
          <div class="project-card__content">
            <h3 class="project-card__title">${item.title}</h3>
            <p class="project-card__category">${item.category}</p>
            <p class="project-card__description">${item.description}</p>
            <div class="project-card__meta">
              <span class="project-card__rating">⭐ ${item.rating}</span>
              <span class="project-card__date">${new Date(item.date).toLocaleDateString('uk-UA')}</span>
            </div>
            <div class="project-card__technologies">
              ${technologiesHTML}
            </div>
            <div class="project-card__actions">
              <a href="item-form.html?id=${item.id}" class="btn-primary">Редагувати</a>
              <button class="btn-danger" type="button" data-delete-btn="${item.id}">Видалити</button>
            </div>
          </div>
        </article>
      `;
    })
    .join('');

  container.innerHTML = `
    <div class="projects-grid">
      ${cardsHTML}
    </div>
  `;

  // Ініціалізувати обробники подій
  initCardEventHandlers();
}

/**
 * Рендерити пагінацію
 */
function renderPagination() {
  const container = document.querySelector('[data-pagination]');
  if (!container) return;

  const totalPages = Math.ceil(catalogState.filteredItems.length / ITEMS_PER_PAGE);

  if (totalPages <= 1) {
    container.innerHTML = '';
    return;
  }

  let html = '<div class="pagination">';

  // Кнопка "Назад"
  if (catalogState.currentPage > 1) {
    html += `
      <button class="btn-pagination" type="button" data-page="prev">← Назад</button>
    `;
  }

  // Номери сторінок
  for (let i = 1; i <= totalPages; i++) {
    const activeClass = i === catalogState.currentPage ? 'is-active' : '';
    html += `
      <button class="btn-pagination ${activeClass}" type="button" data-page="${i}">${i}</button>
    `;
  }

  // Кнопка "Далі"
  if (catalogState.currentPage < totalPages) {
    html += `
      <button class="btn-pagination" type="button" data-page="next">Далі →</button>
    `;
  }

  html += '</div>';
  container.innerHTML = html;

  // Ініціалізувати обробники
  container.querySelectorAll('button').forEach((btn) => {
    btn.addEventListener('click', handlePaginationClick);
  });
}

/**
 * Обробити клік по пагінації
 */
function handlePaginationClick(e) {
  const btn = e.target;
  const page = btn.dataset.page;

  if (page === 'prev') {
    catalogState.currentPage = Math.max(1, catalogState.currentPage - 1);
  } else if (page === 'next') {
    const totalPages = Math.ceil(catalogState.filteredItems.length / ITEMS_PER_PAGE);
    catalogState.currentPage = Math.min(totalPages, catalogState.currentPage + 1);
  } else {
    catalogState.currentPage = parseInt(page);
  }

  updateCatalogDisplay();
  window.scrollTo({ top: document.querySelector('[data-catalog]')?.offsetTop - 100, behavior: 'smooth' });
}

/**
 * Оновити відображення каталогу
 */
function updateCatalogDisplay() {
  const start = (catalogState.currentPage - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  catalogState.displayedItems = catalogState.filteredItems.slice(start, end);

  renderProjects(catalogState.displayedItems);
  renderPagination();
}

/**
 * Застосувати фільтри та пошук (клієнтська фільтрація для локальних даних)
 */
function applyFiltersAndSearch() {
  let filtered = catalogState.allItems;

  // Фільтрація за пошуком
  if (catalogState.searchQuery.trim()) {
    const query = catalogState.searchQuery.toLowerCase();
    filtered = filtered.filter(item => {
      const matchesTitle = item.title.toLowerCase().includes(query);
      const matchesDescription = item.description.toLowerCase().includes(query);
      const matchesTech = Array.isArray(item.technologies) && 
        item.technologies.some(tech => tech.toLowerCase().includes(query));
      return matchesTitle || matchesDescription || matchesTech;
    });
  }

  // Фільтрація за категорією
  if (catalogState.selectedCategory !== 'all') {
    filtered = filtered.filter(item => item.category === catalogState.selectedCategory);
  }

  // Сортування
  filtered = sortItems(filtered, catalogState.sortBy);

  catalogState.filteredItems = filtered;
  catalogState.currentPage = 1;

  updateCatalogDisplay();
}

/**
 * Сортувати елементи
 */
function sortItems(items, sortBy) {
  const copy = [...items];

  switch (sortBy) {
    case 'title-asc':
      copy.sort((a, b) => a.title.localeCompare(b.title, 'uk'));
      break;
    case 'title-desc':
      copy.sort((a, b) => b.title.localeCompare(a.title, 'uk'));
      break;
    case 'rating-desc':
      copy.sort((a, b) => b.rating - a.rating);
      break;
    case 'rating-asc':
      copy.sort((a, b) => a.rating - b.rating);
      break;
    case 'date-newest':
      copy.sort((a, b) => new Date(b.date) - new Date(a.date));
      break;
    case 'date-oldest':
      copy.sort((a, b) => new Date(a.date) - new Date(b.date));
      break;
    case 'level':
      const levelOrder = { 'Новачок': 1, 'Середній': 2, 'Продвинений': 3 };
      copy.sort((a, b) => (levelOrder[a.level] || 0) - (levelOrder[b.level] || 0));
      break;
    default:
      break;
  }

  return copy;
}

/**
 * Очистити фільтри
 */
function resetFilters() {
  catalogState.searchQuery = '';
  catalogState.selectedCategory = 'all';
  catalogState.sortBy = 'date-newest';
  catalogState.currentPage = 1;

  // Оновити вхідні значення
  const searchInput = document.querySelector('[data-search]');
  const categorySelect = document.querySelector('[data-category-filter]');
  const sortSelect = document.querySelector('[data-sort]');

  if (searchInput) searchInput.value = '';
  if (categorySelect) categorySelect.value = 'all';
  if (sortSelect) sortSelect.value = 'date-newest';

  applyFiltersAndSearch();
}

/**
 * Ініціалізувати обробники подій карток
 */
function initCardEventHandlers() {
  // Обробник видалення
  document.querySelectorAll('[data-delete-btn]').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      const itemId = parseInt(btn.dataset.deleteBtn);
      if (confirm('Ви впевнені, що хочете видалити цей проект?')) {
        try {
          btn.disabled = true;
          btn.textContent = 'Видалення...';
          await deleteItem(itemId);
          
          // Оновити список
          catalogState.allItems = catalogState.allItems.filter(item => item.id !== itemId);
          applyFiltersAndSearch();
        } catch (error) {
          alert(`Помилка при видаленні: ${error.message}`);
          btn.disabled = false;
          btn.textContent = 'Видалити';
        }
      }
    });
  });
}

/**
 * Ініціалізувати контролі каталогу
 */
function initCatalogControls() {
  // Пошук
  const searchInput = document.querySelector('[data-search]');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      catalogState.searchQuery = e.target.value;
      applyFiltersAndSearch();
    });
  }

  // Фільтр за категоріями
  const categorySelect = document.querySelector('[data-category-filter]');
  if (categorySelect) {
    categorySelect.addEventListener('change', (e) => {
      catalogState.selectedCategory = e.target.value;
      applyFiltersAndSearch();
    });
  }

  // Сортування
  const sortSelect = document.querySelector('[data-sort]');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      catalogState.sortBy = e.target.value;
      applyFiltersAndSearch();
    });
  }

  // Додати кнопку для створення нового проекту
  const controlsSection = document.querySelector('.controls-section');
  if (controlsSection && !controlsSection.querySelector('[href="item-form.html"]')) {
    const addBtn = document.createElement('a');
    addBtn.href = 'item-form.html';
    addBtn.className = 'btn-primary';
    addBtn.textContent = '+ Додати новий проект';
    addBtn.style.marginLeft = 'auto';
    controlsSection.querySelector('.controls-group')?.appendChild(addBtn);
  }
}
