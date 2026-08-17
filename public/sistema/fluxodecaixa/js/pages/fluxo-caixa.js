// Página Fluxo de Caixa – Visão Diária com paginação mensal
window.FluxoCaixaPage = (function() {
  let mesAtual, anoAtual;
  let resizeObserver = null;

  function initData() {
    const hoje = new Date();
    mesAtual = hoje.getMonth(); // 0-11
    anoAtual = hoje.getFullYear();
  }

  function alterarMes(delta) {
    mesAtual += delta;
    if (mesAtual < 0) {
      mesAtual = 11;
      anoAtual--;
    } else if (mesAtual > 11) {
      mesAtual = 0;
      anoAtual++;
    }
    renderizarMes();
  }

  function formatarMesAno() {
    return new Date(anoAtual, mesAtual).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  }

  function construirDados() {
    const lancamentos = Storage.get(Storage.KEYS.LANCAMENTOS) || [];
    const diasNoMes = new Date(anoAtual, mesAtual + 1, 0).getDate();
    const diario = [];
    let saldoAcumulado = 0;
    for (let dia = 1; dia <= diasNoMes; dia++) {
      const dataStr = `${anoAtual}-${String(mesAtual + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
      const doDia = lancamentos.filter(l => l.data === dataStr);
      const entradas = doDia.filter(l => l.tipo === 'receita').reduce((acc, l) => acc + l.valor, 0);
      const saidas = doDia.filter(l => l.tipo === 'despesa').reduce((acc, l) => acc + l.valor, 0);
      saldoAcumulado += entradas - saidas;
      diario.push({ dia, data: dataStr, entradas, saidas, saldo: entradas - saidas, saldoAcumulado });
    }
    return diario;
  }

  function renderizarMes() {
    const main = document.getElementById('main-content');
    if (!main) return;

    if (resizeObserver) {
      resizeObserver.disconnect();
      resizeObserver = null;
    }

    const diario = construirDados();

    main.innerHTML = `
      <div class="card">
        <div class="card-header" style="display:flex; justify-content:space-between; align-items:center;">
          <button id="btn-mes-anterior" class="btn btn-outline" style="margin-right:auto;">← Mês anterior</button>
          <h3 class="card-title" style="margin:0 1rem;">${formatarMesAno()}</h3>
          <button id="btn-proximo-mes" class="btn btn-outline" style="margin-left:auto;">Próximo mês →</button>
        </div>
        <div class="chart-container" style="height:300px; margin-bottom:1.5rem;">
          <canvas id="fluxo-linha-chart"></canvas>
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
              ${diario.map(d => {
                const saldoClass = d.saldo >= 0 ? 'success' : 'danger';
                const acumClass = d.saldoAcumulado >= 0 ? 'success' : 'danger';
                return `
                  <tr>
                    <td>${d.dia}/${String(mesAtual + 1).padStart(2, '0')}</td>
                    <td class="success">R$ ${d.entradas.toFixed(2)}</td>
                    <td class="danger">R$ ${d.saidas.toFixed(2)}</td>
                    <td class="${saldoClass}">R$ ${d.saldo.toFixed(2)}</td>
                    <td class="${acumClass}">R$ ${d.saldoAcumulado.toFixed(2)}</td>
                  </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    // Eventos de navegação
    document.getElementById('btn-mes-anterior').addEventListener('click', () => alterarMes(-1));
    document.getElementById('btn-proximo-mes').addEventListener('click', () => alterarMes(1));

    // Gráfico
    requestAnimationFrame(() => {
      const canvas = document.getElementById('fluxo-linha-chart');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const labels = diario.map(d => d.dia);
      const saldoData = diario.map(d => d.saldoAcumulado);

      const chart = Charts.createChart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Saldo Acumulado',
            data: saldoData,
            borderColor: Charts.getThemeColors().primary,
            backgroundColor: 'transparent',
            tension: 0.3,
            pointRadius: 3,
            borderWidth: 2
          }]
        },
        options: {
          ...Charts.defaultOptions(),
          plugins: {
            legend: { display: false }
          },
          scales: {
            ...Charts.defaultOptions().scales,
            y: {
              ...Charts.defaultOptions().scales.y,
              title: { display: true, text: 'Saldo (R$)', color: Charts.getThemeColors().textSecondary }
            }
          }
        }
      });

      const container = canvas.parentElement;
      if (container) {
        resizeObserver = new ResizeObserver(() => {
          if (chart && chart.resize) chart.resize();
        });
        resizeObserver.observe(container);
      }
    });
  }

  function render() {
    initData();
    renderizarMes();
  }

  return { render };
})();