// Página Plano de Contas – CRUD de categorias de receitas e despesas
window.PlanoContasPage = (function() {
  let receitas = [];
  let despesas = [];

  function carregar() {
    receitas = Storage.get(Storage.KEYS.PLANO_CONTAS_RECEITAS) || [];
    despesas = Storage.get(Storage.KEYS.PLANO_CONTAS_DESPESAS) || [];
  }

  function salvarReceitas() {
    Storage.set(Storage.KEYS.PLANO_CONTAS_RECEITAS, receitas);
  }

  function salvarDespesas() {
    Storage.set(Storage.KEYS.PLANO_CONTAS_DESPESAS, despesas);
  }

  function renderTabelas() {
    const tbodyRec = document.getElementById('plano-receitas-tbody');
    const tbodyDesp = document.getElementById('plano-despesas-tbody');

    if (tbodyRec) {
      tbodyRec.innerHTML = receitas.length
        ? receitas.map(r => `
            <tr>
              <td>${r.nome}</td>
              <td>
                <button class="btn-acao editar" data-id="${r.id}" data-tipo="receita"><i class="fas fa-pen"></i></button>
                <button class="btn-acao excluir" data-id="${r.id}" data-tipo="receita"><i class="fas fa-trash"></i></button>
              </td>
            </tr>`).join('')
        : '<tr><td colspan="2" style="text-align:center;">Nenhuma categoria de receita</td></tr>';
    }

    if (tbodyDesp) {
      tbodyDesp.innerHTML = despesas.length
        ? despesas.map(d => `
            <tr>
              <td>${d.nome}</td>
              <td>
                <button class="btn-acao editar" data-id="${d.id}" data-tipo="despesa"><i class="fas fa-pen"></i></button>
                <button class="btn-acao excluir" data-id="${d.id}" data-tipo="despesa"><i class="fas fa-trash"></i></button>
              </td>
            </tr>`).join('')
        : '<tr><td colspan="2" style="text-align:center;">Nenhuma categoria de despesa</td></tr>';
    }

    // Eventos de editar e excluir
    document.querySelectorAll('#plano-receitas-tbody .btn-acao, #plano-despesas-tbody .btn-acao').forEach(btn => {
      btn.addEventListener('click', function() {
        const id = parseInt(this.dataset.id);
        const tipo = this.dataset.tipo;
        if (this.classList.contains('editar')) abrirModalEdicao(tipo, id);
        else if (this.classList.contains('excluir')) excluir(tipo, id);
      });
    });
  }

  function excluir(tipo, id) {
    if (!confirm('Excluir esta categoria? Pode afetar lançamentos já cadastrados.')) return;
    if (tipo === 'receita') {
      receitas = receitas.filter(r => r.id !== id);
      salvarReceitas();
    } else {
      despesas = despesas.filter(d => d.id !== id);
      salvarDespesas();
    }
    renderTabelas();
    UI.showToast('Categoria excluída.', 'success');
  }

  function abrirModalEdicao(tipo, id) {
    const lista = tipo === 'receita' ? receitas : despesas;
    const item = lista.find(i => i.id === id);
    if (!item) return;
    const html = `
      <form id="form-editar-categoria">
        <div class="form-group">
          <label class="form-label">Nome da Categoria</label>
          <input id="edit-nome" class="form-input" value="${item.nome}" required>
        </div>
        <input type="hidden" id="edit-tipo" value="${tipo}">
        <input type="hidden" id="edit-id" value="${id}">
        <button type="submit" class="btn" style="width:100%">Salvar</button>
      </form>
    `;
    UI.showModal('Editar Categoria', html);
    document.getElementById('form-editar-categoria').addEventListener('submit', function(e) {
      e.preventDefault();
      const novoNome = document.getElementById('edit-nome').value.trim();
      const editId = parseInt(document.getElementById('edit-id').value);
      if (!novoNome) return;
      if (tipo === 'receita') {
        const idx = receitas.findIndex(r => r.id === editId);
        if (idx !== -1) receitas[idx].nome = novoNome;
        salvarReceitas();
      } else {
        const idx = despesas.findIndex(d => d.id === editId);
        if (idx !== -1) despesas[idx].nome = novoNome;
        salvarDespesas();
      }
      UI.hideModal();
      UI.showToast('Categoria atualizada.', 'success');
      renderTabelas();
    });
  }

  function abrirModalNova(tipo) {
    const html = `
      <form id="form-nova-categoria">
        <div class="form-group">
          <label class="form-label">Nome da Categoria</label>
          <input id="nova-nome" class="form-input" placeholder="Ex: Vendas, Salários..." required>
        </div>
        <input type="hidden" id="nova-tipo" value="${tipo}">
        <button type="submit" class="btn" style="width:100%">Adicionar</button>
      </form>
    `;
    UI.showModal('Nova Categoria', html);
    document.getElementById('form-nova-categoria').addEventListener('submit', function(e) {
      e.preventDefault();
      const nome = document.getElementById('nova-nome').value.trim();
      if (!nome) return;
      const novo = { id: Date.now(), nome, tipo };
      if (tipo === 'receita') {
        receitas.push(novo);
        salvarReceitas();
      } else {
        despesas.push(novo);
        salvarDespesas();
      }
      UI.hideModal();
      UI.showToast('Categoria adicionada.', 'success');
      renderTabelas();
    });
  }

  function render() {
    carregar();
    const main = document.getElementById('main-content');
    if (!main) return;

    main.innerHTML = `
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.5rem;">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Receitas</h3>
            <button id="btn-nova-receita" class="btn">+ Nova</button>
          </div>
          <div class="table-container">
            <table>
              <thead><tr><th>Categoria</th><th>Ações</th></tr></thead>
              <tbody id="plano-receitas-tbody"></tbody>
            </table>
          </div>
        </div>
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Despesas</h3>
            <button id="btn-nova-despesa" class="btn">+ Nova</button>
          </div>
          <div class="table-container">
            <table>
              <thead><tr><th>Categoria</th><th>Ações</th></tr></thead>
              <tbody id="plano-despesas-tbody"></tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    document.getElementById('btn-nova-receita').addEventListener('click', () => abrirModalNova('receita'));
    document.getElementById('btn-nova-despesa').addEventListener('click', () => abrirModalNova('despesa'));

    renderTabelas();
  }

  return { render };
})();