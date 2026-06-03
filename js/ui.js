/**
 * ui.js - UI компоненти та модальні вікна
 */

/**
 * Ініціалізація модальних вікон
 */
function initModal() {
  const modal = document.querySelector('[data-details-modal]');
  if (!modal) return;

  // Закрити по кліку на фон
  modal.addEventListener('click', (e) => {
    if (e.target === modal || e.target.classList.contains('modal-overlay')) {
      modal.setAttribute('hidden', '');
    }
  });

  // Закрити по ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.hasAttribute('hidden')) {
      modal.setAttribute('hidden', '');
    }
  });
}
