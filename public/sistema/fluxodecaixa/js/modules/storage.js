/**
 * Módulo de persistência local (localStorage).
 * Inclui validação básica de integridade para evitar erros quando
 * os dados estiverem corrompidos ou em formato antigo.
 */
window.Storage = (function() {
  const KEYS = {
    AUTH: 'auth',
    THEME: 'theme',
    PLANO_CONTAS_RECEITAS: 'plano_contas_receitas',
    PLANO_CONTAS_DESPESAS: 'plano_contas_despesas',
    LANCAMENTOS: 'lancamentos',
    METAS: 'metas'
  };

  /**
   * Esquemas esperados para cada chave.
   * Se os dados não seguirem o formato, retornamos o padrão.
   */
  const SCHEMAS = {
    [KEYS.PLANO_CONTAS_RECEITAS]: { type: 'array', itemCheck: (i) => i && typeof i.id !== 'undefined' && typeof i.nome === 'string' },
    [KEYS.PLANO_CONTAS_DESPESAS]: { type: 'array', itemCheck: (i) => i && typeof i.id !== 'undefined' && typeof i.nome === 'string' },
    [KEYS.LANCAMENTOS]: { type: 'array', itemCheck: (i) => 
      i && typeof i.id !== 'undefined' &&
      typeof i.data === 'string' &&
      typeof i.valor === 'number' &&
      (i.tipo === 'receita' || i.tipo === 'despesa')
    },
    [KEYS.METAS]: { type: 'object', check: (o) => o && typeof o.receita === 'number' && typeof o.despesa === 'number' }
  };

  const DEFAULTS = {
    [KEYS.PLANO_CONTAS_RECEITAS]: [],
    [KEYS.PLANO_CONTAS_DESPESAS]: [],
    [KEYS.LANCAMENTOS]: [],
    [KEYS.METAS]: { receita: 0, despesa: 0 }
  };

  /**
   * Valida dados conforme o schema da chave.
   * Retorna true se válido.
   */
  function validar(key, data) {
    const schema = SCHEMAS[key];
    if (!schema) return true; // Sem schema, aceita qualquer valor

    if (data === null || data === undefined) return false;

    if (schema.type === 'array') {
      if (!Array.isArray(data)) return false;
      if (schema.itemCheck) {
        return data.every(item => schema.itemCheck(item));
      }
      return true;
    }

    if (schema.type === 'object') {
      if (typeof data !== 'object' || Array.isArray(data)) return false;
      if (schema.check) return schema.check(data);
      return true;
    }

    return true;
  }

  function get(key) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return DEFAULTS[key] !== undefined ? JSON.parse(JSON.stringify(DEFAULTS[key])) : null;

      let data;
      try {
        data = JSON.parse(raw);
      } catch (e) {
        console.error(`[Storage] JSON inválido na chave "${key}". Retornando padrão.`, e);
        return DEFAULTS[key] !== undefined ? JSON.parse(JSON.stringify(DEFAULTS[key])) : null;
      }

      if (!validar(key, data)) {
        console.warn(`[Storage] Dados inválidos na chave "${key}". Retornando padrão.`);
        return DEFAULTS[key] !== undefined ? JSON.parse(JSON.stringify(DEFAULTS[key])) : null;
      }

      return data;
    } catch (e) {
      console.error('Erro ao ler do localStorage', e);
      return null;
    }
  }

  function set(key, value) {
    try {
      if (!validar(key, value)) {
        console.warn(`[Storage] Tentativa de salvar dados inválidos na chave "${key}". Operação ignorada.`);
        return false;
      }
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('Erro ao salvar no localStorage', e);
      return false;
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