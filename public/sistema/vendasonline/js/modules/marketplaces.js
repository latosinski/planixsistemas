function renderMarketplacesView() {
    var html = marketplaces.map(function (m) {
        var badgeAtivo = m.ativo !== false && m.ativo !== 0
            ? '<span class="status-badge status-concluida">Ativo</span>'
            : '<span class="status-badge status-cancelada">Inativo</span>';

        var btnToggle = m.ativo !== false && m.ativo !== 0
            ? '<button class="btn-ghost" title="Desativar" onclick="alternarAtivoMarketplace(' + m.id + ')"><i class="fas fa-toggle-on" style="color: var(--success-dark);"></i></button>'
            : '<button class="btn-ghost" title="Ativar" onclick="alternarAtivoMarketplace(' + m.id + ')"><i class="fas fa-toggle-off" style="color: var(--text-muted);"></i></button>';

        return `<tr>
            <td>${m.nome}</td>
            <td>R$ ${Number(m.valorHora || 0).toFixed(2)}</td>
            <td>${m.prazoRecebimento || 0} dias</td>
            <td>${badgeAtivo}</td>
            <td>
                <button class="btn-ghost edit" title="Editar" onclick="editarMarketplace(${m.id})"><i class="fas fa-edit"></i></button>
                <button class="btn-ghost delete" title="Excluir" onclick="excluirMarketplace(${m.id})"><i class="fas fa-trash-alt"></i></button>
                ${btnToggle}
            </td>
        </tr>`;
    }).join('');

    document.getElementById('contentArea').innerHTML = `
        <div class="panel">
            <div class="panel-header">
                <div class="panel-title"><i class="fas fa-store"></i> Canais de Venda</div>
                <button class="btn btn-primary btn-sm" onclick="abrirModalMarketplace()"><i class="fas fa-plus"></i> Novo Canal</button>
            </div>
            <div class="panel-body">
                <p style="color: var(--text-light); font-size: 0.85rem; margin-bottom: 1rem;">
                    <i class="fas fa-info-circle" style="color: var(--primary);"></i>
                    As taxas de venda são cadastradas por produto, na tela de <strong>Produtos</strong>, porque variam conforme o item.
                </p>
                <div class="table-responsive">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Valor Hora Padrão</th>
                                <th>Prazo de Recebimento</th>
                                <th>Status</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>${html || '<tr><td colspan="5" style="text-align:center;">Nenhum canal cadastrado.</td></tr>'}</tbody>
                    </table>
                </div>
            </div>
        </div>`;
}

function abrirModalMarketplace(marketplace) {
    if (marketplace === undefined) marketplace = null;
    var editando = marketplace !== null;

    abrirModal(`
        <div class="modal-header">
            <h3>${editando ? 'Editar Canal de Venda' : 'Novo Canal de Venda'}</h3>
            <button class="modal-close" onclick="fecharModal()"><i class="fas fa-times"></i></button>
        </div>
        <div class="form-row">
            <div class="form-group" style="grid-column: 1 / -1;">
                <label>Nome do canal *</label>
                <input type="text" id="mktNome" value="${editando ? marketplace.nome : ''}" placeholder="Ex: Shopee, Mercado Livre, Instagram">
            </div>
            <div class="form-group">
                <label>Valor da hora de trabalho (R$)</label>
                <input type="number" step="0.01" min="0" id="mktValorHora" value="${editando ? marketplace.valorHora : '22'}">
            </div>
            <div class="form-group">
                <label>Prazo padrão de recebimento (dias)</label>
                <input type="number" step="1" min="0" id="mktPrazoRecebimento" value="${editando ? (marketplace.prazoRecebimento || 0) : '0'}">
                <small style="color:var(--text-muted); font-size:0.75rem;">0 = à vista (não gera conta a receber)</small>
            </div>
            <div class="form-group">
                <label>Status</label>
                <select id="mktAtivo">
                    <option value="1" ${!editando || marketplace.ativo !== false && marketplace.ativo !== 0 ? 'selected' : ''}>Ativo</option>
                    <option value="0" ${editando && (marketplace.ativo === false || marketplace.ativo === 0) ? 'selected' : ''}>Inativo</option>
                </select>
            </div>
        </div>
        <div style="margin-top:1rem; padding:0.75rem; background:var(--bg); border-radius:8px; font-size:0.8rem; color:var(--text-light); border-left:3px solid var(--primary);">
            <i class="fas fa-lightbulb" style="color: var(--primary);"></i>
            As taxas percentuais e custos fixos deste canal devem ser cadastrados <strong>em cada produto</strong>, na tela de Produtos.
        </div>
        <div class="form-actions">
            <button class="btn btn-outline" onclick="fecharModal()">Cancelar</button>
            <button class="btn btn-primary" onclick="salvarMarketplace(${editando ? marketplace.id : 'null'})">Salvar</button>
        </div>`);
}

function salvarMarketplace(idOriginal) {
    var nome = document.getElementById('mktNome').value.trim();
    var valorHora = +document.getElementById('mktValorHora').value || 0;
    var prazoRecebimento = parseInt(document.getElementById('mktPrazoRecebimento').value) || 0;
    var ativo = document.getElementById('mktAtivo').value === '1';

    if (!nome) return alert('Nome do canal é obrigatório.');

    if (idOriginal !== null && idOriginal !== undefined && idOriginal !== 'null') {
        var idx = marketplaces.findIndex(function (m) { return m.id === idOriginal; });
        if (idx >= 0) {
            marketplaces[idx] = {
                id: idOriginal,
                nome: nome,
                valorHora: valorHora,
                prazoRecebimento: prazoRecebimento,
                ativo: ativo
            };
        }
    } else {
        var novoId = marketplaces.length
            ? Math.max.apply(null, marketplaces.map(function (m) { return m.id || 0; })) + 1
            : 1;
        marketplaces.push({
            id: novoId,
            nome: nome,
            valorHora: valorHora,
            prazoRecebimento: prazoRecebimento,
            ativo: ativo
        });
    }

    Storage.saveMarketplaces();
    fecharModal();
    renderMarketplacesView();
}

function editarMarketplace(id) {
    var m = marketplaces.find(function (x) { return x.id === id; });
    if (m) abrirModalMarketplace(m);
}

async function excluirMarketplace(id) {
    var m = marketplaces.find(function (x) { return x.id === id; });
    if (!m) return;

    // Bloqueia exclusão se houver pedidos vinculados
    var pedidosVinculados = pedidos.filter(function (p) { return p.market === m.nome; }).length;
    if (pedidosVinculados > 0) {
        alert('Não é possível excluir este canal: existem ' + pedidosVinculados + ' pedido(s) vinculado(s) a ele.\n\nConsidere desativá-lo em vez de excluir.');
        return;
    }

    // Bloqueia se houver taxas de produto vinculadas
    var taxasVinculadas = taxasProduto.filter(function (t) { return t.marketplaceId === id; }).length;
    if (taxasVinculadas > 0) {
        alert('Não é possível excluir este canal: existem ' + taxasVinculadas + ' produto(s) com taxas cadastradas para ele.\n\nRemova essas taxas primeiro ou desative o canal.');
        return;
    }

    var ok = await confirmar('Excluir o canal "' + m.nome + '"? Esta ação não pode ser desfeita.', {
        titulo: 'Excluir canal de venda',
        tipo: 'perigo',
        textoConfirmar: 'Excluir'
    });

    if (ok) {
        marketplaces = marketplaces.filter(function (x) { return x.id !== id; });
        Storage.saveMarketplaces();
        renderMarketplacesView();
    }
}

async function alternarAtivoMarketplace(id) {
    var m = marketplaces.find(function (x) { return x.id === id; });
    if (!m) return;

    var estavaAtivo = m.ativo !== false && m.ativo !== 0;

    if (estavaAtivo) {
        var ok = await confirmar(
            'Desativar o canal "' + m.nome + '"?<br><br>' +
            'Pedidos futuros não poderão mais ser criados para este canal. Pedidos e taxas já cadastradas não são afetados.',
            {
                titulo: 'Desativar canal de venda',
                tipo: 'info',
                textoConfirmar: 'Desativar',
                textoCancelar: 'Cancelar'
            }
        );
        if (!ok) return;
    }

    m.ativo = !estavaAtivo;
    Storage.saveMarketplaces();
    renderMarketplacesView();
}