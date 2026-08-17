// Página Contas a Receber – Lista de receitas com filtros
window.ContasReceberPage = (function() {
  let receitas = [];
  let categorias = [];

  function carregarDados() {
    const lancamentos = Storage.get(Storage.KEYS.LANCAMENTOS) || [];
    receitas = lancamentos.filter(l => l.tipo === 'receita');
    categorias = Storage.get(Storage.KEYS.PLANO_CONTAS_RECEITAS) || [];
  }

  function filtrar(filtros) {
    return receitas.filter(l => {
      if (filtros.status && l.status !== filtros.status) return false;
      if (filtros.dataInicio && l.data < filtros.dataInicio) return false;
      if (filtros.dataFim && l.data > filtros.dataFim) return false;
      return true;
    });
  }

  function renderTabela(filtros) {
    const dados = filtrar(filtros);
    const tbody = document.getElementById('contas-receber-tbody');
    if (!tbody) return;

    if (dados.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:2rem;">Nenhuma conta a receber encontrada.</td></tr>';
      return;
    }

    tbody.innerHTML = dados.map(l => {
      const cat = categorias.find(c => c.id === l.categoriaId);
      const nomeCat = cat ? cat.nome : '—';
      const statusBadge = l.status === 'pago' ? 'badge badge-success' : 'badge badge-warning';
      return `
        <tr>
          <td>${new Date(l.data + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
          <td>${l.descricao}</td>
          <td>${nomeCat}</td>
          <td class="success">R$ ${l.valor.toFixed(2)}</td>
          <td><span class="${statusBadge}">${l.status}</span></td>
          <td>
            <button class="btn-acao editar" data-id="${l.id}" title="Editar"><i class="fas fa-pen"></i></button>
            <button class="btn-acao excluir" data-id="${l.id}" title="Excluir"><i class="fas fa-trash"></i></button>
          </td>
        </tr>`;
    }).join('');

    tbody.querySelectorAll('.btn-acao.editar').forEach(btn => {
      btn.addEventListener('click', function() {
        const id = parseInt(this.getAttribute('data-id'));
        abrirModalEdicao(id);
      });
    });
    tbody.querySelectorAll('.btn-acao.excluir').forEach(btn => {
      btn.addEventListener('click', function() {
        const id = parseInt(this.getAttribute('data-id'));
        excluir(id);
      });
    });
  }

  function excluir(id) {
    if (!confirm('Deseja realmente excluir esta conta?')) return;
    const todos = Storage.get(Storage.KEYS.LANCAMENTOS) || [];
    const novos = todos.filter(l => l.id !== id);
    Storage.set(Storage.KEYS.LANCAMENTOS, novos);
    carregarDados();
    renderTabela(obterFiltrosAtuais());
    UI.showToast('Conta excluída.', 'success');
  }

  function obterFiltrosAtuais() {
    const status = document.getElementById('filtro-status')?.value || '';
    const dataInicio = document.getElementById('filtro-inicio')?.value || '';
    const dataFim = document.getElementById('filtro-fim')?.value || '';
    return { status, dataInicio, dataFim };
  }

  function abrirModalEdicao(id) {
    const lanc = receitas.find(l => l.id === id);
    if (!lanc) return;

    const html = `
      <form id="form-editar-receita">
        <div class="form-group">
          <label class="form-label">Categoria</label>
          <select id="edit-categoria" class="form-select" required>
            ${categorias.map(c => `<option value="${c.id}" ${lanc.categoriaId === c.id ? 'selected' : ''}>${c.nome}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Descrição</label>
          <input id="edit-descricao" class="form-input" value="${lanc.descricao}" required>
        </div>
        <div class="form-group">
          <label class="form-label">Valor (R$)</label>
          <input id="edit-valor" type="number" step="0.01" min="0.01" class="form-input" value="${lanc.valor}" required>
        </div>
        <div class="form-group">
          <label class="form-label">Data</label>
          <input id="edit-data" type="date" class="form-input" value="${lanc.data}" required>
        </div>
        <div class="form-group">
          <label class="form-label">Data de recebimento</label>
          <input id="edit-data-pagamento" type="date" class="form-input" value="${lanc.dataPagamento || ''}">
        </div>
        <div class="form-group">
          <label class="form-label">Status</label>
          <select id="edit-status" class="form-select" required>
            <option value="pendente" ${lanc.status === 'pendente' ? 'selected' : ''}>Pendente</option>
            <option value="pago" ${lanc.status === 'pago' ? 'selected' : ''}>Recebido</option>
          </select>
        </div>
        <input type="hidden" id="edit-id" value="${lanc.id}">
        <button type="submit" class="btn" style="width:100%">Salvar Alterações</button>
      </form>
    `;

    UI.showModal('Editar Conta a Receber', html);

    document.getElementById('form-editar-receita').addEventListener('submit', function(e) {
      e.preventDefault();
      const id = parseInt(document.getElementById('edit-id').value);
      const categoriaId = parseInt(document.getElementById('edit-categoria').value);
      const descricao = document.getElementById('edit-descricao').value.trim();
      const valor = parseFloat(document.getElementById('edit-valor').value);
      const data = document.getElementById('edit-data').value;
      const dataPagamento = document.getElementById('edit-data-pagamento').value || data;
      const status = document.getElementById('edit-status').value;

      const todos = Storage.get(Storage.KEYS.LANCAMENTOS) || [];
      const index = todos.findIndex(l => l.id === id);
      if (index !== -1) {
        todos[index] = { ...todos[index], categoriaId, descricao, valor, data, dataPagamento, status };
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
    const main = document.getElementById('main-content');
    if (!main) return;

    main.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Contas a Receber</h3>
        </div>
        <div class="filters-bar">
          <div class="form-group">
            <label class="form-label" for="filtro-status">Status</label>
            <select id="filtro-status" class="form-select">
              <option value="">Todos</option>
              <option value="pendente">Pendente</option>
              <option value="pago">Recebido</option>
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
              <tr>
                <th>Data</th>
                <th>Descrição</th>
                <th>Categoria</th>
                <th>Valor</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody id="contas-receber-tbody"></tbody>
          </table>
        </div>
      </div>
    `;

    document.getElementById('btn-filtrar').addEventListener('click', () => {
      renderTabela(obterFiltrosAtuais());
    });

    renderTabela({ status: '', dataInicio: '', dataFim: '' });
  }

  return { render };
})();