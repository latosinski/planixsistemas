function renderProdutosView() {
    let html = produtos.map(p => {
        return `<tr>
            <td>${p.cod}</td>
            <td>${p.nome}</td>
            <td>${p.cat}</td>
            <td>R$ ${p.preco.toFixed(2)}</td>
            <td>R$ ${p.custoMat.toFixed(2)}</td>
            <td>${p.tempo} min</td>
            <td>${p.margemD}%</td>
            <td>
                <button class="btn-ghost edit" title="Editar" onclick="editarProduto('${p.cod}')"><i class="fas fa-edit"></i></button>
                <button class="btn-ghost delete" title="Excluir" onclick="excluirProduto('${p.cod}')"><i class="fas fa-trash-alt"></i></button>
            </td>
        </tr>`;
    }).join('');

    document.getElementById('contentArea').innerHTML = `
        <div class="panel">
            <div class="panel-header">
                <div class="panel-title"><i class="fas fa-box"></i> Produtos</div>
                <button class="btn btn-primary btn-sm" onclick="abrirModalProduto()"><i class="fas fa-plus"></i> Novo Produto</button>
            </div>
            <div class="panel-body">
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
                                <th>Margem Desejada</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>${html}</tbody>
                    </table>
                </div>
            </div>
        </div>`;
}

function abrirModalProduto(produto) {
    if (!produto) produto = null;
    const editando = produto !== null;
    abrirModal(`
        <div class="modal-header"><h3>${editando ? 'Editar Produto' : 'Novo Produto'}</h3><button class="modal-close" onclick="fecharModal()"><i class="fas fa-times"></i></button></div>
        <div class="form-row">
            <div class="form-group"><label>Código</label><input type="text" id="mCod" value="${editando ? produto.cod : ''}" ${editando ? 'readonly' : ''}></div>
            <div class="form-group"><label>Nome</label><input type="text" id="mNome" value="${editando ? produto.nome : ''}"></div>
            <div class="form-group"><label>Categoria</label><input type="text" id="mCat" value="${editando ? produto.cat : ''}"></div>
            <div class="form-group"><label>Preço Venda R$</label><input type="number" step="0.01" id="mPreco" value="${editando ? produto.preco : ''}"></div>
            <div class="form-group"><label>Custo Material R$</label><input type="number" step="0.01" id="mCustoMat" value="${editando ? produto.custoMat : ''}"></div>
            <div class="form-group"><label>Tempo (min)</label><input type="number" id="mTempo" value="${editando ? produto.tempo : ''}"></div>
            <div class="form-group"><label>Margem Desejada %</label><input type="number" step="0.1" id="mMargem" value="${editando ? produto.margemD : ''}"></div>
        </div>
        <div class="form-actions">
            <button class="btn btn-outline" onclick="fecharModal()">Cancelar</button>
            <button class="btn btn-primary" onclick="salvarProduto('${editando ? produto.cod : ''}')">Salvar</button>
        </div>`);
}

function salvarProduto(codOriginal) {
    const cod = document.getElementById('mCod').value.trim();
    const nome = document.getElementById('mNome').value;
    const cat = document.getElementById('mCat').value;
    const preco = +document.getElementById('mPreco').value;
    const custoMat = +document.getElementById('mCustoMat').value;
    const tempo = +document.getElementById('mTempo').value;
    const margemD = +document.getElementById('mMargem').value;
    if (!cod || !nome) return alert('Código e nome são obrigatórios.');
    if (codOriginal) {
        const idx = produtos.findIndex(p => p.cod === codOriginal);
        if (idx >= 0) produtos[idx] = { cod, nome, cat, preco, custoMat, tempo, margemD };
    } else {
        if (produtos.some(p => p.cod === cod)) return alert('Código já existe.');
        produtos.push({ cod, nome, cat, preco, custoMat, tempo, margemD });
    }
    Storage.saveProdutos();
    fecharModal();
    renderProdutosView();
}

function editarProduto(cod) {
    const p = produtos.find(x => x.cod === cod);
    if (p) abrirModalProduto(p);
}

function excluirProduto(cod) {
    if (confirm('Excluir produto ' + cod + '?')) {
        produtos = produtos.filter(p => p.cod !== cod);
        Storage.saveProdutos();
        renderProdutosView();
    }
}