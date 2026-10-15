// ═══════════════════════════════════════════════════════════════
// Planix Vendasonline — Clientes
// ═══════════════════════════════════════════════════════════════

var clientesPaginaAtual = 1;

Pagination.registrar('clientes', function (pagina) {
    clientesPaginaAtual = pagina;
    renderClientesView();
});

function renderClientesView() {
    var clientesNaPagina = Pagination.fatia(clientes, clientesPaginaAtual, Pagination.POR_PAGINA_PADRAO);

    var html = clientesNaPagina.map(function (c) {
        return `<tr>
            <td>${c.nome}</td>
            <td>${c.cpfCnpj || '-'}</td>
            <td>${c.email || '-'}</td>
            <td>${c.telefone || '-'}</td>
            <td>${c.cidade ? (c.cidade + (c.estado ? '/' + c.estado : '')) : '-'}</td>
            <td>
                <button class="btn-ghost edit" title="Editar" onclick="editarCliente(${c.id})"><i class="fas fa-edit"></i></button>
                <button class="btn-ghost delete" title="Excluir" onclick="excluirCliente(${c.id})"><i class="fas fa-trash-alt"></i></button>
            </td>
        </tr>`;
    }).join('');

    var controlesPaginacao = Pagination.controles('clientes', clientes.length, clientesPaginaAtual, Pagination.POR_PAGINA_PADRAO);

    document.getElementById('contentArea').innerHTML = `
        <div class="panel">
            <div class="panel-header">
                <div class="panel-title"><i class="fas fa-users"></i> Clientes</div>
                <button class="btn btn-primary btn-sm" onclick="abrirModalCliente()"><i class="fas fa-plus"></i> Novo Cliente</button>
            </div>
            <div class="panel-body" style="padding-bottom:0;">
                <div class="table-responsive">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>CPF/CNPJ</th>
                                <th>E-mail</th>
                                <th>Telefone</th>
                                <th>Cidade/UF</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>${html || '<tr><td colspan="6" style="text-align:center;">Nenhum cliente cadastrado.</td></tr>'}</tbody>
                    </table>
                </div>
            </div>
            ${controlesPaginacao}
        </div>`;
}

function abrirModalCliente(cliente) {
    if (cliente === undefined) cliente = null;
    var editando = cliente !== null;
    abrirModal(`
        <div class="modal-header"><h3>${editando ? 'Editar Cliente' : 'Novo Cliente'}</h3><button class="modal-close" onclick="fecharModal()"><i class="fas fa-times"></i></button></div>
        <div class="form-row">
            <div class="form-group"><label>Nome completo *</label><input type="text" id="cliNome" value="${editando ? cliente.nome : ''}"></div>
            <div class="form-group"><label>CPF/CNPJ</label><input type="text" id="cliCpfCnpj" value="${editando ? cliente.cpfCnpj : ''}"></div>
            <div class="form-group"><label>E-mail</label><input type="email" id="cliEmail" value="${editando ? cliente.email : ''}"></div>
            <div class="form-group"><label>Telefone</label><input type="tel" id="cliTelefone" value="${editando ? cliente.telefone : ''}"></div>
            <div class="form-group"><label>CEP</label><input type="text" id="cliCep" value="${editando ? cliente.cep : ''}"></div>
            <div class="form-group"><label>Rua</label><input type="text" id="cliRua" value="${editando ? cliente.rua : ''}"></div>
            <div class="form-group"><label>Número</label><input type="text" id="cliNumero" value="${editando ? cliente.numero : ''}"></div>
            <div class="form-group"><label>Complemento</label><input type="text" id="cliComplemento" value="${editando ? cliente.complemento : ''}"></div>
            <div class="form-group"><label>Cidade</label><input type="text" id="cliCidade" value="${editando ? cliente.cidade : ''}"></div>
            <div class="form-group"><label>Estado (UF)</label><input type="text" id="cliEstado" maxlength="2" value="${editando ? cliente.estado : ''}"></div>
        </div>
        <div class="form-actions">
            <button class="btn btn-outline" onclick="fecharModal()">Cancelar</button>
            <button class="btn btn-primary" onclick="salvarCliente(${editando ? cliente.id : 'null'})">Salvar</button>
        </div>`);
}

function salvarCliente(idOriginal) {
    var nome = document.getElementById('cliNome').value.trim();
    if (!nome) return alert('Nome é obrigatório.');

    var objeto = {
        nome: nome,
        cpfCnpj: document.getElementById('cliCpfCnpj').value.trim(),
        email: document.getElementById('cliEmail').value.trim(),
        telefone: document.getElementById('cliTelefone').value.trim(),
        cep: document.getElementById('cliCep').value.trim(),
        rua: document.getElementById('cliRua').value.trim(),
        numero: document.getElementById('cliNumero').value.trim(),
        complemento: document.getElementById('cliComplemento').value.trim(),
        cidade: document.getElementById('cliCidade').value.trim(),
        estado: document.getElementById('cliEstado').value.trim().toUpperCase()
    };

    if (idOriginal !== null && idOriginal !== undefined && idOriginal !== 'null') {
        var idx = clientes.findIndex(function (c) { return c.id === idOriginal; });
        if (idx >= 0) {
            objeto.id = idOriginal;
            clientes[idx] = objeto;
        }
    } else {
        var novoId = clientes.length ? Math.max.apply(null, clientes.map(function (c) { return c.id; })) + 1 : 1;
        objeto.id = novoId;
        clientes.push(objeto);
    }

    Storage.saveClientes();
    fecharModal();
    renderClientesView();
}

function editarCliente(id) {
    var c = clientes.find(function (x) { return x.id === id; });
    if (c) abrirModalCliente(c);
}

async function excluirCliente(id) {
    var ok = await confirmar('Excluir este cliente? Esta ação não pode ser desfeita.', {
        titulo: 'Excluir cliente',
        tipo: 'perigo',
        textoConfirmar: 'Excluir'
    });
    if (ok) {
        clientes = clientes.filter(function (c) { return c.id !== id; });
        Storage.saveClientes();

        var totalPag = Math.ceil(clientes.length / Pagination.POR_PAGINA_PADRAO);
        if (clientesPaginaAtual > totalPag && totalPag > 0) clientesPaginaAtual = totalPag;

        renderClientesView();
    }
}