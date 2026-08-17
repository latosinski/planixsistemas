// Página Metas – Definição e acompanhamento de metas mensais
window.MetasPage = (function() {
  function carregarMetas() {
    return Storage.get(Storage.KEYS.METAS) || { receita: 0, despesa: 0 };
  }

  function calcularRealizado() {
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
    return { receitas, despesas };
  }

  function salvarMetas(metaReceita, metaDespesa) {
    Storage.set(Storage.KEYS.METAS, { receita: metaReceita, despesa: metaDespesa });
  }

  function render() {
    const metas = carregarMetas();
    const realizado = calcularRealizado();
    const pctReceita = metas.receita > 0 ? Math.min(100, (realizado.receitas / metas.receita) * 100) : 0;
    const pctDespesa = metas.despesa > 0 ? Math.min(100, (realizado.despesas / metas.despesa) * 100) : 0;

    const main = document.getElementById('main-content');
    if (!main) return;

    main.innerHTML = `
      <div class="card" style="margin-bottom:1.5rem;">
        <div class="card-header">
          <h3 class="card-title">Metas do Mês Atual</h3>
        </div>
        <form id="form-metas" style="display:flex; gap:1.5rem; flex-wrap:wrap; align-items:flex-end;">
          <div class="form-group" style="flex:1; min-width:200px;">
            <label class="form-label" for="meta-receita">Meta de Receita (R$)</label>
            <input id="meta-receita" type="number" step="0.01" min="0" class="form-input" value="${metas.receita}">
          </div>
          <div class="form-group" style="flex:1; min-width:200px;">
            <label class="form-label" for="meta-despesa">Meta de Despesa (R$)</label>
            <input id="meta-despesa" type="number" step="0.01" min="0" class="form-input" value="${metas.despesa}">
          </div>
          <button type="submit" class="btn">Salvar Metas</button>
        </form>
      </div>

      <div class="dashboard-grid">
        <div class="card kpi-card">
          <div class="kpi-label">Receitas Realizadas</div>
          <div class="kpi-value success">R$ ${realizado.receitas.toFixed(2)}</div>
          <div style="margin-top:1rem; background:var(--border-color); border-radius:10px; height:12px; overflow:hidden;">
            <div style="width:${pctReceita}%; background:var(--success); height:100%; border-radius:10px; transition: width 0.5s;"></div>
          </div>
          <div style="font-size:0.8rem; color:var(--text-secondary); margin-top:0.3rem;">${pctReceita.toFixed(1)}% da meta</div>
        </div>
        <div class="card kpi-card">
          <div class="kpi-label">Despesas Realizadas</div>
          <div class="kpi-value danger">R$ ${realizado.despesas.toFixed(2)}</div>
          <div style="margin-top:1rem; background:var(--border-color); border-radius:10px; height:12px; overflow:hidden;">
            <div style="width:${pctDespesa}%; background:var(--danger); height:100%; border-radius:10px; transition: width 0.5s;"></div>
          </div>
          <div style="font-size:0.8rem; color:var(--text-secondary); margin-top:0.3rem;">${pctDespesa.toFixed(1)}% da meta</div>
        </div>
      </div>
    `;

    document.getElementById('form-metas').addEventListener('submit', function(e) {
      e.preventDefault();
      const receita = parseFloat(document.getElementById('meta-receita').value) || 0;
      const despesa = parseFloat(document.getElementById('meta-despesa').value) || 0;
      salvarMetas(receita, despesa);
      UI.showToast('Metas salvas com sucesso!', 'success');
      // Atualizar a página para refletir novas metas
      render();
    });
  }

  return { render };
})();