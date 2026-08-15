// Aba ativa: 'vendas' ou 'contas'
var abaAtivaRelatorios = 'vendas';

function renderRelatoriosView() {
    var hoje = new Date();
    var inicioMes = hoje.getFullYear() + '-' + String(hoje.getMonth() + 1).padStart(2, '0') + '-01';
    var hojeISO = hoje.toISOString().split('T')[0];
    var mesAtual = hoje.getFullYear() + '-' + String(hoje.getMonth() + 1).padStart(2, '0');

    var marketOptions = '<option value="Todos">Todos os marketplaces</option>' +
        marketplaces.map(function(m) { return '<option>' + m.nome + '</option>'; }).join('');

    document.getElementById('contentArea').innerHTML = `
        <div class="panel">
            <div class="panel-header">
                <div class="panel-title"><i class="fas fa-chart-bar"></i> Relatórios</div>
            </div>
            <div class="panel-body">
                <div style="display:flex; gap:1rem; margin-bottom:1.5rem;">
                    <button class="btn ${abaAtivaRelatorios === 'vendas' ? 'btn-primary' : 'btn-outline'}" id="tabVendas" onclick="alternarAbaRelatorios('vendas')"><i class="fas fa-shopping-cart"></i> Vendas</button>
                    <button class="btn ${abaAtivaRelatorios === 'contas' ? 'btn-primary' : 'btn-outline'}" id="tabContas" onclick="alternarAbaRelatorios('contas')"><i class="fas fa-file-invoice-dollar"></i> Contas a Pagar</button>
                </div>
                <div id="conteudoRelatorios"></div>
            </div>
        </div>`;

    alternarAbaRelatorios(abaAtivaRelatorios);
}

function alternarAbaRelatorios(aba) {
    abaAtivaRelatorios = aba;
    var btnV = document.getElementById('tabVendas');
    var btnC = document.getElementById('tabContas');
    if (btnV) btnV.className = aba === 'vendas' ? 'btn btn-primary' : 'btn btn-outline';
    if (btnC) btnC.className = aba === 'contas' ? 'btn btn-primary' : 'btn btn-outline';

    var container = document.getElementById('conteudoRelatorios');
    if (!container) return;

    if (aba === 'vendas') {
        renderRelatorioVendas(container);
    } else {
        renderRelatorioContas(container);
    }
}

// ---------- RELATÓRIO DE VENDAS ----------

function renderRelatorioVendas(container) {
    var hoje = new Date();
    var inicioMes = hoje.getFullYear() + '-' + String(hoje.getMonth() + 1).padStart(2, '0') + '-01';
    var hojeISO = hoje.toISOString().split('T')[0];
    var marketOptions = '<option value="Todos">Todos os marketplaces</option>' +
        marketplaces.map(function(m) { return '<option>' + m.nome + '</option>'; }).join('');

    container.innerHTML = `
        <div class="filter-bar" style="margin-bottom:1rem;">
            <div class="filter-group">
                <span class="filter-label">Tipo:</span>
                <select id="relVendasTipo">
                    <option value="produto">Por Produto</option>
                    <option value="marketplace">Por Marketplace</option>
                    <option value="mes">Por Mês</option>
                </select>
                <span class="filter-label">Período:</span>
                <input type="date" class="date-input" id="relVendasInicio" value="${inicioMes}">
                <span style="color:var(--text-muted);">até</span>
                <input type="date" class="date-input" id="relVendasFim" value="${hojeISO}">
                <select id="relVendasMarketplace">${marketOptions}</select>
                <button class="btn btn-primary btn-sm" onclick="gerarRelatorioVendas()"><i class="fas fa-filter"></i> Gerar</button>
            </div>
            <div class="filter-group">
                <button class="btn btn-outline btn-sm" onclick="exportarVendasPDF()"><i class="fas fa-file-pdf"></i> PDF</button>
                <button class="btn btn-outline btn-sm" onclick="exportarVendasExcel()"><i class="fas fa-file-excel"></i> Excel</button>
            </div>
        </div>
        <div id="resultadoVendas"></div>`;
    gerarRelatorioVendas();
}

function gerarDadosVendas() {
    var tipo = document.getElementById('relVendasTipo')?.value || 'produto';
    var dataInicio = document.getElementById('relVendasInicio')?.value || '';
    var dataFim = document.getElementById('relVendasFim')?.value || '';
    var market = document.getElementById('relVendasMarketplace')?.value || 'Todos';

    var pedidosFiltrados = pedidos.filter(function(p) {
        var okData = true;
        if (dataInicio && p.data < dataInicio) okData = false;
        if (dataFim && p.data > dataFim) okData = false;
        var okMarket = (market === 'Todos') || (p.market === market);
        return okData && okMarket;
    });

    var grupos = {};
    pedidosFiltrados.forEach(function(p) {
        var chave;
        if (tipo === 'produto') {
            chave = p.prod;
        } else if (tipo === 'marketplace') {
            chave = p.market;
        } else if (tipo === 'mes') {
            chave = p.data.substring(0, 7);
        }
        if (!grupos[chave]) grupos[chave] = { qtd: 0, receita: 0, lucro: 0 };
        grupos[chave].qtd += p.qtd;
        grupos[chave].receita += p.receita;
        grupos[chave].lucro += p.lucroLiq;
    });

    return Object.keys(grupos).map(function(chave) {
        var g = grupos[chave];
        return {
            item: chave,
            qtd: g.qtd,
            receita: g.receita,
            lucro: g.lucro,
            margem: g.receita > 0 ? (g.lucro / g.receita) * 100 : 0
        };
    }).sort(function(a, b) { return b.receita - a.receita; });
}

function gerarRelatorioVendas() {
    var dados = gerarDadosVendas();
    var container = document.getElementById('resultadoVendas');
    if (!container) return;

    if (dados.length === 0) {
        container.innerHTML = '<p style="color:var(--text-muted);">Nenhum dado encontrado.</p>';
        return;
    }

    var html = '<div class="table-responsive"><table class="data-table">';
    html += '<thead><tr><th>Item</th><th>Qtd</th><th>Receita Bruta</th><th>Lucro Líq.</th><th>Margem</th></tr></thead><tbody>';
    dados.forEach(function(d) {
        html += '<tr><td>' + d.item + '</td><td>' + d.qtd + '</td><td>R$ ' + d.receita.toFixed(2) + '</td><td>R$ ' + d.lucro.toFixed(2) + '</td><td>' + d.margem.toFixed(1) + '%</td></tr>';
    });
    html += '</tbody></table></div>';
    container.innerHTML = html;
}

function exportarVendasPDF() {
    var dados = gerarDadosVendas();
    if (dados.length === 0) return alert('Não há dados para exportar.');
    var html = gerarHtmlTabela('Relatório de Vendas', ['Item','Qtd','Receita Bruta','Lucro Líq.','Margem'], dados.map(function(d) { return [d.item, d.qtd, 'R$ '+d.receita.toFixed(2), 'R$ '+d.lucro.toFixed(2), d.margem.toFixed(1)+'%']; }));
    imprimirPDF(html);
}

function exportarVendasExcel() {
    var dados = gerarDadosVendas();
    if (dados.length === 0) return alert('Não há dados para exportar.');
    var csv = 'Item;Qtd;Receita Bruta;Lucro Líq.;Margem\n';
    dados.forEach(function(d) {
        csv += '"' + d.item + '";' + d.qtd + ';"R$ ' + d.receita.toFixed(2) + '";"R$ ' + d.lucro.toFixed(2) + '";' + d.margem.toFixed(1) + '%\n';
    });
    baixarCSV(csv, 'relatorio_vendas.csv');
}

// ---------- RELATÓRIO DE CONTAS A PAGAR ----------

function renderRelatorioContas(container) {
    var hoje = new Date();
    var mesAtual = hoje.getFullYear() + '-' + String(hoje.getMonth() + 1).padStart(2, '0');
    container.innerHTML = `
        <div class="filter-bar" style="margin-bottom:1rem;">
            <div class="filter-group">
                <span class="filter-label">Competência:</span>
                <input type="month" class="date-input" id="relContasMes" value="${mesAtual}">
                <button class="btn btn-primary btn-sm" onclick="gerarRelatorioContas()"><i class="fas fa-filter"></i> Gerar</button>
            </div>
            <div class="filter-group">
                <button class="btn btn-outline btn-sm" onclick="exportarContasPDF()"><i class="fas fa-file-pdf"></i> PDF</button>
                <button class="btn btn-outline btn-sm" onclick="exportarContasExcel()"><i class="fas fa-file-excel"></i> Excel</button>
            </div>
        </div>
        <div id="resultadoContas"></div>`;
    gerarRelatorioContas();
}

function obterContasCompetencia() {
    var mesAno = document.getElementById('relContasMes')?.value || '';
    if (!mesAno) return [];
    return contas.filter(function(c) {
        return c.dataVencimento.substring(0, 7) === mesAno;
    });
}

function gerarRelatorioContas() {
    var contasMes = obterContasCompetencia();
    var container = document.getElementById('resultadoContas');
    if (!container) return;

    if (contasMes.length === 0) {
        container.innerHTML = '<p style="color:var(--text-muted);">Nenhuma conta encontrada para esta competência.</p>';
        return;
    }

    var totalPagar = contasMes.filter(function(c) { return c.status !== 'pago'; }).reduce(function(s, c) { return s + c.valor; }, 0);
    var totalPago = contasMes.filter(function(c) { return c.status === 'pago'; }).reduce(function(s, c) { return s + c.valor; }, 0);
    var totalPendente = contasMes.filter(function(c) { return c.status === 'pendente'; }).reduce(function(s, c) { return s + c.valor; }, 0);
    var totalVencido = contasMes.filter(function(c) { return c.status === 'vencido'; }).reduce(function(s, c) { return s + c.valor; }, 0);

    var html = `
        <div class="cards-grid">
            <div class="stat-card blue"><div class="stat-icon"><i class="fas fa-file-invoice-dollar"></i></div><div class="stat-info"><div class="stat-label">Total a Pagar</div><div class="stat-value">R$ ${totalPagar.toFixed(2)}</div></div></div>
            <div class="stat-card green"><div class="stat-icon"><i class="fas fa-check-circle"></i></div><div class="stat-info"><div class="stat-label">Pagos</div><div class="stat-value">R$ ${totalPago.toFixed(2)}</div></div></div>
            <div class="stat-card yellow"><div class="stat-icon"><i class="fas fa-clock"></i></div><div class="stat-info"><div class="stat-label">Pendentes</div><div class="stat-value">R$ ${totalPendente.toFixed(2)}</div></div></div>
            <div class="stat-card red"><div class="stat-icon"><i class="fas fa-exclamation-triangle"></i></div><div class="stat-info"><div class="stat-label">Vencidos</div><div class="stat-value">R$ ${totalVencido.toFixed(2)}</div></div></div>
        </div>
        <div class="table-responsive"><table class="data-table">
            <thead><tr><th>Vencimento</th><th>Descrição</th><th>Valor</th><th>Status</th></tr></thead>
            <tbody>`;

    contasMes.forEach(function(c) {
        var statusClass = c.status === 'pago' ? 'status-concluida' : (c.status === 'pendente' ? 'status-pendente' : 'status-cancelada');
        var statusTexto = c.status === 'pago' ? 'Pago' : (c.status === 'pendente' ? 'Pendente' : 'Vencido');
        html += '<tr><td>' + formatarData(c.dataVencimento) + '</td><td>' + c.descricao + '</td><td>R$ ' + c.valor.toFixed(2) + '</td><td><span class="status-badge ' + statusClass + '">' + statusTexto + '</span></td></tr>';
    });

    html += '</tbody></table></div>';
    container.innerHTML = html;
}

function exportarContasPDF() {
    var contasMes = obterContasCompetencia();
    if (contasMes.length === 0) return alert('Não há dados para exportar.');
    var dados = contasMes.map(function(c) {
        return [formatarData(c.dataVencimento), c.descricao, 'R$ ' + c.valor.toFixed(2), c.status];
    });
    var html = gerarHtmlTabela('Relatório de Contas a Pagar', ['Vencimento','Descrição','Valor','Status'], dados);
    imprimirPDF(html);
}

function exportarContasExcel() {
    var contasMes = obterContasCompetencia();
    if (contasMes.length === 0) return alert('Não há dados para exportar.');
    var csv = 'Vencimento;Descricao;Valor;Status\n';
    contasMes.forEach(function(c) {
        csv += '"' + formatarData(c.dataVencimento) + '";"' + c.descricao + '";"R$ ' + c.valor.toFixed(2) + '";' + c.status + '\n';
    });
    baixarCSV(csv, 'relatorio_contas.csv');
}

// ---------- FUNÇÕES AUXILIARES ----------

function gerarHtmlTabela(titulo, colunas, linhas) {
    var html = '<html><head><meta charset="UTF-8"><title>' + titulo + '</title><style>';
    html += 'body { font-family: Arial, sans-serif; margin: 20px; }';
    html += 'h2 { color: #333; }';
    html += 'table { width: 100%; border-collapse: collapse; margin-top: 10px; }';
    html += 'th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }';
    html += 'th { background-color: #f5f5f5; }';
    html += '</style></head><body><h2>' + titulo + '</h2><table><thead><tr>';
    colunas.forEach(function(col) { html += '<th>' + col + '</th>'; });
    html += '</tr></thead><tbody>';
    linhas.forEach(function(linha) {
        html += '<tr>';
        linha.forEach(function(cel) { html += '<td>' + cel + '</td>'; });
        html += '</tr>';
    });
    html += '</tbody></table></body></html>';
    return html;
}

function imprimirPDF(html) {
    var win = window.open('', '_blank');
    if (!win) return alert('Permita pop-ups para exportar PDF.');
    win.document.write(html);
    win.document.close();
    win.print();
}

function baixarCSV(csv, nomeArquivo) {
    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    var link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = nomeArquivo;
    link.click();
    URL.revokeObjectURL(link.href);
}