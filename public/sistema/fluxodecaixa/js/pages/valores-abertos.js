/**
 * Página Valores em Aberto – Pendências e inadimplência com paginação.
 */
window.ValoresAbertosPage = (function() {
  let lancamentos = [];
  let categoriasReceitas = [];
  let categoriasDespesas = [];
  let paginaAtual = 1;
  const POR_PAGINA = 10;

  function carregarDados() {
    const todos = Storage.get(Storage.KEYS.LANCAMENTOS) || [];
    lancamentos = todos.filter(l => l.status === 'pendente');
    categoriasReceitas = Storage.get(Storage.KEYS.PLANO_CONTAS_RECEITAS) || [];
    categoriasDespesas = Storage.get(Storage.KEYS.PLANO_CONTAS_DESPESAS) || [];
  }

  function isVencido(dataStr) {
    const d = Utils.parseDate(dataStr);
    if (!d) return false;
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    return d < hoje;
  }

  function renderTabela() {
    const { itens, totalPaginas, totalItens, paginaAtual: pg } = Utils.paginar(lancamentos, paginaAtual, POR_PAGINA);
    paginaAtual = pg;

    const tbody = document.getElementById('valores-abertos-tbody');
    const pagInfo = document.getElementById('valores-abertos-pag-info');
    const btnPrev = document.getElementById('valores-abertos-pag-prev');
    const btnNext = document.getElementById('valores-abertos-pag-next');

    if (!tbody) return;

    if (itens.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:2rem;">Nenhum valor em aberto.</td></tr>';
    } else {
      tbody.innerHTML = itens.map(l => {
        const cat = l.tipo === 'receita' 
          ? categoriasReceitas.find(c => c.id === l.categoriaId) 
          : categoriasDespesas.find(c => c.id === l.categoriaId);
        const nomeCat = cat ? Utils.escapeHtml(cat.nome) : '—';
        const vencido = isVencido(l.data);
        const rowStyle = vencido ? 'style="background-color: rgba(239,68,68,0.06);"' : '';
        const statusBadge = vencido ? 'badge badge-danger' : 'badge badge-warning';
        const statusTexto = vencido ? 'Vencido' : 'Pendente';
        const valorClass = l.tipo === 'receita' ? 'success' : 'danger';
        const valorFormatado = (l.tipo === 'despesa' ? '-' : '') + Utils.formatCurrency(l.valor);
        const dataFmt = Utils.parseDate(l.data)?.toLocaleDateString('pt-BR') || l.data;
        return `
          <tr ${rowStyle}>
            <td>${dataFmt}</td>
            <td>${Utils.escapeHtml(l.descricao)}</td>
            <td>${nomeCat}</td>
            <td>${l.tipo === 'receita' ? 'Receita' : 'Despesa'}</td>
            <td class="${valorClass}">${valorFormatado}</td>
            <td><span class="${statusBadge}">${statusTexto}</span></td>
            <td>
              <button class="btn-acao editar" data-id="${l.id}" title="Editar"><i class="fas fa-pen"></i></button>
              <button class="btn-acao excluir" data-id="${l.id}" title="Excluir"><i class="fas fa-trash"></i></button>
            </td>
          </tr>`;
      }).join('');

      tbody.querySelectorAll('.btn-acao.editar').forEach(btn => {
        btn.addEventListener('click', function() { abrirModalEdicao(parseInt(this.getAttribute('data-id'))); });
      });
      tbody.querySelectorAll('.btn-acao.excluir').forEach(btn => {
        btn.addEventListener('click', function() { excluir(parseInt(this.getAttribute('data-id'))); });
      });
    }

    if (pagInfo) {
      pagInfo.textContent = totalItens === 0
        ? 'Nenhum registro'
        : `Página ${paginaAtual} de ${totalPaginas} — ${totalItens} registro(s)`;
    }
    if (btnPrev) btnPrev.disabled = paginaAtual <= 1;
    if (btnNext) btnNext.disabled = paginaAtual >= totalPaginas;
  }

  function irParaPagina(delta) {
    paginaAtual += delta;
    renderTabela();
  }

  function excluir(id) {
    const item = lancamentos.find(l => l.id === id);
    const msg = item ? `Deseja realmente excluir o lançamento "${item.descricao}"?` : 'Deseja realmente excluir este lançamento?';
    UI.confirm(msg, function() {
      const todos = Storage.get(Storage.KEYS.LANCAMENTOS) || [];
      const novos = todos.filter(l => l.id !== id);
      Storage.set(Storage.KEYS.LANCAMENTOS, novos);
      carregarDados();
      renderTabela();
      UI.showToast('Lançamento excluído.', 'success');
    }, { title: 'Excluir Lançamento', confirmText: 'Excluir', confirmClass: 'btn-danger' });
  }

  function abrirModalEdicao(id) {
    const lanc = lancamentos.find(l => l.id === id);
    if (!lanc) { UI.showToast('Lançamento não encontrado.', 'error'); return; }

    const categorias = lanc.tipo === 'receita' ? categoriasReceitas : categoriasDespesas;
    const valorFormatado = Utils.formatCurrencyInput(lanc.valor);

    const html = `
      <form id="form-editar-valores" novalidate>
        <div class="form-group">
          <label class="form-label">Tipo</label>
          <select id="edit-tipo" class="form-select" disabled>
            <option value="receita" ${lanc.tipo === 'receita' ? 'selected' : ''}>Receita</option>
            <option value="despesa" ${lanc.tipo === 'despesa' ? 'selected' : ''}>Despesa</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Categoria *</label>
          <select id="edit-categoria" class="form-select" required>
            ${categorias.map(c => `<option value="${c.id}" ${lanc.categoriaId === c.id ? 'selected' : ''}>${Utils.escapeHtml(c.nome)}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Descrição *</label>
          <input id="edit-descricao" class="form-input" maxlength="200" value="${Utils.escapeHtml(lanc.descricao)}" required>
        </div>
        <div class="form-group">
          <label class="form-label">Valor (R$) *</label>
          <input id="edit-valor" type="text" inputmode="decimal" class="form-input" value="${valorFormatado}" placeholder="0,00" required>
        </div>
        <div class="form-group">
          <label class="form-label">Data *</label>
          <input id="edit-data" type="date" class="form-input" value="${lanc.data}" required>
        </div>
        <div class="form-group">
          <label class="form-label">Data de pagamento</label>
          <input id="edit-data-pagamento" type="date" class="form-input" value="${lanc.dataPagamento || ''}">
        </div>
        <div class="form-group">
          <label class="form-label">Status *</label>
          <select id="edit-status" class="form-select" required>
            <option value="pendente" ${lanc.status === 'pendente' ? 'selected' : ''}>Pendente</option>
            <option value="pago" ${lanc.status === 'pago' ? 'selected' : ''}>Pago/Recebido</option>
          </select>
        </div>
        <input type="hidden" id="edit-id" value="${lanc.id}">
        <button type="submit" class="btn btn-primary" style="width:100%">Salvar Alterações</button>
      </form>
    `;
    UI.showModal('Editar Lançamento', html);

    const valorInput = document.getElementById('edit-valor');
    valorInput.addEventListener('blur', function() {
      const n = Utils.parseCurrencyInput(this.value);
      if (!isNaN(n)) this.value = Utils.formatCurrencyInput(n);
    });

    document.getElementById('form-editar-valores').addEventListener('submit', function(e) {
      e.preventDefault();
      const id = parseInt(document.getElementById('edit-id').value);
      const categoriaId = parseInt(document.getElementById('edit-categoria').value);
      const descricao = document.getElementById('edit-descricao').value.trim();
      const valor = Utils.parseCurrencyInput(valorInput.value);
      const data = document.getElementById('edit-data').value;
      const dataPagamento = document.getElementById('edit-data-pagamento').value;
      const status = document.getElementById('edit-status').value;

      if (!categoriaId || isNaN(categoriaId)) { UI.showToast('Selecione uma categoria.', 'error'); return; }
      if (!descricao) { UI.showToast('A descrição é obrigatória.', 'error'); return; }
      if (isNaN(valor) || valor <= 0) { UI.showToast('O valor deve ser maior que zero.', 'error'); valorInput.focus(); return; }
      if (!Utils.isValidDate(data)) { UI.showToast('Data inválida.', 'error'); return; }
      if (dataPagamento) {
        if (!Utils.isValidDate(dataPagamento)) { UI.showToast('Data de pagamento inválida.', 'error'); return; }
        if (dataPagamento < data) { UI.showToast('A data de pagamento não pode ser anterior à data do lançamento.', 'error'); return; }
      }

      const todos = Storage.get(Storage.KEYS.LANCAMENTOS) || [];
      const index = todos.findIndex(l => l.id === id);
      if (index !== -1) {
        todos[index] = { ...todos[index], categoriaId, descricao, valor, data, dataPagamento: dataPagamento || data, status };
        Storage.set(Storage.KEYS.LANCAMENTOS, todos);
        carregarDados();
        UI.hideModal();
        UI.showToast('Lançamento atualizado.', 'success');
        renderTabela();
      }
    });
  }

  function render() {
    carregarDados();
    paginaAtual = 1;
    const main = document.getElementById('main-content');
    if (!main) return;

    main.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Valores em Aberto</h3>
          <span style="font-size:0.85rem; color:var(--muted);">${lancamentos.length} pendência(s)</span>
        </div>
        <div class="table-container">
          <table>
            <thead>
              <tr><th>Data</th><th>Descrição</th><th>Categoria</th><th>Tipo</th><th>Valor</th><th>Status</th><th>Ações</th></tr>
            </thead>
            <tbody id="valores-abertos-tbody"></tbody>
          </table>
        </div>
        <div class="pagination">
          <div class="pagination-info" id="valores-abertos-pag-info"></div>
          <div class="pagination-buttons">
            <button id="valores-abertos-pag-prev" class="btn"><i class="fas fa-chevron-left"></i> Anterior</button>
            <button id="valores-abertos-pag-next" class="btn">Próxima <i class="fas fa-chevron-right"></i></button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('valores-abertos-pag-prev').addEventListener('click', () => irParaPagina(-1));
    document.getElementById('valores-abertos-pag-next').addEventListener('click', () => irParaPagina(1));

    renderTabela();
  }

  return { render };
})();