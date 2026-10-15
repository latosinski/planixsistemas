// ═══════════════════════════════════════════════════════════════
// Planix Vendasonline — Pedidos
// ═══════════════════════════════════════════════════════════════

var pedidosPaginaAtual = 1;
var _pedidosFiltrados = [];

Pagination.registrar('pedidos', function (pagina) {
    pedidosPaginaAtual = pagina;
    renderPedidosView();
});

function renderPedidosView() {
    aplicarFiltroPedidos();

    var clienteOptions = '<option value="">Todos os clientes</option>' +
        clientes.map(function (c) { return '<option value="' + c.id + '">' + c.nome + '</option>'; }).join('');

    document.getElementById('contentArea').innerHTML = `
        <div class="panel">
            <div class="panel-header">
                <div class="panel-title"><i class="fas fa-shopping-cart"></i> Pedidos</div>
                <button class="btn btn-primary btn-sm" onclick="abrirModalPedido()"><i class="fas fa-plus"></i> Novo Pedido</button>
            </div>
            <div class="panel-body" style="padding-bottom:0;">
                <div class="filter-bar" style="margin-bottom:1rem;">
                    <div class="filter-group">
                        <span class="filter-label">Período:</span>
                        <input type="date" class="date-input" id="pedFiltroInicio" value="${new Date().toISOString().slice(0,7)}-01">
                        <span style="color:var(--text-muted);">até</span>
                        <input type="date" class="date-input" id="pedFiltroFim" value="${new Date().toISOString().slice(0,10)}">
                        <select id="pedFiltroMarket">
                            <option value="Todos">Todos os marketplaces</option>
                            ${marketplaces.map(function (m) { return '<option>' + m.nome + '</option>'; }).join('')}
                        </select>
                        <select id="pedFiltroCliente">${clienteOptions}</select>
                        <button class="btn btn-primary btn-sm" onclick="filtrarPedidos()"><i class="fas fa-filter"></i> Filtrar</button>
                    </div>
                </div>
                <div class="table-responsive">
                    <table class="data-table" id="tabelaPedidos">
                        <thead><tr><th>Data</th><th class="cell-wrap">Cliente</th><th>Marketplace</th><th>Cód</th><th class="cell-wrap">Produto</th><th>Qtd</th><th>Receita</th><th>Taxas</th><th>Lucro Bruto</th><th>Lucro Líq.</th><th>Margem</th><th class="cell-actions"></th></tr></thead>
                        <tbody id="tabelaPedidosBody"></tbody>
                    </table>
                </div>
            </div>
            <div id="pedidosPaginacao"></div>
        </div>`;

    renderTabelaPedidos();
}

function aplicarFiltroPedidos() {
    var inicio = document.getElementById('pedFiltroInicio')?.value || '';
    var fim = document.getElementById('pedFiltroFim')?.value || '';
    var market = document.getElementById('pedFiltroMarket')?.value || 'Todos';
    var clienteId = document.getElementById('pedFiltroCliente')?.value || '';

    _pedidosFiltrados = pedidos.filter(function (p) {
        if (inicio && p.data < inicio) return false;
        if (fim && p.data > fim) return false;
        if (market !== 'Todos' && p.market !== market) return false;
        if (clienteId && String(p.clienteId) !== String(clienteId)) return false;
        return true;
    });
}

function renderTabelaPedidos() {
    var tbody = document.getElementById('tabelaPedidosBody');
    if (!tbody) return;

    var pedidosNaPagina = Pagination.fatia(_pedidosFiltrados, pedidosPaginaAtual, Pagination.POR_PAGINA_PADRAO);

    tbody.innerHTML = pedidosNaPagina.map(function (p) {
        return `<tr>
            <td>${formatarData(p.data)}</td>
            <td class="cell-wrap">${p.clienteNome || '-'}</td>
            <td>${p.market}</td>
            <td>${p.cod}</td>
            <td class="cell-wrap">${p.prod}</td>
            <td>${p.qtd}</td>
            <td>R$ ${p.receita.toFixed(2)}</td>
            <td>R$ ${p.taxas.toFixed(2)}</td>
            <td>R$ ${p.lucroBruto.toFixed(2)}</td>
            <td>R$ ${p.lucroLiq.toFixed(2)}</td>
            <td><span class="status-badge status-concluida">${p.margem.toFixed(1)}%</span></td>
            <td class="cell-actions">
                <button class="btn-ghost edit" title="Editar" onclick="editarPedido(${p.id})"><i class="fas fa-edit"></i></button>
                <button class="btn-ghost delete" title="Excluir" onclick="excluirPedido(${p.id})"><i class="fas fa-trash-alt"></i></button>
            </td>
        </tr>`;
    }).join('') || '<tr><td colspan="12" style="text-align:center; padding:1.5rem; color:var(--text-muted);">Nenhum pedido encontrado para os filtros aplicados.</td></tr>';

    var container = document.getElementById('pedidosPaginacao');
    if (container) {
        container.innerHTML = Pagination.controles('pedidos', _pedidosFiltrados.length, pedidosPaginaAtual, Pagination.POR_PAGINA_PADRAO);
    }
}

function filtrarPedidos() {
    pedidosPaginaAtual = 1;
    aplicarFiltroPedidos();
    renderTabelaPedidos();
}

function abrirModalPedido(pedido) {
    if (!pedido) pedido = null;
    var editando = pedido !== null;

    var marketplacesDisponiveis = marketplaces.filter(function (m) {
        if (m.ativo !== false && m.ativo !== 0) return true;
        if (editando && pedido.market === m.nome) return true;
        return false;
    });

    if (marketplacesDisponiveis.length === 0) {
        alert('Nenhum marketplace ativo. Cadastre ou ative ao menos um antes de criar pedidos.');
        return;
    }

    var marketOptions = marketplacesDisponiveis.map(function (m) {
        var sel = (editando && pedido.market === m.nome) ? ' selected' : '';
        var prefixo = (m.ativo === false || m.ativo === 0) ? '[Inativo] ' : '';
        return '<option value="' + m.id + '"' + sel + '>' + prefixo + m.nome + '</option>';
    }).join('');

    var clienteOptions = '<option value="">Sem cliente</option>' +
        clientes.map(function (c) {
            var sel = (editando && pedido.clienteId === c.id) ? ' selected' : '';
            return '<option value="' + c.id + '"' + sel + '>' + c.nome + '</option>';
        }).join('');

    var taxaInicial = editando && pedido.taxaUsada != null ? pedido.taxaUsada : '';
    var custoInicial = editando && pedido.custoUsado != null ? pedido.custoUsado : '';

    abrirModal(`
        <div class="modal-header">
            <h3>${editando ? 'Editar Pedido' : 'Novo Pedido'}</h3>
            <button class="modal-close" onclick="fecharModal()"><i class="fas fa-times"></i></button>
        </div>
        <div class="form-row">
            <div class="form-group"><label>Data</label><input type="date" id="pedData" value="${editando ? pedido.data : new Date().toISOString().split('T')[0]}"></div>
            <div class="form-group"><label>Cliente</label><select id="pedCliente">${clienteOptions}</select></div>
            <div class="form-group"><label>Marketplace</label><select id="pedMarket" onchange="aoTrocarCanalPedido()">${marketOptions}</select></div>
            <div class="form-group"><label>Cód Produto</label><input type="text" id="pedCod" value="${editando ? pedido.cod : ''}" onchange="aoMudarProduto()"></div>
            <div class="form-group"><label>Quantidade</label><input type="number" id="pedQtd" value="${editando ? pedido.qtd : 1}" min="1" onchange="atualizarResumoPedido()"></div>
        </div>

        <div style="margin-top:1.25rem; padding-top:1rem; border-top:1px solid var(--border);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
                <label style="font-weight:600; font-size:0.85rem; color: var(--text);">
                    <i class="fas fa-percent" style="color: var(--primary); margin-right:0.35rem;"></i>
                    Taxas do marketplace para este produto
                </label>
                <span id="pedTaxaOrigem" style="font-size:0.72rem; color:var(--text-muted);"></span>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Taxa percentual (%)</label>
                    <input type="number" step="0.01" min="0" id="pedTaxaPerc" value="${taxaInicial}" placeholder="0,00" onchange="atualizarResumoPedido()">
                </div>
                <div class="form-group">
                    <label>Custo fixo por venda (R$)</label>
                    <input type="number" step="0.01" min="0" id="pedCustoFixo" value="${custoInicial}" placeholder="0,00" onchange="atualizarResumoPedido()">
                </div>
            </div>
            <p style="font-size:0.75rem; color:var(--text-muted); margin-top:-0.25rem;">
                Os valores são preenchidos automaticamente a partir do cadastro do produto. Edite se necessário — o pedido guardará os valores usados.
            </p>
        </div>

        <div id="pedResumo" style="margin:1rem 0; padding:0.75rem; background:var(--bg); border-radius:6px; font-size:0.85rem;">${editando ? 'Resumo será atualizado' : 'Preencha o código do produto'}</div>
        <div class="form-actions">
            <button class="btn btn-outline" onclick="fecharModal()">Cancelar</button>
            <button class="btn btn-primary" onclick="salvarPedido(${editando ? pedido.id : 'null'})">Salvar</button>
        </div>`);

    if (editando) {
        marcarOrigemTaxa(false);
        atualizarResumoPedido();
    }
}

function aoTrocarCanalPedido() {
    var cod = document.getElementById('pedCod')?.value.trim();
    if (cod) aoMudarProduto();
}

function aoMudarProduto() {
    var cod = document.getElementById('pedCod')?.value.trim();
    var selectMarket = document.getElementById('pedMarket');
    var inputTaxa = document.getElementById('pedTaxaPerc');
    var inputCusto = document.getElementById('pedCustoFixo');

    if (!selectMarket || !selectMarket.value || !inputTaxa || !inputCusto) return;
    if (!cod) return;

    var p = produtos.find(function (x) { return x.cod.toLowerCase() === cod.toLowerCase(); });
    if (!p) { atualizarResumoPedido(); return; }

    var marketId = parseInt(selectMarket.value);
    var taxa = obterTaxaDoProduto(p.cod, marketId);

    if (taxa) {
        inputTaxa.value = taxa.taxaPerc || 0;
        inputCusto.value = taxa.custoFixo || 0;
        marcarOrigemTaxa(true);
    } else {
        inputTaxa.value = '';
        inputCusto.value = '';
        marcarOrigemTaxa(false, 'Sem cadastro para este marketplace — preencha manualmente.');
    }

    atualizarResumoPedido();
}

function marcarOrigemTaxa(veioDoCadastro, textoCustom) {
    var el = document.getElementById('pedTaxaOrigem');
    if (!el) return;
    if (textoCustom) {
        el.textContent = textoCustom;
        el.style.color = 'var(--warning-dark)';
    } else if (veioDoCadastro) {
        el.textContent = '✓ valores do cadastro do produto';
        el.style.color = 'var(--success-dark)';
    } else {
        el.textContent = '';
    }
}

function atualizarResumoPedido() {
    var cod = document.getElementById('pedCod')?.value.trim();
    var qtd = +document.getElementById('pedQtd')?.value || 1;
    var selectMarket = document.getElementById('pedMarket');
    var marketObj = null;
    if (selectMarket && selectMarket.value) {
        var marketId = parseInt(selectMarket.value);
        marketObj = marketplaces.find(function (m) { return m.id === marketId; });
    }
    var taxaPerc = parseFloat(document.getElementById('pedTaxaPerc')?.value) || 0;
    var custoFixo = parseFloat(document.getElementById('pedCustoFixo')?.value) || 0;

    var p = produtos.find(function (x) { return x.cod.toLowerCase() === cod?.toLowerCase(); });
    if (!p) {
        var resumo = document.getElementById('pedResumo');
        if (resumo) resumo.innerHTML = 'Produto não encontrado.';
        return;
    }

    var vals = calcularPedidoValues(p, qtd, marketObj, taxaPerc, custoFixo);
    var prazoInfo = marketObj && marketObj.prazoRecebimento > 0
        ? ' | Recebimento em ' + marketObj.prazoRecebimento + ' dias'
        : ' | À vista';

    var resumo = document.getElementById('pedResumo');
    if (resumo) {
        resumo.innerHTML = `Receita: R$ ${vals.rec.toFixed(2)} | Taxas: R$ ${vals.taxas.toFixed(2)} | Lucro Bruto: R$ ${vals.lucroBruto.toFixed(2)} | Lucro Líq: R$ ${vals.lucroLiq.toFixed(2)} | Margem: ${vals.margem.toFixed(1)}%${prazoInfo}`;
    }
}

function sincronizarContaReceber(pedidoObj) {
    var marketObj = marketplaces.find(function (m) { return m.nome === pedidoObj.market; });
    var prazo = marketObj && marketObj.prazoRecebimento ? marketObj.prazoRecebimento : 0;

    var idxExistente = contasReceber.findIndex(function (c) { return c.pedidoId === pedidoObj.id; });

    if (prazo <= 0) {
        if (idxExistente >= 0) {
            contasReceber.splice(idxExistente, 1);
            Storage.saveContasReceber();
        }
        return;
    }

    var valorAReceber = parseFloat((pedidoObj.receita - pedidoObj.taxas).toFixed(2));
    var dataVencimento = adicionarDiasISO(pedidoObj.data, prazo);
    var descricao = 'Pedido #' + pedidoObj.id + ' - ' + pedidoObj.prod + ' (' + pedidoObj.market + ')';

    if (idxExistente >= 0) {
        contasReceber[idxExistente].descricao = descricao;
        contasReceber[idxExistente].clienteId = pedidoObj.clienteId || null;
        contasReceber[idxExistente].clienteNome = pedidoObj.clienteNome || '';
        contasReceber[idxExistente].valor = valorAReceber;
        contasReceber[idxExistente].dataVencimento = dataVencimento;
        contasReceber[idxExistente].market = pedidoObj.market;
    } else {
        var maxId = contasReceber.length ? Math.max.apply(null, contasReceber.map(function (c) { return c.id; })) : 0;
        contasReceber.push({
            id: ++maxId,
            pedidoId: pedidoObj.id,
            descricao: descricao,
            clienteId: pedidoObj.clienteId || null,
            clienteNome: pedidoObj.clienteNome || '',
            market: pedidoObj.market,
            valor: valorAReceber,
            dataVencimento: dataVencimento,
            status: 'pendente',
            dataRecebimento: null
        });
    }
    Storage.saveContasReceber();
}

function salvarPedido(idOriginal) {
    var cod = document.getElementById('pedCod').value.trim();
    var qtd = +document.getElementById('pedQtd').value;
    var selectMarket = document.getElementById('pedMarket');
    var marketObj = null;
    if (selectMarket && selectMarket.value) {
        var marketId = parseInt(selectMarket.value);
        marketObj = marketplaces.find(function (m) { return m.id === marketId; });
    }
    var marketNome = marketObj ? marketObj.nome : '';

    var clienteId = document.getElementById('pedCliente')?.value || '';
    var clienteObj = clienteId ? clientes.find(function (c) { return String(c.id) === String(clienteId); }) : null;
    var clienteNome = clienteObj ? clienteObj.nome : '';

    var taxaPerc = parseFloat(document.getElementById('pedTaxaPerc').value) || 0;
    var custoFixo = parseFloat(document.getElementById('pedCustoFixo').value) || 0;

    var data = document.getElementById('pedData').value;
    var p = produtos.find(function (x) { return x.cod.toLowerCase() === cod.toLowerCase(); });
    if (!p) return alert('Produto não encontrado.');
    if (!marketObj) return alert('Selecione um marketplace válido.');
    if (taxaPerc < 0 || custoFixo < 0) return alert('Taxa e custo não podem ser negativos.');

    var vals = calcularPedidoValues(p, qtd, marketObj, taxaPerc, custoFixo);
    var pedidoObj;

    if (idOriginal) {
        var idx = pedidos.findIndex(function (ped) { return ped.id === idOriginal; });
        if (idx >= 0) {
            pedidoObj = {
                id: idOriginal,
                data: data,
                clienteId: clienteObj ? clienteObj.id : null,
                clienteNome: clienteNome,
                market: marketNome,
                cod: p.cod,
                prod: p.nome,
                qtd: qtd,
                receita: vals.rec,
                taxas: vals.taxas,
                lucroBruto: vals.lucroBruto,
                lucroLiq: vals.lucroLiq,
                margem: vals.margem,
                taxaUsada: taxaPerc,
                custoUsado: custoFixo
            };
            pedidos[idx] = pedidoObj;
        }
    } else {
        var newId = pedidos.length ? Math.max.apply(null, pedidos.map(function (p) { return p.id; })) + 1 : 1;
        pedidoObj = {
            id: newId,
            data: data,
            clienteId: clienteObj ? clienteObj.id : null,
            clienteNome: clienteNome,
            market: marketNome,
            cod: p.cod,
            prod: p.nome,
            qtd: qtd,
            receita: vals.rec,
            taxas: vals.taxas,
            lucroBruto: vals.lucroBruto,
            lucroLiq: vals.lucroLiq,
            margem: vals.margem,
            taxaUsada: taxaPerc,
            custoUsado: custoFixo
        };
        pedidos.unshift(pedidoObj);
    }

    Storage.savePedidos();
    sincronizarContaReceber(pedidoObj);
    fecharModal();
    renderPedidosView();
}

function editarPedido(id) {
    var p = pedidos.find(function (x) { return x.id === id; });
    if (p) abrirModalPedido(p);
}

async function excluirPedido(id) {
    var ok = await confirmar('Excluir este pedido? A conta a receber vinculada (se existir) também será removida.', {
        titulo: 'Excluir pedido',
        tipo: 'perigo',
        textoConfirmar: 'Excluir'
    });
    if (ok) {
        pedidos = pedidos.filter(function (p) { return p.id !== id; });
        Storage.savePedidos();
        var tamanhoAntes = contasReceber.length;
        contasReceber = contasReceber.filter(function (c) { return c.pedidoId !== id; });
        if (contasReceber.length !== tamanhoAntes) {
            Storage.saveContasReceber();
        }
        renderPedidosView();
    }
}