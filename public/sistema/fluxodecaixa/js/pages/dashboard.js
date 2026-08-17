// Página Dashboard – Visão Mensal com KPIs e gráfico responsivo
window.DashboardPage = (function() {
  let resizeObserver = null;

  function render() {
    const main = document.getElementById('main-content');
    if (!main) return;

    // Limpar observer anterior
    if (resizeObserver) {
      resizeObserver.disconnect();
      resizeObserver = null;
    }

    const lancamentos = Storage.get(Storage.KEYS.LANCAMENTOS) || [];
    const hoje = new Date();
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();

    const doMes = lancamentos.filter(l => {
      const d = new Date(l.data + 'T00:00:00');
      return d.getMonth() === mesAtual && d.getFullYear() === anoAtual;
    });

    const receitas = doMes.filter(l => l.tipo === 'receita').reduce((acc, l) => acc + l.valor, 0);
    const despesas = doMes.filter(l => l.tipo === 'despesa').reduce((acc, l) => acc + l.valor, 0);
    const saldo = receitas - despesas;

    const diasDoMes = new Date(anoAtual, mesAtual + 1, 0).getDate();
    const diario = Array.from({ length: diasDoMes }, (_, i) => {
      const dia = i + 1;
      const dataStr = `${anoAtual}-${String(mesAtual + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
      const entradas = doMes.filter(l => l.tipo === 'receita' && l.data === dataStr).reduce((acc, l) => acc + l.valor, 0);
      const saidas = doMes.filter(l => l.tipo === 'despesa' && l.data === dataStr).reduce((acc, l) => acc + l.valor, 0);
      return { dia, entradas, saidas, saldo: entradas - saidas };
    });

    main.innerHTML = `
      <div class="dashboard-grid">
        <div class="card kpi-card">
          <div class="kpi-label">Receitas (mês)</div>
          <div class="kpi-value success">R$ ${receitas.toFixed(2)}</div>
        </div>
        <div class="card kpi-card">
          <div class="kpi-label">Despesas (mês)</div>
          <div class="kpi-value danger">R$ ${despesas.toFixed(2)}</div>
        </div>
        <div class="card kpi-card">
          <div class="kpi-label">Saldo (mês)</div>
          <div class="kpi-value ${saldo >= 0 ? 'success' : 'danger'}">R$ ${saldo.toFixed(2)}</div>
        </div>
      </div>
      <div class="card chart-card">
        <div class="card-header">
          <h3 class="card-title">Fluxo de Caixa Diário</h3>
        </div>
        <div class="chart-container">
          <canvas id="fluxo-chart"></canvas>
        </div>
      </div>
    `;

    // Garantir que o canvas exista antes de criar o gráfico
    requestAnimationFrame(() => {
      const canvas = document.getElementById('fluxo-chart');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const labels = diario.map(d => d.dia);
      const entradasData = diario.map(d => d.entradas);
      const saidasData = diario.map(d => d.saidas);

      const chart = Charts.createChart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Entradas',
              data: entradasData,
              backgroundColor: Charts.getThemeColors().success,
              borderRadius: 4
            },
            {
              label: 'Saídas',
              data: saidasData,
              backgroundColor: Charts.getThemeColors().danger,
              borderRadius: 4
            }
          ]
        },
        options: {
          ...Charts.defaultOptions(),
          scales: {
            ...Charts.defaultOptions().scales,
            x: {
              ...Charts.defaultOptions().scales.x,
              title: {
                display: true,
                text: 'Dia do mês',
                color: Charts.getThemeColors().textSecondary
              }
            },
            y: {
              ...Charts.defaultOptions().scales.y,
              title: {
                display: true,
                text: 'Valor (R$)',
                color: Charts.getThemeColors().textSecondary
              }
            }
          }
        }
      });

      // Observer para redimensionar o gráfico quando o container mudar de tamanho
      const container = document.querySelector('.chart-container');
      if (container) {
        resizeObserver = new ResizeObserver(() => {
          if (chart && chart.resize) {
            chart.resize();
          }
        });
        resizeObserver.observe(container);
      }
    });
  }

  return { render };
})();