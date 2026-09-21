/**
 * Página Relatório para Impressão – Resumo mensal com exportação PDF/Excel.
 * Exibe apenas os dias com movimentação. Usa o período global (PeriodStore).
 */
window.RelatorioImpressaoPage = (function() {
  let chartInstance = null;
  let periodHandler = null;

  function construirDados() {
    const p = PeriodStore.get();
    const lancamentos = Storage.get(Storage.KEYS.LANCAMENTOS) || [];

    const doMes = lancamentos.filter(l => {
      const d = Utils.parseDate(l.data);
      return d && d.getMonth() === p.mes && d.getFullYear() === p.ano;
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

    const totalReceitas = diario.reduce((acc, d) => acc + d.entradas, 0);
    const totalDespesas = diario.reduce((acc, d) => acc + d.saidas, 0);
    const saldo = totalReceitas - totalDespesas;

    return { diario, totalReceitas, totalDespesas, saldo };
  }

  function exportarPDF() {
    const elemento = document.getElementById('relatorio-print-area');
    if (!elemento) return;
    const p = PeriodStore.get();
    UI.showLoading();
    html2canvas(elemento, { scale: 2, useCORS: true, backgroundColor: '#ffffff' }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const imgHeight = canvas.height * imgWidth / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`relatorio-${p.mes + 1}-${p.ano}.pdf`);
      UI.hideLoading();
      UI.showToast('PDF gerado com sucesso!', 'success');
    }).catch(err => {
      console.error('Erro ao gerar PDF:', err);
      UI.hideLoading();
      UI.showToast('Erro ao gerar PDF.', 'error');
    });
  }

  function exportarExcel() {
    const p = PeriodStore.get();
    const { diario, totalReceitas, totalDespesas, saldo } = construirDados();
    const planilha = diario.map(d => ({
      Dia: d.dia,
      Entradas: d.entradas,
      Saídas: d.saidas,
      Saldo_Dia: d.saldo,
      Saldo_Acumulado: d.saldoAcumulado
    }));
    planilha.push({
      Dia: 'TOTAL',
      Entradas: totalReceitas,
      Saídas: totalDespesas,
      Saldo_Dia: saldo,
      Saldo_Acumulado: ''
    });
    if (window.Export) {
      Export.toExcel(planilha, `fluxo-caixa-${p.mes + 1}-${p.ano}.xlsx`);
      UI.showToast('Excel gerado com sucesso!', 'success');
    }
  }

  function render() {
    if (periodHandler) {
      window.removeEventListener('periodchange', periodHandler);
      periodHandler = null;
    }

    const main = document.getElementById('main-content');
    if (!main) return;

    if (chartInstance) {
      chartInstance.destroy();
      chartInstance = null;
    }

    const p = PeriodStore.get();
    const tituloMes = new Date(p.ano, p.mes).toLocaleDateString('pt-BR', {
      month: 'long', year: 'numeric'
    });
    const tituloMesCap = tituloMes.charAt(0).toUpperCase() + tituloMes.slice(1);

    const { diario, totalReceitas, totalDespesas, saldo } = construirDados();
    const saldoClass = saldo >= 0 ? 'success' : 'danger';

    main.innerHTML = `
      <div id="relatorio-print-area">
        <div class="no-print" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; flex-wrap:wrap; gap:8px;">
          <h2 style="margin:0; font-size:1.1rem;">Relatório de Fluxo de Caixa</h2>
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            <button id="btn-export-pdf" class="btn btn-primary"><i class="fas fa-file-pdf"></i> PDF</button>
            <button id="btn-export-excel" class="btn btn-primary"><i class="fas fa-file-excel"></i> Excel</button>
          </div>
        </div>

        <h3 style="text-align:center; margin-bottom:16px; font-size:1rem;">${tituloMesCap}</h3>

        <div class="dashboard-grid" style="margin-bottom:16px;">
          <div class="card kpi-card">
            <div class="kpi-label">Receitas</div>
            <div class="kpi-value success">${Utils.formatCurrency(totalReceitas)}</div>
          </div>
          <div class="card kpi-card">
            <div class="kpi-label">Despesas</div>
            <div class="kpi-value danger">${Utils.formatCurrency(totalDespesas)}</div>
          </div>
          <div class="card kpi-card">
            <div class="kpi-label">Saldo</div>
            <div class="kpi-value ${saldoClass}">${Utils.formatCurrency(saldo)}</div>
          </div>
        </div>

        <div class="card" style="margin-bottom:16px;">
          <div class="chart-container" style="height:260px;">
            <canvas id="relatorio-chart"></canvas>
          </div>
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
              ${diario.length ? diario.map(d => {
                const sdClass = d.saldo >= 0 ? 'success' : 'danger';
                const acClass = d.saldoAcumulado >= 0 ? 'success' : 'danger';
                return `
                  <tr>
                    <td>${d.dia}/${String(p.mes + 1).padStart(2, '0')}</td>
                    <td class="success">${Utils.formatCurrency(d.entradas)}</td>
                    <td class="danger">${Utils.formatCurrency(d.saidas)}</td>
                    <td class="${sdClass}">${Utils.formatCurrency(d.saldo)}</td>
                    <td class="${acClass}">${Utils.formatCurrency(d.saldoAcumulado)}</td>
                  </tr>`;
              }).join('') : '<tr><td colspan="5" style="text-align:center; padding:2rem;">Nenhum lançamento neste mês</td></tr>'}
            </tbody>
            ${diario.length ? `
              <tfoot>
                <tr class="tfoot-total">
                  <td>TOTAL</td>
                  <td class="success">${Utils.formatCurrency(totalReceitas)}</td>
                  <td class="danger">${Utils.formatCurrency(totalDespesas)}</td>
                  <td class="${saldoClass}">${Utils.formatCurrency(saldo)}</td>
                  <td></td>
                </tr>
              </tfoot>
            ` : ''}
          </table>
        </div>
      </div>
    `;

    document.getElementById('btn-export-pdf').addEventListener('click', exportarPDF);
    document.getElementById('btn-export-excel').addEventListener('click', exportarExcel);

    requestAnimationFrame(() => {
      const canvas = document.getElementById('relatorio-chart');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const labels = diario.map(d => `${d.dia}/${String(p.mes + 1).padStart(2, '0')}`);
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
            y: { ...Charts.defaultOptions().scales.y, beginAtZero: true, title: { display: true, text: 'Valor (R$)' } }
          }
        }
      });
    });

    periodHandler = function() { render(); };
    window.addEventListener('periodchange', periodHandler);
  }

  return { render };
})();