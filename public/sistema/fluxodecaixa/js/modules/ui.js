// Módulo de interface do usuário (tema, sidebar, modal, toasts)
window.UI = (function() {
  // --- Tema (Dark/Light) ---
  function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    updateThemeIcon(next);
  }

  function updateThemeIcon(theme) {
    const icon = document.querySelector('#dark-mode-toggle i');
    if (icon) {
      icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
  }

  // --- Sidebar e menu mobile ---
  function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    const menuToggle = document.getElementById('menu-toggle');
    const closeSidebar = document.getElementById('close-sidebar');

    function openSidebar() {
      sidebar.classList.add('open');
      overlay.classList.add('active');
    }
    function closeSidebarFn() {
      sidebar.classList.remove('open');
      overlay.classList.remove('active');
    }

    menuToggle?.addEventListener('click', openSidebar);
    closeSidebar?.addEventListener('click', closeSidebarFn);
    overlay?.addEventListener('click', closeSidebarFn);

    // Fechar sidebar ao clicar em qualquer link (mobile)
    sidebar?.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 991) {
          closeSidebarFn();
        }
      });
    });
  }

  // --- Modal ---
  function showModal(title, contentHtml) {
    const container = document.getElementById('modal-container');
    if (!container) return;
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = contentHtml;
    container.classList.remove('hidden');
  }

  function hideModal() {
    document.getElementById('modal-container')?.classList.add('hidden');
  }

  function initModal() {
    document.getElementById('modal-close')?.addEventListener('click', hideModal);
    const container = document.getElementById('modal-container');
    container?.addEventListener('click', (e) => {
      if (e.target === container) hideModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') hideModal();
    });
  }

  // --- Toast de notificação ---
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: var(--bg-card);
      color: var(--text-primary);
      padding: 0.75rem 1.5rem;
      border-radius: var(--radius-sm);
      box-shadow: var(--shadow-lg);
      z-index: 300;
      animation: slideInRight 0.3s ease;
      border-left: 4px solid var(--primary);
    `;
    if (type === 'success') toast.style.borderLeftColor = 'var(--success)';
    if (type === 'error') toast.style.borderLeftColor = 'var(--danger)';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  // --- Data atual no header ---
  function updateCurrentDate() {
    const dateEl = document.getElementById('current-date');
    if (dateEl) {
      const now = new Date();
      dateEl.textContent = now.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
    }
  }

  // --- Inicialização geral ---
  function init() {
    initTheme();
    initSidebar();
    initModal();
    updateCurrentDate();

    document.getElementById('dark-mode-toggle')?.addEventListener('click', toggleTheme);
  }

  return { init, toggleTheme, showModal, hideModal, showToast, updateCurrentDate };
})();