// Estado interno do módulo de Contas a Receber
var receberCompetencia = { mes: new Date().getMonth() + 1, ano: new Date().getFullYear() };
var receberModo = 'mensal';

function obterReceberMes(mes, ano) {
    return contasReceber.filter(function(c) {
        var partes = c.dataVencimento.split('-');
        return parseInt(partes[0]) === ano && parseInt(partes[1]) === mes;
    });
}

function calcularTotaisReceber(lista) {
    var totais = { total: 0, recebido: 0, pendente: 0, vencido: 0 };
    lista.forEach(function(c) {
        if (c.status === 'recebido') {
            totais.recebido += c.valor;
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

function formatarMesAnoReceber(mes, ano) {
    var nomes = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
    return nomes[mes-1] + '/' + ano;
}

function avancarCompetenciaReceber() {
    if (receberCompetencia.mes === 12) {
        receberCompetencia.mes = 1;
        receberCompetencia.ano++;
    } else {
        receberCompetencia.mes++;
    }
    aplicarCompetenciaReceber();
}

function retrocederCompetenciaReceber() {
    if (receberCompetencia.mes === 1) {
        receberCompetencia.mes = 12;
        receberCompetencia.ano--;
    } else {
        receberCompetencia.mes--;
    }
    aplicarCompetenciaReceber();
}

function aplicarCompetenciaReceber() {
    document.getElementById('receberAno').value = receberCompetencia.ano;
    document.getElementById('receberMes').value = receberCompetencia.mes;
    if (receberModo === 'mensal') {
        atualizarVisaoMensalReceber();
    } else {
        atualizarVisaoAnualReceber();
    }
}

function alternarModoReceber() {
    if (receberModo === 'mensal') {
        receberModo = 'anual';
        document.getElementById('btnModoReceber').innerHTML = '<i class="fas fa-calendar-alt"></i> Visão Mensal';
    } else {
        receberModo = 'mensal';
        document.getElementById('btnModoReceber').innerHTML = '<i class="fas fa-chart-bar"></i> Visão Anual';
    }
    if (receberModo === 'mensal') {
        atualizarVisaoMensalReceber();
    } else {
        atualizarVisaoAnualReceber();
    }
}

function renderContasReceberView() {
    var meses = [
        { valor: 1, nome: 'Janeiro' }, { valor: 2, nome: 'Fevereiro' }, { valor: 3, nome: 'Março' },
        { valor: 4, nome: 'Abril' }, { valor: 5, nome: 'Maio' }, { valor: 6, nome: 'Junho' },
        { valor: 7, nome: 'Julho' }, { valor: 8, nome: 'Agosto' }, { valor: 9, nome: 'Setembro' },
        { valor: 10, nome: 'Outubro' }, { valor: 11, nome: 'Novembro' }, { valor: 12, nome: 'Dezembro' }
    ];

    var optionsMeses = meses.map(function(m) {
        var selected = m.valor === receberCompetencia.mes ? ' selected' : '';
        return '<option value="' + m.valor + '"' + selected + '>' + m.nome + '</option>';
    }).join('');

    document.getElementById('contentArea').innerHTML = `
        <div class="filter-bar" style="justify-content: space-between;">
            <div class="filter-group">
                <button class="btn btn-outline btn-sm" onclick="retrocederCompetenciaReceber()"><i class="fas fa-chevron-left"></i></button>
                <select id="receberMes" onchange="receberCompetencia.mes=parseInt(this.value); aplicarCompetenciaReceber();">${optionsMeses}</select>
                <input type="number" id="receberAno" value="${receberCompetencia.ano}" style="width:90px; text-align:center;" onchange="receberCompetencia.ano=parseInt(this.value); aplicarCompetenciaReceber();" min="1900" max="2100" step="1">
                <button class="btn btn-outline btn-sm" onclick="avancarCompetenciaReceber()"><i class="fas fa-chevron-right"></i></button>
            </div>
            <div class="filter-group">
                <button class="btn btn-outline btn-sm" id="btnModoReceber" onclick="alternarModoReceber()"><i class="fas fa-chart-bar"></i> Visão Anual</button>
                <button class="btn btn-primary btn-sm" onclick="abrirModalContaReceber()"><i class="fas fa-plus"></i> Nova Conta</button>
            </div>
        </div>
        <div id="receberConteudo"></div>`;

    if (receberModo === 'mensal') {
        atualizarVisaoMensalReceber();
    } else {
        atualizarVisaoAnualReceber();
    }
}

function atualizarVisaoMensalReceber() {
    var mes = receberCompetencia.mes;
    var ano = receberCompetencia.ano;
    var lista = obterReceberMes(mes, ano);
    var totais = calcularTotaisReceber(lista);

    var html = `
        <div class="cards-grid">
            <div class="stat-card green"><div class="stat-icon"><i class="fas fa-hand-holding-usd"></i></div><div class="stat-info"><div class="stat-label">Total a Receber</div><div class="stat-value">R$ ${totais.total.toFixed(2)}</div></div></div>
            <div class="stat-card blue"><div class="stat-icon"><i class="fas fa-check-circle"></i></div><div class="stat-info"><div class="stat-label">Recebidos</div><div class="stat-value">R$ ${totais.recebido.toFixed(2)}</div></div></div>
            <div class="stat-card yellow"><div class="stat-icon"><i class="fas fa-clock"></i></div><div class="stat-info"><div class="stat-label">Pendentes</div><div class="stat-value">R$ ${totais.pendente.toFixed(2)}</div></div></div>
            <div class="stat-card red"><div class="stat-icon"><i class="fas fa-exclamation-triangle"></i></div><div class="stat-info"><div class="stat-label">Vencidos</div><div class="stat-value">R$ ${totais.vencido.toFixed(2)}</div></div></div>
        </div>

        <div class="panel">
            <div class="panel-header"><div class="panel-title"><i class="fas fa-list"></i> Contas de ${formatarMesAnoReceber(mes, ano)}</div></div>
            <div class="panel-body">
                <div class="table-responsive">
                    <table class="data-table">
                        <thead><tr><th>Vencimento</th><th>Descrição</th><th>Cliente</th><th>Valor</th><th>Status</th><th>Ações</th></tr></thead>
                        <tbody>`;

    lista.forEach(function(c) {
        var statusClass = c.status === 'recebido' ? 'status-concluida' : (c.status === 'pendente' ? 'status-pendente' : 'status-cancelada');
        var statusTexto = c.status === 'recebido' ? 'Recebido' : (c.status === 'pendente' ? 'Pendente' : 'Vencido');
        var dataFormatada = formatarData(c.dataVencimento);
        var badgeAuto = c.pedidoId ? ' <span class="status-badge status-agendada" style="font-size:0.65rem; padding:0.15rem 0.5rem;" title="Gerada automaticamente pelo pedido #' + c.pedidoId + '">Auto</span>' : '';
        html += `
            <tr>
                <td>${dataFormatada}</td>
                <td>${c.descricao}${badgeAuto}</td>
                <td>${c.clienteNome || '-'}</td>
                <td>R$ ${c.valor.toFixed(2)}</td>
                <td><span class="status-badge ${statusClass}">${statusTexto}</span></td>
                <td>
                    <button class="btn-ghost edit" title="Editar" onclick="editarContaReceber(${c.id})"><i class="fas fa-edit"></i></button>
                    <button class="btn-ghost delete" title="Excluir" onclick="excluirContaReceber(${c.id})"><i class="fas fa-trash-alt"></i></button>
                    ${c.status !== 'recebido' ? '<button class="btn-ghost edit" title="Marcar como Recebido" onclick="marcarContaRecebida(' + c.id + ')"><i class="fas fa-check"></i></button>' : ''}
                </td>
            </tr>`;
    });

    html += '</tbody></table></div></div></div>';
    document.getElementById('receberConteudo').innerHTML = html;
}

function atualizarVisaoAnualReceber() {
    var ano = receberCompetencia.ano;
    var html = '<div class="panel"><div class="panel-header"><div class="panel-title"><i class="fas fa-chart-bar"></i> Resumo Anual - ' + ano + '</div></div><div class="panel-body"><div class="table-responsive"><table class="data-table"><thead><tr><th>Mês</th><th>Total a Receber</th><th>Recebidos</th><th>Pendentes</th><th>Vencidos</th></tr></thead><tbody>';

    var nomesMeses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
    for (var m = 1; m <= 12; m++) {
        var lista = obterReceberMes(m, ano);
        var totais = calcularTotaisReceber(lista);
        html += '<tr style="cursor:pointer;" onclick="irParaMesReceber(' + m + ')">';
        html += '<td>' + nomesMeses[m-1] + '</td>';
        html += '<td>R$ ' + totais.total.toFixed(2) + '</td>';
        html += '<td style="color:var(--success-dark);">R$ ' + totais.recebido.toFixed(2) + '</td>';
        html += '<td style="color:var(--warning-dark);">R$ ' + totais.pendente.toFixed(2) + '</td>';
        html += '<td style="color:var(--danger-dark);">R$ ' + totais.vencido.toFixed(2) + '</td>';
        html += '</tr>';
    }

    html += '</tbody></table></div></div></div>';
    document.getElementById('receberConteudo').innerHTML = html;
}

function irParaMesReceber(mes) {
    receberCompetencia.mes = mes;
    receberModo = 'mensal';
    document.getElementById('btnModoReceber').innerHTML = '<i class="fas fa-chart-bar"></i> Visão Anual';
    aplicarCompetenciaReceber();
}

function abrirModalContaReceber(conta) {
    if (conta === undefined) conta = null;
    var editando = conta !== null;
    var dataPadrao = receberCompetencia.ano + '-' + String(receberCompetencia.mes).padStart(2, '0') + '-01';

    var clienteOptions = '<option value="">Sem cliente</option>' +
        clientes.map(function(c) {
            var sel = (editando && conta.clienteId === c.id) ? ' selected' : '';
            return '<option value="' + c.id + '"' + sel + '>' + c.nome + '</option>';
        }).join('');

    abrirModal(`
        <div class="modal-header"><h3>${editando ? 'Editar Conta a Receber' : 'Nova Conta a Receber'}</h3><button class="modal-close" onclick="fecharModal()"><i class="fas fa-times"></i></button></div>
        ${editando && conta.pedidoId ? '<div style="margin-bottom:1rem; padding:0.75rem; background:var(--color-sky-light); border-radius:6px; font-size:0.85rem; color:#0277BD;"><strong>Conta automática:</strong> gerada pelo pedido #' + conta.pedidoId + '. Alterar aqui não afeta o pedido.</div>' : ''}
        <div class="form-row">
            <div class="form-group"><label>Descrição</label><input type="text" id="recDescricao" value="${editando ? conta.descricao : ''}"></div>
            <div class="form-group"><label>Cliente</label><select id="recCliente">${clienteOptions}</select></div>
            <div class="form-group"><label>Valor R$</label><input type="number" step="0.01" id="recValor" value="${editando ? conta.valor : ''}"></div>
            <div class="form-group"><label>Data Vencimento</label><input type="date" id="recData" value="${editando ? conta.dataVencimento : dataPadrao}"></div>
            ${!editando ? '<div class="form-group"><label>Parcelas</label><input type="number" id="recParcelas" value="1" min="1" step="1"></div>' : ''}
        </div>
        <div class="form-actions">
            <button class="btn btn-outline" onclick="fecharModal()">Cancelar</button>
            <button class="btn btn-primary" onclick="salvarContaReceber(${editando ? conta.id : 'null'})">Salvar</button>
        </div>`);
}

function salvarContaReceber(idOriginal) {
    var descricao = document.getElementById('recDescricao').value.trim();
    var valor = +document.getElementById('recValor').value;
    var data = document.getElementById('recData').value;
    var clienteId = document.getElementById('recCliente')?.value || '';
    var clienteObj = clienteId ? clientes.find(function(c) { return String(c.id) === String(clienteId); }) : null;
    var clienteNome = clienteObj ? clienteObj.nome : '';

    if (!descricao || !data || valor <= 0) return alert('Preencha descrição, data e valor válido.');

    if (idOriginal !== null && idOriginal !== undefined && idOriginal !== 'null') {
        var idx = contasReceber.findIndex(function(c) { return c.id === idOriginal; });
        if (idx >= 0) {
            var original = contasReceber[idx];
            contasReceber[idx] = {
                id: idOriginal,
                pedidoId: original.pedidoId || null,
                market: original.market || null,
                descricao: descricao,
                clienteId: clienteObj ? clienteObj.id : null,
                clienteNome: clienteNome,
                valor: valor,
                dataVencimento: data,
                status: original.status,
                dataRecebimento: original.dataRecebimento || null
            };
            Storage.saveContasReceber();
        }
    } else {
        var parcelas = parseInt(document.getElementById('recParcelas')?.value || '1');
        if (isNaN(parcelas) || parcelas < 1) parcelas = 1;

        var maxId = contasReceber.length ? Math.max(...contasReceber.map(c => c.id)) : 0;
        var valorParcela = parseFloat((valor / parcelas).toFixed(2));
        var resto = parseFloat((valor - (valorParcela * parcelas)).toFixed(2));

        for (var i = 0; i < parcelas; i++) {
            var dataParcela = adicionarMesesReceber(data, i);
            var valorFinal = (i === parcelas - 1) ? parseFloat((valorParcela + resto).toFixed(2)) : valorParcela;
            var novaConta = {
                id: ++maxId,
                pedidoId: null,
                market: null,
                descricao: descricao + (parcelas > 1 ? ' (' + (i+1) + '/' + parcelas + ')' : ''),
                clienteId: clienteObj ? clienteObj.id : null,
                clienteNome: clienteNome,
                valor: valorFinal,
                dataVencimento: dataParcela,
                status: 'pendente',
                dataRecebimento: null
            };
            contasReceber.push(novaConta);
        }
        Storage.saveContasReceber();
    }

    fecharModal();
    if (receberModo === 'mensal') {
        atualizarVisaoMensalReceber();
    } else {
        atualizarVisaoAnualReceber();
    }
}

function editarContaReceber(id) {
    var c = contasReceber.find(function(x) { return x.id === id; });
    if (c) abrirModalContaReceber(c);
}

function excluirContaReceber(id) {
    var c = contasReceber.find(function(x) { return x.id === id; });
    var msg = c && c.pedidoId
        ? 'Esta conta foi gerada automaticamente pelo pedido #' + c.pedidoId + '. Excluí-la não remove o pedido. Continuar?'
        : 'Excluir esta conta?';
    if (confirm(msg)) {
        contasReceber = contasReceber.filter(function(x) { return x.id !== id; });
        Storage.saveContasReceber();
        if (receberModo === 'mensal') {
            atualizarVisaoMensalReceber();
        } else {
            atualizarVisaoAnualReceber();
        }
    }
}

function marcarContaRecebida(id) {
    var c = contasReceber.find(function(x) { return x.id === id; });
    if (c) {
        c.status = 'recebido';
        c.dataRecebimento = new Date().toISOString().split('T')[0];
        Storage.saveContasReceber();
        if (receberModo === 'mensal') {
            atualizarVisaoMensalReceber();
        } else {
            atualizarVisaoAnualReceber();
        }
    }
}

function adicionarMesesReceber(dataISO, meses) {
    var partes = dataISO.split('-');
    var ano = parseInt(partes[0]);
    var mes = parseInt(partes[1]) - 1 + meses;
    var dia = parseInt(partes[2]);
    var data = new Date(ano, mes, 1);
    var ultimoDia = new Date(data.getFullYear(), data.getMonth() + 1, 0).getDate();
    if (dia > ultimoDia) dia = ultimoDia;
    return data.getFullYear() + '-' + String(data.getMonth() + 1).padStart(2, '0') + '-' + String(dia).padStart(2, '0');
}