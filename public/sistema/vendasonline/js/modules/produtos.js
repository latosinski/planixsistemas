// Estado local
var _taxasProdutoEstado = [];
var produtosPaginaAtual = 1;

Pagination.registrar('produtos', function (pagina) {
    produtosPaginaAtual = pagina;
    renderProdutosView();
});

function renderProdutosView() {
    var produtosNaPagina = Pagination.fatia(produtos, produtosPaginaAtual, Pagination.POR_PAGINA_PADRAO);

    var html = produtosNaPagina.map(function (p) {
        // Nome da categoria (apenas o nome)
        var categoriaNome = '-';
        if (p.categoriaId) {
            var cat = categorias.find(function (c) { return c.id === p.categoriaId; });
            if (cat) categoriaNome = cat.nome;
        }

        // Taxas por marketplace: "Shopee (12% + R$ 3,00), Instagram (0%)"
        var taxasDoProduto = taxasProduto.filter(function (t) { return t.produtoCod === p.cod; });
        var taxasTexto = taxasDoProduto.length === 0
            ? '<span style="color: var(--text-muted);">Nenhuma</span>'
            : taxasDoProduto.map(function (t) {
                var m = marketplaces.find(function (x) { return x.id === t.marketplaceId; });
                if (!m) return '';

                var partes = [];
                if (t.taxaPerc) partes.push(t.taxaPerc + '%');
                if (t.custoFixo) partes.push('R$ ' + Number(t.custoFixo).toFixed(2));
                var detalhe = partes.length ? ' (' + partes.join(' + ') + ')' : '';

                return '<div style="font-size:0.8rem; margin-bottom:0.15rem;">' +
                    '<strong style="color: var(--text);">' + m.nome + '</strong>' +
                    '<span style="color: var(--text-muted);">' + detalhe + '</span>' +
                '</div>';
            }).join('');

        return `<tr>
            <td>${p.cod}</td>
            <td>${p.nome}</td>
            <td>${categoriaNome}</td>
            <td>R$ ${p.preco.toFixed(2)}</td>
            <td>R$ ${p.custoMat.toFixed(2)}</td>
            <td>${p.tempo} min</td>
            <td>${p.margemD}%</td>
            <td class="cell-wrap">${taxasTexto}</td>
            <td>
                <button class="btn-ghost edit" title="Editar" onclick="editarProduto('${p.cod}')"><i class="fas fa-edit"></i></button>
                <button class="btn-ghost delete" title="Excluir" onclick="excluirProduto('${p.cod}')"><i class="fas fa-trash-alt"></i></button>
            </td>
        </tr>`;
    }).join('');

    var controlesPaginacao = Pagination.controles('produtos', produtos.length, produtosPaginaAtual, Pagination.POR_PAGINA_PADRAO);

    document.getElementById('contentArea').innerHTML = `
        <div class="panel">
            <div class="panel-header">
                <div class="panel-title"><i class="fas fa-box"></i> Produtos</div>
                <button class="btn btn-primary btn-sm" onclick="abrirModalProduto()"><i class="fas fa-plus"></i> Novo Produto</button>
            </div>
            <div class="panel-body" style="padding-bottom:0;">
                <div class="table-responsive">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Código</th>
                                <th>Nome</th>
                                <th>Categoria</th>
                                <th>Preço</th>
                                <th>Custo Material</th>
                                <th>Tempo</th>
                                <th>Margem de Lucro</th>
                                <th>Taxas por Marketplaces</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>${html || '<tr><td colspan="9" style="text-align:center;">Nenhum produto cadastrado.</td></tr>'}</tbody>
                    </table>
                </div>
            </div>
            ${controlesPaginacao}
        </div>`;
}

function abrirModalProduto(produto) {
    if (!produto) produto = null;
    const editando = produto !== null;

    var categoriaOptions = construirOptionsCategorias(editando ? produto.categoriaId : null);

    _taxasProdutoEstado = [];
    if (editando) {
        taxasProduto
            .filter(function (t) { return t.produtoCod === produto.cod; })
            .forEach(function (t) {
                _taxasProdutoEstado.push({
                    marketplaceId: t.marketplaceId,
                    taxaPerc: t.taxaPerc,
                    custoFixo: t.custoFixo
                });
            });
    }

    abrirModal(`
        <div class="modal-header">
            <h3>${editando ? 'Editar Produto' : 'Novo Produto'}</h3>
            <button class="modal-close" onclick="fecharModal()"><i class="fas fa-times"></i></button>
        </div>
        <div class="form-row">
            <div class="form-group"><label>Código</label><input type="text" id="mCod" value="${editando ? produto.cod : ''}" ${editando ? 'readonly' : ''}></div>
            <div class="form-group"><label>Nome</label><input type="text" id="mNome" value="${editando ? produto.nome : ''}"></div>
            <div class="form-group"><label>Categoria</label><select id="mCategoria">${categoriaOptions}</select></div>
            <div class="form-group"><label>Preço Venda R$</label><input type="number" step="0.01" id="mPreco" value="${editando ? produto.preco : ''}"></div>
            <div class="form-group"><label>Custo Material R$</label><input type="number" step="0.01" id="mCustoMat" value="${editando ? produto.custoMat : ''}"></div>
            <div class="form-group"><label>Tempo (min)</label><input type="number" id="mTempo" value="${editando ? produto.tempo : ''}"></div>
            <div class="form-group"><label>Margem de Lucro %</label><input type="number" step="0.1" id="mMargem" value="${editando ? produto.margemD : ''}"></div>
        </div>

        <div style="margin-top:1.5rem; padding-top:1.25rem; border-top:1px solid var(--border);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
                <label style="font-weight:600; font-size:0.9rem; color: var(--text);">
                    <i class="fas fa-percent" style="color: var(--primary); margin-right:0.35rem;"></i>
                    Taxas por Marketplaces
                </label>
                <button type="button" class="btn btn-outline btn-sm" onclick="adicionarTaxaProduto()">
                    <i class="fas fa-plus"></i> Adicionar marketplace
                </button>
            </div>
            <p style="font-size:0.78rem; color:var(--text-muted); margin-bottom:0.75rem; line-height:1.4;">
                Cadastre a taxa percentual e o custo fixo que cada marketplace cobra sobre <strong>este produto específico</strong>.
            </p>
            <div id="taxasProdutoContainer"></div>
        </div>

        <div class="form-actions" style="margin-top:1.5rem;">
            <button class="btn btn-outline" onclick="fecharModal()">Cancelar</button>
            <button class="btn btn-primary" onclick="salvarProduto('${editando ? produto.cod : ''}')">Salvar</button>
        </div>`);

    renderTaxasProdutoEstado();
}

function renderTaxasProdutoEstado() {
    var container = document.getElementById('taxasProdutoContainer');
    if (!container) return;

    if (marketplaces.length === 0) {
        container.innerHTML = '<div style="padding:1rem; background:var(--bg); border-radius:8px; font-size:0.85rem; color:var(--text-muted); text-align:center;">Nenhum marketplace cadastrado. Cadastre um antes de definir taxas.</div>';
        return;
    }

    if (_taxasProdutoEstado.length === 0) {
        container.innerHTML = '<div style="padding:1rem; background:var(--bg); border-radius:8px; font-size:0.85rem; color:var(--text-muted); text-align:center;">Nenhuma taxa cadastrada para este produto. Clique em "Adicionar marketplace" para começar.</div>';
        return;
    }

    var linhas = _taxasProdutoEstado.map(function (t, i) {
        var marketOptions = marketplaces.map(function (m) {
            var sel = (m.id === t.marketplaceId) ? ' selected' : '';
            var prefixo = (m.ativo === false || m.ativo === 0) ? '[Inativo] ' : '';
            return '<option value="' + m.id + '"' + sel + '>' + prefixo + m.nome + '</option>';
        }).join('');

        return `<tr>
            <td style="width:40%;">
                <select onchange="atualizarTaxaProdutoEstado(${i}, 'marketplaceId', this.value)"
                    style="width:100%; padding:0.5rem 0.65rem; border:1.5px solid var(--border); border-radius:8px; font-size:0.85rem; background:var(--bg); color:var(--text); font-family:inherit;">
                    <option value="">— Selecione um marketplace —</option>
                    ${marketOptions}
                </select>
            </td>
            <td style="width:22%;">
                <input type="number" step="0.01" min="0" value="${t.taxaPerc || 0}"
                    onchange="atualizarTaxaProdutoEstado(${i}, 'taxaPerc', this.value)"
                    placeholder="0,00"
                    style="width:100%; padding:0.5rem 0.65rem; border:1.5px solid var(--border); border-radius:8px; font-size:0.85rem; background:var(--bg); color:var(--text); font-family:inherit;">
            </td>
            <td style="width:24%;">
                <input type="number" step="0.01" min="0" value="${t.custoFixo || 0}"
                    onchange="atualizarTaxaProdutoEstado(${i}, 'custoFixo', this.value)"
                    placeholder="0,00"
                    style="width:100%; padding:0.5rem 0.65rem; border:1.5px solid var(--border); border-radius:8px; font-size:0.85rem; background:var(--bg); color:var(--text); font-family:inherit;">
            </td>
            <td style="width:14%; text-align:center;">
                <button type="button" class="btn-ghost delete" title="Remover" onclick="removerTaxaProdutoEstado(${i})" style="padding:0.4rem;">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </td>
        </tr>`;
    }).join('');

    container.innerHTML = `
        <table style="width:100%; border-collapse:collapse;">
            <thead>
                <tr style="font-size:0.7rem; text-transform:uppercase; letter-spacing:0.04em; color:var(--text-muted);">
                    <th style="text-align:left; padding:0 0.4rem 0.5rem;">Marketplace</th>
                    <th style="text-align:left; padding:0 0.4rem 0.5rem;">Taxa (%)</th>
                    <th style="text-align:left; padding:0 0.4rem 0.5rem;">Custo fixo (R$)</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>${linhas}</tbody>
        </table>`;
}

function adicionarTaxaProduto() {
    if (marketplaces.length === 0) {
        alert('Cadastre ao menos um marketplace antes de adicionar taxas.');
        return;
    }
    _taxasProdutoEstado.push({ marketplaceId: '', taxaPerc: 0, custoFixo: 0 });
    renderTaxasProdutoEstado();
}

function removerTaxaProdutoEstado(idx) {
    _taxasProdutoEstado.splice(idx, 1);
    renderTaxasProdutoEstado();
}

function atualizarTaxaProdutoEstado(idx, campo, valor) {
    if (!_taxasProdutoEstado[idx]) return;
    if (campo === 'marketplaceId') {
        _taxasProdutoEstado[idx].marketplaceId = parseInt(valor) || '';
    } else {
        _taxasProdutoEstado[idx][campo] = parseFloat(valor) || 0;
    }
}

function salvarProduto(codOriginal) {
    const cod = document.getElementById('mCod').value.trim();
    const nome = document.getElementById('mNome').value;
    const preco = +document.getElementById('mPreco').value;
    const custoMat = +document.getElementById('mCustoMat').value;
    const tempo = +document.getElementById('mTempo').value;
    const margemD = +document.getElementById('mMargem').value;
    const categoriaId = document.getElementById('mCategoria').value ? parseInt(document.getElementById('mCategoria').value) : null;

    if (!cod || !nome) return alert('Código e nome são obrigatórios.');

    var idsUsados = {};
    for (var i = 0; i < _taxasProdutoEstado.length; i++) {
        var t = _taxasProdutoEstado[i];
        if (!t.marketplaceId) {
            return alert('Selecione o marketplace em todas as linhas de taxa, ou remova as linhas vazias.');
        }
        if (idsUsados[t.marketplaceId]) {
            return alert('Há marketplaces duplicados na lista de taxas. Cada marketplace pode aparecer apenas uma vez por produto.');
        }
        idsUsados[t.marketplaceId] = true;
    }

    if (codOriginal) {
        const idx = produtos.findIndex(p => p.cod === codOriginal);
        if (idx >= 0) produtos[idx] = { cod, nome, categoriaId, preco, custoMat, tempo, margemD };
    } else {
        if (produtos.some(p => p.cod === cod)) return alert('Código já existe.');
        produtos.push({ cod, nome, categoriaId, preco, custoMat, tempo, margemD });
    }
    Storage.saveProdutos();

    taxasProduto = taxasProduto.filter(function (t) { return t.produtoCod !== cod; });
    _taxasProdutoEstado.forEach(function (t) {
        taxasProduto.push({
            produtoCod: cod,
            marketplaceId: t.marketplaceId,
            taxaPerc: t.taxaPerc || 0,
            custoFixo: t.custoFixo || 0
        });
    });
    Storage.saveTaxasProduto();

    _taxasProdutoEstado = [];
    fecharModal();
    renderProdutosView();
}

function editarProduto(cod) {
    const p = produtos.find(x => x.cod === cod);
    if (p) abrirModalProduto(p);
}

async function excluirProduto(cod) {
    var qtdTaxas = taxasProduto.filter(function (t) { return t.produtoCod === cod; }).length;
    var msg = 'Excluir o produto "' + cod + '"?';
    if (qtdTaxas > 0) {
        msg += '<br><br><small style="color:var(--text-muted);">Também serão removidas ' + qtdTaxas + ' taxa(s) de marketplace vinculadas a este produto.</small>';
    }

    var ok = await confirmar(msg, {
        titulo: 'Excluir produto',
        tipo: 'perigo',
        textoConfirmar: 'Excluir'
    });

    if (ok) {
        produtos = produtos.filter(p => p.cod !== cod);
        Storage.saveProdutos();

        var tamanhoAntes = taxasProduto.length;
        taxasProduto = taxasProduto.filter(function (t) { return t.produtoCod !== cod; });
        if (taxasProduto.length !== tamanhoAntes) {
            Storage.saveTaxasProduto();
        }

        var totalPag = Math.ceil(produtos.length / Pagination.POR_PAGINA_PADRAO);
        if (produtosPaginaAtual > totalPag && totalPag > 0) produtosPaginaAtual = totalPag;

        renderProdutosView();
    }
}