const pageTitle = document.getElementById('pageTitle');
const sectionMap = {
    'dashboard': { title: 'Dashboard', render: renderDashboard },
    'produtos': { title: 'Produtos', render: renderProdutosView },
    'pedidos': { title: 'Pedidos', render: renderPedidosView },
    'custos-fixos': { title: 'Custos Fixos', render: renderCustosFixosView },
    'marketplaces': { title: 'Marketplaces', render: renderMarketplacesView },
    'fornecedores': { title: 'Fornecedores', render: renderFornecedoresView },
    'contas': { title: 'Contas a Pagar', render: renderContasView },
    'relatorios': { title: 'Relatórios', render: renderRelatoriosView }
};

function navigateTo(section) {
    var info = sectionMap[section];
    if (!info) return;
    info.render();
    pageTitle.textContent = info.title;
    document.querySelectorAll('.nav-item').forEach(function(a) { a.classList.remove('active'); });
    var navItem = document.querySelector('.nav-item[data-section="' + section + '"]');
    if (navItem) navItem.classList.add('active');
    closeSidebar();
}

function closeSidebar() {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebarOverlay').classList.remove('active');
}

document.getElementById('menuToggle').addEventListener('click', function() {
    document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('sidebarOverlay').classList.toggle('active');
});
document.getElementById('sidebarClose').addEventListener('click', closeSidebar);
document.getElementById('sidebarOverlay').addEventListener('click', closeSidebar);

document.querySelectorAll('.nav-item[data-section]').forEach(function(a) {
    a.addEventListener('click', function() { navigateTo(a.dataset.section); });
});

document.getElementById('modalOverlay').addEventListener('click', function(e) {
    if (e.target === this) fecharModal();
});

const themeToggle = document.getElementById('themeToggle');
const icon = themeToggle.querySelector('i');
function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}
var savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    setTheme(savedTheme);
} else {
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(prefersDark ? 'dark' : 'light');
}
themeToggle.addEventListener('click', function() {
    var current = document.documentElement.getAttribute('data-theme') || 'light';
    setTheme(current === 'dark' ? 'light' : 'dark');
});

navigateTo('dashboard');