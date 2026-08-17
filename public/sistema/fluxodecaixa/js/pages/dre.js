// Página DRE – Demonstrativo de Resultado do Exercício (Regime de Competência)
window.DREPage = (function() {
  let mesAtual, anoAtual;

  function initData() {
    const hoje = new Date();
    mesAtual = hoje.getMonth();
    anoAtual = hoje.getFullYear();
  }

  function alterarMes(delta) {
    mesAtual += delta;
    if (mesAtual < 0) { mesAtual = 11; anoAtual--; }
    else if (mesAtual > 11) { mesAtual = 0; anoAtual++; }
    renderizar();
  }

  function formatarMesAno() {
    return new Date(anoAtual, mesAtual).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  }

  function calcularDRE() {
    const lancamentos = Storage.get(Storage.KEYS.LANCAMENTOS) || [];
    const receitasCat = Storage.get(Storage.KEYS.PLANO_CONTAS_RECEITAS) || [];
    const despesasCat = Storage.get(Storage.KEYS.PLANO_CONTAS_DESPESAS) || [];

    const doMes = lancamentos.filter(l => {
      const d = new Date(l.data + 'T00:00:00');
      return d.getMonth() === mesAtual && d.getFullYear() === anoAtual;
    });

    // Agrupar por categoria
    const receitasDetalhe = receitasCat.map(cat => {
      const total = doMes.filter(l => l.tipo === 'receita' && l.categoriaId === cat.id).reduce((acc, l) => acc + l.valor, 0);
      return { nome: cat.nome, total };
    }).filter(r => r.total > 0);

    const despesasDetalhe = despesasCat.map(cat => {
      const total = doMes.filter(l => l.tipo === 'despesa' && l.categoriaId === cat.id).reduce((acc, l) => acc + l.valor, 0);
      return { nome: cat.nome, total };
    }).filter(d => d.total > 0);

    const totalReceitas = receitasDetalhe.reduce((acc, r) => acc + r.total, 0);
    const totalDespesas = despesasDetalhe.reduce((acc, d) => acc + d.total, 0);
    const resultado = totalReceitas - totalDespesas;

    return { receitasDetalhe, despesasDetalhe, totalReceitas, totalDespesas, resultado };
  }

  function renderizar() {
    const main = document.getElementById('main-content');
    if (!main) return;

    const dre = calcularDRE();

    const rowsReceitas = dre.receitasDetalhe.map(r => `
      <tr>
        <td>${r.nome}</td>
        <td class="success">R$ ${r.total.toFixed(2)}</td>
      </tr>`).join('');

    const rowsDespesas = dre.despesasDetalhe.map(d => `
      <tr>
        <td>${d.nome}</td>
        <td class="danger">R$ ${d.total.toFixed(2)}</td>
      </tr>`).join('');

    const resultadoClass = dre.resultado >= 0 ? 'success' : 'danger';

    main.innerHTML = `
      <div class="card" style="margin-bottom:1.5rem;">
        <div class="card-header" style="display:flex; justify-content:space-between; align-items:center;">
          <button id="btn-mes-anterior" class="btn btn-outline">← Mês anterior</button>
          <h3 class="card-title">${formatarMesAno()}</h3>
          <button id="btn-proximo-mes" class="btn btn-outline">Próximo mês →</button>
        </div>
        <!-- DRE Resumido -->
        <div class="dashboard-grid">
          <div class="card kpi-card">
            <div class="kpi-label">Receita Total</div>
            <div class="kpi-value success">R$ ${dre.totalReceitas.toFixed(2)}</div>
          </div>
          <div class="card kpi-card">
            <div class="kpi-label">Despesa Total</div>
            <div class="kpi-value danger">R$ ${dre.totalDespesas.toFixed(2)}</div>
          </div>
          <div class="card kpi-card">
            <div class="kpi-label">Resultado</div>
            <div class="kpi-value ${resultadoClass}">R$ ${dre.resultado.toFixed(2)}</div>
          </div>
        </div>
      </div>

      <!-- DRE Detalhado -->
      <div class="card">
        <h4 style="margin-bottom:1rem;">Detalhamento por Categoria</h4>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:2rem;">
          <div>
            <h5 style="color:var(--success); margin-bottom:0.5rem;">Receitas</h5>
            <div class="table-container">
              <table>
                <thead><tr><th>Categoria</th><th>Valor</th></tr></thead>
                <tbody>${rowsReceitas || '<tr><td colspan="2" style="text-align:center;">Nenhuma receita</td></tr>'}</tbody>
              </table>
            </div>
          </div>
          <div>
            <h5 style="color:var(--danger); margin-bottom:0.5rem;">Despesas</h5>
            <div class="table-container">
              <table>
                <thead><tr><th>Categoria</th><th>Valor</th></tr></thead>
                <tbody>${rowsDespesas || '<tr><td colspan="2" style="text-align:center;">Nenhuma despesa</td></tr>'}</tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('btn-mes-anterior').addEventListener('click', () => alterarMes(-1));
    document.getElementById('btn-proximo-mes').addEventListener('click', () => alterarMes(1));
  }

  function render() {
    initData();
    renderizar();
  }

  return { render };
})();