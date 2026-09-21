/**
 * Página DRE – Demonstrativo de Resultado do Exercício (regime de competência).
 * Usa o período global (PeriodStore).
 */
window.DREPage = (function() {
  let periodHandler = null;

  function calcularDRE() {
    const p = PeriodStore.get();
    const lancamentos = Storage.get(Storage.KEYS.LANCAMENTOS) || [];
    const receitasCat = Storage.get(Storage.KEYS.PLANO_CONTAS_RECEITAS) || [];
    const despesasCat = Storage.get(Storage.KEYS.PLANO_CONTAS_DESPESAS) || [];

    const doMes = lancamentos.filter(l => {
      const d = Utils.parseDate(l.data);
      return d && d.getMonth() === p.mes && d.getFullYear() === p.ano;
    });

    const receitasDetalhe = receitasCat.map(cat => {
      const total = doMes.filter(l => l.tipo === 'receita' && l.categoriaId === cat.id)
                          .reduce((acc, l) => acc + l.valor, 0);
      return { nome: cat.nome, total };
    }).filter(r => r.total > 0);

    const despesasDetalhe = despesasCat.map(cat => {
      const total = doMes.filter(l => l.tipo === 'despesa' && l.categoriaId === cat.id)
                          .reduce((acc, l) => acc + l.valor, 0);
      return { nome: cat.nome, total };
    }).filter(d => d.total > 0);

    const totalReceitas = receitasDetalhe.reduce((acc, r) => acc + r.total, 0);
    const totalDespesas = despesasDetalhe.reduce((acc, d) => acc + d.total, 0);
    const resultado = totalReceitas - totalDespesas;

    return { receitasDetalhe, despesasDetalhe, totalReceitas, totalDespesas, resultado };
  }

  function render() {
    if (periodHandler) {
      window.removeEventListener('periodchange', periodHandler);
      periodHandler = null;
    }

    const main = document.getElementById('main-content');
    if (!main) return;

    const p = PeriodStore.get();
    const tituloMes = new Date(p.ano, p.mes).toLocaleDateString('pt-BR', {
      month: 'long', year: 'numeric'
    });
    const tituloMesCap = tituloMes.charAt(0).toUpperCase() + tituloMes.slice(1);

    const dre = calcularDRE();

    const rowsReceitas = dre.receitasDetalhe.map(r => `
      <tr>
        <td>${Utils.escapeHtml(r.nome)}</td>
        <td class="success">${Utils.formatCurrency(r.total)}</td>
      </tr>`).join('');

    const rowsDespesas = dre.despesasDetalhe.map(d => `
      <tr>
        <td>${Utils.escapeHtml(d.nome)}</td>
        <td class="danger">${Utils.formatCurrency(d.total)}</td>
      </tr>`).join('');

    const resultadoClass = dre.resultado >= 0 ? 'success' : 'danger';

    main.innerHTML = `
      <div class="card" style="margin-bottom:16px;">
        <div class="card-header">
          <h3 class="card-title">DRE — ${tituloMesCap}</h3>
        </div>
        <div class="dashboard-grid">
          <div class="card kpi-card">
            <div class="kpi-label">Receita Total</div>
            <div class="kpi-value success">${Utils.formatCurrency(dre.totalReceitas)}</div>
          </div>
          <div class="card kpi-card">
            <div class="kpi-label">Despesa Total</div>
            <div class="kpi-value danger">${Utils.formatCurrency(dre.totalDespesas)}</div>
          </div>
          <div class="card kpi-card">
            <div class="kpi-label">Resultado</div>
            <div class="kpi-value ${resultadoClass}">${Utils.formatCurrency(dre.resultado)}</div>
          </div>
        </div>
      </div>

      <div class="card">
        <h4 style="margin-bottom:1rem;">Detalhamento por Categoria</h4>
        <div class="dre-detalhe-grid">
          <div>
            <h5 style="color:var(--success); margin-bottom:0.5rem;">Receitas</h5>
            <div class="table-container" style="margin-top:0;">
              <table>
                <thead><tr><th>Categoria</th><th>Valor</th></tr></thead>
                <tbody>${rowsReceitas || '<tr><td colspan="2" style="text-align:center;">Nenhuma receita</td></tr>'}</tbody>
              </table>
            </div>
          </div>
          <div>
            <h5 style="color:var(--danger); margin-bottom:0.5rem;">Despesas</h5>
            <div class="table-container" style="margin-top:0;">
              <table>
                <thead><tr><th>Categoria</th><th>Valor</th></tr></thead>
                <tbody>${rowsDespesas || '<tr><td colspan="2" style="text-align:center;">Nenhuma despesa</td></tr>'}</tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    `;

    periodHandler = function() { render(); };
    window.addEventListener('periodchange', periodHandler);
  }

  return { render };
})();