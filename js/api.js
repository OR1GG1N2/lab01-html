/**
 * api.js - REST API функції для CRUD операцій
 * Працює з локальним json-server на порту 3000
 */

const API_BASE_URL = 'http://localhost:3000/items';

/**
 * GET /items - Отримати список усіх елементів
 * @param {Object} params - Параметри запиту (q, category, _sort, _order, _page, _limit)
 * @returns {Promise<Array>} Масив елементів
 */
async function getItems(params = {}) {
  try {
    const query = buildQueryString(params);
    const url = query ? `${API_BASE_URL}?${query}` : API_BASE_URL;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Помилка при завантаженні: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Помилка в getItems:', error);
    throw error;
  }
}

/**
 * GET /items/:id - Отримати один елемент за ID
 * @param {number} id - ID елемента
 * @returns {Promise<Object>} Об'єкт елемента
 */
async function getItemById(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`);
    if (!response.ok) {
      throw new Error(`Елемент не знайдено: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Помилка в getItemById:', error);
    throw error;
  }
}

/**
 * POST /items - Створити новий елемент
 * @param {Object} data - Дані нового елемента
 * @returns {Promise<Object>} Новий елемент з ID від сервера
 */
async function createItem(data) {
  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`Помилка при створенні: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Помилка в createItem:', error);
    throw error;
  }
}

/**
 * PATCH /items/:id - Оновити елемент
 * @param {number} id - ID елемента
 * @param {Object} data - Дані для оновлення
 * @returns {Promise<Object>} Оновлений елемент
 */
async function updateItem(id, data) {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`Помилка при оновленні: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Помилка в updateItem:', error);
    throw error;
  }
}

/**
 * DELETE /items/:id - Видалити елемент
 * @param {number} id - ID елемента для видалення
 * @returns {Promise<void>}
 */
async function deleteItem(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`Помилка при видаленні: ${response.status}`);
    }
  } catch (error) {
    console.error('Помилка в deleteItem:', error);
    throw error;
  }
}

/**
 * Побудувати query string з параметрів
 * @param {Object} params
 * @returns {string}
 */
function buildQueryString(params = {}) {
  const searchParams = new URLSearchParams();
  
  if (params.q) searchParams.set('q', params.q);
  if (params.category && params.category !== 'all') {
    searchParams.set('category', params.category);
  }
  if (params._sort) searchParams.set('_sort', params._sort);
  if (params._order) searchParams.set('_order', params._order);
  if (params._page) searchParams.set('_page', params._page);
  if (params._limit) searchParams.set('_limit', params._limit);
  
  return searchParams.toString();
}

/**
 * Отримати унікальні категорії з даних
 * @param {Array} items - Масив елементів
 * @returns {Array}
 */
function getCategories(items) {
  if (!Array.isArray(items)) return ['all'];
  const categories = [...new Set(items.map((p) => p.category).filter(Boolean))];
  return ['all', ...categories];
}
