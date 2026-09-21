/**
 * Página de Lançamentos – CRUD com validações e paginação.
 */
window.LancamentosPage = (function() {
  let lancamentos = [];
  let categoriasReceitas = [];
  let categoriasDespesas = [];
  let paginaAtual = 1;
  const POR_PAGINA = 10;

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
    const { itens, totalPaginas, totalItens, paginaAtual: pg } = Utils.paginar(dados, paginaAtual, POR_PAGINA);
    paginaAtual = pg;

    const tbody = document.getElementById('lancamentos-tbody');
    const pagInfo = document.getElementById('lancamentos-pag-info');
    const btnPrev = document.getElementById('lancamentos-pag-prev');
    const btnNext = document.getElementById('lancamentos-pag-next');

    if (!tbody) return;

    if (itens.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:2rem;">Nenhum lançamento encontrado.</td></tr>';
    } else {
      tbody.innerHTML = itens.map(l => {
        const cat = l.tipo === 'receita' 
          ? categoriasReceitas.find(c => c.id === l.categoriaId) 
          : categoriasDespesas.find(c => c.id === l.categoriaId);
        const nomeCat = cat ? Utils.escapeHtml(cat.nome) : '—';
        const valorClass = l.tipo === 'receita' ? 'success' : 'danger';
        const statusBadge = l.status === 'pago' ? 'badge badge-success' : 'badge badge-warning';
        const valorFormatado = (l.tipo === 'despesa' ? '-' : '') + Utils.formatCurrency(l.valor);
        const dataFmt = Utils.parseDate(l.data)?.toLocaleDateString('pt-BR') || l.data;
        return `
          <tr>
            <td>${dataFmt}</td>
            <td>${Utils.escapeHtml(l.descricao)}</td>
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
        btn.addEventListener('click', function() { abrirModalEdicao(parseInt(this.getAttribute('data-id'))); });
      });
      tbody.querySelectorAll('.btn-acao.excluir').forEach(btn => {
        btn.addEventListener('click', function() { excluirLancamento(parseInt(this.getAttribute('data-id'))); });
      });
    }

    // Atualiza paginação
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

  function excluirLancamento(id) {
    const lanc = lancamentos.find(l => l.id === id);
    const msg = lanc 
      ? `Deseja realmente excluir o lançamento "${lanc.descricao}"?`
      : 'Deseja realmente excluir este lançamento?';

    UI.confirm(msg, function() {
      const novos = lancamentos.filter(l => l.id !== id);
      Storage.set(Storage.KEYS.LANCAMENTOS, novos);
      lancamentos = novos;
      renderTabela(obterFiltrosAtuais());
      UI.showToast('Lançamento excluído.', 'success');
    }, { title: 'Excluir Lançamento', confirmText: 'Excluir', confirmClass: 'btn-danger' });
  }

  function obterFiltrosAtuais() {
    return {
      tipo: document.getElementById('filtro-tipo')?.value || '',
      dataInicio: document.getElementById('filtro-inicio')?.value || '',
      dataFim: document.getElementById('filtro-fim')?.value || ''
    };
  }

  function abrirModalCadastro() { preencherModal(null); }
  function abrirModalEdicao(id) {
    const lanc = lancamentos.find(l => l.id === id);
    if (!lanc) return;
    preencherModal(lanc);
  }

  function encontrarDuplicata(dados, idIgnorar) {
    return lancamentos.find(l => 
      l.id !== idIgnorar &&
      l.tipo === dados.tipo &&
      l.data === dados.data &&
      l.valor === dados.valor &&
      l.descricao.trim().toLowerCase() === dados.descricao.trim().toLowerCase()
    );
  }

  function preencherModal(lanc) {
    const titulo = lanc ? 'Editar Lançamento' : 'Novo Lançamento';
    const isEdicao = !!lanc;
    const valorFormatado = lanc ? Utils.formatCurrencyInput(lanc.valor) : '';

    const html = `
      <form id="form-lancamento" novalidate>
        <div class="form-group">
          <label class="form-label">Tipo *</label>
          <select id="lanc-tipo" class="form-select" required>
            <option value="">Selecione...</option>
            <option value="receita" ${lanc && lanc.tipo === 'receita' ? 'selected' : ''}>Receita</option>
            <option value="despesa" ${lanc && lanc.tipo === 'despesa' ? 'selected' : ''}>Despesa</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Categoria *</label>
          <select id="lanc-categoria" class="form-select" required ${!lanc ? 'disabled' : ''}>
            <option value="">Selecione o tipo primeiro</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Descrição *</label>
          <input id="lanc-descricao" class="form-input" maxlength="200" value="${lanc ? Utils.escapeHtml(lanc.descricao) : ''}" required>
        </div>
        <div class="form-group">
          <label class="form-label">Valor (R$) *</label>
          <input id="lanc-valor" type="text" inputmode="decimal" class="form-input" value="${valorFormatado}" placeholder="0,00" required>
        </div>
        <div class="form-group">
          <label class="form-label">Data do lançamento *</label>
          <input id="lanc-data" type="date" class="form-input" value="${lanc ? lanc.data : ''}" required>
        </div>
        <div class="form-group">
          <label class="form-label">Data de pagamento</label>
          <input id="lanc-data-pagamento" type="date" class="form-input" value="${lanc ? lanc.dataPagamento : ''}">
          <small style="color:var(--muted); font-size:0.75rem;">Deve ser igual ou posterior à data do lançamento.</small>
        </div>
        <div class="form-group">
          <label class="form-label">Status *</label>
          <select id="lanc-status" class="form-select" required>
            <option value="pendente" ${lanc && lanc.status === 'pendente' ? 'selected' : ''}>Pendente</option>
            <option value="pago" ${lanc && lanc.status === 'pago' ? 'selected' : ''}>Pago/Recebido</option>
          </select>
        </div>
        <input type="hidden" id="lanc-id" value="${lanc ? lanc.id : ''}">
        <button type="submit" class="btn btn-primary" style="width:100%">${isEdicao ? 'Atualizar' : 'Salvar'} Lançamento</button>
      </form>
    `;
    UI.showModal(titulo, html);

    const tipoSelect = document.getElementById('lanc-tipo');
    const catSelect = document.getElementById('lanc-categoria');
    const valorInput = document.getElementById('lanc-valor');

    valorInput.addEventListener('blur', function() {
      const n = Utils.parseCurrencyInput(this.value);
      if (!isNaN(n)) this.value = Utils.formatCurrencyInput(n);
    });

    function carregarCategorias(tipo) {
      catSelect.innerHTML = '<option value="">Selecione...</option>';
      catSelect.disabled = !tipo;
      if (tipo === 'receita') {
        categoriasReceitas.forEach(c => {
          catSelect.innerHTML += `<option value="${c.id}" ${lanc && lanc.categoriaId === c.id ? 'selected' : ''}>${Utils.escapeHtml(c.nome)}</option>`;
        });
      } else if (tipo === 'despesa') {
        categoriasDespesas.forEach(c => {
          catSelect.innerHTML += `<option value="${c.id}" ${lanc && lanc.categoriaId === c.id ? 'selected' : ''}>${Utils.escapeHtml(c.nome)}</option>`;
        });
      }
    }

    if (lanc && lanc.tipo) carregarCategorias(lanc.tipo);
    tipoSelect.addEventListener('change', function() { carregarCategorias(this.value); });

    document.getElementById('form-lancamento').addEventListener('submit', function(e) {
      e.preventDefault();

      const idAtual = document.getElementById('lanc-id').value;
      const id = idAtual ? parseInt(idAtual) : null;
      const tipo = tipoSelect.value;
      const categoriaId = parseInt(catSelect.value);
      const descricao = document.getElementById('lanc-descricao').value.trim();
      const valor = Utils.parseCurrencyInput(valorInput.value);
      const data = document.getElementById('lanc-data').value;
      const dataPagamento = document.getElementById('lanc-data-pagamento').value;
      const status = document.getElementById('lanc-status').value;

      if (!tipo) { UI.showToast('Selecione o tipo do lançamento.', 'error'); tipoSelect.focus(); return; }
      if (!categoriaId || isNaN(categoriaId)) { UI.showToast('Selecione uma categoria válida.', 'error'); catSelect.focus(); return; }
      const listaCat = tipo === 'receita' ? categoriasReceitas : categoriasDespesas;
      if (!listaCat.some(c => c.id === categoriaId)) { UI.showToast('A categoria selecionada não existe mais.', 'error'); return; }
      if (!descricao) { UI.showToast('A descrição é obrigatória.', 'error'); document.getElementById('lanc-descricao').focus(); return; }
      if (isNaN(valor) || valor <= 0) { UI.showToast('O valor deve ser maior que zero.', 'error'); valorInput.focus(); return; }
      if (!Utils.isValidDate(data)) { UI.showToast('Informe uma data de lançamento válida.', 'error'); document.getElementById('lanc-data').focus(); return; }
      if (dataPagamento) {
        if (!Utils.isValidDate(dataPagamento)) { UI.showToast('Data de pagamento inválida.', 'error'); return; }
        if (dataPagamento < data) { UI.showToast('A data de pagamento não pode ser anterior à data do lançamento.', 'error'); document.getElementById('lanc-data-pagamento').focus(); return; }
      }

      const dados = { tipo, categoriaId, descricao, valor, data, dataPagamento: dataPagamento || data, status };

      function salvar() {
        if (id) {
          const idx = lancamentos.findIndex(l => l.id === id);
          if (idx !== -1) {
            lancamentos[idx] = { ...lancamentos[idx], ...dados };
            Storage.set(Storage.KEYS.LANCAMENTOS, lancamentos);
            UI.hideModal();
            UI.showToast('Lançamento atualizado.', 'success');
          }
        } else {
          const novo = { id: Utils.gerarId(), ...dados };
          lancamentos.push(novo);
          Storage.set(Storage.KEYS.LANCAMENTOS, lancamentos);
          UI.hideModal();
          UI.showToast('Lançamento adicionado com sucesso!', 'success');
        }
        paginaAtual = 1;
        renderTabela(obterFiltrosAtuais());
      }

      const duplicata = encontrarDuplicata(dados, id);
      if (duplicata && !id) {
        UI.confirm(
          `Já existe um lançamento semelhante:\n\n` +
          `Data: ${Utils.parseDate(duplicata.data)?.toLocaleDateString('pt-BR')}\n` +
          `Descrição: ${duplicata.descricao}\n` +
          `Valor: ${Utils.formatCurrency(duplicata.valor)}\n\n` +
          `Deseja continuar mesmo assim?`,
          salvar,
          { title: 'Lançamento Duplicado', confirmText: 'Continuar', confirmClass: 'btn-primary' }
        );
        return;
      }

      salvar();
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
          <h3 class="card-title">Lançamentos</h3>
          <button id="btn-novo-lancamento" class="btn btn-primary">+ Novo</button>
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
        <div class="pagination">
          <div class="pagination-info" id="lancamentos-pag-info"></div>
          <div class="pagination-buttons">
            <button id="lancamentos-pag-prev" class="btn"><i class="fas fa-chevron-left"></i> Anterior</button>
            <button id="lancamentos-pag-next" class="btn">Próxima <i class="fas fa-chevron-right"></i></button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('btn-novo-lancamento').addEventListener('click', abrirModalCadastro);
    document.getElementById('btn-filtrar').addEventListener('click', () => {
      paginaAtual = 1;
      renderTabela(obterFiltrosAtuais());
    });
    document.getElementById('lancamentos-pag-prev').addEventListener('click', () => irParaPagina(-1));
    document.getElementById('lancamentos-pag-next').addEventListener('click', () => irParaPagina(1));

    renderTabela({ tipo: '', dataInicio: '', dataFim: '' });
  }

  return { render };
})();