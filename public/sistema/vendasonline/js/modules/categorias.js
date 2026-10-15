// ═══════════════════════════════════════════════════════════════
// Planix Vendasonline — Categorias
// ═══════════════════════════════════════════════════════════════

var categoriasPaginaAtual = 1;

Pagination.registrar('categorias', function (pagina) {
    categoriasPaginaAtual = pagina;
    renderCategoriasView();
});

function renderCategoriasView() {
    var categoriasNaPagina = Pagination.fatia(categorias, categoriasPaginaAtual, Pagination.POR_PAGINA_PADRAO);

    var html = categoriasNaPagina.map(function (c) {
        var qtdProdutos = produtos.filter(function (p) { return p.categoriaId === c.id; }).length;
        return `<tr>
            <td><i class="fas fa-folder" style="color: var(--primary); margin-right: 0.5rem;"></i>${c.nome}</td>
            <td>${qtdProdutos}</td>
            <td class="cell-actions">
                <button class="btn-ghost edit" title="Editar" onclick="editarCategoria(${c.id})"><i class="fas fa-edit"></i></button>
                <button class="btn-ghost delete" title="Excluir" onclick="excluirCategoria(${c.id})"><i class="fas fa-trash-alt"></i></button>
            </td>
        </tr>`;
    }).join('');

    var controlesPaginacao = Pagination.controles('categorias', categorias.length, categoriasPaginaAtual, Pagination.POR_PAGINA_PADRAO);

    document.getElementById('contentArea').innerHTML = `
        <div class="panel">
            <div class="panel-header">
                <div class="panel-title"><i class="fas fa-tags"></i> Categorias de Produtos</div>
                <button class="btn btn-primary btn-sm" onclick="abrirModalCategoria()"><i class="fas fa-plus"></i> Nova Categoria</button>
            </div>
            <div class="panel-body" style="padding-bottom:0;">
                <div class="table-responsive">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th style="width:220px;">Produtos Vinculados</th>
                                <th class="cell-actions">Ações</th>
                            </tr>
                        </thead>
                        <tbody>${html || '<tr><td colspan="3" style="text-align:center; padding:1.5rem; color:var(--text-muted);">Nenhuma categoria cadastrada.</td></tr>'}</tbody>
                    </table>
                </div>
            </div>
            ${controlesPaginacao}
        </div>`;
}

function abrirModalCategoria(categoria) {
    if (categoria === undefined) categoria = null;
    var editando = categoria !== null;

    abrirModal(`
        <div class="modal-header"><h3>${editando ? 'Editar Categoria' : 'Nova Categoria'}</h3><button class="modal-close" onclick="fecharModal()"><i class="fas fa-times"></i></button></div>
        <div class="form-group">
            <label>Nome da categoria *</label>
            <input type="text" id="catNome" value="${editando ? categoria.nome : ''}" placeholder="Ex: Caixa, Convite, Planner">
        </div>
        <div class="form-actions">
            <button class="btn btn-outline" onclick="fecharModal()">Cancelar</button>
            <button class="btn btn-primary" onclick="salvarCategoria(${editando ? categoria.id : 'null'})">Salvar</button>
        </div>`);
}

function salvarCategoria(idOriginal) {
    var nome = document.getElementById('catNome').value.trim();

    if (!nome) return alert('Nome da categoria é obrigatório.');

    if (idOriginal !== null && idOriginal !== undefined && idOriginal !== 'null') {
        var idx = categorias.findIndex(function (c) { return c.id === idOriginal; });

        var duplicada = categorias.some(function (c) {
            return c.id !== idOriginal && c.nome.toLowerCase() === nome.toLowerCase();
        });
        if (duplicada) return alert('Já existe uma categoria com este nome.');

        if (idx >= 0) {
            categorias[idx] = { id: idOriginal, nome: nome };
        }
    } else {
        var duplicadaNova = categorias.some(function (c) {
            return c.nome.toLowerCase() === nome.toLowerCase();
        });
        if (duplicadaNova) return alert('Já existe uma categoria com este nome.');

        var novoId = categorias.length ? Math.max.apply(null, categorias.map(function (c) { return c.id; })) + 1 : 1;
        categorias.push({ id: novoId, nome: nome });
    }

    Storage.saveCategorias();
    fecharModal();
    renderCategoriasView();
}

function editarCategoria(id) {
    var c = categorias.find(function (x) { return x.id === id; });
    if (c) abrirModalCategoria(c);
}

async function excluirCategoria(id) {
    var cat = categorias.find(function (c) { return c.id === id; });
    if (!cat) return;

    var qtd = produtos.filter(function (p) { return p.categoriaId === id; }).length;
    var msg = qtd > 0
        ? 'Esta categoria possui ' + qtd + ' produto(s) vinculado(s). Ao excluir, os produtos ficarão sem categoria. Continuar?'
        : 'Excluir a categoria "' + cat.nome + '"?';

    var ok = await confirmar(msg, {
        titulo: 'Excluir categoria',
        tipo: 'perigo',
        textoConfirmar: 'Excluir'
    });

    if (ok) {
        produtos.forEach(function (p) {
            if (p.categoriaId === id) p.categoriaId = null;
        });
        Storage.saveProdutos();
        categorias = categorias.filter(function (c) { return c.id !== id; });
        Storage.saveCategorias();

        var totalPag = Math.ceil(categorias.length / Pagination.POR_PAGINA_PADRAO);
        if (categoriasPaginaAtual > totalPag && totalPag > 0) categoriasPaginaAtual = totalPag;

        renderCategoriasView();
    }
}

// Helper usado pelo cadastro de produtos
function construirOptionsCategorias(categoriaSelecionadaId) {
    var html = '<option value="">Sem categoria</option>';
    categorias.forEach(function (c) {
        var sel = (categoriaSelecionadaId === c.id) ? ' selected' : '';
        html += '<option value="' + c.id + '"' + sel + '>' + c.nome + '</option>';
    });
    return html;
}