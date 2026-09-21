/**
 * Página Contas a Pagar – Lista de despesas com filtros e paginação.
 */
window.ContasPagarPage = (function() {
  let despesas = [];
  let categorias = [];
  let paginaAtual = 1;
  const POR_PAGINA = 10;

  function carregarDados() {
    const lancamentos = Storage.get(Storage.KEYS.LANCAMENTOS) || [];
    despesas = lancamentos.filter(l => l.tipo === 'despesa');
    categorias = Storage.get(Storage.KEYS.PLANO_CONTAS_DESPESAS) || [];
  }

  function filtrar(filtros) {
    return despesas.filter(l => {
      if (filtros.status && l.status !== filtros.status) return false;
      if (filtros.dataInicio && l.data < filtros.dataInicio) return false;
      if (filtros.dataFim && l.data > filtros.dataFim) return false;
      return true;
    });
  }

  function renderTabela(filtros) {
    const dados = filtrar(filtros);
    const { itens, totalPaginas, totalItens, paginaAtual: pg } = Utils.paginar(dados, paginaAtual, POR_PAGINA);
    paginaAtual = pg;

    const tbody = document.getElementById('contas-pagar-tbody');
    const pagInfo = document.getElementById('contas-pagar-pag-info');
    const btnPrev = document.getElementById('contas-pagar-pag-prev');
    const btnNext = document.getElementById('contas-pagar-pag-next');

    if (!tbody) return;

    if (itens.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:2rem;">Nenhuma conta a pagar encontrada.</td></tr>';
    } else {
      tbody.innerHTML = itens.map(l => {
        const cat = categorias.find(c => c.id === l.categoriaId);
        const nomeCat = cat ? Utils.escapeHtml(cat.nome) : '—';
        const statusBadge = l.status === 'pago' ? 'badge badge-success' : 'badge badge-warning';
        const dataFmt = Utils.parseDate(l.data)?.toLocaleDateString('pt-BR') || l.data;
        return `
          <tr>
            <td>${dataFmt}</td>
            <td>${Utils.escapeHtml(l.descricao)}</td>
            <td>${nomeCat}</td>
            <td class="danger">- ${Utils.formatCurrency(l.valor)}</td>
            <td><span class="${statusBadge}">${l.status}</span></td>
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
    renderTabela(obterFiltrosAtuais());
  }

  function excluir(id) {
    const item = despesas.find(l => l.id === id);
    const msg = item ? `Deseja realmente excluir a conta "${item.descricao}"?` : 'Deseja realmente excluir esta conta?';
    UI.confirm(msg, function() {
      const todos = Storage.get(Storage.KEYS.LANCAMENTOS) || [];
      const novos = todos.filter(l => l.id !== id);
      Storage.set(Storage.KEYS.LANCAMENTOS, novos);
      carregarDados();
      renderTabela(obterFiltrosAtuais());
      UI.showToast('Conta excluída.', 'success');
    }, { title: 'Excluir Conta', confirmText: 'Excluir', confirmClass: 'btn-danger' });
  }

  function obterFiltrosAtuais() {
    return {
      status: document.getElementById('filtro-status')?.value || '',
      dataInicio: document.getElementById('filtro-inicio')?.value || '',
      dataFim: document.getElementById('filtro-fim')?.value || ''
    };
  }

  function abrirModalEdicao(id) {
    const lanc = despesas.find(l => l.id === id);
    if (!lanc) { UI.showToast('Conta não encontrada.', 'error'); return; }

    const valorFormatado = Utils.formatCurrencyInput(lanc.valor);

    const html = `
      <form id="form-editar-despesa" novalidate>
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
            <option value="pago" ${lanc.status === 'pago' ? 'selected' : ''}>Pago</option>
          </select>
        </div>
        <input type="hidden" id="edit-id" value="${lanc.id}">
        <button type="submit" class="btn btn-primary" style="width:100%">Salvar Alterações</button>
      </form>
    `;
    UI.showModal('Editar Conta a Pagar', html);

    const valorInput = document.getElementById('edit-valor');
    valorInput.addEventListener('blur', function() {
      const n = Utils.parseCurrencyInput(this.value);
      if (!isNaN(n)) this.value = Utils.formatCurrencyInput(n);
    });

    document.getElementById('form-editar-despesa').addEventListener('submit', function(e) {
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
        UI.showToast('Conta atualizada.', 'success');
        renderTabela(obterFiltrosAtuais());
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
        <div class="card-header"><h3 class="card-title">Contas a Pagar</h3></div>
        <div class="filters-bar">
          <div class="form-group">
            <label class="form-label" for="filtro-status">Status</label>
            <select id="filtro-status" class="form-select">
              <option value="">Todos</option>
              <option value="pendente">Pendente</option>
              <option value="pago">Pago</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="filtro-inicio">Data Início</label>
            <input id="filtro-inicio" type="date" class="form-input">
          </div>
          <div class="form-group">
            <label class="form-label" for="filtro-fim">Data Fim</label>
            <input id="filtro-fim" type="date" class="form-input">
          </div>
          <button id="btn-filtrar" class="btn">Filtrar</button>
        </div>
        <div class="table-container">
          <table>
            <thead>
              <tr><th>Data</th><th>Descrição</th><th>Categoria</th><th>Valor</th><th>Status</th><th>Ações</th></tr>
            </thead>
            <tbody id="contas-pagar-tbody"></tbody>
          </table>
        </div>
        <div class="pagination">
          <div class="pagination-info" id="contas-pagar-pag-info"></div>
          <div class="pagination-buttons">
            <button id="contas-pagar-pag-prev" class="btn"><i class="fas fa-chevron-left"></i> Anterior</button>
            <button id="contas-pagar-pag-next" class="btn">Próxima <i class="fas fa-chevron-right"></i></button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('btn-filtrar').addEventListener('click', () => {
      paginaAtual = 1;
      renderTabela(obterFiltrosAtuais());
    });
    document.getElementById('contas-pagar-pag-prev').addEventListener('click', () => irParaPagina(-1));
    document.getElementById('contas-pagar-pag-next').addEventListener('click', () => irParaPagina(1));

    renderTabela({ status: '', dataInicio: '', dataFim: '' });
  }

  return { render };
})();