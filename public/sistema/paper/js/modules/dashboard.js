// Variáveis de controle dos gráficos
var chartDiarioInstance = null;
var chartMarketplaceInstance = null;

function obterDadosFiltrados() {
    var dataInicio = document.getElementById('dashDataInicio')?.value || '';
    var dataFim = document.getElementById('dashDataFim')?.value || '';
    var market = document.getElementById('dashMarketplace')?.value || 'Todos';
    return pedidos.filter(function(p) {
        var dentroPeriodo = true;
        if (dataInicio && p.data < dataInicio) dentroPeriodo = false;
        if (dataFim && p.data > dataFim) dentroPeriodo = false;
        var marketOk = (market === 'Todos') || (p.market === market);
        return dentroPeriodo && marketOk;
    });
}

function agruparPorDia(pedidosFiltrados) {
    var mapa = {};
    pedidosFiltrados.forEach(function(p) {
        if (!mapa[p.data]) mapa[p.data] = 0;
        mapa[p.data] += p.lucroLiq;
    });
    return mapa;
}

function agruparPorProduto(pedidosFiltrados) {
    var mapa = {};
    pedidosFiltrados.forEach(function(p) {
        var chave = p.cod;
        if (!mapa[chave]) mapa[chave] = { nome: p.prod, qtd: 0, lucroLiq: 0 };
        mapa[chave].qtd += p.qtd;
        mapa[chave].lucroLiq += p.lucroLiq;
    });
    return Object.values(mapa);
}

function agruparPorMarketplace(pedidosFiltrados) {
    var mapa = {};
    pedidosFiltrados.forEach(function(p) {
        if (!mapa[p.market]) mapa[p.market] = 0;
        mapa[p.market] += p.lucroLiq;
    });
    return mapa;
}

function gerarLabelsDias(dataInicio, dataFim) {
    var labels = [];
    var atual = new Date(dataInicio + 'T00:00:00');
    var fim = new Date(dataFim + 'T00:00:00');
    while (atual <= fim) {
        var dia = String(atual.getDate()).padStart(2, '0');
        var mes = String(atual.getMonth() + 1).padStart(2, '0');
        var ano = atual.getFullYear();
        labels.push(dia + '/' + mes + '/' + ano);
        atual.setDate(atual.getDate() + 1);
    }
    return labels;
}

function recalcularDashboard() {
    var pedidosFiltrados = obterDadosFiltrados();
    var dataInicio = document.getElementById('dashDataInicio')?.value || '';
    var dataFim = document.getElementById('dashDataFim')?.value || '';

    // Totais dos pedidos (lucro líquido)
    var receitaTotal = pedidosFiltrados.reduce(function(s, p) { return s + p.receita; }, 0);
    var lucroLiqTotal = pedidosFiltrados.reduce(function(s, p) { return s + p.lucroLiq; }, 0);

    // Custos fixos totais mensais
    var totalCustosFixos = custosFixos.reduce(function(s, c) { return s + c.valor; }, 0);

    // Contas a pagar (pendentes + vencidas)
    var totalContasPagar = contas.filter(function(c) { return c.status !== 'pago'; })
        .reduce(function(s, c) { return s + c.valor; }, 0);

    // Faturamento Hoje (lucro líquido do último dia do período)
    var faturamentoHoje = 0;
    if (dataFim) {
        faturamentoHoje = pedidosFiltrados.filter(function(p) { return p.data === dataFim; })
            .reduce(function(s, p) { return s + p.lucroLiq; }, 0);
    } else {
        var hoje = new Date().toISOString().split('T')[0];
        faturamentoHoje = pedidos.filter(function(p) { return p.data === hoje; })
            .reduce(function(s, p) { return s + p.lucroLiq; }, 0);
    }

    // Faturamento Mensal (lucro líquido do mês atual)
    var agora = new Date();
    var mesAtual = agora.getMonth() + 1;
    var anoAtual = agora.getFullYear();
    var pedidosMes = pedidos.filter(function(p) {
        var partes = p.data.split('-');
        return parseInt(partes[0]) === anoAtual && parseInt(partes[1]) === mesAtual;
    });
    var faturamentoMensal = pedidosMes.reduce(function(s, p) { return s + p.lucroLiq; }, 0);

    // Entradas = lucro líquido total do período
    var entradas = lucroLiqTotal;

    // Lucro Líquido final = entradas - custos fixos mensais
    var lucroLiquido = entradas - totalCustosFixos;

    // Atualizar cards
    document.getElementById('cardFaturamentoHoje').innerText = 'R$ ' + faturamentoHoje.toFixed(2);
    document.getElementById('cardEntradas').innerText = 'R$ ' + entradas.toFixed(2);
    document.getElementById('cardCustosFixosMensais').innerText = 'R$ ' + totalCustosFixos.toFixed(2);
    document.getElementById('cardContasPagar').innerText = 'R$ ' + totalContasPagar.toFixed(2);
    document.getElementById('cardFaturamentoMensal').innerText = 'R$ ' + faturamentoMensal.toFixed(2);
    document.getElementById('cardTotalBruto').innerText = 'R$ ' + receitaTotal.toFixed(2);
    document.getElementById('cardLucroLiquido').innerText = 'R$ ' + lucroLiquido.toFixed(2);

    // Gráfico de faturamento diário (lucro líquido)
    var dadosPorDia = agruparPorDia(pedidosFiltrados);
    if (dataInicio && dataFim) {
        var labels = gerarLabelsDias(dataInicio, dataFim);
        var valores = labels.map(function(label) {
            var partes = label.split('/');
            var chave = partes[2] + '-' + partes[1] + '-' + partes[0];
            return dadosPorDia[chave] || 0;
        });
        if (chartDiarioInstance) chartDiarioInstance.destroy();
        var ctx = document.getElementById('chartDiario');
        if (ctx) {
            chartDiarioInstance = new Chart(ctx, {
                type: 'bar',
                data: { labels: labels, datasets: [{ data: valores, backgroundColor: '#7FB3D5' }] },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
            });
        }
    }

    // Gráfico de pizza (lucro líquido por marketplace)
    var dadosMarket = agruparPorMarketplace(pedidosFiltrados);
    var marketLabels = Object.keys(dadosMarket);
    var marketValores = marketLabels.map(function(k) { return dadosMarket[k]; });
    if (chartMarketplaceInstance) chartMarketplaceInstance.destroy();
    var ctxPizza = document.getElementById('chartMarketplace');
    if (ctxPizza) {
        chartMarketplaceInstance = new Chart(ctxPizza, {
            type: 'doughnut',
            data: { labels: marketLabels, datasets: [{ data: marketValores, backgroundColor: ['#7FB3D5','#81C784','#F7B7A3','#C9B1FF','#FFE4B5'] }] },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }

    // Tabela de mais vendidos (lucro líquido)
    var produtosAgrupados = agruparPorProduto(pedidosFiltrados);
    produtosAgrupados.sort(function(a, b) { return b.qtd - a.qtd; });
    var tbody = document.getElementById('maisVendidosBody');
    if (tbody) {
        tbody.innerHTML = produtosAgrupados.map(function(prod) {
            return '<tr><td>' + prod.nome + '</td><td>' + prod.qtd + '</td><td>R$ ' + prod.lucroLiq.toFixed(2) + '</td></tr>';
        }).join('');
    }
}

function renderDashboard() {
    var hoje = new Date().toISOString().split('T')[0];
    var seteDiasAtras = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    var marketOptions = '<option value="Todos">Todos os marketplaces</option>' +
        marketplaces.map(function(m) { return '<option>' + m.nome + '</option>'; }).join('');

    document.getElementById('contentArea').innerHTML = `
        <div class="filter-bar">
            <div class="filter-group">
                <span class="filter-label">Período:</span>
                <input type="date" class="date-input" id="dashDataInicio" value="${seteDiasAtras}">
                <span style="color:var(--text-muted);">até</span>
                <input type="date" class="date-input" id="dashDataFim" value="${hoje}">
                <select id="dashMarketplace">${marketOptions}</select>
                <button class="btn btn-primary btn-sm" onclick="recalcularDashboard()"><i class="fas fa-filter"></i> Filtrar</button>
            </div>
        </div>
        <div class="cards-grid">
            <div class="stat-card blue"><div class="stat-icon"><i class="fas fa-coins"></i></div><div class="stat-info"><div class="stat-label">Faturamento Hoje</div><div class="stat-value" id="cardFaturamentoHoje">R$ 0,00</div><div class="stat-sub">Lucro líquido do dia</div></div></div>
            <div class="stat-card green"><div class="stat-icon"><i class="fas fa-arrow-up"></i></div><div class="stat-info"><div class="stat-label">Entradas</div><div class="stat-value" id="cardEntradas">R$ 0,00</div><div class="stat-sub">Lucro líquido do período</div></div></div>
            <div class="stat-card orange"><div class="stat-icon"><i class="fas fa-arrow-down"></i></div><div class="stat-info"><div class="stat-label">Custos Fixos Mensais</div><div class="stat-value" id="cardCustosFixosMensais">R$ 0,00</div><div class="stat-sub">Total do mês</div></div></div>
            <div class="stat-card purple"><div class="stat-icon"><i class="fas fa-file-invoice-dollar"></i></div><div class="stat-info"><div class="stat-label">Contas a Pagar</div><div class="stat-value" id="cardContasPagar">R$ 0,00</div><div class="stat-sub">Pendentes + Vencidas</div></div></div>
            <div class="stat-card purple"><div class="stat-icon"><i class="fas fa-chart-line"></i></div><div class="stat-info"><div class="stat-label">Faturamento Mensal</div><div class="stat-value" id="cardFaturamentoMensal">R$ 0,00</div><div class="stat-sub">Lucro líquido do mês</div></div></div>
            <div class="stat-card yellow"><div class="stat-icon"><i class="fas fa-shopping-bag"></i></div><div class="stat-info"><div class="stat-label">Total Bruto</div><div class="stat-value" id="cardTotalBruto">R$ 0,00</div><div class="stat-sub">Receita bruta do período</div></div></div>
            <div class="stat-card blue"><div class="stat-icon"><i class="fas fa-dollar-sign"></i></div><div class="stat-info"><div class="stat-label">Lucro Líquido</div><div class="stat-value" id="cardLucroLiquido">R$ 0,00</div><div class="stat-sub">Entradas - Custos Fixos</div></div></div>
        </div>
        <div class="section-grid">
            <div class="panel"><div class="panel-header"><div class="panel-title"><i class="fas fa-chart-bar"></i> Faturamento Diário</div></div><div class="panel-body"><canvas id="chartDiario" style="width:100%; height:260px;"></canvas></div></div>
            <div class="panel"><div class="panel-header"><div class="panel-title"><i class="fas fa-chart-pie"></i> Vendas por Marketplace</div></div><div class="panel-body"><canvas id="chartMarketplace" style="width:100%; height:260px;"></canvas></div></div>
        </div>
        <div class="panel" style="margin-top:1.25rem;"><div class="panel-header"><div class="panel-title"><i class="fas fa-star"></i> Mais Vendidos</div></div><div class="panel-body"><div class="table-responsive"><table class="data-table"><thead><tr><th>Produto</th><th>Qtd</th><th>Lucro Líquido</th></tr></thead><tbody id="maisVendidosBody"></tbody></table></div></div></div>`;
    recalcularDashboard();
}