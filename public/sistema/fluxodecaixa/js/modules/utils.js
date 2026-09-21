/**
 * Módulo de funções utilitárias compartilhadas.
 */
window.Utils = (function() {
  function parseDate(str) {
    if (!str || typeof str !== 'string') return null;
    const partes = str.split('-');
    if (partes.length !== 3) return null;
    const ano = parseInt(partes[0], 10);
    const mes = parseInt(partes[1], 10) - 1;
    const dia = parseInt(partes[2], 10);
    if (isNaN(ano) || isNaN(mes) || isNaN(dia)) return null;
    const d = new Date(ano, mes, dia);
    if (d.getFullYear() !== ano || d.getMonth() !== mes || d.getDate() !== dia) return null;
    return d;
  }

  function isValidDate(str) {
    return parseDate(str) !== null;
  }

  function escapeHtml(value) {
    if (value === null || value === undefined) return '';
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatCurrency(valor) {
    const n = Number(valor) || 0;
    return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function formatCurrencyInput(value) {
    if (value === null || value === undefined || value === '') return '';
    let n;
    if (typeof value === 'number') {
      n = value;
    } else {
      let s = String(value).trim();
      s = s.replace(/R\$\s?/g, '').replace(/\./g, '').replace(/\s/g, '');
      s = s.replace(',', '.');
      n = parseFloat(s);
    }
    if (isNaN(n)) return '';
    return n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function parseCurrencyInput(value) {
    if (value === null || value === undefined || value === '') return NaN;
    let s = String(value).trim();
    s = s.replace(/R\$\s?/g, '').replace(/\./g, '').replace(/\s/g, '');
    s = s.replace(',', '.');
    const n = parseFloat(s);
    return isNaN(n) ? NaN : n;
  }

  function gerarId() {
    return Date.now() + Math.floor(Math.random() * 1000);
  }

  function hojeISO() {
    const h = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${h.getFullYear()}-${pad(h.getMonth() + 1)}-${pad(h.getDate())}`;
  }

  /**
   * Pagina um array.
   * @param {Array} array
   * @param {number} pagina - 1-based
   * @param {number} porPagina
   * @returns {{ itens: Array, totalPaginas: number, totalItens: number, paginaAtual: number }}
   */
  function paginar(array, pagina = 1, porPagina = 10) {
    const totalItens = array.length;
    const totalPaginas = Math.max(1, Math.ceil(totalItens / porPagina));
    const paginaAtual = Math.min(Math.max(1, pagina), totalPaginas);
    const inicio = (paginaAtual - 1) * porPagina;
    const itens = array.slice(inicio, inicio + porPagina);
    return { itens, totalPaginas, totalItens, paginaAtual };
  }

  return {
    parseDate, isValidDate, escapeHtml,
    formatCurrency, formatCurrencyInput, parseCurrencyInput,
    gerarId, hojeISO, paginar
  };
})();