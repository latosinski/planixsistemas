window.Router = (function() {
  let currentPage = null;
  const pageCallbacks = {};
  const TEMPO_MINIMO_LOADING = 200;

  function register(page, callback) {
    if (typeof callback === 'function') pageCallbacks[page] = callback;
  }

  function navigate(page, forcar = false) {
    if (page === currentPage && !forcar) return;

    if (window.Charts) Charts.destroyAll();

    currentPage = page;
    if (!forcar) window.location.hash = page;

    document.querySelectorAll('.nav-link[data-page]').forEach(link => {
      const linkPage = link.getAttribute('data-page');
      link.classList.toggle('active', linkPage === page);
    });

    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;

    UI.showLoading();
    const inicio = Date.now();

    try {
      if (pageCallbacks[page]) {
        pageCallbacks[page]();
      } else {
        mainContent.innerHTML = `
          <div class="card" style="text-align:center; padding:3rem;">
            <h2>Página em construção</h2>
            <p style="color:var(--muted); margin-top:0.5rem;">Funcionalidade "${page}" será implementada em breve.</p>
          </div>`;
      }
    } catch (err) {
      console.error('Erro ao renderizar a página:', err);
      mainContent.innerHTML = `
        <div class="card" style="text-align:center; padding:3rem;">
          <h2 style="color:var(--danger);">Erro ao carregar a página</h2>
          <p style="color:var(--muted); margin-top:0.5rem;">Consulte o console para mais detalhes.</p>
        </div>`;
    }

    const decorrido = Date.now() - inicio;
    const restante = Math.max(0, TEMPO_MINIMO_LOADING - decorrido);
    setTimeout(() => UI.hideLoading(), restante);
  }

  function init() {
    document.querySelectorAll('.nav-link[data-page]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = link.getAttribute('data-page');
        navigate(page);
      });
    });

    const hash = window.location.hash.substring(1) || 'dashboard';
    navigate(hash);

    window.addEventListener('hashchange', () => {
      const newHash = window.location.hash.substring(1) || 'dashboard';
      navigate(newHash);
    });
  }

  return { init, register, navigate };
})();