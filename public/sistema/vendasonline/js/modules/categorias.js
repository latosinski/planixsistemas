function renderCategoriasView() {
    var html = '';

    if (categorias.length === 0) {
        html = '<tr><td colspan="4" style="text-align:center;">Nenhuma categoria cadastrada.</td></tr>';
    } else {
        // Agrupa por nome, mantendo a ordem de inserção
        var grupos = {};
        var ordemNomes = [];
        categorias.forEach(function(c) {
            if (!grupos[c.nome]) {
                grupos[c.nome] = [];
                ordemNomes.push(c.nome);
            }
            grupos[c.nome].push(c);
        });

        ordemNomes.forEach(function(nome) {
            var itens = grupos[nome];
            var qtdTotal = produtos.filter(function(p) {
                return itens.some(function(c) { return c.id === p.categoriaId; });
            }).length;

            // Cabeçalho do grupo
            html += '<tr style="background:rgba(127,179,213,0.08);">';
            html += '<td colspan="2"><strong><i class="fas fa-folder" style="color:var(--primary); margin-right:0.5rem;"></i>' + nome + '</strong></td>';
            html += '<td><strong>' + qtdTotal + '</strong></td>';
            html += '<td></td>';
            html += '</tr>';

            // Linhas das variações
            itens.forEach(function(c) {
                var qtdProdutos = produtos.filter(function(p) { return p.categoriaId === c.id; }).length;
                html += '<tr>';
                html += '<td style="padding-left:2.5rem; color:var(--text-light); font-size:0.85rem;">↳ ' + nome + '</td>';
                html += '<td>' + (c.descricao || '-') + '</td>';
                html += '<td>' + qtdProdutos + '</td>';
                html += '<td>' + botoesAcaoCategoria(c.id) + '</td>';
                html += '</tr>';
            });
        });
    }

    document.getElementById('contentArea').innerHTML = `
        <div class="panel">
            <div class="panel-header">
                <div class="panel-title"><i class="fas fa-tags"></i> Categorias de Produtos</div>
                <button class="btn btn-primary btn-sm" onclick="abrirModalCategoria()"><i class="fas fa-plus"></i> Nova Categoria</button>
            </div>
            <div class="panel-body">
                <div class="table-responsive">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Descrição</th>
                                <th>Produtos Vinculados</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>${html}</tbody>
                    </table>
                </div>
            </div>
        </div>`;
}

function botoesAcaoCategoria(id) {
    return '<button class="btn-ghost edit" title="Editar" onclick="editarCategoria(' + id + ')"><i class="fas fa-edit"></i></button>' +
           '<button class="btn-ghost delete" title="Excluir" onclick="excluirCategoria(' + id + ')"><i class="fas fa-trash-alt"></i></button>';
}

function abrirModalCategoria(categoria) {
    if (categoria === undefined) categoria = null;
    var editando = categoria !== null;

    // Nomes já existentes para autocomplete (datalist)
    var nomesUnicos = {};
    categorias.forEach(function(c) {
        if (!editando || c.id !== categoria.id) {
            nomesUnicos[c.nome] = true;
        }
    });
    var datalistOptions = Object.keys(nomesUnicos).map(function(n) {
        return '<option value="' + n + '">';
    }).join('');

    abrirModal(`
        <div class="modal-header"><h3>${editando ? 'Editar Categoria' : 'Nova Categoria'}</h3><button class="modal-close" onclick="fecharModal()"><i class="fas fa-times"></i></button></div>
        <div class="form-row">
            <div class="form-group"><label>Nome *</label><input type="text" id="catNome" list="listaNomes" value="${editando ? categoria.nome : ''}" placeholder="Ex: Caixa, Convite, Planner"><datalist id="listaNomes">${datalistOptions}</datalist>
            <small style="display:block; margin-top:0.35rem; color:var(--text-muted); font-size:0.75rem;">Use o mesmo nome em várias categorias para agrupá-las (ex: "Caixa" para borda simples, dupla, tripla).</small></div>
            <div class="form-group"><label>Descrição</label><input type="text" id="catDescricao" value="${editando ? categoria.descricao : ''}" placeholder="Ex: Borda simples, Borda dupla"><small style="display:block; margin-top:0.35rem; color:var(--text-muted); font-size:0.75rem;">Nome específico desta variação.</small></div>
        </div>
        <div class="form-actions">
            <button class="btn btn-outline" onclick="fecharModal()">Cancelar</button>
            <button class="btn btn-primary" onclick="salvarCategoria(${editando ? categoria.id : 'null'})">Salvar</button>
        </div>`);
}

function salvarCategoria(idOriginal) {
    var nome = document.getElementById('catNome').value.trim();
    var descricao = document.getElementById('catDescricao').value.trim();

    if (!nome) return alert('Nome é obrigatório.');
    if (!descricao) return alert('Descrição é obrigatória (nome específico da variação).');

    if (idOriginal !== null && idOriginal !== undefined && idOriginal !== 'null') {
        var idx = categorias.findIndex(function(c) { return c.id === idOriginal; });

        // Verifica duplicidade exata (nome + descrição) ignorando a si mesma
        var duplicada = categorias.some(function(c) {
            return c.id !== idOriginal &&
                   c.nome.toLowerCase() === nome.toLowerCase() &&
                   c.descricao.toLowerCase() === descricao.toLowerCase();
        });
        if (duplicada) return alert('Já existe uma categoria com este nome e descrição.');

        if (idx >= 0) {
            categorias[idx] = { id: idOriginal, nome: nome, descricao: descricao };
        }
    } else {
        var duplicadaNova = categorias.some(function(c) {
            return c.nome.toLowerCase() === nome.toLowerCase() &&
                   c.descricao.toLowerCase() === descricao.toLowerCase();
        });
        if (duplicadaNova) return alert('Já existe uma categoria com este nome e descrição.');

        var novoId = categorias.length ? Math.max(...categorias.map(c => c.id)) + 1 : 1;
        categorias.push({ id: novoId, nome: nome, descricao: descricao });
    }

    Storage.saveCategorias();
    fecharModal();
    renderCategoriasView();
}

function editarCategoria(id) {
    var c = categorias.find(function(x) { return x.id === id; });
    if (c) abrirModalCategoria(c);
}

function excluirCategoria(id) {
    var cat = categorias.find(function(c) { return c.id === id; });
    if (!cat) return;

    var qtd = produtos.filter(function(p) { return p.categoriaId === id; }).length;
    var msg = qtd > 0
        ? 'Esta categoria possui ' + qtd + ' produto(s) vinculado(s). Ao excluir, os produtos ficarão sem categoria. Continuar?'
        : 'Excluir a categoria "' + cat.nome + ' - ' + cat.descricao + '"?';
    if (confirm(msg)) {
        produtos.forEach(function(p) {
            if (p.categoriaId === id) p.categoriaId = null;
        });
        Storage.saveProdutos();
        categorias = categorias.filter(function(c) { return c.id !== id; });
        Storage.saveCategorias();
        renderCategoriasView();
    }
}

// Helper para montar as opções de categoria em <select> com agrupamento por nome
function construirOptionsCategorias(categoriaSelecionadaId) {
    var html = '<option value="">Sem categoria</option>';

    // Agrupa por nome
    var grupos = {};
    var ordemNomes = [];
    categorias.forEach(function(c) {
        if (!grupos[c.nome]) {
            grupos[c.nome] = [];
            ordemNomes.push(c.nome);
        }
        grupos[c.nome].push(c);
    });

    ordemNomes.forEach(function(nome) {
        var itens = grupos[nome];
        html += '<optgroup label="' + nome + '">';
        itens.forEach(function(c) {
            var sel = (categoriaSelecionadaId === c.id) ? ' selected' : '';
            var label = c.descricao ? c.descricao : nome;
            html += '<option value="' + c.id + '"' + sel + '>' + label + '</option>';
        });
        html += '</optgroup>';
    });

    return html;
}