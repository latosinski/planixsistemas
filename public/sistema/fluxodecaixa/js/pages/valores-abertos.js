// Página Valores em Aberto – Pendências e inadimplência
window.ValoresAbertosPage = (function() {
  let lancamentos = [];
  let categoriasReceitas = [];
  let categoriasDespesas = [];

  function carregarDados() {
    const todos = Storage.get(Storage.KEYS.LANCAMENTOS) || [];
    lancamentos = todos.filter(l => l.status === 'pendente');
    categoriasReceitas = Storage.get(Storage.KEYS.PLANO_CONTAS_RECEITAS) || [];
    categoriasDespesas = Storage.get(Storage.KEYS.PLANO_CONTAS_DESPESAS) || [];
  }

  function isVencido(data) {
    const hoje = new Date();
    hoje.setHours(0,0,0,0);
    return new Date(data + 'T00:00:00') < hoje;
  }

  function renderTabela() {
    const tbody = document.getElementById('valores-abertos-tbody');
    if (!tbody) return;

    if (lancamentos.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:2rem;">Nenhum valor em aberto.</td></tr>';
      return;
    }

    tbody.innerHTML = lancamentos.map(l => {
      const cat = l.tipo === 'receita' 
        ? categoriasReceitas.find(c => c.id === l.categoriaId) 
        : categoriasDespesas.find(c => c.id === l.categoriaId);
      const nomeCat = cat ? cat.nome : '—';
      const vencido = isVencido(l.data);
      const rowClass = vencido ? 'style="background-color: rgba(239,68,68,0.08);"' : '';
      const statusBadge = vencido ? 'badge badge-danger' : 'badge badge-warning';
      const statusTexto = vencido ? 'Vencido' : 'Pendente';
      const valorClass = l.tipo === 'receita' ? 'success' : 'danger';
      const valorFormatado = (l.tipo === 'despesa' ? '-' : '') + 'R$ ' + l.valor.toFixed(2);
      return `
        <tr ${rowClass}>
          <td>${new Date(l.data + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
          <td>${l.descricao}</td>
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
    if (!confirm('Deseja realmente excluir este lançamento?')) return;
    const todos = Storage.get(Storage.KEYS.LANCAMENTOS) || [];
    const novos = todos.filter(l => l.id !== id);
    Storage.set(Storage.KEYS.LANCAMENTOS, novos);
    carregarDados();
    renderTabela();
    UI.showToast('Lançamento excluído.', 'success');
  }

  function abrirModalEdicao(id) {
    const lanc = lancamentos.find(l => l.id === id);
    if (!lanc) return;

    const categorias = lanc.tipo === 'receita' ? categoriasReceitas : categoriasDespesas;
    const html = `
      <form id="form-editar-valores">
        <div class="form-group">
          <label class="form-label">Tipo</label>
          <select id="edit-tipo" class="form-select" disabled>
            <option value="receita" ${lanc.tipo === 'receita' ? 'selected' : ''}>Receita</option>
            <option value="despesa" ${lanc.tipo === 'despesa' ? 'selected' : ''}>Despesa</option>
          </select>
        </div>
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
          <label class="form-label">Data do lançamento</label>
          <input id="edit-data" type="date" class="form-input" value="${lanc.data}" required>
        </div>
        <div class="form-group">
          <label class="form-label">Data de pagamento</label>
          <input id="edit-data-pagamento" type="date" class="form-input" value="${lanc.dataPagamento || ''}">
        </div>
        <div class="form-group">
          <label class="form-label">Status</label>
          <select id="edit-status" class="form-select" required>
            <option value="pendente" ${lanc.status === 'pendente' ? 'selected' : ''}>Pendente</option>
            <option value="pago" ${lanc.status === 'pago' ? 'selected' : ''}>Pago/Recebido</option>
          </select>
        </div>
        <input type="hidden" id="edit-id" value="${lanc.id}">
        <button type="submit" class="btn" style="width:100%">Salvar Alterações</button>
      </form>
    `;

    UI.showModal('Editar Lançamento', html);

    document.getElementById('form-editar-valores').addEventListener('submit', function(e) {
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
        UI.showToast('Lançamento atualizado.', 'success');
        renderTabela();
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
          <h3 class="card-title">Valores em Aberto</h3>
          <span style="font-size:0.9rem; color:var(--text-secondary);">${lancamentos.length} pendência(s)</span>
        </div>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Descrição</th>
                <th>Categoria</th>
                <th>Tipo</th>
                <th>Valor</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody id="valores-abertos-tbody"></tbody>
          </table>
        </div>
      </div>
    `;

    renderTabela();
  }

  return { render };
})();