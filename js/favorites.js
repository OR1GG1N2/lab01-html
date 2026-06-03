/**
 * favorites.js - Управление страницей избранного
 */

let allProjects = [];

// Инициализация страницы избранного
async function initFavoritesPage() {
  const container = document.querySelector('[data-favorites-container]');
  if (!container) return;

  try {
    allProjects = await loadProjects();
    renderFavorites();
  } catch (error) {
    container.innerHTML = `
      <div class="error-state" role="alert">
        <h3>⚠️ Помилка при завантаженні</h3>
        <p>${error.message}</p>
      </div>
    `;
  }
}

// Рендеринг избранных проектов
function renderFavorites() {
  const container = document.querySelector('[data-favorites-container]');
  if (!container) return;

  const favorites = getFavorites();

  if (favorites.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>🔖 Обране порожньо</h3>
        <p>Додайте проекти у обране для того щоб вони з'явились тут</p>
        <a href="catalog.html" class="btn-primary">Перейти до каталогу</a>
      </div>
    `;
    return;
  }

  const favoriteProjects = allProjects.filter((p) => favorites.includes(p.id));

  const cardsHTML = favoriteProjects
    .map((project) => {
      return `
        <article class="project-card" data-project-id="${project.id}">
          <div class="project-card__image">
            <img src="${project.image}" alt="${project.title}" loading="lazy">
            <div class="project-card__badge">${project.level}</div>
            <button 
              class="project-card__favorite is-favorite" 
              type="button" 
              aria-label="Видалити з обраного"
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

  // Добавить обработчики
  initFavoritesEventHandlers();
}

// Инициализация обработчиков событий на странице избранного
function initFavoritesEventHandlers() {
  // Обработчик удаления из избранного
  document.querySelectorAll('[data-favorite-btn]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const card = btn.closest('[data-project-id]');
      const projectId = parseInt(card.dataset.projectId);

      toggleFavorite(projectId);
      renderFavorites(); // Перерендерить список
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

// Инициализация при загрузке документа
document.addEventListener('DOMContentLoaded', () => {
  initActiveNav();
  initMenuToggle();
  initThemeToggle();
  initBackToTop();
  initModal();
  initFavoritesPage();
});
