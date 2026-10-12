// Estado interno do módulo de Custos Fixos
var custosCompetencia = { mes: new Date().getMonth() + 1, ano: new Date().getFullYear() };
var custosModo = 'mensal'; // 'mensal' ou 'anual'

// ---------- FUNÇÕES AUXILIARES ----------

function filtrarCustosPorMesAno(mes, ano) {
    return custosFixos.filter(function(c) {
        var partes = c.dataVencimento.split('-');
        var custoAno = parseInt(partes[0]);
        var custoMes = parseInt(partes[1]);
        return custoAno === ano && custoMes === mes;
    });
}

function calcularTotaisStatus(custosFiltrados) {
    var totais = { pago: 0, pendente: 0, vencido: 0 };
    custosFiltrados.forEach(function(c) {
        if (totais[c.status] !== undefined) {
            totais[c.status] += c.valor;
        }
    });
    return totais;
}

function formatarMesAno(mes, ano) {
    var nomes = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
    return nomes[mes-1] + '/' + ano;
}

function avancarCompetencia() {
    if (custosCompetencia.mes === 12) {
        custosCompetencia.mes = 1;
        custosCompetencia.ano++;
    } else {
        custosCompetencia.mes++;
    }
    aplicarCompetencia();
}

function retrocederCompetencia() {
    if (custosCompetencia.mes === 1) {
        custosCompetencia.mes = 12;
        custosCompetencia.ano--;
    } else {
        custosCompetencia.mes--;
    }
    aplicarCompetencia();
}

function aplicarCompetencia() {
    document.getElementById('custosAno').value = custosCompetencia.ano;
    document.getElementById('custosMes').value = custosCompetencia.mes;
    if (custosModo === 'mensal') {
        atualizarVisaoMensal();
    } else {
        atualizarVisaoAnual();
    }
}

function alternarModo() {
    if (custosModo === 'mensal') {
        custosModo = 'anual';
        document.getElementById('btnModo').innerHTML = '<i class="fas fa-calendar-alt"></i> Visão Mensal';
    } else {
        custosModo = 'mensal';
        document.getElementById('btnModo').innerHTML = '<i class="fas fa-chart-bar"></i> Visão Anual';
    }
    if (custosModo === 'mensal') {
        atualizarVisaoMensal();
    } else {
        atualizarVisaoAnual();
    }
}

// ---------- VISÕES ----------

function atualizarVisaoMensal() {
    var mes = custosCompetencia.mes;
    var ano = custosCompetencia.ano;
    var custosFiltrados = filtrarCustosPorMesAno(mes, ano);
    var totalMes = custosFiltrados.reduce(function(s, c) { return s + c.valor; }, 0);
    var totaisStatus = calcularTotaisStatus(custosFiltrados);

    var html = `
        <div class="cards-grid" style="grid-template-columns: 1fr 1fr;">
            <div class="stat-card blue">
                <div class="stat-icon"><i class="fas fa-coins"></i></div>
                <div class="stat-info">
                    <div class="stat-label">Total de ${formatarMesAno(mes, ano)}</div>
                    <div class="stat-value">R$ ${totalMes.toFixed(2)}</div>
                </div>
            </div>
            <div class="stat-card green" style="flex-direction: column; align-items: stretch; gap: 0.5rem;">
                <div style="display: flex; justify-content: space-between; gap: 1rem;">
                    <div style="text-align: center; flex:1;">
                        <div style="font-size:0.75rem; color:var(--text-muted);">Pagos</div>
                        <div style="font-weight:700; font-size:1.1rem; color: var(--success-dark);">R$ ${totaisStatus.pago.toFixed(2)}</div>
                    </div>
                    <div style="text-align: center; flex:1;">
                        <div style="font-size:0.75rem; color:var(--text-muted);">Pendentes</div>
                        <div style="font-weight:700; font-size:1.1rem; color: var(--warning-dark);">R$ ${totaisStatus.pendente.toFixed(2)}</div>
                    </div>
                    <div style="text-align: center; flex:1;">
                        <div style="font-size:0.75rem; color:var(--text-muted);">Vencidos</div>
                        <div style="font-weight:700; font-size:1.1rem; color: var(--danger-dark);">R$ ${totaisStatus.vencido.toFixed(2)}</div>
                    </div>
                </div>
            </div>
        </div>

        <div class="panel">
            <div class="panel-header">
                <div class="panel-title"><i class="fas fa-list"></i> Custos de ${formatarMesAno(mes, ano)}</div>
            </div>
            <div class="panel-body">
                <div class="table-responsive">
                    <table class="data-table">
                        <thead><tr><th>Descrição</th><th>Valor</th><th>Vencimento</th><th>Status</th><th>Ações</th></tr></thead>
                        <tbody>`;

    custosFiltrados.forEach(function(c) {
        var statusClass = c.status === 'pago' ? 'status-concluida' : (c.status === 'pendente' ? 'status-pendente' : 'status-cancelada');
        var statusTexto = c.status === 'pago' ? 'Pago' : (c.status === 'pendente' ? 'Pendente' : 'Vencido');
        var dataFormatada = new Date(c.dataVencimento + 'T00:00:00').toLocaleDateString('pt-BR');
        html += `
            <tr>
                <td>${c.desc}</td>
                <td>R$ ${c.valor.toFixed(2)}</td>
                <td>${dataFormatada}</td>
                <td><span class="status-badge ${statusClass}">${statusTexto}</span></td>
                <td>
                    <button class="btn-ghost edit" title="Editar" onclick="editarCustoFixo('${c.dataVencimento}', '${c.desc}')"><i class="fas fa-edit"></i></button>
                    <button class="btn-ghost delete" title="Excluir" onclick="excluirCustoFixo('${c.dataVencimento}', '${c.desc}')"><i class="fas fa-trash-alt"></i></button>
                    ${c.status !== 'pago' ? '<button class="btn-ghost edit" title="Marcar como Pago" onclick="marcarComoPago(\'' + c.dataVencimento + '\', \'' + c.desc + '\')"><i class="fas fa-check"></i></button>' : ''}
                </td>
            </tr>`;
    });

    html += `</tbody></table></div></div></div>`;
    document.getElementById('custosConteudo').innerHTML = html;
}

function atualizarVisaoAnual() {
    var ano = custosCompetencia.ano;
    var html = '<div class="panel"><div class="panel-header"><div class="panel-title"><i class="fas fa-chart-bar"></i> Resumo Anual - ' + ano + '</div></div><div class="panel-body"><div class="table-responsive"><table class="data-table"><thead><tr><th>Mês</th><th>Total</th><th>Pagos</th><th>Pendentes</th><th>Vencidos</th></tr></thead><tbody>';

    var nomesMeses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
    for (var m = 1; m <= 12; m++) {
        var custosMes = filtrarCustosPorMesAno(m, ano);
        var total = custosMes.reduce(function(s, c) { return s + c.valor; }, 0);
        var status = calcularTotaisStatus(custosMes);
        html += '<tr style="cursor:pointer;" onclick="irParaMes(' + m + ')">';
        html += '<td>' + nomesMeses[m-1] + '</td>';
        html += '<td>R$ ' + total.toFixed(2) + '</td>';
        html += '<td style="color:var(--success-dark);">R$ ' + status.pago.toFixed(2) + '</td>';
        html += '<td style="color:var(--warning-dark);">R$ ' + status.pendente.toFixed(2) + '</td>';
        html += '<td style="color:var(--danger-dark);">R$ ' + status.vencido.toFixed(2) + '</td>';
        html += '</tr>';
    }

    html += '</tbody></table></div></div></div>';
    document.getElementById('custosConteudo').innerHTML = html;
}

function irParaMes(mes) {
    custosCompetencia.mes = mes;
    custosModo = 'mensal';
    document.getElementById('btnModo').innerHTML = '<i class="fas fa-chart-bar"></i> Visão Anual';
    aplicarCompetencia();
}

// ---------- RENDERIZAÇÃO PRINCIPAL ----------

function renderCustosFixosView() {
    var meses = [
        { valor: 1, nome: 'Janeiro' }, { valor: 2, nome: 'Fevereiro' }, { valor: 3, nome: 'Março' },
        { valor: 4, nome: 'Abril' }, { valor: 5, nome: 'Maio' }, { valor: 6, nome: 'Junho' },
        { valor: 7, nome: 'Julho' }, { valor: 8, nome: 'Agosto' }, { valor: 9, nome: 'Setembro' },
        { valor: 10, nome: 'Outubro' }, { valor: 11, nome: 'Novembro' }, { valor: 12, nome: 'Dezembro' }
    ];

    var optionsMeses = meses.map(function(m) {
        var selected = m.valor === custosCompetencia.mes ? ' selected' : '';
        return '<option value="' + m.valor + '"' + selected + '>' + m.nome + '</option>';
    }).join('');

    document.getElementById('contentArea').innerHTML = `
        <div class="filter-bar" style="justify-content: space-between;">
            <div class="filter-group">
                <button class="btn btn-outline btn-sm" onclick="retrocederCompetencia()" title="Mês anterior"><i class="fas fa-chevron-left"></i></button>
                <select id="custosMes" onchange="custosCompetencia.mes=parseInt(this.value); aplicarCompetencia();">${optionsMeses}</select>
                <input type="number" id="custosAno" value="${custosCompetencia.ano}" style="width:90px; text-align:center;" onchange="custosCompetencia.ano=parseInt(this.value); aplicarCompetencia();" min="1900" max="2100" step="1">
                <button class="btn btn-outline btn-sm" onclick="avancarCompetencia()" title="Próximo mês"><i class="fas fa-chevron-right"></i></button>
            </div>
            <div class="filter-group">
                <button class="btn btn-outline btn-sm" id="btnModo" onclick="alternarModo()"><i class="fas fa-chart-bar"></i> Visão Anual</button>
                <button class="btn btn-primary btn-sm" onclick="abrirModalCustoFixo()"><i class="fas fa-plus"></i> Adicionar</button>
            </div>
        </div>
        <div id="custosConteudo"></div>`;

    // Renderizar visão atual
    if (custosModo === 'mensal') {
        atualizarVisaoMensal();
    } else {
        atualizarVisaoAnual();
    }
}

// ---------- CRUD ----------

function abrirModalCustoFixo(custo) {
    if (!custo) custo = null;
    var mes = custosCompetencia.mes.toString().padStart(2, '0');
    var dataPadrao = custosCompetencia.ano + '-' + mes + '-01';
    abrirModal(`
        <div class="modal-header"><h3>${custo ? 'Editar Custo Fixo' : 'Novo Custo Fixo'}</h3><button class="modal-close" onclick="fecharModal()"><i class="fas fa-times"></i></button></div>
        <div class="form-row">
            <div class="form-group"><label>Descrição</label><input type="text" id="mDesc" value="${custo ? custo.desc : ''}"></div>
            <div class="form-group"><label>Valor R$</label><input type="number" step="0.01" id="mValor" value="${custo ? custo.valor : ''}"></div>
            <div class="form-group"><label>Data Vencimento</label><input type="date" id="mData" value="${custo ? custo.dataVencimento : dataPadrao}"></div>
            <div class="form-group"><label>Status</label><select id="mStatus">
                <option value="pendente" ${custo && custo.status === 'pendente' ? 'selected' : ''}>Pendente</option>
                <option value="pago" ${custo && custo.status === 'pago' ? 'selected' : ''}>Pago</option>
                <option value="vencido" ${custo && custo.status === 'vencido' ? 'selected' : ''}>Vencido</option>
            </select></div>
        </div>
        <div class="form-actions">
            <button class="btn btn-outline" onclick="fecharModal()">Cancelar</button>
            <button class="btn btn-primary" onclick="salvarCustoFixo('${custo ? custo.dataVencimento + '|' + custo.desc : ''}')">Salvar</button>
        </div>`);
}

function salvarCustoFixo(chaveOriginal) {
    var desc = document.getElementById('mDesc').value;
    var valor = +document.getElementById('mValor').value;
    var data = document.getElementById('mData').value;
    var status = document.getElementById('mStatus').value;
    if (!desc || !data) return alert('Descrição e data são obrigatórios.');

    if (chaveOriginal) {
        var partes = chaveOriginal.split('|');
        var dataOriginal = partes[0];
        var descOriginal = partes[1];
        var idx = custosFixos.findIndex(function(c) { return c.dataVencimento === dataOriginal && c.desc === descOriginal; });
        if (idx >= 0) {
            custosFixos[idx] = { desc: desc, valor: valor, dataVencimento: data, status: status };
        }
    } else {
        custosFixos.push({ desc: desc, valor: valor, dataVencimento: data, status: status });
    }
    Storage.saveCustosFixos();
    fecharModal();
    if (custosModo === 'mensal') {
        atualizarVisaoMensal();
    } else {
        atualizarVisaoAnual();
    }
}

function editarCustoFixo(dataVencimento, desc) {
    var custo = custosFixos.find(function(c) { return c.dataVencimento === dataVencimento && c.desc === desc; });
    if (custo) abrirModalCustoFixo(custo);
}

function excluirCustoFixo(dataVencimento, desc) {
    if (confirm('Excluir custo "' + desc + '"?')) {
        custosFixos = custosFixos.filter(function(c) { return !(c.dataVencimento === dataVencimento && c.desc === desc); });
        Storage.saveCustosFixos();
        if (custosModo === 'mensal') {
            atualizarVisaoMensal();
        } else {
            atualizarVisaoAnual();
        }
    }
}

function marcarComoPago(dataVencimento, desc) {
    var custo = custosFixos.find(function(c) { return c.dataVencimento === dataVencimento && c.desc === desc; });
    if (custo) {
        custo.status = 'pago';
        Storage.saveCustosFixos();
        if (custosModo === 'mensal') {
            atualizarVisaoMensal();
        } else {
            atualizarVisaoAnual();
        }
    }
}