/**
 * form.js - Логіка для створення та редагування елементів
 */

let formState = {
  mode: 'create', // 'create' або 'edit'
  editingId: null,
  isSubmitting: false,
};

/**
 * Ініціалізація сторінки форми
 */
async function initItemFormPage() {
  const form = document.querySelector('[data-item-form]');
  if (!form) return;

  const cancelBtn = document.getElementById('cancelBtn');
  const deleteBtn = document.querySelector('[data-delete-btn]');

  // Перевірити, чи це редагування за URL параметром
  const urlParams = new URLSearchParams(window.location.search);
  const editId = urlParams.get('id');

  if (editId) {
    await loadItemForEdit(parseInt(editId));
  }

  form.addEventListener('submit', handleFormSubmit);
  cancelBtn?.addEventListener('click', () => {
    window.history.back();
  });

  deleteBtn?.addEventListener('click', showDeleteConfirmation);
}

/**
 * Завантажити дані елемента для редагування
 */
async function loadItemForEdit(id) {
  try {
    showLoadingState('form');
    const item = await getItemById(id);
    
    formState.mode = 'edit';
    formState.editingId = id;

    // Заповнити форму даними
    populateForm(item);
    updateFormTitle();
    showDeleteButton();
  } catch (error) {
    showErrorMessage(error.message);
  } finally {
    hideLoadingState('form');
  }
}

/**
 * Заповнити форму даними елемента
 */
function populateForm(item) {
  const form = document.querySelector('[data-item-form]');
  if (!form) return;

  form.querySelector('[name="title"]').value = item.title || '';
  form.querySelector('[name="category"]').value = item.category || '';
  form.querySelector('[name="description"]').value = item.description || '';
  form.querySelector('[name="rating"]').value = item.rating || '';
  form.querySelector('[name="level"]').value = item.level || '';
  form.querySelector('[name="image"]').value = item.image || '';
  form.querySelector('[name="date"]').value = item.date || '';
  form.querySelector('[name="featured"]').checked = item.featured || false;
  
  if (Array.isArray(item.technologies)) {
    form.querySelector('[name="technologies"]').value = item.technologies.join(', ');
  }
}

/**
 * Оновити заголовок форми
 */
function updateFormTitle() {
  const title = document.querySelector('[data-form-title]');
  if (title) {
    title.textContent = formState.mode === 'edit' 
      ? 'Редагувати проект' 
      : 'Додати новий проект';
  }

  const submitBtn = document.querySelector('[data-submit-btn]');
  if (submitBtn) {
    submitBtn.textContent = formState.mode === 'edit' 
      ? 'Оновити' 
      : 'Додати';
  }
}

/**
 * Показати кнопку видалення при редаганні
 */
function showDeleteButton() {
  const deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.className = 'btn-danger';
  deleteBtn.textContent = 'Видалити';
  deleteBtn.setAttribute('data-delete-btn', '');
  deleteBtn.addEventListener('click', showDeleteConfirmation);

  const buttons = document.querySelector('.form-buttons');
  if (buttons && !buttons.querySelector('[data-delete-btn]')) {
    buttons.insertBefore(deleteBtn, buttons.firstChild);
  }
}

/**
 * Обробити відправку форми
 */
async function handleFormSubmit(event) {
  event.preventDefault();

  if (formState.isSubmitting) return;

  const form = event.target;
  
  // Валідація форми
  if (!validateForm(form)) {
    showErrorMessage('Будь ласка, заповніть усі обов\'язкові поля коректно');
    return;
  }

  try {
    formState.isSubmitting = true;
    setFormDisabled(true);
    showLoadingState('form');

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Перетворити дані в правильний формат
    data.rating = parseFloat(data.rating);
    data.featured = form.querySelector('[name="featured"]').checked;
    
    if (data.technologies.trim()) {
      data.technologies = data.technologies
        .split(',')
        .map(t => t.trim())
        .filter(t => t);
    } else {
      data.technologies = [];
    }

    let result;
    if (formState.mode === 'create') {
      result = await createItem(data);
    } else {
      result = await updateItem(formState.editingId, data);
    }

    showSuccessMessage(
      formState.mode === 'create' 
        ? 'Проект успішно створено!' 
        : 'Проект успішно оновлено!'
    );

    // Перенаправити на каталог після успіху
    setTimeout(() => {
      window.location.href = 'catalog.html';
    }, 1500);

  } catch (error) {
    showErrorMessage(`Помилка: ${error.message}`);
  } finally {
    formState.isSubmitting = false;
    setFormDisabled(false);
    hideLoadingState('form');
  }
}

/**
 * Валідація форми
 */
function validateForm(form) {
  let isValid = true;
  const errorElements = form.querySelectorAll('[data-error]');
  
  errorElements.forEach(el => el.textContent = '');

  const requiredFields = form.querySelectorAll('[required]');
  requiredFields.forEach(field => {
    if (!field.value.trim()) {
      isValid = false;
      const errorEl = form.querySelector(`[data-error="${field.name}"]`);
      if (errorEl) {
        errorEl.textContent = 'Це поле обов\'язкове';
      }
    }
  });

  // Додаткова валідація для рейтингу
  const ratingField = form.querySelector('[name="rating"]');
  if (ratingField && ratingField.value) {
    const rating = parseFloat(ratingField.value);
    if (isNaN(rating) || rating < 1 || rating > 5) {
      isValid = false;
      const errorEl = form.querySelector('[data-error="rating"]');
      if (errorEl) {
        errorEl.textContent = 'Рейтинг має бути від 1 до 5';
      }
    }
  }

  // Валідація URL зображення
  const imageField = form.querySelector('[name="image"]');
  if (imageField && imageField.value.trim()) {
    try {
      new URL(imageField.value);
    } catch {
      isValid = false;
      const errorEl = form.querySelector('[data-error="image"]');
      if (errorEl) {
        errorEl.textContent = 'Введіть коректний URL';
      }
    }
  }

  return isValid;
}

/**
 * Показати підтвердження видалення
 */
function showDeleteConfirmation() {
  const modal = document.querySelector('[data-delete-confirm]');
  if (!modal) return;

  modal.removeAttribute('hidden');

  const confirmBtn = modal.querySelector('[data-confirm-delete]');
  const cancelBtn = modal.querySelector('[data-cancel-delete]');
  const overlay = modal.querySelector('.modal-overlay');

  const cleanup = () => {
    modal.setAttribute('hidden', '');
    confirmBtn?.removeEventListener('click', handleDelete);
    cancelBtn?.removeEventListener('click', cleanup);
    overlay?.removeEventListener('click', cleanup);
    document.removeEventListener('keydown', handleEscape);
  };

  const handleEscape = (e) => {
    if (e.key === 'Escape') cleanup();
  };

  confirmBtn?.addEventListener('click', handleDelete);
  cancelBtn?.addEventListener('click', cleanup);
  overlay?.addEventListener('click', cleanup);
  document.addEventListener('keydown', handleEscape);
}

/**
 * Обробити видалення елемента
 */
async function handleDelete() {
  try {
    setFormDisabled(true);
    showLoadingState('form');

    await deleteItem(formState.editingId);

    showSuccessMessage('Проект успішно видалено!');

    setTimeout(() => {
      window.location.href = 'catalog.html';
    }, 1500);

  } catch (error) {
    showErrorMessage(`Помилка при видаленні: ${error.message}`);
    setFormDisabled(false);
    hideLoadingState('form');
  }
}

/**
 * Встановити стан disabled для всіх контролів форми
 */
function setFormDisabled(disabled) {
  const form = document.querySelector('[data-item-form]');
  if (!form) return;

  const controls = form.querySelectorAll('input, select, textarea, button');
  controls.forEach(control => {
    control.disabled = disabled;
  });
}

/**
 * Показати повідомлення про успіх
 */
function showSuccessMessage(message) {
  const statusEl = document.querySelector('[data-form-status]');
  if (!statusEl) return;

  statusEl.textContent = message;
  statusEl.className = 'status-message success-message';
  statusEl.removeAttribute('hidden');
}

/**
 * Показати повідомлення про помилку
 */
function showErrorMessage(message) {
  const statusEl = document.querySelector('[data-form-status]');
  if (!statusEl) return;

  statusEl.textContent = message;
  statusEl.className = 'status-message error-message';
  statusEl.removeAttribute('hidden');

  setTimeout(() => {
    statusEl.setAttribute('hidden', '');
  }, 5000);
}

/**
 * Показати стан завантаження
 */
function showLoadingState(scope = 'form') {
  const form = document.querySelector('[data-item-form]');
  if (!form) return;
  
  setFormDisabled(true);
}

/**
 * Приховати стан завантаження
 */
function hideLoadingState(scope = 'form') {
  const form = document.querySelector('[data-item-form]');
  if (!form) return;
  
  setFormDisabled(false);
}
