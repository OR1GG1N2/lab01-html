/**
 * api.js - Асинхронные функции для работы с данными
 */

// Загрузка проектов из JSON
async function loadProjects() {
  try {
    const response = await fetch('./data/projects.json');
    if (!response.ok) {
      throw new Error(`Помилка при завантаженні: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Помилка при завантаженні даних:', error);
    throw error;
  }
}

// Получение проекта по ID
function getProjectById(projects, id) {
  return projects.find((project) => project.id === parseInt(id));
}

// Получение уникальных категорий
function getCategories(projects) {
  const categories = [...new Set(projects.map((p) => p.category))];
  return ['all', ...categories];
}

// Фильтрация проектов по поиску и категориям
function filterProjects(projects, searchQuery, category) {
  return projects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.technologies.some((tech) =>
        tech.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesCategory = category === 'all' || project.category === category;

    return matchesSearch && matchesCategory;
  });
}

// Сортировка проектов
function sortProjects(projects, sortBy) {
  const copy = [...projects];

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
      copy.sort((a, b) => levelOrder[a.level] - levelOrder[b.level]);
      break;
    default:
      break;
  }

  return copy;
}

// Получение избранных проектов из localStorage
function getFavorites() {
  const stored = localStorage.getItem('projectFavorites') || '[]';
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

// Сохранение избранных в localStorage
function saveFavorites(favorites) {
  localStorage.setItem('projectFavorites', JSON.stringify(favorites));
}

// Добавление/удаление из избранного
function toggleFavorite(projectId) {
  const favorites = getFavorites();
  const index = favorites.indexOf(projectId);

  if (index === -1) {
    favorites.push(projectId);
  } else {
    favorites.splice(index, 1);
  }

  saveFavorites(favorites);
  return favorites;
}

// Проверка, добавлен ли проект в избранное
function isFavorite(projectId) {
  const favorites = getFavorites();
  return favorites.includes(projectId);
}
