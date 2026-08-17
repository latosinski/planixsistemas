// Módulo de persistência local (localStorage)
window.Storage = (function() {
  const KEYS = {
    AUTH: 'auth',
    THEME: 'theme',
    PLANO_CONTAS_RECEITAS: 'plano_contas_receitas',
    PLANO_CONTAS_DESPESAS: 'plano_contas_despesas',
    LANCAMENTOS: 'lancamentos',
    METAS: 'metas'
  };

  function get(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Erro ao ler do localStorage', e);
      return null;
    }
  }

  function set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Erro ao salvar no localStorage', e);
    }
  }

  function remove(key) {
    localStorage.removeItem(key);
  }

  function clearAll() {
    localStorage.clear();
  }

  return { KEYS, get, set, remove, clearAll };
})();