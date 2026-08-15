function renderDashboardAdicional() {
    // Cálculos dinâmicos
    var receitaTotal = pedidos.reduce(function(s, p) { return s + p.receita; }, 0);
    var lucroLiquidoTotal = pedidos.reduce(function(s, p) { return s + p.lucroLiq; }, 0);
    var ticketMedio = pedidos.length > 0 ? receitaTotal / pedidos.length : 0;
    var margemMedia = receitaTotal > 0 ? (lucroLiquidoTotal / receitaTotal) * 100 : 0;

    // Lucro Real (líquido - custos fixos totais)
    var totalCustosFixos = custosFixos.reduce(function(s, c) { return s + c.valor; }, 0);
    var lucroReal = lucroLiquidoTotal - totalCustosFixos;

    // Faturamento Mensal (mês atual)
    var hoje = new Date();
    var mesAtual = hoje.getMonth() + 1;
    var anoAtual = hoje.getFullYear();
    var pedidosMes = pedidos.filter(function(p) {
        var partes = p.data.split('-');
        return parseInt(partes[0]) === anoAtual && parseInt(partes[1]) === mesAtual;
    });
    var faturamentoMensal = pedidosMes.reduce(function(s, p) { return s + p.receita; }, 0);

    // Saldo Atual (dia)
    var hojeStr = hoje.toISOString().split('T')[0];
    var pedidosHoje = pedidos.filter(function(p) { return p.data === hojeStr; });
    var entradasHoje = pedidosHoje.reduce(function(s, p) { return s + p.receita; }, 0);
    var saidasDiarias = totalCustosFixos / 30;
    var saldoAtual = entradasHoje - saidasDiarias;

    // Faturamento Semanal (últimos 7 dias)
    var seteDiasAtras = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    var pedidosSemana = pedidos.filter(function(p) { return p.data >= seteDiasAtras; });
    var faturamentoSemanal = pedidosSemana.reduce(function(s, p) { return s + p.receita; }, 0);

    // Dados para gráfico Receita vs Lucro (mensal)
    var receitasMensais = [0,0,0,0,0,0,0,0,0,0,0,0];
    var lucrosMensais = [0,0,0,0,0,0,0,0,0,0,0,0];
    pedidos.forEach(function(p) {
        var mes = parseInt(p.data.split('-')[1]) - 1;
        receitasMensais[mes] += p.receita;
        lucrosMensais[mes] += p.lucroLiq;
    });

    document.getElementById('contentArea').innerHTML = `
        <div class="cards-grid">
            <div class="stat-card blue">
                <div class="stat-icon"><i class="fas fa-chart-line"></i></div>
                <div class="stat-info">
                    <div class="stat-label">Receita Total</div>
                    <div class="stat-value">R$ ${receitaTotal.toFixed(2)}</div>
                </div>
            </div>
            <div class="stat-card green">
                <div class="stat-icon"><i class="fas fa-dollar-sign"></i></div>
                <div class="stat-info">
                    <div class="stat-label">Lucro Líquido</div>
                    <div class="stat-value">R$ ${lucroLiquidoTotal.toFixed(2)}</div>
                    <div class="stat-sub">Margem ${margemMedia.toFixed(1)}%</div>
                </div>
            </div>
            <div class="stat-card orange">
                <div class="stat-icon"><i class="fas fa-shopping-bag"></i></div>
                <div class="stat-info">
                    <div class="stat-label">Ticket Médio</div>
                    <div class="stat-value">R$ ${ticketMedio.toFixed(2)}</div>
                </div>
            </div>
            <div class="stat-card green">
                <div class="stat-icon"><i class="fas fa-chart-line"></i></div>
                <div class="stat-info">
                    <div class="stat-label">Faturamento Mensal</div>
                    <div class="stat-value">R$ ${faturamentoMensal.toFixed(2)}</div>
                    <div class="stat-sub">${hoje.toLocaleDateString('pt-BR', {month: 'long', year: 'numeric'})}</div>
                </div>
            </div>
            <div class="stat-card green">
                <div class="stat-icon"><i class="fas fa-chart-pie"></i></div>
                <div class="stat-info">
                    <div class="stat-label">Lucro Real</div>
                    <div class="stat-value">R$ ${lucroReal.toFixed(2)}</div>
                    <div class="stat-sub">Líquido - Custos Fixos</div>
                </div>
            </div>
            <div class="stat-card blue">
                <div class="stat-icon"><i class="fas fa-wallet"></i></div>
                <div class="stat-info">
                    <div class="stat-label">Saldo Atual</div>
                    <div class="stat-value">R$ ${saldoAtual.toFixed(2)}</div>
                    <div class="stat-sub">Hoje</div>
                </div>
            </div>
            <div class="stat-card blue">
                <div class="stat-icon"><i class="fas fa-calendar-week"></i></div>
                <div class="stat-info">
                    <div class="stat-label">Faturamento Semanal</div>
                    <div class="stat-value">R$ ${faturamentoSemanal.toFixed(2)}</div>
                    <div class="stat-sub">Últimos 7 dias</div>
                </div>
            </div>
        </div>

        <div class="section-grid">
            <div class="panel">
                <div class="panel-header"><div class="panel-title"><i class="fas fa-chart-line"></i> Receita vs Lucro</div></div>
                <div class="panel-body"><div class="chart-placeholder"><canvas id="chartReceitaLucro"></canvas></div></div>
            </div>
            <div class="panel">
                <div class="panel-header"><div class="panel-title"><i class="fas fa-chart-pie"></i> Custos Fixos</div></div>
                <div class="panel-body"><div class="chart-placeholder"><canvas id="chartCustosFixos"></canvas></div></div>
            </div>
        </div>
        <div class="section-grid" style="margin-top:1.25rem;">
            <div class="panel">
                <div class="panel-header"><div class="panel-title"><i class="fas fa-star"></i> Produtos Mais Vendidos</div></div>
                <div class="panel-body"><div class="chart-placeholder"><canvas id="chartProdutosVendidos"></canvas></div></div>
            </div>
            <div class="panel">
                <div class="panel-header"><div class="panel-title"><i class="fas fa-chart-area"></i> Evolução das Vendas</div></div>
                <div class="panel-body"><div class="chart-placeholder"><canvas id="chartEvolucaoVendas"></canvas></div></div>
            </div>
        </div>`;

    // Gráficos
    new Chart(document.getElementById('chartReceitaLucro'), {
        type: 'line',
        data: { labels: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'],
                datasets: [
                    { label: 'Receita', data: receitasMensais, borderColor: '#7FB3D5' },
                    { label: 'Lucro Líq.', data: lucrosMensais, borderColor: '#81C784' }
                ]},
        options: { responsive: true, maintainAspectRatio: false }
    });
    new Chart(document.getElementById('chartCustosFixos'), {
        type: 'doughnut',
        data: { labels: custosFixos.map(function(c) { return c.desc; }),
                datasets: [{ data: custosFixos.map(function(c) { return c.valor; }),
                backgroundColor: ['#7FB3D5','#11cdef','#81C784','#fb6340','#f5365c','#ffd600'] }] },
        options: { responsive: true, maintainAspectRatio: false }
    });
    // Produtos mais vendidos (agrupado)
    var prodVendidos = {};
    pedidos.forEach(function(p) {
        if (!prodVendidos[p.prod]) prodVendidos[p.prod] = 0;
        prodVendidos[p.prod] += p.qtd;
    });
    var labelsProd = Object.keys(prodVendidos);
    var dataProd = labelsProd.map(function(k) { return prodVendidos[k]; });
    new Chart(document.getElementById('chartProdutosVendidos'), {
        type: 'bar',
        data: { labels: labelsProd, datasets: [{ data: dataProd, backgroundColor: '#7FB3D5' }] },
        options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
    // Evolução das vendas (mesma linha de receita)
    new Chart(document.getElementById('chartEvolucaoVendas'), {
        type: 'line',
        data: { labels: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'],
                datasets: [{ data: receitasMensais, borderColor: '#fb6340', backgroundColor: 'rgba(251,99,64,0.1)', fill: true }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
}