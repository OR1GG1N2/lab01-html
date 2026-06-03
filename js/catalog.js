/**
 * catalog.js - Логика рендеринга и управления каталогом
 */

const ITEMS_PER_PAGE = 6;
let catalogState = {
  allProjects: [],
  filteredProjects: [],
  displayedProjects: [],
  currentPage: 1,
  searchQuery: '',
  selectedCategory: 'all',
  sortBy: 'date-newest',
};

// Показать состояние загрузки
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

// Показать состояние ошибки
function showErrorState(error) {
  const container = document.querySelector('[data-catalog]');
  if (!container) return;

  container.innerHTML = `
    <div class="error-state" role="alert">
      <h3>⚠️ Помилка при завантаженні</h3>
      <p>${error}</p>
      <button class="btn-primary" type="button" id="retry-button">Спробувати знову</button>
    </div>
  `;

  document.getElementById('retry-button')?.addEventListener('click', initCatalogPage);
}

// Показать состояние пустого результата
function showEmptyState() {
  const container = document.querySelector('[data-catalog]');
  if (!container) return;

  container.innerHTML = `
    <div class="empty-state">
      <h3>😔 Нічого не знайдено</h3>
      <p>Спробуйте змінити параметри пошуку або фільтрів</p>
      <button class="btn-primary" type="button" id="clear-filters-button">Очистити фільтри</button>
    </div>
  `;

  document.getElementById('clear-filters-button')?.addEventListener('click', resetFilters);
}

// Рендеринг карток проектов
function renderProjects(projects) {
  const container = document.querySelector('[data-catalog]');
  if (!container) return;

  if (projects.length === 0) {
    showEmptyState();
    return;
  }

  const cardsHTML = projects
    .map((project) => {
      const isFav = isFavorite(project.id);
      return `
        <article class="project-card" data-project-id="${project.id}">
          <div class="project-card__image">
            <img src="${project.image}" alt="${project.title}" loading="lazy">
            <div class="project-card__badge">${project.level}</div>
            <button 
              class="project-card__favorite ${isFav ? 'is-favorite' : ''}" 
              type="button" 
              aria-label="Додати в обране"
              data-favorite-btn
            >
              ♥
            </button>
          </div>
          <div class="project-card__content">
            <h3 class="project-card__title">${project.title}</h3>
            <p class="project-card__category">${project.category}</p>
            <p class="project-card__description">${project.description}</p>
            <div class="project-card__meta">
              <span class="project-card__rating">⭐ ${project.rating}</span>
              <span class="project-card__date">${new Date(project.date).toLocaleDateString('uk-UA')}</span>
            </div>
            <div class="project-card__technologies">
              ${project.technologies.map((tech) => `<span class="tech-tag">${tech}</span>`).join('')}
            </div>
            <button 
              class="btn-primary project-card__btn" 
              type="button"
              data-details-btn
            >
              Детально
            </button>
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

  // Добавить обработчики событий
  initCardEventHandlers();
}

// Рендеринг пагинации
function renderPagination() {
  const container = document.querySelector('[data-pagination]');
  if (!container) return;

  const totalPages = Math.ceil(catalogState.filteredProjects.length / ITEMS_PER_PAGE);

  if (totalPages <= 1) {
    container.innerHTML = '';
    return;
  }

  let html = '<div class="pagination">';

  // Кнопка "Предыдущая"
  if (catalogState.currentPage > 1) {
    html += `
      <button class="btn-pagination" type="button" data-page="prev">← Назад</button>
    `;
  }

  // Номера страниц
  for (let i = 1; i <= totalPages; i++) {
    const activeClass = i === catalogState.currentPage ? 'is-active' : '';
    html += `
      <button class="btn-pagination ${activeClass}" type="button" data-page="${i}">${i}</button>
    `;
  }

  // Кнопка "Следующая"
  if (catalogState.currentPage < totalPages) {
    html += `
      <button class="btn-pagination" type="button" data-page="next">Далі →</button>
    `;
  }

  html += '</div>';
  container.innerHTML = html;

  // Добавить обработчики
  container.querySelectorAll('button').forEach((btn) => {
    btn.addEventListener('click', handlePaginationClick);
  });
}

// Обработка клика по пагинации
function handlePaginationClick(e) {
  const btn = e.target;
  const page = btn.dataset.page;

  if (page === 'prev') {
    catalogState.currentPage = Math.max(1, catalogState.currentPage - 1);
  } else if (page === 'next') {
    const totalPages = Math.ceil(catalogState.filteredProjects.length / ITEMS_PER_PAGE);
    catalogState.currentPage = Math.min(totalPages, catalogState.currentPage + 1);
  } else {
    catalogState.currentPage = parseInt(page);
  }

  updateCatalogDisplay();
  window.scrollTo({ top: document.querySelector('[data-catalog]')?.offsetTop - 100, behavior: 'smooth' });
}

// Обновить отображение каталога
function updateCatalogDisplay() {
  const start = (catalogState.currentPage - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  catalogState.displayedProjects = catalogState.filteredProjects.slice(start, end);

  renderProjects(catalogState.displayedProjects);
  renderPagination();
}

// Применить фильтры и поиск
function applyFiltersAndSearch() {
  let filtered = filterProjects(
    catalogState.allProjects,
    catalogState.searchQuery,
    catalogState.selectedCategory
  );

  filtered = sortProjects(filtered, catalogState.sortBy);

  catalogState.filteredProjects = filtered;
  catalogState.currentPage = 1;

  updateCatalogDisplay();
}

// Очистить фільтри
function resetFilters() {
  catalogState.searchQuery = '';
  catalogState.selectedCategory = 'all';
  catalogState.sortBy = 'date-newest';
  catalogState.currentPage = 1;

  // Обновить входные значения
  const searchInput = document.querySelector('[data-search]');
  const categorySelect = document.querySelector('[data-category-filter]');
  const sortSelect = document.querySelector('[data-sort]');

  if (searchInput) searchInput.value = '';
  if (categorySelect) categorySelect.value = 'all';
  if (sortSelect) sortSelect.value = 'date-newest';

  applyFiltersAndSearch();
}

// Инициализация обработчиков событий карточек
function initCardEventHandlers() {
  // Обработчик избранного
  document.querySelectorAll('[data-favorite-btn]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const card = btn.closest('[data-project-id]');
      const projectId = parseInt(card.dataset.projectId);

      toggleFavorite(projectId);
      btn.classList.toggle('is-favorite');
    });
  });

  // Обработчик "Детально"
  document.querySelectorAll('[data-details-btn]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const card = btn.closest('[data-project-id]');
      const projectId = parseInt(card.dataset.projectId);
      showProjectDetails(projectId);
    });
  });
}

// Показать детали проекта в модальном окне
function showProjectDetails(projectId) {
  const project = getProjectById(catalogState.allProjects, projectId);
  if (!project) return;

  const modal = document.querySelector('[data-details-modal]');
  if (!modal) {
    console.warn('Modal not found');
    return;
  }

  const isFav = isFavorite(projectId);

  const content = modal.querySelector('[data-modal-content]');
  if (content) {
    content.innerHTML = `
      <div class="modal-header">
        <h2>${project.title}</h2>
        <button class="modal-close" type="button" aria-label="Закрити">×</button>
      </div>
      <div class="modal-body">
        <img src="${project.image}" alt="${project.title}" class="modal-image">
        <div class="project-details">
          <p><strong>Категорія:</strong> ${project.category}</p>
          <p><strong>Рівень:</strong> ${project.level}</p>
          <p><strong>Рейтинг:</strong> ⭐ ${project.rating}</p>
          <p><strong>Дата:</strong> ${new Date(project.date).toLocaleDateString('uk-UA')}</p>
          <p><strong>Опис:</strong> ${project.description}</p>
          <div class="technologies-list">
            <strong>Технології:</strong>
            ${project.technologies.map((tech) => `<span class="tech-tag">${tech}</span>`).join('')}
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button 
          class="btn-primary ${isFav ? 'is-favorite' : ''}" 
          type="button"
          id="modal-favorite-btn"
        >
          ${isFav ? '♥ Видалити з обраного' : '♡ Додати в обране'}
        </button>
        <button class="btn-secondary modal-close-btn" type="button">Закрити</button>
      </div>
    `;
  }

  modal.hidden = false;

  // Обработчики кнопок модального окна
  modal.querySelector('.modal-close')?.addEventListener('click', () => {
    modal.hidden = true;
  });

  modal.querySelector('.modal-close-btn')?.addEventListener('click', () => {
    modal.hidden = true;
  });

  document.getElementById('modal-favorite-btn')?.addEventListener('click', () => {
    toggleFavorite(projectId);
    showProjectDetails(projectId); // Перерендерить
  });

  // Закрыть по нажатию Esc
  const handleEsc = (e) => {
    if (e.key === 'Escape') {
      modal.hidden = true;
      document.removeEventListener('keydown', handleEsc);
    }
  };
  document.addEventListener('keydown', handleEsc);

  // Закрыть по клику на фон
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.hidden = true;
    }
  });
}

// Инициализация каталога
async function initCatalogPage() {
  const container = document.querySelector('[data-catalog]');
  if (!container) return;

  try {
    showLoadingState();

    // Загрузить данные
    catalogState.allProjects = await loadProjects();

    if (catalogState.allProjects.length === 0) {
      showEmptyState();
      return;
    }

    // Инициализировать фильтры
    initCatalogControls();

    // Отобразить первый набор
    applyFiltersAndSearch();
  } catch (error) {
    showErrorState(error.message);
  }
}

// Инициализация элементов управления каталогом
function initCatalogControls() {
  // Поиск
  const searchInput = document.querySelector('[data-search]');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      catalogState.searchQuery = e.target.value;
      applyFiltersAndSearch();
    });
  }

  // Фильтр по категориям
  const categorySelect = document.querySelector('[data-category-filter]');
  if (categorySelect) {
    categorySelect.addEventListener('change', (e) => {
      catalogState.selectedCategory = e.target.value;
      applyFiltersAndSearch();
    });
  }

  // Сортировка
  const sortSelect = document.querySelector('[data-sort]');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      catalogState.sortBy = e.target.value;
      applyFiltersAndSearch();
    });
  }
}
