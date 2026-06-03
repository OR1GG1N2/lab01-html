document.addEventListener('DOMContentLoaded', init);

function init() {
  initActiveNav();
  initMenuToggle();
  initThemeToggle();
  initBackToTop();
  initAccordion();
  initFilters();
  initModal();
  initContactForm();
}

function initActiveNav() {
  const links = document.querySelectorAll('.main-nav a');
  const currentPath = window.location.pathname;
  links.forEach((link) => {
    const linkPath = new URL(link.href).pathname;
    if (linkPath === currentPath || currentPath.endsWith(linkPath)) {
      link.classList.add('is-active');
    }
  });
}

function initMenuToggle() {
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.main-nav');
  if (!menuToggle || !nav) return;

  menuToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });

  nav.addEventListener('click', (event) => {
    if (event.target.matches('a') && nav.classList.contains('is-open')) {
      nav.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

function initThemeToggle() {
  const button = document.querySelector('.theme-toggle');
  const body = document.body;
  if (!button) return;

  const storageKey = 'siteTheme';
  const savedTheme = localStorage.getItem(storageKey);
  if (savedTheme === 'light') {
    body.classList.add('theme-light');
  }

  button.addEventListener('click', () => {
    const isLight = body.classList.toggle('theme-light');
    localStorage.setItem(storageKey, isLight ? 'light' : 'dark');
  });
}

function initBackToTop() {
  const button = document.querySelector('.back-to-top');
  const footerText = document.querySelector('footer p');
  if (footerText) {
    const currentYear = new Date().getFullYear();
    footerText.textContent = `© ${currentYear}`;
  }
  if (!button) return;

  window.addEventListener('scroll', () => {
    button.hidden = window.scrollY < 220;
  });

  button.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

function initAccordion() {
  const buttons = document.querySelectorAll('.accordion-button');
  if (!buttons.length) return;

  buttons.forEach((button) => {
    const panel = button.nextElementSibling;
    button.addEventListener('click', () => {
      const isOpen = button.getAttribute('aria-expanded') === 'true';
      buttons.forEach((otherButton) => {
        if (otherButton !== button) {
          otherButton.setAttribute('aria-expanded', 'false');
          const otherPanel = otherButton.nextElementSibling;
          if (otherPanel) otherPanel.hidden = true;
        }
      });
      button.setAttribute('aria-expanded', String(!isOpen));
      if (panel) panel.hidden = isOpen;
    });
  });
}

function initFilters() {
  const buttons = document.querySelectorAll('.filter-button');
  const cards = document.querySelectorAll('.service-card');
  if (!buttons.length || !cards.length) return;

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      buttons.forEach((item) => item.classList.remove('is-active'));
      button.classList.add('is-active');
      const filter = button.dataset.filter;

      cards.forEach((card) => {
        const category = card.dataset.category;
        const isMatch = filter === 'all' || category === filter;
        card.hidden = !isMatch;
      });
    });
  });
}

function initModal() {
  const modal = document.querySelector('.modal');
  if (!modal) return;

  console.debug('initModal: initializing', modal);

  const overlay = modal.querySelector('.modal__overlay');
  const closeButton = modal.querySelector('.modal-close');
  const modalImage = modal.querySelector('img');
  const caption = modal.querySelector('.modal-caption');
  const heroImage = document.querySelector('#hero-image');
  if (!overlay || !modalImage || !caption) return;

  function closeModal() {
    modal.hidden = true;
    modalImage.src = '';
  }

  function openModal(source, text) {
    modalImage.src = source;
    modalImage.alt = text;
    caption.textContent = text;
    modal.hidden = false;
    console.debug('modal: opened', { source, text });
  }

  if (heroImage) {
    heroImage.addEventListener('click', () => {
      openModal(heroImage.src, heroImage.alt || 'Зображення');
    });
  }

  // direct listener on close button (fallback) and delegated listener on modal
  if (closeButton) {
    closeButton.addEventListener('click', (e) => {
      console.debug('modal: close button clicked', e);
      closeModal();
    });
  } else {
    console.debug('initModal: no closeButton found inside modal');
  }

  modal.addEventListener('click', (event) => {
    const target = event.target;
    if (target === overlay || target.closest('.modal-close')) {
      console.debug('modal: overlay or close detected', target);
      closeModal();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !modal.hidden) {
      closeModal();
    }
  });
}

function initContactForm() {
  const form = document.querySelector('#contact-form');
  if (!form) return;

  const nameField = form.querySelector('#name');
  const emailField = form.querySelector('#email');
  const messageField = form.querySelector('#message');
  const resultBox = form.querySelector('#contact-result');
  const nameError = form.querySelector('#name-error');
  const emailError = form.querySelector('#email-error');
  const messageError = form.querySelector('#message-error');
  const messageCount = form.querySelector('#message-count');
  const draftKey = 'contactDraft';
  const maxMessage = 500;

  const getDraft = () => {
    try {
      return JSON.parse(localStorage.getItem(draftKey) || '{}');
    } catch {
      return {};
    }
  };

  const saveDraft = () => {
    const draft = {
      name: nameField.value,
      email: emailField.value,
      phone: form.querySelector('#phone')?.value || '',
      topic: form.querySelector('#topic')?.value || '',
      way: form.querySelector('input[name="way"]:checked')?.value || 'email',
      message: messageField.value,
      agree: form.querySelector('#agree')?.checked || false,
    };
    localStorage.setItem(draftKey, JSON.stringify(draft));
  };

  const restoreDraft = () => {
    const draft = getDraft();
    if (!draft) return;
    if (draft.name) nameField.value = draft.name;
    if (draft.email) emailField.value = draft.email;
    if (draft.phone) form.querySelector('#phone').value = draft.phone || '';
    if (draft.topic) form.querySelector('#topic').value = draft.topic;
    if (draft.way) {
      const radio = form.querySelector(`input[name="way"][value="${draft.way}"]`);
      radio?.setAttribute('checked', 'checked');
      if (radio) radio.checked = true;
    }
    if (draft.message) messageField.value = draft.message;
    if (typeof draft.agree === 'boolean') {
      const agreeCheckbox = form.querySelector('#agree');
      if (agreeCheckbox) agreeCheckbox.checked = draft.agree;
    }
    updateMessageCount();
  };

  const updateMessageCount = () => {
    if (!messageCount) return;
    const length = messageField.value.length;
    messageCount.textContent = `${length} / ${maxMessage}`;
  };

  const showError = (element, message) => {
    if (!element) return;
    element.hidden = false;
    element.textContent = message;
  };

  const clearError = (element) => {
    if (!element) return;
    element.hidden = true;
    element.textContent = '';
  };

  const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const validateForm = () => {
    let isValid = true;
    if (!nameField.value.trim() || nameField.value.trim().length < 2) {
      showError(nameError, 'Ім’я має бути принаймні 2 символи.');
      isValid = false;
    } else {
      clearError(nameError);
    }

    if (!validateEmail(emailField.value.trim())) {
      showError(emailError, 'Введіть реальний email.');
      isValid = false;
    } else {
      clearError(emailError);
    }

    if (!messageField.value.trim()) {
      showError(messageError, 'Повідомлення не може бути пустим.');
      isValid = false;
    } else {
      clearError(messageError);
    }

    return isValid;
  };

  const resetForm = () => {
    form.reset();
    localStorage.removeItem(draftKey);
    updateMessageCount();
  };

  const handleInput = () => {
    updateMessageCount();
    saveDraft();
  };

  nameField.addEventListener('input', handleInput);
  emailField.addEventListener('input', handleInput);
  messageField.addEventListener('input', handleInput);
  form.querySelector('#phone')?.addEventListener('input', saveDraft);
  form.querySelector('#topic')?.addEventListener('change', saveDraft);
  form.querySelectorAll('input[name="way"]').forEach((radio) => {
    radio.addEventListener('change', saveDraft);
  });
  form.querySelector('#agree')?.addEventListener('change', saveDraft);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    resultBox.hidden = false;
    resultBox.innerHTML = `
      <strong>Повідомлення відправлено</strong>
      <p>Ім’я: ${escapeHtml(data.name || '')}</p>
      <p>Email: ${escapeHtml(data.email || '')}</p>
      <p>Тема: ${escapeHtml(data.topic || '')}</p>
      <p>Спосіб зв’язку: ${escapeHtml(data.way || '')}</p>
      <p>Повідомлення: ${escapeHtml(data.message || '')}</p>
    `;
    resetForm();
  });

  restoreDraft();
  updateMessageCount();
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
