/**
 * Página Projeção Financeira
 * Baseia-se em média móvel simples dos últimos N meses.
 * Projeta receitas, despesas e saldo para os próximos M meses.
 */
window.ProjecaoPage = (function() {
  // Estado local
  let baseMeses = 6;       // 3 | 6 | 12
  let horizonteMeses = 6;  // 3 | 6 | 12

  let chart = null;
  let periodHandler = null;
  let resizeObserver = null;

  // ---- Utilidades ----

  function todosLancamentos() {
    return Storage.get(Storage.KEYS.LANCAMENTOS) || [];
  }

  /**
   * Retorna { ano, mes } retrocedendo N meses do período atual (PeriodStore).
   */
  function mesRetrocedido(anoBase, mesBase, n) {
    let a = anoBase, m = mesBase - n;
    while (m < 0) { m += 12; a--; }
    return { ano: a, mes: m };
  }

  /**
   * Retorna { ano, mes } avançando N meses.
   */
  function mesAvancado(anoBase, mesBase, n) {
    let a = anoBase, m = mesBase + n;
    while (m > 11) { m -= 12; a++; }
    return { ano: a, mes: m };
  }

  function totaisDoMes(ano, mes) {
    const todos = todosLancamentos();
    const doMes = todos.filter(l => {
      const d = Utils.parseDate(l.data);
      return d && d.getFullYear() === ano && d.getMonth() === mes;
    });
    const receitas = doMes.filter(l => l.tipo === 'receita').reduce((s, l) => s + l.valor, 0);
    const despesas = doMes.filter(l => l.tipo === 'despesa').reduce((s, l) => s + l.valor, 0);
    return { receitas, despesas, saldo: receitas - despesas };
  }

  function rotuloMes(ano, mes) {
    const nome = new Date(ano, mes).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
    return `${nome.charAt(0).toUpperCase() + nome.slice(1)}/${String(ano).slice(2)}`;
  }

  /**
   * Retorna o saldo acumulado até o fim do mês anterior ao período base.
   */
  function saldoAcumuladoAte(ano, mes) {
    const todos = todosLancamentos();
    let saldo = 0;
    todos.forEach(l => {
      const d = Utils.parseDate(l.data);
      if (!d) return;
      // Considera lançamentos até o fim do mês (ano, mes)
      const fim = new Date(ano, mes + 1, 0);
      if (d <= fim) {
        if (l.tipo === 'receita') saldo += l.valor;
        else saldo -= l.valor;
      }
    });
    return saldo;
  }

  /**
   * Calcula as médias dos últimos N meses (base) terminando no mês do PeriodStore.
   */
  function calcularMedias() {
    const p = PeriodStore.get();
    const amostras = [];
    for (let i = 0; i < baseMeses; i++) {
      const { ano, mes } = mesRetrocedido(p.ano, p.mes, i);
      const t = totaisDoMes(ano, mes);
      amostras.push(t);
    }
    const n = amostras.length || 1;
    const mediaReceitas = amostras.reduce((s, a) => s + a.receitas, 0) / n;
    const mediaDespesas = amostras.reduce((s, a) => s + a.despesas, 0) / n;
    const mediaSaldo = mediaReceitas - mediaDespesas;
    return { mediaReceitas, mediaDespesas, mediaSaldo, amostras };
  }

  // ---- Render ----

  function render() {
    if (periodHandler) {
      window.removeEventListener('periodchange', periodHandler);
      periodHandler = null;
    }
    if (chart) { try { chart.destroy(); } catch (e) {} chart = null; }
    if (resizeObserver) { try { resizeObserver.disconnect(); } catch (e) {} resizeObserver = null; }

    const main = document.getElementById('main-content');
    if (!main) return;

    const p = PeriodStore.get();
    const { mediaReceitas, mediaDespesas, mediaSaldo } = calcularMedias();
    const saldoInicial = saldoAcumuladoAte(p.ano, p.mes);

    // Arrays para o gráfico: histórico dos últimos `baseMeses` + projeção dos próximos `horizonteMeses`
    const labels = [];
    const receitasReais = [];
    const despesasReais = [];
    const saldoReais = [];
    const receitasProj = [];
    const despesasProj = [];
    const saldoProj = [];

    // Histórico (realizado)
    for (let i = baseMeses - 1; i >= 0; i--) {
      const { ano, mes } = mesRetrocedido(p.ano, p.mes, i);
      const t = totaisDoMes(ano, mes);
      labels.push(rotuloMes(ano, mes));
      receitasReais.push(t.receitas);
      despesasReais.push(t.despesas);
      saldoReais.push(t.saldo);
      receitasProj.push(null);
      despesasProj.push(null);
      saldoProj.push(null);
    }

    // Projeção (futuro)
    let acumuladoProjetado = saldoInicial;
    const linhasProjecao = [];
    for (let i = 1; i <= horizonteMeses; i++) {
      const { ano, mes } = mesAvancado(p.ano, p.mes, i);
      acumuladoProjetado += mediaSaldo;
      labels.push(rotuloMes(ano, mes));
      receitasReais.push(null);
      despesasReais.push(null);
      saldoReais.push(null);
      receitasProj.push(mediaReceitas);
      despesasProj.push(mediaDespesas);
      saldoProj.push(mediaSaldo);
      linhasProjecao.push({
        ano, mes,
        receitas: mediaReceitas,
        despesas: mediaDespesas,
        saldo: mediaSaldo,
        saldoAcumulado: acumuladoProjetado
      });
    }

    // Conecta a última barra do histórico à primeira da projeção (para o gráfico não ficar "cortado")
    const idxUltimoReal = baseMeses - 1;
    receitasProj[idxUltimoReal] = receitasReais[idxUltimoReal];
    despesasProj[idxUltimoReal] = despesasReais[idxUltimoReal];
    saldoProj[idxUltimoReal] = saldoReais[idxUltimoReal];

    // ---- HTML ----
    main.innerHTML = `
      <div class="projecao-aviso">
        <i class="fas fa-info-circle"></i>
        <span>Projeções são estimativas baseadas na <strong>média móvel simples</strong> dos últimos ${baseMeses} meses. Não substituem uma análise profissional detalhada.</span>
      </div>

      <div class="card" style="margin-bottom:16px;">
        <div class="card-header">
          <h3 class="card-title">Configurações da Projeção</h3>
        </div>
        <div class="filters-bar" style="margin-bottom:0;">
          <div class="form-group">
            <label class="form-label">Base (últimos meses)</label>
            <select id="proj-base" class="form-select">
              <option value="3" ${baseMeses === 3 ? 'selected' : ''}>3 meses</option>
              <option value="6" ${baseMeses === 6 ? 'selected' : ''}>6 meses</option>
              <option value="12" ${baseMeses === 12 ? 'selected' : ''}>12 meses</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Horizonte (próximos meses)</label>
            <select id="proj-horizonte" class="form-select">
              <option value="3" ${horizonteMeses === 3 ? 'selected' : ''}>3 meses</option>
              <option value="6" ${horizonteMeses === 6 ? 'selected' : ''}>6 meses</option>
              <option value="12" ${horizonteMeses === 12 ? 'selected' : ''}>12 meses</option>
            </select>
          </div>
        </div>
      </div>

      <div class="dashboard-grid">
        <div class="card kpi-card">
          <div class="kpi-label">Média de Receitas</div>
          <div class="kpi-value success">${Utils.formatCurrency(mediaReceitas)}</div>
          <div class="kpi-note muted" style="font-size:0.75rem; margin-top:0.3rem;">por mês (base ${baseMeses}m)</div>
        </div>
        <div class="card kpi-card">
          <div class="kpi-label">Média de Despesas</div>
          <div class="kpi-value danger">${Utils.formatCurrency(mediaDespesas)}</div>
          <div class="kpi-note muted" style="font-size:0.75rem; margin-top:0.3rem;">por mês (base ${baseMeses}m)</div>
        </div>
        <div class="card kpi-card">
          <div class="kpi-label">Saldo Médio</div>
          <div class="kpi-value ${mediaSaldo >= 0 ? 'success' : 'danger'}">${Utils.formatCurrency(mediaSaldo)}</div>
          <div class="kpi-note muted" style="font-size:0.75rem; margin-top:0.3rem;">por mês</div>
        </div>
        <div class="card kpi-card">
          <div class="kpi-label">Saldo Acumulado Atual</div>
          <div class="kpi-value ${saldoInicial >= 0 ? 'success' : 'danger'}">${Utils.formatCurrency(saldoInicial)}</div>
          <div class="kpi-note muted" style="font-size:0.75rem; margin-top:0.3rem;">até ${rotuloMes(p.ano, p.mes)}</div>
        </div>
      </div>

      <div class="card" style="margin-bottom:16px;">
        <div class="card-header">
          <h3 class="card-title">Realizado × Projetado</h3>
        </div>
        <div class="chart-container" style="height:320px;">
          <canvas id="chart-projecao"></canvas>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Projeção Mês a Mês</h3>
        </div>
        <div class="table-container" style="margin-top:0;">
          <table>
            <thead>
              <tr>
                <th>Mês</th>
                <th>Receitas</th>
                <th>Despesas</th>
                <th>Saldo do Mês</th>
                <th>Saldo Acumulado</th>
              </tr>
            </thead>
            <tbody>
              ${linhasProjecao.map(l => `
                <tr>
                  <td>${rotuloMes(l.ano, l.mes)}</td>
                  <td class="success">${Utils.formatCurrency(l.receitas)}</td>
                  <td class="danger">${Utils.formatCurrency(l.despesas)}</td>
                  <td class="${l.saldo >= 0 ? 'success' : 'danger'}">${Utils.formatCurrency(l.saldo)}</td>
                  <td class="${l.saldoAcumulado >= 0 ? 'success' : 'danger'}">${Utils.formatCurrency(l.saldoAcumulado)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    // Eventos
    document.getElementById('proj-base').addEventListener('change', function() {
      baseMeses = parseInt(this.value);
      render();
    });
    document.getElementById('proj-horizonte').addEventListener('change', function() {
      horizonteMeses = parseInt(this.value);
      render();
    });

    // Gráfico
    requestAnimationFrame(() => {
      const canvas = document.getElementById('chart-projecao');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const cores = Charts.getThemeColors();

      chart = Charts.createChart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: 'Receitas (realizado)',
              data: receitasReais,
              borderColor: cores.success,
              backgroundColor: 'transparent',
              tension: 0.3,
              pointRadius: 3,
              borderWidth: 2
            },
            {
              label: 'Despesas (realizado)',
              data: despesasReais,
              borderColor: cores.danger,
              backgroundColor: 'transparent',
              tension: 0.3,
              pointRadius: 3,
              borderWidth: 2
            },
            {
              label: 'Saldo (realizado)',
              data: saldoReais,
              borderColor: cores.primary,
              backgroundColor: 'transparent',
              tension: 0.3,
              pointRadius: 3,
              borderWidth: 2
            },
            {
              label: 'Receitas (projetado)',
              data: receitasProj,
              borderColor: cores.success,
              backgroundColor: 'transparent',
              tension: 0.3,
              pointRadius: 3,
              borderWidth: 2,
              borderDash: [6, 4]
            },
            {
              label: 'Despesas (projetado)',
              data: despesasProj,
              borderColor: cores.danger,
              backgroundColor: 'transparent',
              tension: 0.3,
              pointRadius: 3,
              borderWidth: 2,
              borderDash: [6, 4]
            },
            {
              label: 'Saldo (projetado)',
              data: saldoProj,
              borderColor: cores.primary,
              backgroundColor: 'transparent',
              tension: 0.3,
              pointRadius: 3,
              borderWidth: 2,
              borderDash: [6, 4]
            }
          ]
        },
        options: {
          ...Charts.defaultOptions(),
          scales: {
            ...Charts.defaultOptions().scales,
            x: { ...Charts.defaultOptions().scales.x, title: { display: true, text: 'Mês' } },
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