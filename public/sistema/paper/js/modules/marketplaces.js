function renderMarketplacesView() {
    var html = marketplaces.map(function(m, index) {
        return `<tr>
            <td>${m.nome}</td>
            <td>${m.taxa.toFixed(1)}%</td>
            <td>R$ ${m.custosAdicionais.toFixed(2)}</td>
            <td>R$ ${m.valorHora.toFixed(2)}</td>
            <td>
                <button class="btn-ghost edit" title="Editar" onclick="editarMarketplace(${index})"><i class="fas fa-edit"></i></button>
                <button class="btn-ghost delete" title="Excluir" onclick="excluirMarketplace(${index})"><i class="fas fa-trash-alt"></i></button>
            </td>
        </tr>`;
    }).join('');

    document.getElementById('contentArea').innerHTML = `
        <div class="panel">
            <div class="panel-header">
                <div class="panel-title"><i class="fas fa-store"></i> Marketplaces</div>
                <button class="btn btn-primary btn-sm" onclick="abrirModalMarketplace()"><i class="fas fa-plus"></i> Novo Marketplace</button>
            </div>
            <div class="panel-body">
                <div class="table-responsive">
                    <table class="data-table">
                        <thead><tr><th>Nome</th><th>Taxa (%)</th><th>Custos Adicionais</th><th>Valor Hora</th><th>Ações</th></tr></thead>
                        <tbody>${html || '<tr><td colspan="5" style="text-align:center;">Nenhum marketplace cadastrado.</td></tr>'}</tbody>
                    </table>
                </div>
            </div>
        </div>`;
}

function abrirModalMarketplace(marketplace, index) {
    if (marketplace === undefined) marketplace = null;
    var editando = marketplace !== null;
    abrirModal(`
        <div class="modal-header"><h3>${editando ? 'Editar Marketplace' : 'Novo Marketplace'}</h3><button class="modal-close" onclick="fecharModal()"><i class="fas fa-times"></i></button></div>
        <div class="form-row">
            <div class="form-group"><label>Nome</label><input type="text" id="mktNome" value="${editando ? marketplace.nome : ''}"></div>
            <div class="form-group"><label>Taxa (%)</label><input type="number" step="0.1" id="mktTaxa" value="${editando ? marketplace.taxa : '0'}"></div>
            <div class="form-group"><label>Custos Adicionais (R$)</label><input type="number" step="0.01" id="mktCustosAdicionais" value="${editando ? marketplace.custosAdicionais : '0'}"></div>
            <div class="form-group"><label>Valor Hora (R$)</label><input type="number" step="0.01" id="mktValorHora" value="${editando ? marketplace.valorHora : '22'}"></div>
        </div>
        <div class="form-actions">
            <button class="btn btn-outline" onclick="fecharModal()">Cancelar</button>
            <button class="btn btn-primary" onclick="salvarMarketplace(${editando ? index : -1})">Salvar</button>
        </div>`);
}

function salvarMarketplace(index) {
    var nome = document.getElementById('mktNome').value.trim();
    var taxa = +document.getElementById('mktTaxa').value || 0;
    var custosAdicionais = +document.getElementById('mktCustosAdicionais').value || 0;
    var valorHora = +document.getElementById('mktValorHora').value || 0;
    if (!nome) return alert('Nome do marketplace é obrigatório.');
    var obj = { nome: nome, taxa: taxa, custosAdicionais: custosAdicionais, valorHora: valorHora };
    if (index >= 0) {
        marketplaces[index] = obj;
    } else {
        marketplaces.push(obj);
    }
    Storage.saveMarketplaces();
    fecharModal();
    renderMarketplacesView();
}

function editarMarketplace(index) {
    abrirModalMarketplace(marketplaces[index], index);
}

function excluirMarketplace(index) {
    if (confirm('Excluir marketplace "' + marketplaces[index].nome + '"?')) {
        marketplaces.splice(index, 1);
        Storage.saveMarketplaces();
        renderMarketplacesView();
    }
}