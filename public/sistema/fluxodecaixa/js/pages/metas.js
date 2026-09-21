/**
 * Página Metas – Definição e acompanhamento de metas mensais.
 * As metas são armazenadas por mês/ano; o realizado é calculado
 * sobre o período selecionado no header (PeriodStore).
 */
window.MetasPage = (function() {
  let periodHandler = null;

  /**
   * Retorna as metas do mês selecionado (ou { receita: 0, despesa: 0 }).
   * Estrutura: { "2026-09": { receita: 20000, despesa: 12000 }, ... }
   */
  function carregarMetas() {
    const todas = Storage.get(Storage.KEYS.METAS) || {};
    const p = PeriodStore.get();
    const chave = `${p.ano}-${String(p.mes + 1).padStart(2, '0')}`;
    return todas[chave] || { receita: 0, despesa: 0 };
  }

  /**
   * Salva as metas do mês selecionado.
   */
  function salvarMetas(metaReceita, metaDespesa) {
    const todas = Storage.get(Storage.KEYS.METAS) || {};
    const p = PeriodStore.get();
    const chave = `${p.ano}-${String(p.mes + 1).padStart(2, '0')}`;
    todas[chave] = { receita: metaReceita, despesa: metaDespesa };
    Storage.set(Storage.KEYS.METAS, todas);
  }

  function calcularRealizado() {
    const lancamentos = Storage.get(Storage.KEYS.LANCAMENTOS) || [];
    const p = PeriodStore.get();

    const doMes = lancamentos.filter(l => {
      const d = Utils.parseDate(l.data);
      return d && d.getMonth() === p.mes && d.getFullYear() === p.ano;
    });

    const receitas = doMes.filter(l => l.tipo === 'receita').reduce((acc, l) => acc + l.valor, 0);
    const despesas = doMes.filter(l => l.tipo === 'despesa').reduce((acc, l) => acc + l.valor, 0);
    return { receitas, despesas };
  }

  function render() {
    if (periodHandler) {
      window.removeEventListener('periodchange', periodHandler);
      periodHandler = null;
    }

    const metas = carregarMetas();
    const realizado = calcularRealizado();
    const pctReceita = metas.receita > 0 ? Math.min(100, (realizado.receitas / metas.receita) * 100) : 0;
    const pctDespesa = metas.despesa > 0 ? Math.min(100, (realizado.despesas / metas.despesa) * 100) : 0;

    const p = PeriodStore.get();
    const tituloMes = new Date(p.ano, p.mes).toLocaleDateString('pt-BR', {
      month: 'long', year: 'numeric'
    });
    const tituloMesCap = tituloMes.charAt(0).toUpperCase() + tituloMes.slice(1);

    const main = document.getElementById('main-content');
    if (!main) return;

    main.innerHTML = `
      <div class="card" style="margin-bottom:16px;">
        <div class="card-header"><h3 class="card-title">Metas de ${tituloMesCap}</h3></div>
        <form id="form-metas" class="filters-bar">
          <div class="form-group" style="flex:1; min-width:180px;">
            <label class="form-label" for="meta-receita">Meta de Receita (R$)</label>
            <input id="meta-receita" type="text" inputmode="decimal" class="form-input" value="${Utils.formatCurrencyInput(metas.receita)}" placeholder="0,00">
          </div>
          <div class="form-group" style="flex:1; min-width:180px;">
            <label class="form-label" for="meta-despesa">Meta de Despesa (R$)</label>
            <input id="meta-despesa" type="text" inputmode="decimal" class="form-input" value="${Utils.formatCurrencyInput(metas.despesa)}" placeholder="0,00">
          </div>
          <button type="submit" class="btn btn-primary">Salvar Metas</button>
        </form>
      </div>

      <div class="dashboard-grid">
        <div class="card kpi-card">
          <div class="kpi-label">Receitas Realizadas</div>
          <div class="kpi-value success">${Utils.formatCurrency(realizado.receitas)}</div>
          <div style="margin-top:0.75rem; background:var(--border); border-radius:10px; height:8px; overflow:hidden;">
            <div style="width:${pctReceita}%; background:var(--success); height:100%; border-radius:10px; transition: width 0.5s;"></div>
          </div>
          <div style="font-size:0.75rem; color:var(--muted); margin-top:0.3rem;">${pctReceita.toFixed(1)}% da meta</div>
        </div>
        <div class="card kpi-card">
          <div class="kpi-label">Despesas Realizadas</div>
          <div class="kpi-value danger">${Utils.formatCurrency(realizado.despesas)}</div>
          <div style="margin-top:0.75rem; background:var(--border); border-radius:10px; height:8px; overflow:hidden;">
            <div style="width:${pctDespesa}%; background:var(--danger); height:100%; border-radius:10px; transition: width 0.5s;"></div>
          </div>
          <div style="font-size:0.75rem; color:var(--muted); margin-top:0.3rem;">${pctDespesa.toFixed(1)}% da meta</div>
        </div>
      </div>
    `;

    const metaRecInput = document.getElementById('meta-receita');
    const metaDespInput = document.getElementById('meta-despesa');

    [metaRecInput, metaDespInput].forEach(input => {
      input.addEventListener('blur', function() {
        const n = Utils.parseCurrencyInput(this.value);
        if (!isNaN(n)) this.value = Utils.formatCurrencyInput(n);
      });
    });

    document.getElementById('form-metas').addEventListener('submit', function(e) {
      e.preventDefault();

      const receita = Utils.parseCurrencyInput(metaRecInput.value);
      const despesa = Utils.parseCurrencyInput(metaDespInput.value);

      if (isNaN(receita) || receita < 0) { UI.showToast('A meta de receita deve ser um número maior ou igual a zero.', 'error'); metaRecInput.focus(); return; }
      if (isNaN(despesa) || despesa < 0) { UI.showToast('A meta de despesa deve ser um número maior ou igual a zero.', 'error'); metaDespInput.focus(); return; }

      function salvar() {
        salvarMetas(receita, despesa);
        UI.showToast('Metas salvas com sucesso!', 'success');
        render();
      }

      if (despesa > receita && receita > 0) {
        UI.confirm(
          `Atenção: a meta de despesa (${Utils.formatCurrency(despesa)}) ` +
          `é maior que a meta de receita (${Utils.formatCurrency(receita)}).\n\n` +
          `Deseja salvar mesmo assim?`,
          salvar,
          { title: 'Aviso de Metas', confirmText: 'Salvar', confirmClass: 'btn-primary' }
        );
        return;
      }

      salvar();
    });

    periodHandler = function() { render(); };
    window.addEventListener('periodchange', periodHandler);
  }

  return { render };
})();