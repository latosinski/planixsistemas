/**
 * Página Análise Financeira
 *
 * Blocos:
 *  A - Evolução do caixa (linhas, por mês, na janela escolhida)
 *  B - Comparativo ano a ano (barras + tabela com variação %)
 *  C - Tabela consolidada anual (12 meses + total)
 *  D - Top categorias no período (5 receitas + 5 despesas)
 */
window.AnaliseFinanceiraPage = (function() {
  // Estado local da página
  let janela = 12;               // 6 | 12 | 24 | 'custom'
  let dataInicioCustom = null;   // string YYYY-MM-DD
  let dataFimCustom = null;      // string YYYY-MM-DD
  let anoComparativoA = null;
  let anoComparativoB = null;
  let anoConsolidado = null;

  let chartEvolucao = null;
  let chartComparativo = null;
  let periodHandler = null;
  let resizeObservers = [];

  // ---- Utilidades ----

  function todosLancamentos() {
    return Storage.get(Storage.KEYS.LANCAMENTOS) || [];
  }

  function categorias() {
    return {
      receitas: Storage.get(Storage.KEYS.PLANO_CONTAS_RECEITAS) || [],
      despesas: Storage.get(Storage.KEYS.PLANO_CONTAS_DESPESAS) || []
    };
  }

  /**
   * Retorna array de { ano, mes } representando os meses da janela.
   * A janela termina no mês atual do PeriodStore.
   */
  function mesesDaJanela() {
    const p = PeriodStore.get();
    let totalMeses = janela;
    let inicioAno, inicioMes;

    if (janela === 'custom' && dataInicioCustom && dataFimCustom) {
      const dI = Utils.parseDate(dataInicioCustom);
      const dF = Utils.parseDate(dataFimCustom);
      if (dI && dF && dI <= dF) {
        inicioAno = dI.getFullYear();
        inicioMes = dI.getMonth();
        const fimAno = dF.getFullYear();
        const fimMes = dF.getMonth();
        totalMeses = (fimAno - inicioAno) * 12 + (fimMes - inicioMes) + 1;
      } else {
        return [];
      }
    } else {
      // Últimos N meses terminando no mês do PeriodStore
      const fimAno = p.ano;
      const fimMes = p.mes;
      const totalAntes = (janela === 'custom' ? 12 : janela) - 1;
      inicioAno = fimAno;
      inicioMes = fimMes - totalAntes;
      while (inicioMes < 0) { inicioMes += 12; inicioAno--; }
    }

    const meses = [];
    let a = inicioAno, m = inicioMes;
    const fimA = (janela === 'custom' && dataFimCustom ? Utils.parseDate(dataFimCustom)?.getFullYear() : p.ano);
    const fimM = (janela === 'custom' && dataFimCustom ? Utils.parseDate(dataFimCustom)?.getMonth() : p.mes);
    while (a < fimA || (a === fimA && m <= fimM)) {
      meses.push({ ano: a, mes: m });
      m++;
      if (m > 11) { m = 0; a++; }
    }
    return meses;
  }

  /**
   * Soma receitas e despesas de um mês/ano.
   */
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

  /**
   * Retorna todos os anos presentes nos lançamentos.
   */
  function anosDisponiveis() {
    const todos = todosLancamentos();
    const set = new Set();
    todos.forEach(l => {
      const d = Utils.parseDate(l.data);
      if (d) set.add(d.getFullYear());
    });
    const atual = new Date().getFullYear();
    set.add(atual);
    return Array.from(set).sort((a, b) => b - a);
  }

  function rotuloMes(ano, mes) {
    const nome = new Date(ano, mes).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
    return `${nome.charAt(0).toUpperCase() + nome.slice(1)}/${String(ano).slice(2)}`;
  }

  function limparGraficos() {
    if (chartEvolucao) { try { chartEvolucao.destroy(); } catch (e) {} chartEvolucao = null; }
    if (chartComparativo) { try { chartComparativo.destroy(); } catch (e) {} chartComparativo = null; }
    resizeObservers.forEach(r => { try { r.disconnect(); } catch (e) {} });
    resizeObservers = [];
  }

  // ---- Bloco A: Evolução do Caixa ----

  function renderEvolucao() {
    const meses = mesesDaJanela();
    const labels = meses.map(m => rotuloMes(m.ano, m.mes));
    const receitasArr = meses.map(m => totaisDoMes(m.ano, m.mes).receitas);
    const despesasArr = meses.map(m => totaisDoMes(m.ano, m.mes).despesas);
    const saldoArr = meses.map(m => totaisDoMes(m.ano, m.mes).saldo);

    const cores = Charts.getThemeColors();

    requestAnimationFrame(() => {
      const canvas = document.getElementById('chart-evolucao');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      chartEvolucao = Charts.createChart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: 'Receitas',
              data: receitasArr,
              borderColor: cores.success,
              backgroundColor: 'transparent',
              tension: 0.3,
              pointRadius: 3,
              borderWidth: 2
            },
            {
              label: 'Despesas',
              data: despesasArr,
              borderColor: cores.danger,
              backgroundColor: 'transparent',
              tension: 0.3,
              pointRadius: 3,
              borderWidth: 2
            },
            {
              label: 'Saldo',
              data: saldoArr,
              borderColor: cores.primary,
              backgroundColor: 'transparent',
              tension: 0.3,
              pointRadius: 3,
              borderWidth: 2,
              borderDash: [5, 4]
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
        const ro = new ResizeObserver(() => chartEvolucao && chartEvolucao.resize());
        ro.observe(container);
        resizeObservers.push(ro);
      }
    });
  }

  // ---- Bloco B: Comparativo Ano a Ano ----

  function renderComparativo() {
    const anos = anosDisponiveis();
    if (anoComparativoA === null) anoComparativoA = anos[0];
    if (anoComparativoB === null) anoComparativoB = anos[1] ?? anos[0];

    const mesesLabels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const dadosA = mesesLabels.map((_, i) => totaisDoMes(anoComparativoA, i));
    const dadosB = mesesLabels.map((_, i) => totaisDoMes(anoComparativoB, i));

    const cores = Charts.getThemeColors();

    requestAnimationFrame(() => {
      const canvas = document.getElementById('chart-comparativo');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      chartComparativo = Charts.createChart(ctx, {
        type: 'bar',
        data: {
          labels: mesesLabels,
          datasets: [
            {
              label: `${anoComparativoA} - Receitas`,
              data: dadosA.map(d => d.receitas),
              backgroundColor: cores.success,
              borderRadius: 3
            },
            {
              label: `${anoComparativoA} - Despesas`,
              data: dadosA.map(d => d.despesas),
              backgroundColor: cores.danger,
              borderRadius: 3
            },
            {
              label: `${anoComparativoB} - Receitas`,
              data: dadosB.map(d => d.receitas),
              backgroundColor: 'rgba(5,150,105,0.4)',
              borderRadius: 3
            },
            {
              label: `${anoComparativoB} - Despesas`,
              data: dadosB.map(d => d.despesas),
              backgroundColor: 'rgba(220,38,38,0.4)',
              borderRadius: 3
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
        const ro = new ResizeObserver(() => chartComparativo && chartComparativo.resize());
        ro.observe(container);
        resizeObservers.push(ro);
      }
    });
  }

  function tabelaComparativa() {
    const mesesLabels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

    let html = `
      <table>
        <thead>
          <tr>
            <th>Mês</th>
            <th>Saldo ${anoComparativoA}</th>
            <th>Saldo ${anoComparativoB}</th>
            <th>Variação</th>
          </tr>
        </thead>
        <tbody>
    `;

    let totalA = 0, totalB = 0;

    mesesLabels.forEach((label, i) => {
      const sa = totaisDoMes(anoComparativoA, i).saldo;
      const sb = totaisDoMes(anoComparativoB, i).saldo;
      totalA += sa;
      totalB += sb;

      let variacaoHtml = '—';
      if (sb !== 0) {
        const pct = ((sa - sb) / Math.abs(sb)) * 100;
        const classe = pct >= 0 ? 'success' : 'danger';
        const seta = pct >= 0 ? '▲' : '▼';
        variacaoHtml = `<span class="${classe}">${seta} ${pct.toFixed(1)}%</span>`;
      } else if (sa !== 0) {
        variacaoHtml = '<span class="muted">Novo</span>';
      }

      html += `
        <tr>
          <td>${label}</td>
          <td class="${sa >= 0 ? 'success' : 'danger'}">${Utils.formatCurrency(sa)}</td>
          <td class="${sb >= 0 ? 'success' : 'danger'}">${Utils.formatCurrency(sb)}</td>
          <td>${variacaoHtml}</td>
        </tr>
      `;
    });

    // Linha de total
    let variacaoTotal = '—';
    if (totalB !== 0) {
      const pct = ((totalA - totalB) / Math.abs(totalB)) * 100;
      const classe = pct >= 0 ? 'success' : 'danger';
      const seta = pct >= 0 ? '▲' : '▼';
      variacaoTotal = `<span class="${classe}">${seta} ${pct.toFixed(1)}%</span>`;
    }
    html += `
        </tbody>
        <tfoot>
          <tr class="tfoot-total">
            <td>TOTAL</td>
            <td class="${totalA >= 0 ? 'success' : 'danger'}">${Utils.formatCurrency(totalA)}</td>
            <td class="${totalB >= 0 ? 'success' : 'danger'}">${Utils.formatCurrency(totalB)}</td>
            <td>${variacaoTotal}</td>
          </tr>
        </tfoot>
      </table>
    `;
    return html;
  }

  // ---- Bloco C: Tabela Consolidada Anual ----

  function tabelaConsolidada() {
    const anos = anosDisponiveis();
    if (anoConsolidado === null) anoConsolidado = anos[0];

    const mesesLabels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

    let html = `
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
    `;

    let acumulado = 0;
    let totalRec = 0, totalDesp = 0;

    mesesLabels.forEach((label, i) => {
      const t = totaisDoMes(anoConsolidado, i);
      acumulado += t.saldo;
      totalRec += t.receitas;
      totalDesp += t.despesas;

      const saldoClass = t.saldo >= 0 ? 'success' : 'danger';
      const acumClass = acumulado >= 0 ? 'success' : 'danger';

      html += `
        <tr>
          <td>${label}</td>
          <td class="success">${Utils.formatCurrency(t.receitas)}</td>
          <td class="danger">${Utils.formatCurrency(t.despesas)}</td>
          <td class="${saldoClass}">${Utils.formatCurrency(t.saldo)}</td>
          <td class="${acumClass}">${Utils.formatCurrency(acumulado)}</td>
        </tr>
      `;
    });

    const totalSaldo = totalRec - totalDesp;
    html += `
        </tbody>
        <tfoot>
          <tr class="tfoot-total">
            <td>TOTAL</td>
            <td class="success">${Utils.formatCurrency(totalRec)}</td>
            <td class="danger">${Utils.formatCurrency(totalDesp)}</td>
            <td class="${totalSaldo >= 0 ? 'success' : 'danger'}">${Utils.formatCurrency(totalSaldo)}</td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    `;
    return html;
  }

  // ---- Bloco D: Top Categorias no Período ----

  function topCategorias(tipo, meses, limite = 5) {
    const cats = tipo === 'receita' ? categorias().receitas : categorias().despesas;
    const todos = todosLancamentos();

    const somas = {};
    cats.forEach(c => { somas[c.id] = 0; });

    meses.forEach(m => {
      const doMes = todos.filter(l => {
        const d = Utils.parseDate(l.data);
        return d && d.getFullYear() === m.ano && d.getMonth() === m.mes && l.tipo === tipo;
      });
      doMes.forEach(l => {
        if (somas[l.categoriaId] !== undefined) somas[l.categoriaId] += l.valor;
      });
    });

    const total = Object.values(somas).reduce((a, b) => a + b, 0);
    const lista = cats.map(c => ({ nome: c.nome, total: somas[c.id] || 0 }))
                      .filter(c => c.total > 0)
                      .sort((a, b) => b.total - a.total)
                      .slice(0, limite);

    return { lista, total };
  }

  function renderTopCategorias() {
    const meses = mesesDaJanela();
    const topRec = topCategorias('receita', meses);
    const topDesp = topCategorias('despesa', meses);

    function renderLista(obj, tipo) {
      if (!obj.lista.length) {
        return '<div class="muted" style="padding:1rem; text-align:center;">Nenhum dado no período.</div>';
      }
      return `
        <ul class="top-list">
          ${obj.lista.map(c => {
            const pct = obj.total > 0 ? (c.total / obj.total) * 100 : 0;
            return `
              <li>
                <div class="top-list-header">
                  <span>${Utils.escapeHtml(c.nome)}</span>
                  <span class="${tipo === 'receita' ? 'success' : 'danger'}">${Utils.formatCurrency(c.total)}</span>
                </div>
                <div class="top-list-bar">
                  <div class="top-list-bar-fill ${tipo === 'receita' ? 'success' : 'danger'}" style="width:${pct}%"></div>
                </div>
                <div class="top-list-pct">${pct.toFixed(1)}% do total</div>
              </li>
            `;
          }).join('')}
        </ul>
      `;
    }

    return `
      <div class="top-categorias-grid">
        <div>
          <h5 style="color:var(--success); margin-bottom:0.5rem;">Top Receitas</h5>
          ${renderLista(topRec, 'receita')}
        </div>
        <div>
          <h5 style="color:var(--danger); margin-bottom:0.5rem;">Top Despesas</h5>
          ${renderLista(topDesp, 'despesa')}
        </div>
      </div>
    `;
  }

  // ---- Render principal ----

  function render() {
    if (periodHandler) {
      window.removeEventListener('periodchange', periodHandler);
      periodHandler = null;
    }
    limparGraficos();

    const main = document.getElementById('main-content');
    if (!main) return;

    const anos = anosDisponiveis();
    const opcoesAno = anos.map(a => `<option value="${a}">${a}</option>`).join('');

    main.innerHTML = `
      <div class="card" style="margin-bottom:16px;">
        <div class="card-header">
          <h3 class="card-title">Evolução do Caixa</h3>
          <div style="display:flex; gap:6px; flex-wrap:wrap;">
            <button class="btn btn-janela ${janela === 6 ? 'btn-primary' : ''}" data-janela="6">6 meses</button>
            <button class="btn btn-janela ${janela === 12 ? 'btn-primary' : ''}" data-janela="12">12 meses</button>
            <button class="btn btn-janela ${janela === 24 ? 'btn-primary' : ''}" data-janela="24">24 meses</button>
            <button class="btn btn-janela ${janela === 'custom' ? 'btn-primary' : ''}" data-janela="custom">Personalizado</button>
          </div>
        </div>
        <div id="custom-range" class="filters-bar" style="display:${janela === 'custom' ? 'flex' : 'none'}; margin-bottom:12px;">
          <div class="form-group">
            <label class="form-label">De</label>
            <input type="date" id="custom-inicio" class="form-input" value="${dataInicioCustom || ''}">
          </div>
          <div class="form-group">
            <label class="form-label">Até</label>
            <input type="date" id="custom-fim" class="form-input" value="${dataFimCustom || ''}">
          </div>
          <button id="btn-aplicar-custom" class="btn btn-primary">Aplicar</button>
        </div>
        <div class="chart-container" style="height:300px;">
          <canvas id="chart-evolucao"></canvas>
        </div>
      </div>

      <div class="card" style="margin-bottom:16px;">
        <div class="card-header" style="flex-wrap:wrap; gap:8px;">
          <h3 class="card-title">Comparativo Ano a Ano</h3>
          <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
            <label style="font-size:0.8rem; color:var(--muted);">Ano A:</label>
            <select id="ano-a" class="form-select" style="width:auto;">${opcoesAno}</select>
            <label style="font-size:0.8rem; color:var(--muted);">Ano B:</label>
            <select id="ano-b" class="form-select" style="width:auto;">${opcoesAno}</select>
          </div>
        </div>
        <div class="chart-container" style="height:280px; margin-bottom:16px;">
          <canvas id="chart-comparativo"></canvas>
        </div>
        <div class="table-container" style="margin-top:0;">
          ${tabelaComparativa()}
        </div>
      </div>

      <div class="card" style="margin-bottom:16px;">
        <div class="card-header">
          <h3 class="card-title">Consolidado Anual</h3>
          <select id="ano-consolidado" class="form-select" style="width:auto;">${opcoesAno}</select>
        </div>
        <div class="table-container" style="margin-top:0;">
          ${tabelaConsolidada()}
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Top Categorias no Período</h3>
        </div>
        ${renderTopCategorias()}
      </div>
    `;

    // Preenche seletores com valores atuais
    document.getElementById('ano-a').value = anoComparativoA;
    document.getElementById('ano-b').value = anoComparativoB;
    document.getElementById('ano-consolidado').value = anoConsolidado;

    // Eventos das janelas
    document.querySelectorAll('.btn-janela').forEach(btn => {
      btn.addEventListener('click', () => {
        const v = btn.getAttribute('data-janela');
        janela = (v === 'custom') ? 'custom' : parseInt(v);
        render();
      });
    });

    // Range personalizado
    document.getElementById('btn-aplicar-custom')?.addEventListener('click', () => {
      const i = document.getElementById('custom-inicio').value;
      const f = document.getElementById('custom-fim').value;
      if (!i || !f) {
        UI.showToast('Informe data inicial e final.', 'error');
        return;
      }
      if (i > f) {
        UI.showToast('A data inicial não pode ser posterior à final.', 'error');
        return;
      }
      dataInicioCustom = i;
      dataFimCustom = f;
      render();
    });

    // Comparativo
    document.getElementById('ano-a').addEventListener('change', function() {
      anoComparativoA = parseInt(this.value);
      render();
    });
    document.getElementById('ano-b').addEventListener('change', function() {
      anoComparativoB = parseInt(this.value);
      render();
    });

    // Consolidado
    document.getElementById('ano-consolidado').addEventListener('change', function() {
      anoConsolidado = parseInt(this.value);
      render();
    });

    // Desenha os gráficos
    renderEvolucao();
    renderComparativo();

    periodHandler = function() { render(); };
    window.addEventListener('periodchange', periodHandler);
  }

  return { render };
})();