/**
 * PeriodStore – Armazena o período global (ano/mês) selecionado.
 *
 * - Persiste em localStorage.
 * - Se nunca foi definido, usa o mês/ano atual.
 * - Emite evento "periodchange" ao alterar.
 *
 * API:
 *   PeriodStore.get()           -> { ano, mes } (mes 0-11)
 *   PeriodStore.set({ano,mes})  -> define e emite evento
 *   PeriodStore.avancar()       -> +1 mês
 *   PeriodStore.retroceder()    -> -1 mês
 *   PeriodStore.hoje()          -> define para o mês/ano atual
 *   PeriodStore.label()         -> "Setembro/2026"
 *   PeriodStore.labelCurto()    -> "Set/26"
 */
window.PeriodStore = (function() {
  const STORAGE_KEY = 'periodo_global';

  function ler() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const p = JSON.parse(raw);
      if (typeof p.ano === 'number' && typeof p.mes === 'number' && p.mes >= 0 && p.mes <= 11) {
        return p;
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  function salvar(p) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); } catch (e) { /* ignora */ }
  }

  function hoje() {
    const h = new Date();
    return { ano: h.getFullYear(), mes: h.getMonth() };
  }

  function get() {
    return ler() || hoje();
  }

  function set(novo) {
    let { ano, mes } = novo;
    // Normaliza overflow de mês
    while (mes < 0) { mes += 12; ano--; }
    while (mes > 11) { mes -= 12; ano++; }
    const p = { ano, mes };
    salvar(p);
    window.dispatchEvent(new CustomEvent('periodchange', { detail: p }));
    return p;
  }

  function avancar() {
    const p = get();
    return set({ ano: p.ano, mes: p.mes + 1 });
  }

  function retroceder() {
    const p = get();
    return set({ ano: p.ano, mes: p.mes - 1 });
  }

  function definirHoje() {
    return set(hoje());
  }

  function label() {
    const p = get();
    const nome = new Date(p.ano, p.mes).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    // Capitaliza primeira letra
    return nome.charAt(0).toUpperCase() + nome.slice(1);
  }

  function labelCurto() {
    const p = get();
    const nome = new Date(p.ano, p.mes).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
    const cap = nome.charAt(0).toUpperCase() + nome.slice(1);
    return `${cap}/${String(p.ano).slice(2)}`;
  }

  return { get, set, avancar, retroceder, definirHoje, hoje, label, labelCurto };
})();