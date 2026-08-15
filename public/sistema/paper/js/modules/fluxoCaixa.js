function renderFluxoCaixaView() {
    // Combina entradas (pedidos) e saídas (custos fixos) ordenados por data
    var lancamentos = [];

    pedidos.forEach(function(p) {
        lancamentos.push({
            data: p.data,
            descricao: 'Venda: ' + p.prod + ' (' + p.market + ')',
            tipo: 'entrada',
            valor: p.receita
        });
    });

    custosFixos.forEach(function(c) {
        lancamentos.push({
            data: c.dataVencimento,
            descricao: c.desc,
            tipo: 'saida',
            valor: c.valor
        });
    });

    lancamentos.sort(function(a, b) { return b.data.localeCompare(a.data); });

    var html = '';
    if (lancamentos.length === 0) {
        html = '<tr><td colspan="4" style="text-align:center; padding:2rem;">Nenhum lançamento registrado.</td></tr>';
    } else {
        html = lancamentos.map(function(l) {
            var tipoClass = l.tipo === 'entrada' ? 'status-concluida' : 'status-cancelada';
            var tipoTexto = l.tipo === 'entrada' ? 'Entrada' : 'Saída';
            var dataFormatada = new Date(l.data + 'T00:00:00').toLocaleDateString('pt-BR');
            return '<tr><td>' + dataFormatada + '</td><td>' + l.descricao + '</td><td><span class="status-badge ' + tipoClass + '">' + tipoTexto + '</span></td><td>R$ ' + l.valor.toFixed(2) + '</td></tr>';
        }).join('');
    }

    document.getElementById('contentArea').innerHTML = `
        <div class="panel">
            <div class="panel-header">
                <div class="panel-title"><i class="fas fa-exchange-alt"></i> Fluxo de Caixa</div>
            </div>
            <div class="panel-body">
                <div class="table-responsive">
                    <table class="data-table">
                        <thead><tr><th>Data</th><th>Descrição</th><th>Tipo</th><th>Valor</th></tr></thead>
                        <tbody>${html}</tbody>
                    </table>
                </div>
            </div>
        </div>`;
}