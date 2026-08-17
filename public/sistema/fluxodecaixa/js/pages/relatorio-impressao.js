// Página Relatório para Impressão – Resumo mensal com exportação PDF/Excel
window.RelatorioImpressaoPage = (function() {
  let mesAtual, anoAtual;
  let chartInstance = null;

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

  function construirDados() {
    const lancamentos = Storage.get(Storage.KEYS.LANCAMENTOS) || [];
    const diasNoMes = new Date(anoAtual, mesAtual + 1, 0).getDate();
    const diario = [];
    let saldoAcumulado = 0;
    let totalReceitas = 0, totalDespesas = 0;
    for (let dia = 1; dia <= diasNoMes; dia++) {
      const dataStr = `${anoAtual}-${String(mesAtual + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
      const doDia = lancamentos.filter(l => l.data === dataStr);
      const entradas = doDia.filter(l => l.tipo === 'receita').reduce((acc, l) => acc + l.valor, 0);
      const saidas = doDia.filter(l => l.tipo === 'despesa').reduce((acc, l) => acc + l.valor, 0);
      saldoAcumulado += entradas - saidas;
      totalReceitas += entradas;
      totalDespesas += saidas;
      diario.push({ dia, entradas, saidas, saldo: entradas - saidas, saldoAcumulado });
    }
    return { diario, totalReceitas, totalDespesas, saldo: totalReceitas - totalDespesas };
  }

  function exportarPDF() {
    const elemento = document.getElementById('relatorio-print-area');
    if (!elemento) return;
    html2canvas(elemento, { scale: 2, useCORS: true, backgroundColor: '#ffffff' }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const imgHeight = canvas.height * imgWidth / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`relatorio-${mesAtual+1}-${anoAtual}.pdf`);
      UI.showToast('PDF gerado com sucesso!', 'success');
    }).catch(err => {
      console.error('Erro ao gerar PDF:', err);
      UI.showToast('Erro ao gerar PDF.', 'error');
    });
  }

  function exportarExcel() {
    const dados = construirDados();
    const planilha = dados.diario.map(d => ({
      Dia: d.dia,
      Entradas: d.entradas,
      Saídas: d.saidas,
      Saldo_Dia: d.saldo,
      Saldo_Acumulado: d.saldoAcumulado
    }));
    if (window.Export) {
      Export.toExcel(planilha, `fluxo-caixa-${mesAtual+1}-${anoAtual}.xlsx`);
      UI.showToast('Excel gerado com sucesso!', 'success');
    }
  }

  function renderizar() {
    const main = document.getElementById('main-content');
    if (!main) return;

    // Destrói gráfico anterior se existir
    if (chartInstance) {
      chartInstance.destroy();
      chartInstance = null;
    }

    const { diario, totalReceitas, totalDespesas, saldo } = construirDados();
    const saldoClass = saldo >= 0 ? 'success' : 'danger';

    main.innerHTML = `
      <div id="relatorio-print-area" style="padding:1rem;">
        <!-- Cabeçalho do relatório -->
        <div class="no-print" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
          <h2 style="margin:0;">Relatório de Fluxo de Caixa</h2>
          <div style="display:flex; gap:0.75rem;">
            <button id="btn-mes-anterior" class="btn btn-outline">← Mês anterior</button>
            <button id="btn-proximo-mes" class="btn btn-outline">Próximo mês →</button>
            <button id="btn-export-pdf" class="btn"><i class="fas fa-file-pdf"></i> PDF</button>
            <button id="btn-export-excel" class="btn"><i class="fas fa-file-excel"></i> Excel</button>
          </div>
        </div>
        <h3 style="text-align:center; margin-bottom:1.5rem;">${formatarMesAno()}</h3>

        <!-- KPIs -->
        <div class="dashboard-grid" style="margin-bottom:1.5rem;">
          <div class="card kpi-card">
            <div class="kpi-label">Receitas</div>
            <div class="kpi-value success">R$ ${totalReceitas.toFixed(2)}</div>
          </div>
          <div class="card kpi-card">
            <div class="kpi-label">Despesas</div>
            <div class="kpi-value danger">R$ ${totalDespesas.toFixed(2)}</div>
          </div>
          <div class="card kpi-card">
            <div class="kpi-label">Saldo</div>
            <div class="kpi-value ${saldoClass}">R$ ${saldo.toFixed(2)}</div>
          </div>
        </div>

        <!-- Gráfico -->
        <div class="card" style="margin-bottom:1.5rem;">
          <div class="chart-container" style="height:300px;">
            <canvas id="relatorio-chart"></canvas>
          </div>
        </div>

        <!-- Tabela -->
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
                const sdClass = d.saldo >= 0 ? 'success' : 'danger';
                const acClass = d.saldoAcumulado >= 0 ? 'success' : 'danger';
                return `
                  <tr>
                    <td>${d.dia}</td>
                    <td class="success">R$ ${d.entradas.toFixed(2)}</td>
                    <td class="danger">R$ ${d.saidas.toFixed(2)}</td>
                    <td class="${sdClass}">R$ ${d.saldo.toFixed(2)}</td>
                    <td class="${acClass}">R$ ${d.saldoAcumulado.toFixed(2)}</td>
                  </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    // Eventos
    document.getElementById('btn-mes-anterior').addEventListener('click', () => alterarMes(-1));
    document.getElementById('btn-proximo-mes').addEventListener('click', () => alterarMes(1));
    document.getElementById('btn-export-pdf').addEventListener('click', exportarPDF);
    document.getElementById('btn-export-excel').addEventListener('click', exportarExcel);

    // Renderizar gráfico
    requestAnimationFrame(() => {
      const canvas = document.getElementById('relatorio-chart');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const labels = diario.map(d => d.dia);
      chartInstance = Charts.createChart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Entradas',
              data: diario.map(d => d.entradas),
              backgroundColor: Charts.getThemeColors().success,
              borderRadius: 4
            },
            {
              label: 'Saídas',
              data: diario.map(d => d.saidas),
              backgroundColor: Charts.getThemeColors().danger,
              borderRadius: 4
            }
          ]
        },
        options: {
          ...Charts.defaultOptions(),
          scales: {
            ...Charts.defaultOptions().scales,
            x: { ...Charts.defaultOptions().scales.x, title: { display: true, text: 'Dia' } },
            y: { ...Charts.defaultOptions().scales.y, title: { display: true, text: 'Valor (R$)' } }
          }
        }
      });
    });
  }

  function render() {
    initData();
    renderizar();
  }

  return { render };
})();