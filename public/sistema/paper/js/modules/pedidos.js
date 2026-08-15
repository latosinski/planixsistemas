function renderPedidosView() {
    var html = pedidos.map(function(p) {
        return `<tr>
            <td>${formatarData(p.data)}</td>
            <td>${p.market}</td>
            <td>${p.cod}</td>
            <td>${p.prod}</td>
            <td>${p.qtd}</td>
            <td>R$ ${p.receita.toFixed(2)}</td>
            <td>R$ ${p.taxas.toFixed(2)}</td>
            <td>R$ ${p.lucroBruto.toFixed(2)}</td>
            <td>R$ ${p.lucroLiq.toFixed(2)}</td>
            <td><span class="status-badge status-concluida">${p.margem.toFixed(1)}%</span></td>
            <td>
                <button class="btn-ghost edit" title="Editar" onclick="editarPedido(${p.id})"><i class="fas fa-edit"></i></button>
                <button class="btn-ghost delete" title="Excluir" onclick="excluirPedido(${p.id})"><i class="fas fa-trash-alt"></i></button>
            </td>
        </tr>`;
    }).join('');

    document.getElementById('contentArea').innerHTML = `
        <div class="panel">
            <div class="panel-header">
                <div class="panel-title"><i class="fas fa-shopping-cart"></i> Pedidos</div>
                <button class="btn btn-primary btn-sm" onclick="abrirModalPedido()"><i class="fas fa-plus"></i> Novo Pedido</button>
            </div>
            <div class="panel-body">
                <div class="filter-bar" style="margin-bottom:1rem;">
                    <div class="filter-group">
                        <span class="filter-label">Período:</span>
                        <input type="date" class="date-input" id="pedFiltroInicio" value="${new Date().toISOString().slice(0,7)}-01">
                        <span style="color:var(--text-muted);">até</span>
                        <input type="date" class="date-input" id="pedFiltroFim" value="${new Date().toISOString().slice(0,10)}">
                        <select id="pedFiltroMarket">
                            <option value="Todos">Todos os marketplaces</option>
                            ${marketplaces.map(m => '<option>' + m.nome + '</option>').join('')}
                        </select>
                        <button class="btn btn-primary btn-sm" onclick="filtrarPedidos()"><i class="fas fa-filter"></i> Filtrar</button>
                    </div>
                </div>
                <div class="table-responsive">
                    <table class="data-table" id="tabelaPedidos">
                        <thead><tr><th>Data</th><th>Marketplace</th><th>Cód</th><th>Produto</th><th>Qtd</th><th>Receita</th><th>Taxas</th><th>Lucro Bruto</th><th>Lucro Líq.</th><th>Margem</th><th></th></tr></thead>
                        <tbody>${html}</tbody>
                    </table>
                </div>
            </div>
        </div>`;
}

function filtrarPedidos() {
    var inicio = document.getElementById('pedFiltroInicio').value;
    var fim = document.getElementById('pedFiltroFim').value;
    var market = document.getElementById('pedFiltroMarket').value;
    var filtrados = pedidos.filter(function(p) {
        if (inicio && p.data < inicio) return false;
        if (fim && p.data > fim) return false;
        if (market !== 'Todos' && p.market !== market) return false;
        return true;
    });
    var tbody = document.querySelector('#tabelaPedidos tbody');
    tbody.innerHTML = filtrados.map(function(p) {
        return `<tr>
            <td>${formatarData(p.data)}</td>
            <td>${p.market}</td>
            <td>${p.cod}</td>
            <td>${p.prod}</td>
            <td>${p.qtd}</td>
            <td>R$ ${p.receita.toFixed(2)}</td>
            <td>R$ ${p.taxas.toFixed(2)}</td>
            <td>R$ ${p.lucroBruto.toFixed(2)}</td>
            <td>R$ ${p.lucroLiq.toFixed(2)}</td>
            <td><span class="status-badge status-concluida">${p.margem.toFixed(1)}%</span></td>
            <td>
                <button class="btn-ghost edit" title="Editar" onclick="editarPedido(${p.id})"><i class="fas fa-edit"></i></button>
                <button class="btn-ghost delete" title="Excluir" onclick="excluirPedido(${p.id})"><i class="fas fa-trash-alt"></i></button>
            </td>
        </tr>`;
    }).join('');
}

function abrirModalPedido(pedido) {
    if (!pedido) pedido = null;
    var editando = pedido !== null;
    if (marketplaces.length === 0) {
        alert('Cadastre pelo menos um marketplace antes de criar pedidos.');
        return;
    }
    var options = marketplaces.map(function(m, index) {
        var sel = (editando && pedido.market === m.nome) ? ' selected' : '';
        return '<option value="' + index + '"' + sel + '>' + m.nome + '</option>';
    }).join('');
    abrirModal(`
        <div class="modal-header"><h3>${editando ? 'Editar Pedido' : 'Novo Pedido'}</h3><button class="modal-close" onclick="fecharModal()"><i class="fas fa-times"></i></button></div>
        <div class="form-row">
            <div class="form-group"><label>Data</label><input type="date" id="pedData" value="${editando ? pedido.data : new Date().toISOString().split('T')[0]}"></div>
            <div class="form-group"><label>Marketplace</label><select id="pedMarket">${options}</select></div>
            <div class="form-group"><label>Cód Produto</label><input type="text" id="pedCod" value="${editando ? pedido.cod : ''}" onchange="atualizarResumoPedido()"></div>
            <div class="form-group"><label>Quantidade</label><input type="number" id="pedQtd" value="${editando ? pedido.qtd : 1}" min="1" onchange="atualizarResumoPedido()"></div>
        </div>
        <div id="pedResumo" style="margin:1rem 0; padding:0.75rem; background:var(--bg); border-radius:6px; font-size:0.85rem;">${editando ? 'Resumo será atualizado' : 'Preencha o código do produto'}</div>
        <div class="form-actions">
            <button class="btn btn-outline" onclick="fecharModal()">Cancelar</button>
            <button class="btn btn-primary" onclick="salvarPedido(${editando ? pedido.id : 'null'})">Salvar</button>
        </div>`);
    if (editando) atualizarResumoPedido();
}

function atualizarResumoPedido() {
    var cod = document.getElementById('pedCod')?.value.trim();
    var qtd = +document.getElementById('pedQtd')?.value || 1;
    var selectMarket = document.getElementById('pedMarket');
    var marketObj = null;
    if (selectMarket && selectMarket.selectedIndex >= 0 && selectMarket.selectedIndex < marketplaces.length) {
        marketObj = marketplaces[selectMarket.selectedIndex];
    }
    var p = produtos.find(x => x.cod.toLowerCase() === cod?.toLowerCase());
    if (!p) {
        var resumo = document.getElementById('pedResumo');
        if (resumo) resumo.innerHTML = 'Produto não encontrado.';
        return;
    }
    var vals = calcularPedidoValues(p, qtd, marketObj);
    var resumo = document.getElementById('pedResumo');
    if (resumo) resumo.innerHTML = `Receita: R$ ${vals.rec.toFixed(2)} | Taxas: R$ ${vals.taxas.toFixed(2)} | Lucro Bruto: R$ ${vals.lucroBruto.toFixed(2)} | Lucro Líq: R$ ${vals.lucroLiq.toFixed(2)} | Margem: ${vals.margem.toFixed(1)}%`;
}

function salvarPedido(idOriginal) {
    var cod = document.getElementById('pedCod').value.trim();
    var qtd = +document.getElementById('pedQtd').value;
    var selectMarket = document.getElementById('pedMarket');
    var marketObj = null;
    var marketNome = '';
    if (selectMarket && selectMarket.selectedIndex >= 0 && selectMarket.selectedIndex < marketplaces.length) {
        marketObj = marketplaces[selectMarket.selectedIndex];
        marketNome = marketObj.nome;
    }
    var data = document.getElementById('pedData').value;
    var p = produtos.find(x => x.cod.toLowerCase() === cod.toLowerCase());
    if (!p) return alert('Produto não encontrado.');
    if (!marketObj) return alert('Selecione um marketplace válido.');
    var vals = calcularPedidoValues(p, qtd, marketObj);
    if (idOriginal) {
        var idx = pedidos.findIndex(ped => ped.id === idOriginal);
        if (idx >= 0) {
            pedidos[idx] = { id: idOriginal, data: data, market: marketNome, cod: p.cod, prod: p.nome, qtd: qtd, receita: vals.rec, taxas: vals.taxas, lucroBruto: vals.lucroBruto, lucroLiq: vals.lucroLiq, margem: vals.margem };
        }
    } else {
        var newId = pedidos.length ? Math.max(...pedidos.map(p => p.id)) + 1 : 1;
        pedidos.unshift({ id: newId, data: data, market: marketNome, cod: p.cod, prod: p.nome, qtd: qtd, receita: vals.rec, taxas: vals.taxas, lucroBruto: vals.lucroBruto, lucroLiq: vals.lucroLiq, margem: vals.margem });
    }
    Storage.savePedidos();
    fecharModal();
    renderPedidosView();
}

function editarPedido(id) {
    var p = pedidos.find(x => x.id === id);
    if (p) abrirModalPedido(p);
}

function excluirPedido(id) {
    if (confirm('Excluir pedido?')) {
        pedidos = pedidos.filter(p => p.id !== id);
        Storage.savePedidos();
        renderPedidosView();
    }
}