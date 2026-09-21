/**
 * Página Dashboard – Visão Mensal com KPIs, alertas, metas e últimos lançamentos.
 * Usa o período global (PeriodStore) em vez de fixar no mês corrente.
 */
window.DashboardPage = (function() {
  let resizeObserver = null;
  let periodHandler = null;

  function render() {
    const main = document.getElementById('main-content');
    if (!main) return;

    // Remove listener anterior para evitar acúmulo
    if (periodHandler) {
      window.removeEventListener('periodchange', periodHandler);
      periodHandler = null;
    }

    if (resizeObserver) { resizeObserver.disconnect(); resizeObserver = null; }

    // === Dados ===
    const periodo = PeriodStore.get();
    const lancamentos = Storage.get(Storage.KEYS.LANCAMENTOS) || [];
    const metas = Storage.get(Storage.KEYS.METAS) || { receita: 0, despesa: 0 };

    const mesAtual = periodo.mes;
    const anoAtual = periodo.ano;

    const doMes = lancamentos.filter(l => {
      const d = Utils.parseDate(l.data);
      return d && d.getFullYear() === anoAtual && d.getMonth() === mesAtual;
    });

    const receitas = doMes.filter(l => l.tipo === 'receita').reduce((acc, l) => acc + l.valor, 0);
    const despesas = doMes.filter(l => l.tipo === 'despesa').reduce((acc, l) => acc + l.valor, 0);
    const saldo = receitas - despesas;

    // Pendências (considera apenas até o fim do mês selecionado)
    const fimDoMes = new Date(anoAtual, mesAtual + 1, 0);
    const pendentes = lancamentos.filter(l => {
      if (l.status !== 'pendente') return false;
      const d = Utils.parseDate(l.data);
      return d && d <= fimDoMes;
    });

    const hoje = new Date();
    const vencidos = pendentes.filter(l => {
      const d = Utils.parseDate(l.data);
      if (!d) return false;
      return d < hoje;
    });

    const pendentesMes = doMes.filter(l => l.status === 'pendente');
    const aPagar = pendentesMes.filter(l => l.tipo === 'despesa').reduce((acc, l) => acc + l.valor, 0);
    const aReceber = pendentesMes.filter(l => l.tipo === 'receita').reduce((acc, l) => acc + l.valor, 0);

    const pctReceita = metas.receita > 0 ? Math.min(100, (receitas / metas.receita) * 100) : 0;
    const pctDespesa = metas.despesa > 0 ? Math.min(100, (despesas / metas.despesa) * 100) : 0;

    // Últimos 5 lançamentos do mês (ordenados por data desc)
    const ultimos = doMes.slice()
      .sort((a, b) => b.data.localeCompare(a.data))
      .slice(0, 5);

    // Dias com movimentação no período
    const mapaDias = {};
    doMes.forEach(l => {
      const d = Utils.parseDate(l.data);
      if (!d) return;
      const dia = d.getDate();
      if (!mapaDias[dia]) mapaDias[dia] = { dia, entradas: 0, saidas: 0 };
      if (l.tipo === 'receita') mapaDias[dia].entradas += l.valor;
      else mapaDias[dia].saidas += l.valor;
    });
    const diasComMovimento = Object.values(mapaDias).sort((a, b) => a.dia - b.dia);

    const tituloMes = new Date(anoAtual, mesAtual).toLocaleDateString('pt-BR', {
      month: 'long', year: 'numeric'
    });
    const tituloMesCap = tituloMes.charAt(0).toUpperCase() + tituloMes.slice(1);

    // === HTML ===
    main.innerHTML = `
      <div style="margin-bottom:14px;">
        <h2 style="font-size:1.1rem; font-weight:700; color:var(--text);">Visão de ${tituloMesCap}</h2>
      </div>

      <div class="dashboard-grid">
        <div class="card kpi-card">
          <div class="kpi-label">Receitas</div>
          <div class="kpi-value success">${Utils.formatCurrency(receitas)}</div>
        </div>
        <div class="card kpi-card">
          <div class="kpi-label">Despesas</div>
          <div class="kpi-value danger">${Utils.formatCurrency(despesas)}</div>
        </div>
        <div class="card kpi-card">
          <div class="kpi-label">Saldo</div>
          <div class="kpi-value ${saldo >= 0 ? 'success' : 'danger'}">${Utils.formatCurrency(saldo)}</div>
        </div>
      </div>

      <div class="dashboard-grid" style="grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px;">
        <div class="card">
          <div class="card-header"><h3 class="card-title">Pendências</h3></div>
          <div style="display:flex; flex-direction:column; gap:8px;">
            <div style="display:flex; justify-content:space-between;"><span>Total em aberto</span><strong>${pendentes.length}</strong></div>
            <div style="display:flex; justify-content:space-between;"><span>Vencidos</span><strong style="color:var(--danger);">${vencidos.length}</strong></div>
          </div>
        </div>
        <div class="card">
          <div class="card-header"><h3 class="card-title">Metas do Mês</h3></div>
          <div style="display:flex; flex-direction:column; gap:12px;">
            <div>
              <div style="display:flex; justify-content:space-between; font-size:0.8rem;"><span>Receitas</span><span>${pctReceita.toFixed(1)}%</span></div>
              <div style="background:var(--border); border-radius:10px; height:8px; overflow:hidden; margin-top:4px;"><div style="width:${pctReceita}%; background:var(--success); height:100%;"></div></div>
            </div>
            <div>
              <div style="display:flex; justify-content:space-between; font-size:0.8rem;"><span>Despesas</span><span>${pctDespesa.toFixed(1)}%</span></div>
              <div style="background:var(--border); border-radius:10px; height:8px; overflow:hidden; margin-top:4px;"><div style="width:${pctDespesa}%; background:var(--danger); height:100%;"></div></div>
            </div>
          </div>
        </div>
        <div class="card">
          <div class="card-header"><h3 class="card-title">Resumo Pendente (mês)</h3></div>
          <div style="display:flex; flex-direction:column; gap:8px;">
            <div style="display:flex; justify-content:space-between;"><span>Contas a Pagar</span><strong style="color:var(--danger);">${Utils.formatCurrency(aPagar)}</strong></div>
            <div style="display:flex; justify-content:space-between;"><span>Contas a Receber</span><strong style="color:var(--success);">${Utils.formatCurrency(aReceber)}</strong></div>
          </div>
        </div>
      </div>

      <div class="dashboard-row">
        <div class="card chart-card">
          <div class="card-header"><h3 class="card-title">Fluxo de Caixa Diário — ${tituloMesCap}</h3></div>
          <div class="chart-container" style="height:240px;"><canvas id="fluxo-chart"></canvas></div>
        </div>
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Últimos Lançamentos</h3>
            <a href="#lancamentos" style="font-size:0.8rem; color:var(--primary); text-decoration:none;">Ver todos</a>
          </div>
          <div class="table-container" style="margin-top:0; border:none; box-shadow:none;">
            <table>
              <thead><tr><th>Data</th><th>Descrição</th><th>Valor</th><th>Status</th></tr></thead>
              <tbody>
                ${ultimos.length ? ultimos.map(l => {
                  const d = Utils.parseDate(l.data);
                  const dataFmt = d ? d.toLocaleDateString('pt-BR') : l.data;
                  const valor = (l.tipo === 'despesa' ? '-' : '') + Utils.formatCurrency(l.valor);
                  const statusBadge = l.status === 'pago' ? 'badge badge-success' : 'badge badge-warning';
                  return `<tr><td>${dataFmt}</td><td>${Utils.escapeHtml(l.descricao)}</td><td class="${l.tipo === 'receita' ? 'success' : 'danger'}">${valor}</td><td><span class="${statusBadge}">${l.status}</span></td></tr>`;
                }).join('') : '<tr><td colspan="4" style="text-align:center;">Nenhum lançamento neste mês</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    // Gráfico
    requestAnimationFrame(() => {
      const canvas = document.getElementById('fluxo-chart');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const labels = diasComMovimento.map(d => d.dia);
      const entradasData = diasComMovimento.map(d => d.entradas);
      const saidasData = diasComMovimento.map(d => d.saidas);

      const chart = Charts.createChart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [
            { label: 'Entradas', data: entradasData, backgroundColor: Charts.getThemeColors().success, borderRadius: 4 },
            { label: 'Saídas', data: saidasData, backgroundColor: Charts.getThemeColors().danger, borderRadius: 4 }
          ]
        },
        options: {
          ...Charts.defaultOptions(),
          scales: {
            ...Charts.defaultOptions().scales,
            x: { ...Charts.defaultOptions().scales.x, title: { display: true, text: 'Dia' } },
            y: { ...Charts.defaultOptions().scales.y, beginAtZero: true, title: { display: true, text: 'Valor (R$)' } }
          }
        }
      });

      const container = document.querySelector('.chart-container');
      if (container) {
        resizeObserver = new ResizeObserver(() => chart && chart.resize && chart.resize());
        resizeObserver.observe(container);
      }
    });

    // Reage a mudanças de período
    periodHandler = function() {
      render();
    };
    window.addEventListener('periodchange', periodHandler);
  }

  return { render };
})();