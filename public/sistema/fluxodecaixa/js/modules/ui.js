window.UI = (function() {
  // --- Tema ---
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
    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme: next } }));
  }
  function updateThemeIcon(theme) {
    const icon = document.querySelector('#dark-mode-toggle i');
    if (icon) icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
  }

  // --- Sidebar ---
  function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    const menuToggle = document.getElementById('menu-toggle');
    const closeSidebar = document.getElementById('close-sidebar');

    function openSidebar() {
      sidebar.classList.add('open');
      overlay.classList.add('active');
      menuToggle.classList.add('is-open');
      menuToggle.setAttribute('aria-expanded', 'true');
    }
    function closeSidebarFn() {
      sidebar.classList.remove('open');
      overlay.classList.remove('active');
      menuToggle.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
    }

    menuToggle?.addEventListener('click', () => {
      if (sidebar.classList.contains('open')) closeSidebarFn();
      else openSidebar();
    });
    closeSidebar?.addEventListener('click', closeSidebarFn);
    overlay?.addEventListener('click', closeSidebarFn);

    sidebar?.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 767) closeSidebarFn();
      });
    });
  }

  // --- Modal genérico ---
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

  // --- Confirmação ---
  let _confirmCallback = null;
  function confirmDialog(message, onConfirm, options = {}) {
    const {
      title = 'Confirmação',
      confirmText = 'Confirmar',
      confirmClass = 'btn-primary'
    } = options;

    const container = document.getElementById('confirm-container');
    if (!container) {
      if (window.confirm(message)) onConfirm && onConfirm();
      return;
    }

    document.getElementById('confirm-title').textContent = title;
    document.getElementById('confirm-message').textContent = message;

    const okBtn = document.getElementById('confirm-ok');
    okBtn.textContent = confirmText;
    okBtn.className = 'btn ' + confirmClass;

    _confirmCallback = onConfirm;
    container.classList.remove('hidden');
  }
  function fecharConfirm(confirmar) {
    const container = document.getElementById('confirm-container');
    container?.classList.add('hidden');
    if (confirmar && _confirmCallback) _confirmCallback();
    _confirmCallback = null;
  }
  function initConfirm() {
    document.getElementById('confirm-close')?.addEventListener('click', () => fecharConfirm(false));
    document.getElementById('confirm-cancel')?.addEventListener('click', () => fecharConfirm(false));
    document.getElementById('confirm-ok')?.addEventListener('click', () => fecharConfirm(true));
    const container = document.getElementById('confirm-container');
    container?.addEventListener('click', (e) => {
      if (e.target === container) fecharConfirm(false);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && container && !container.classList.contains('hidden')) {
        fecharConfirm(false);
      }
    });
  }

  // --- Loading ---
  function showLoading() { document.getElementById('loading-overlay')?.classList.remove('hidden'); }
  function hideLoading() { document.getElementById('loading-overlay')?.classList.add('hidden'); }

  // --- Toast ---
  function showToast(message, type = 'info') {
    const icons = {
      success: 'fa-check-circle', error: 'fa-exclamation-circle',
      warning: 'fa-exclamation-triangle', info: 'fa-info-circle'
    };
    const colors = {
      success: 'var(--success)', error: 'var(--danger)',
      warning: 'var(--warning)', info: 'var(--primary)'
    };
    const durations = { success: 3000, info: 3000, warning: 4000, error: 5000 };

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.style.cssText = `
      position: fixed; bottom: 20px; right: 20px;
      background: var(--card-bg); color: var(--text);
      padding: 12px 16px; border-radius: 10px;
      box-shadow: 0 12px 35px rgba(0,0,0,.15);
      z-index: 300; display: flex; align-items: center; gap: 10px;
      border-left: 4px solid ${colors[type]};
      max-width: 360px; font-size: 0.85rem;
      animation: slideInRight 0.25s ease;
    `;
    toast.innerHTML = `<i class="fas ${icons[type]}" style="color:${colors[type]}; font-size:1rem;"></i><span>${Utils.escapeHtml(message)}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), durations[type] || 3000);
  }

  // --- Data atual no header ---
  function updateCurrentDate() {
    const dateEl = document.getElementById('current-date');
    if (dateEl) {
      const now = new Date();
      dateEl.textContent = now.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
    }
  }

  // --- Seletor de período global ---
  let _anoExibido = null; // ano mostrado no dropdown (independente do período selecionado)

  function initPeriodSelector() {
    const prevBtn = document.getElementById('period-prev');
    const nextBtn = document.getElementById('period-next');
    const display = document.getElementById('period-display');
    const dropdown = document.getElementById('period-dropdown');
    const yearLabel = document.getElementById('period-year-label');
    const yearPrev = document.getElementById('period-year-prev');
    const yearNext = document.getElementById('period-year-next');
    const monthsBox = document.getElementById('period-months');
    const btnHoje = document.getElementById('period-hoje');

    if (!display || !dropdown) return;

    function atualizarLabel() {
      const p = PeriodStore.get();
      document.getElementById('period-label').textContent = PeriodStore.label();
      display.setAttribute('data-short', PeriodStore.labelCurto());
      _anoExibido = p.ano;
    }

    function renderMeses() {
      yearLabel.textContent = _anoExibido;
      const p = PeriodStore.get();
      const nomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
                     'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      monthsBox.innerHTML = nomes.map((nome, idx) => {
        const ativo = (_anoExibido === p.ano && idx === p.mes) ? 'active' : '';
        return `<button class="period-month-btn ${ativo}" data-mes="${idx}">${nome}</button>`;
      }).join('');

      monthsBox.querySelectorAll('.period-month-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const mes = parseInt(btn.getAttribute('data-mes'));
          PeriodStore.set({ ano: _anoExibido, mes });
          fecharDropdown();
          atualizarLabel();
        });
      });
    }

    function abrirDropdown() {
      _anoExibido = PeriodStore.get().ano;
      renderMeses();
      dropdown.classList.remove('hidden');
      display.setAttribute('aria-expanded', 'true');
    }
    function fecharDropdown() {
      dropdown.classList.add('hidden');
      display.setAttribute('aria-expanded', 'false');
    }

    display.addEventListener('click', (e) => {
      e.stopPropagation();
      if (dropdown.classList.contains('hidden')) abrirDropdown();
      else fecharDropdown();
    });

    prevBtn.addEventListener('click', () => {
      PeriodStore.retroceder();
      atualizarLabel();
    });
    nextBtn.addEventListener('click', () => {
      PeriodStore.avancar();
      atualizarLabel();
    });

    yearPrev.addEventListener('click', () => {
      _anoExibido--;
      renderMeses();
    });
    yearNext.addEventListener('click', () => {
      _anoExibido++;
      renderMeses();
    });

    btnHoje.addEventListener('click', () => {
      PeriodStore.definirHoje();
      atualizarLabel();
      fecharDropdown();
    });

    // Fechar dropdown ao clicar fora
    document.addEventListener('click', (e) => {
      if (!dropdown.contains(e.target) && e.target !== display && !display.contains(e.target)) {
        fecharDropdown();
      }
    });

    atualizarLabel();
  }

  function init() {
    initTheme();
    initSidebar();
    initModal();
    initConfirm();
    updateCurrentDate();
    initPeriodSelector();
    document.getElementById('dark-mode-toggle')?.addEventListener('click', toggleTheme);
  }

  return {
    init, toggleTheme, showModal, hideModal, showToast,
    updateCurrentDate, confirm: confirmDialog, showLoading, hideLoading
  };
})();