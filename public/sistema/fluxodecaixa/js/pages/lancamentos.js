// Página de Lançamentos – Listagem com filtros e modal de cadastro/edição
window.LancamentosPage = (function() {
  console.log('LancamentosPage módulo carregado.');

  let lancamentos = [];
  let categoriasReceitas = [];
  let categoriasDespesas = [];

  function carregarDados() {
    lancamentos = Storage.get(Storage.KEYS.LANCAMENTOS) || [];
    categoriasReceitas = Storage.get(Storage.KEYS.PLANO_CONTAS_RECEITAS) || [];
    categoriasDespesas = Storage.get(Storage.KEYS.PLANO_CONTAS_DESPESAS) || [];
  }

  function filtrar(filtros) {
    return lancamentos.filter(l => {
      if (filtros.tipo && l.tipo !== filtros.tipo) return false;
      if (filtros.dataInicio && l.data < filtros.dataInicio) return false;
      if (filtros.dataFim && l.data > filtros.dataFim) return false;
      return true;
    });
  }

  function renderTabela(filtros) {
    const dados = filtrar(filtros);
    const tbody = document.getElementById('lancamentos-tbody');
    if (!tbody) return;

    if (dados.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:2rem;">Nenhum lançamento encontrado.</td></tr>`;
      return;
    }

    tbody.innerHTML = dados.map(l => {
      const cat = l.tipo === 'receita' 
        ? categoriasReceitas.find(c => c.id === l.categoriaId) 
        : categoriasDespesas.find(c => c.id === l.categoriaId);
      const nomeCat = cat ? cat.nome : '—';
      const valorClass = l.tipo === 'receita' ? 'success' : 'danger';
      const statusBadge = l.status === 'pago' ? 'badge badge-success' : 'badge badge-warning';
      const valorFormatado = (l.tipo === 'despesa' ? '-' : '') + 'R$ ' + l.valor.toFixed(2);
      return `
        <tr>
          <td>${new Date(l.data + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
          <td>${l.descricao}</td>
          <td>${nomeCat}</td>
          <td class="${valorClass}">${valorFormatado}</td>
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
        excluirLancamento(id);
      });
    });
  }

  function excluirLancamento(id) {
    if (!confirm('Deseja realmente excluir este lançamento?')) return;
    const novos = lancamentos.filter(l => l.id !== id);
    Storage.set(Storage.KEYS.LANCAMENTOS, novos);
    lancamentos = novos;
    const filtros = obterFiltrosAtuais();
    renderTabela(filtros);
    UI.showToast('Lançamento excluído.', 'success');
  }

  function obterFiltrosAtuais() {
    const tipo = document.getElementById('filtro-tipo')?.value || '';
    const dataInicio = document.getElementById('filtro-inicio')?.value || '';
    const dataFim = document.getElementById('filtro-fim')?.value || '';
    return { tipo, dataInicio, dataFim };
  }

  function abrirModalCadastro() {
    preencherModal(null);
  }

  function abrirModalEdicao(id) {
    const lanc = lancamentos.find(l => l.id === id);
    if (!lanc) return;
    preencherModal(lanc);
  }

  function preencherModal(lanc) {
    const titulo = lanc ? 'Editar Lançamento' : 'Novo Lançamento';
    const isEdicao = !!lanc;

    const html = `
      <form id="form-lancamento">
        <div class="form-group">
          <label class="form-label">Tipo</label>
          <select id="lanc-tipo" class="form-select" required>
            <option value="">Selecione...</option>
            <option value="receita" ${lanc && lanc.tipo === 'receita' ? 'selected' : ''}>Receita</option>
            <option value="despesa" ${lanc && lanc.tipo === 'despesa' ? 'selected' : ''}>Despesa</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Categoria</label>
          <select id="lanc-categoria" class="form-select" required ${!lanc ? 'disabled' : ''}>
            <option value="">Selecione o tipo primeiro</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Descrição</label>
          <input id="lanc-descricao" class="form-input" value="${lanc ? lanc.descricao : ''}" required>
        </div>
        <div class="form-group">
          <label class="form-label">Valor (R$)</label>
          <input id="lanc-valor" type="number" step="0.01" min="0.01" class="form-input" value="${lanc ? lanc.valor : ''}" required>
        </div>
        <div class="form-group">
          <label class="form-label">Data do lançamento</label>
          <input id="lanc-data" type="date" class="form-input" value="${lanc ? lanc.data : ''}" required>
        </div>
        <div class="form-group">
          <label class="form-label">Data de pagamento</label>
          <input id="lanc-data-pagamento" type="date" class="form-input" value="${lanc ? lanc.dataPagamento : ''}">
        </div>
        <div class="form-group">
          <label class="form-label">Status</label>
          <select id="lanc-status" class="form-select" required>
            <option value="pendente" ${lanc && lanc.status === 'pendente' ? 'selected' : ''}>Pendente</option>
            <option value="pago" ${lanc && lanc.status === 'pago' ? 'selected' : ''}>Pago</option>
          </select>
        </div>
        <input type="hidden" id="lanc-id" value="${lanc ? lanc.id : ''}">
        <button type="submit" class="btn" style="width:100%">${isEdicao ? 'Atualizar' : 'Salvar'} Lançamento</button>
      </form>
    `;

    UI.showModal(titulo, html);

    const tipoSelect = document.getElementById('lanc-tipo');
    const catSelect = document.getElementById('lanc-categoria');

    function carregarCategorias(tipo) {
      catSelect.innerHTML = '<option value="">Selecione...</option>';
      catSelect.disabled = !tipo;
      if (tipo === 'receita') {
        categoriasReceitas.forEach(c => {
          catSelect.innerHTML += `<option value="${c.id}" ${lanc && lanc.categoriaId === c.id ? 'selected' : ''}>${c.nome}</option>`;
        });
      } else if (tipo === 'despesa') {
        categoriasDespesas.forEach(c => {
          catSelect.innerHTML += `<option value="${c.id}" ${lanc && lanc.categoriaId === c.id ? 'selected' : ''}>${c.nome}</option>`;
        });
      }
    }

    if (lanc && lanc.tipo) {
      carregarCategorias(lanc.tipo);
    }

    tipoSelect.addEventListener('change', function() {
      carregarCategorias(this.value);
    });

    document.getElementById('form-lancamento').addEventListener('submit', function(e) {
      e.preventDefault();
      const id = document.getElementById('lanc-id').value;
      const tipo = document.getElementById('lanc-tipo').value;
      const categoriaId = parseInt(document.getElementById('lanc-categoria').value);
      const descricao = document.getElementById('lanc-descricao').value.trim();
      const valor = parseFloat(document.getElementById('lanc-valor').value);
      const data = document.getElementById('lanc-data').value;
      const dataPagamento = document.getElementById('lanc-data-pagamento').value || data;
      const status = document.getElementById('lanc-status').value;

      if (!tipo || isNaN(categoriaId) || !descricao || isNaN(valor) || !data) {
        UI.showToast('Preencha todos os campos obrigatórios.', 'error');
        return;
      }

      if (id) {
        const index = lancamentos.findIndex(l => l.id === parseInt(id));
        if (index !== -1) {
          lancamentos[index] = { ...lancamentos[index], tipo, categoriaId, descricao, valor, data, dataPagamento, status };
          Storage.set(Storage.KEYS.LANCAMENTOS, lancamentos);
          UI.hideModal();
          UI.showToast('Lançamento atualizado.', 'success');
        }
      } else {
        const novo = {
          id: Date.now(),
          data,
          descricao,
          valor,
          tipo,
          categoriaId,
          dataPagamento,
          status
        };
        lancamentos.push(novo);
        Storage.set(Storage.KEYS.LANCAMENTOS, lancamentos);
        UI.hideModal();
        UI.showToast('Lançamento adicionado com sucesso!', 'success');
      }

      renderTabela(obterFiltrosAtuais());
    });
  }

  function render() {
    console.log('LancamentosPage.render() chamado.');
    carregarDados();
    const main = document.getElementById('main-content');
    if (!main) {
      console.error('Elemento main-content não encontrado.');
      return;
    }

    main.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Lançamentos</h3>
          <button id="btn-novo-lancamento" class="btn">+ Novo</button>
        </div>
        <div class="filters-bar">
          <div class="form-group">
            <label class="form-label" for="filtro-tipo">Tipo</label>
            <select id="filtro-tipo" class="form-select">
              <option value="">Todos</option>
              <option value="receita">Receita</option>
              <option value="despesa">Despesa</option>
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
            <tbody id="lancamentos-tbody"></tbody>
          </table>
        </div>
      </div>
    `;

    document.getElementById('btn-novo-lancamento').addEventListener('click', abrirModalCadastro);
    document.getElementById('btn-filtrar').addEventListener('click', () => {
      renderTabela(obterFiltrosAtuais());
    });

    renderTabela({ tipo: '', dataInicio: '', dataFim: '' });
    console.log('Página de lançamentos renderizada.');
  }

  return { render };
})();