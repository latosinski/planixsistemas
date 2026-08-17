// Roteador SPA baseado em hash
window.Router = (function() {
  let currentPage = null;
  const pageCallbacks = {};

  function register(page, callback) {
    if (typeof callback === 'function') {
      pageCallbacks[page] = callback;
      console.log(`Rota registrada: ${page}`);
    } else {
      console.warn(`Tentativa de registrar rota "${page}" sem callback válido.`);
    }
  }

  function navigate(page) {
    if (page === currentPage) {
      console.log(`Navegação ignorada: já estamos em ${page}`);
      return;
    }

    console.log(`Navegando para: ${page}`);

    if (window.Charts) {
      Charts.destroyAll();
    }

    currentPage = page;
    window.location.hash = page;

    document.querySelectorAll('.nav-link[data-page]').forEach(link => {
      const linkPage = link.getAttribute('data-page');
      link.classList.toggle('active', linkPage === page);
    });

    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;

    if (pageCallbacks[page]) {
      pageCallbacks[page]();
    } else {
      console.warn(`Nenhum callback registrado para a página "${page}".`);
      mainContent.innerHTML = `
        <div class="welcome-message">
          <h2>Página em construção</h2>
          <p>Funcionalidade "${page}" será implementada em breve.</p>
        </div>`;
    }
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