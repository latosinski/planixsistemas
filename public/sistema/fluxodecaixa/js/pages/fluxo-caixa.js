/**
 * Página Fluxo de Caixa – Visão Diária com paginação mensal.
 * Usa o período global (PeriodStore).
 */
window.FluxoCaixaPage = (function() {
  let resizeObserver = null;
  let periodHandler = null;

  function obterDadosDiarios() {
    const p = PeriodStore.get();
    const todos = Storage.get(Storage.KEYS.LANCAMENTOS) || [];

    const doMes = todos.filter(l => {
      const d = Utils.parseDate(l.data);
      return d && d.getFullYear() === p.ano && d.getMonth() === p.mes;
    });

    const mapa = {};
    doMes.forEach(l => {
      const d = Utils.parseDate(l.data);
      if (!d) return;
      const dia = d.getDate();
      if (!mapa[dia]) mapa[dia] = { dia, entradas: 0, saidas: 0, saldo: 0, saldoAcumulado: 0 };
      if (l.tipo === 'receita') mapa[dia].entradas += l.valor;
      else mapa[dia].saidas += l.valor;
    });

    const diario = Object.values(mapa).sort((a, b) => a.dia - b.dia);

    let acumulado = 0;
    diario.forEach(d => {
      d.saldo = d.entradas - d.saidas;
      acumulado += d.saldo;
      d.saldoAcumulado = acumulado;
    });

    return diario;
  }

  function render() {
    if (periodHandler) {
      window.removeEventListener('periodchange', periodHandler);
      periodHandler = null;
    }
    if (resizeObserver) { resizeObserver.disconnect(); resizeObserver = null; }

    const main = document.getElementById('main-content');
    if (!main) return;

    const p = PeriodStore.get();
    const tituloMes = new Date(p.ano, p.mes).toLocaleDateString('pt-BR', {
      month: 'long', year: 'numeric'
    });
    const tituloMesCap = tituloMes.charAt(0).toUpperCase() + tituloMes.slice(1);

    const diario = obterDadosDiarios();

    main.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Fluxo de Caixa Diário — ${tituloMesCap}</h3>
        </div>
        <div class="chart-container" style="height:280px; margin-bottom:16px;">
          <canvas id="fluxo-chart"></canvas>
        </div>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Dia</th>
                <th>Entradas</th>
                <th>Saídas</th>
                <th>Saldo do Dia</th>
                <th>Saldo Acumulado</th>
              </tr>
            </thead>
            <tbody>
              ${diario.length ? diario.map(d => `
                <tr>
                  <td>${d.dia}/${String(p.mes + 1).padStart(2, '0')}</td>
                  <td class="success">${Utils.formatCurrency(d.entradas)}</td>
                  <td class="danger">${Utils.formatCurrency(d.saidas)}</td>
                  <td class="${d.saldo >= 0 ? 'success' : 'danger'}">${Utils.formatCurrency(d.saldo)}</td>
                  <td class="${d.saldoAcumulado >= 0 ? 'success' : 'danger'}">${Utils.formatCurrency(d.saldoAcumulado)}</td>
                </tr>`).join('') : '<tr><td colspan="5" style="text-align:center; padding:2rem;">Nenhum lançamento neste mês</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    `;

    requestAnimationFrame(() => {
      const canvas = document.getElementById('fluxo-chart');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const labels = diario.map(d => `${d.dia}/${String(p.mes + 1).padStart(2, '0')}`);
      const entradasData = diario.map(d => d.entradas);
      const saidasData = diario.map(d => d.saidas);

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

      const container = canvas.parentElement;
      if (container) {
        resizeObserver = new ResizeObserver(() => chart && chart.resize && chart.resize());
        resizeObserver.observe(container);
      }
    });

    periodHandler = function() { render(); };
    window.addEventListener('periodchange', periodHandler);
  }

  return { render };
})();