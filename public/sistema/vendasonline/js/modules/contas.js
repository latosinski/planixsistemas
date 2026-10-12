// Estado interno do módulo de Contas a Pagar
var contasCompetencia = { mes: new Date().getMonth() + 1, ano: new Date().getFullYear() };
var contasModo = 'mensal';

// Funções auxiliares
function obterContasMes(mes, ano) {
    return contas.filter(function(c) {
        var partes = c.dataVencimento.split('-');
        return parseInt(partes[0]) === ano && parseInt(partes[1]) === mes;
    });
}

function calcularTotaisContas(lista) {
    var totais = { total: 0, pago: 0, pendente: 0, vencido: 0 };
    lista.forEach(function(c) {
        if (c.status === 'pago') {
            totais.pago += c.valor;
        } else if (c.status === 'pendente') {
            totais.pendente += c.valor;
            totais.total += c.valor;
        } else if (c.status === 'vencido') {
            totais.vencido += c.valor;
            totais.total += c.valor;
        }
    });
    return totais;
}

function formatarMesAnoContas(mes, ano) {
    var nomes = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
    return nomes[mes-1] + '/' + ano;
}

function avancarCompetenciaContas() {
    if (contasCompetencia.mes === 12) {
        contasCompetencia.mes = 1;
        contasCompetencia.ano++;
    } else {
        contasCompetencia.mes++;
    }
    aplicarCompetenciaContas();
}

function retrocederCompetenciaContas() {
    if (contasCompetencia.mes === 1) {
        contasCompetencia.mes = 12;
        contasCompetencia.ano--;
    } else {
        contasCompetencia.mes--;
    }
    aplicarCompetenciaContas();
}

function aplicarCompetenciaContas() {
    document.getElementById('contasAno').value = contasCompetencia.ano;
    document.getElementById('contasMes').value = contasCompetencia.mes;
    if (contasModo === 'mensal') {
        atualizarVisaoMensalContas();
    } else {
        atualizarVisaoAnualContas();
    }
}

function alternarModoContas() {
    if (contasModo === 'mensal') {
        contasModo = 'anual';
        document.getElementById('btnModoContas').innerHTML = '<i class="fas fa-calendar-alt"></i> Visão Mensal';
    } else {
        contasModo = 'mensal';
        document.getElementById('btnModoContas').innerHTML = '<i class="fas fa-chart-bar"></i> Visão Anual';
    }
    if (contasModo === 'mensal') {
        atualizarVisaoMensalContas();
    } else {
        atualizarVisaoAnualContas();
    }
}

// Renderização principal
function renderContasView() {
    var meses = [
        { valor: 1, nome: 'Janeiro' }, { valor: 2, nome: 'Fevereiro' }, { valor: 3, nome: 'Março' },
        { valor: 4, nome: 'Abril' }, { valor: 5, nome: 'Maio' }, { valor: 6, nome: 'Junho' },
        { valor: 7, nome: 'Julho' }, { valor: 8, nome: 'Agosto' }, { valor: 9, nome: 'Setembro' },
        { valor: 10, nome: 'Outubro' }, { valor: 11, nome: 'Novembro' }, { valor: 12, nome: 'Dezembro' }
    ];

    var optionsMeses = meses.map(function(m) {
        var selected = m.valor === contasCompetencia.mes ? ' selected' : '';
        return '<option value="' + m.valor + '"' + selected + '>' + m.nome + '</option>';
    }).join('');

    document.getElementById('contentArea').innerHTML = `
        <div class="filter-bar" style="justify-content: space-between;">
            <div class="filter-group">
                <button class="btn btn-outline btn-sm" onclick="retrocederCompetenciaContas()"><i class="fas fa-chevron-left"></i></button>
                <select id="contasMes" onchange="contasCompetencia.mes=parseInt(this.value); aplicarCompetenciaContas();">${optionsMeses}</select>
                <input type="number" id="contasAno" value="${contasCompetencia.ano}" style="width:90px; text-align:center;" onchange="contasCompetencia.ano=parseInt(this.value); aplicarCompetenciaContas();" min="1900" max="2100" step="1">
                <button class="btn btn-outline btn-sm" onclick="avancarCompetenciaContas()"><i class="fas fa-chevron-right"></i></button>
            </div>
            <div class="filter-group">
                <button class="btn btn-outline btn-sm" id="btnModoContas" onclick="alternarModoContas()"><i class="fas fa-chart-bar"></i> Visão Anual</button>
                <button class="btn btn-primary btn-sm" onclick="abrirModalConta()"><i class="fas fa-plus"></i> Nova Conta</button>
            </div>
        </div>
        <div id="contasConteudo"></div>`;

    if (contasModo === 'mensal') {
        atualizarVisaoMensalContas();
    } else {
        atualizarVisaoAnualContas();
    }
}

function atualizarVisaoMensalContas() {
    var mes = contasCompetencia.mes;
    var ano = contasCompetencia.ano;
    var lista = obterContasMes(mes, ano);
    var totais = calcularTotaisContas(lista);

    var html = `
        <div class="cards-grid">
            <div class="stat-card blue"><div class="stat-icon"><i class="fas fa-file-invoice-dollar"></i></div><div class="stat-info"><div class="stat-label">Total a Pagar</div><div class="stat-value">R$ ${totais.total.toFixed(2)}</div></div></div>
            <div class="stat-card green"><div class="stat-icon"><i class="fas fa-check-circle"></i></div><div class="stat-info"><div class="stat-label">Pagos</div><div class="stat-value">R$ ${totais.pago.toFixed(2)}</div></div></div>
            <div class="stat-card yellow"><div class="stat-icon"><i class="fas fa-clock"></i></div><div class="stat-info"><div class="stat-label">Pendentes</div><div class="stat-value">R$ ${totais.pendente.toFixed(2)}</div></div></div>
            <div class="stat-card red"><div class="stat-icon"><i class="fas fa-exclamation-triangle"></i></div><div class="stat-info"><div class="stat-label">Vencidos</div><div class="stat-value">R$ ${totais.vencido.toFixed(2)}</div></div></div>
        </div>

        <div class="panel">
            <div class="panel-header"><div class="panel-title"><i class="fas fa-list"></i> Contas de ${formatarMesAnoContas(mes, ano)}</div></div>
            <div class="panel-body">
                <div class="table-responsive">
                    <table class="data-table">
                        <thead><tr><th>Vencimento</th><th>Descrição</th><th>Valor</th><th>Status</th><th>Ações</th></tr></thead>
                        <tbody>`;

    lista.forEach(function(c) {
        var statusClass = c.status === 'pago' ? 'status-concluida' : (c.status === 'pendente' ? 'status-pendente' : 'status-cancelada');
        var statusTexto = c.status === 'pago' ? 'Pago' : (c.status === 'pendente' ? 'Pendente' : 'Vencido');
        var dataFormatada = formatarData(c.dataVencimento);
        html += `
            <tr>
                <td>${dataFormatada}</td>
                <td>${c.descricao}</td>
                <td>R$ ${c.valor.toFixed(2)}</td>
                <td><span class="status-badge ${statusClass}">${statusTexto}</span></td>
                <td>
                    <button class="btn-ghost edit" title="Editar" onclick="editarConta(${c.id})"><i class="fas fa-edit"></i></button>
                    <button class="btn-ghost delete" title="Excluir" onclick="excluirConta(${c.id})"><i class="fas fa-trash-alt"></i></button>
                    ${c.status !== 'pago' ? '<button class="btn-ghost edit" title="Marcar como Pago" onclick="marcarContaPaga(' + c.id + ')"><i class="fas fa-check"></i></button>' : ''}
                </td>
            </tr>`;
    });

    html += '</tbody></table></div></div></div>';
    document.getElementById('contasConteudo').innerHTML = html;
}

function atualizarVisaoAnualContas() {
    var ano = contasCompetencia.ano;
    var html = '<div class="panel"><div class="panel-header"><div class="panel-title"><i class="fas fa-chart-bar"></i> Resumo Anual - ' + ano + '</div></div><div class="panel-body"><div class="table-responsive"><table class="data-table"><thead><tr><th>Mês</th><th>Total a Pagar</th><th>Pagos</th><th>Pendentes</th><th>Vencidos</th></tr></thead><tbody>';

    var nomesMeses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
    for (var m = 1; m <= 12; m++) {
        var lista = obterContasMes(m, ano);
        var totais = calcularTotaisContas(lista);
        html += '<tr style="cursor:pointer;" onclick="irParaMesContas(' + m + ')">';
        html += '<td>' + nomesMeses[m-1] + '</td>';
        html += '<td>R$ ' + totais.total.toFixed(2) + '</td>';
        html += '<td style="color:var(--success-dark);">R$ ' + totais.pago.toFixed(2) + '</td>';
        html += '<td style="color:var(--warning-dark);">R$ ' + totais.pendente.toFixed(2) + '</td>';
        html += '<td style="color:var(--danger-dark);">R$ ' + totais.vencido.toFixed(2) + '</td>';
        html += '</tr>';
    }

    html += '</tbody></table></div></div></div>';
    document.getElementById('contasConteudo').innerHTML = html;
}

function irParaMesContas(mes) {
    contasCompetencia.mes = mes;
    contasModo = 'mensal';
    document.getElementById('btnModoContas').innerHTML = '<i class="fas fa-chart-bar"></i> Visão Anual';
    aplicarCompetenciaContas();
}

// CRUD
function abrirModalConta(conta) {
    if (conta === undefined) conta = null;
    var editando = conta !== null;
    var dataPadrao = contasCompetencia.ano + '-' + String(contasCompetencia.mes).padStart(2, '0') + '-01';
    abrirModal(`
        <div class="modal-header"><h3>${editando ? 'Editar Conta' : 'Nova Conta a Pagar'}</h3><button class="modal-close" onclick="fecharModal()"><i class="fas fa-times"></i></button></div>
        <div class="form-row">
            <div class="form-group"><label>Descrição</label><input type="text" id="contaDescricao" value="${editando ? conta.descricao : ''}"></div>
            <div class="form-group"><label>Valor R$</label><input type="number" step="0.01" id="contaValor" value="${editando ? conta.valor : ''}"></div>
            <div class="form-group"><label>Data Vencimento</label><input type="date" id="contaData" value="${editando ? conta.dataVencimento : dataPadrao}"></div>
            ${!editando ? '<div class="form-group"><label>Parcelas</label><input type="number" id="contaParcelas" value="1" min="1" step="1"></div>' : ''}
        </div>
        <div class="form-actions">
            <button class="btn btn-outline" onclick="fecharModal()">Cancelar</button>
            <button class="btn btn-primary" onclick="salvarConta(${editando ? conta.id : 'null'})">Salvar</button>
        </div>`);
}

function salvarConta(idOriginal) {
    var descricao = document.getElementById('contaDescricao').value.trim();
    var valor = +document.getElementById('contaValor').value;
    var data = document.getElementById('contaData').value;
    if (!descricao || !data || valor <= 0) return alert('Preencha descrição, data e valor válido.');

    if (idOriginal !== null && idOriginal !== undefined && idOriginal !== 'null') {
        var idx = contas.findIndex(function(c) { return c.id === idOriginal; });
        if (idx >= 0) {
            contas[idx] = {
                id: idOriginal,
                descricao: descricao,
                valor: valor,
                dataVencimento: data,
                status: contas[idx].status,
                dataPagamento: contas[idx].dataPagamento || null
            };
            Storage.saveContas();
        }
    } else {
        var parcelas = parseInt(document.getElementById('contaParcelas')?.value || '1');
        if (isNaN(parcelas) || parcelas < 1) parcelas = 1;

        var maxId = contas.length ? Math.max(...contas.map(c => c.id)) : 0;
        var valorParcela = parseFloat((valor / parcelas).toFixed(2));
        var resto = parseFloat((valor - (valorParcela * parcelas)).toFixed(2));

        for (var i = 0; i < parcelas; i++) {
            var dataParcela = adicionarMesesContas(data, i);
            var valorFinal = (i === parcelas - 1) ? parseFloat((valorParcela + resto).toFixed(2)) : valorParcela;
            var novaConta = {
                id: ++maxId,
                descricao: descricao + (parcelas > 1 ? ' (' + (i+1) + '/' + parcelas + ')' : ''),
                valor: valorFinal,
                dataVencimento: dataParcela,
                status: 'pendente',
                dataPagamento: null
            };
            contas.push(novaConta);
        }
        Storage.saveContas();
    }

    fecharModal();
    if (contasModo === 'mensal') {
        atualizarVisaoMensalContas();
    } else {
        atualizarVisaoAnualContas();
    }
}

function editarConta(id) {
    var c = contas.find(function(x) { return x.id === id; });
    if (c) abrirModalConta(c);
}

function excluirConta(id) {
    if (confirm('Excluir esta conta?')) {
        contas = contas.filter(function(c) { return c.id !== id; });
        Storage.saveContas();
        if (contasModo === 'mensal') {
            atualizarVisaoMensalContas();
        } else {
            atualizarVisaoAnualContas();
        }
    }
}

function marcarContaPaga(id) {
    var c = contas.find(function(x) { return x.id === id; });
    if (c) {
        c.status = 'pago';
        c.dataPagamento = new Date().toISOString().split('T')[0];
        Storage.saveContas();
        if (contasModo === 'mensal') {
            atualizarVisaoMensalContas();
        } else {
            atualizarVisaoAnualContas();
        }
    }
}

// Função auxiliar para adicionar meses a uma data ISO
function adicionarMesesContas(dataISO, meses) {
    var partes = dataISO.split('-');
    var ano = parseInt(partes[0]);
    var mes = parseInt(partes[1]) - 1 + meses;
    var dia = parseInt(partes[2]);
    var data = new Date(ano, mes, 1);
    var ultimoDia = new Date(data.getFullYear(), data.getMonth() + 1, 0).getDate();
    if (dia > ultimoDia) dia = ultimoDia;
    return data.getFullYear() + '-' + String(data.getMonth() + 1).padStart(2, '0') + '-' + String(dia).padStart(2, '0');
}