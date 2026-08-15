function renderFornecedoresView() {
    var html = fornecedores.map(function(f) {
        return `<tr>
            <td>${f.nome}</td>
            <td>${f.cnpjCpf}</td>
            <td>${f.email || '-'}</td>
            <td>${f.telefone || '-'}</td>
            <td>${f.contato || '-'}</td>
            <td>
                <button class="btn-ghost edit" title="Editar" onclick="editarFornecedor(${f.id})"><i class="fas fa-edit"></i></button>
                <button class="btn-ghost delete" title="Excluir" onclick="excluirFornecedor(${f.id})"><i class="fas fa-trash-alt"></i></button>
            </td>
        </tr>`;
    }).join('');

    document.getElementById('contentArea').innerHTML = `
        <div class="panel">
            <div class="panel-header">
                <div class="panel-title"><i class="fas fa-truck"></i> Fornecedores</div>
                <button class="btn btn-primary btn-sm" onclick="abrirModalFornecedor()"><i class="fas fa-plus"></i> Novo Fornecedor</button>
            </div>
            <div class="panel-body">
                <div class="table-responsive">
                    <table class="data-table">
                        <thead><tr><th>Nome</th><th>CNPJ/CPF</th><th>E-mail</th><th>Telefone</th><th>Contato</th><th>Ações</th></tr></thead>
                        <tbody>${html || '<tr><td colspan="6" style="text-align:center;">Nenhum fornecedor cadastrado.</td></tr>'}</tbody>
                    </table>
                </div>
            </div>
        </div>`;
}

function abrirModalFornecedor(fornecedor) {
    if (fornecedor === undefined) fornecedor = null;
    var editando = fornecedor !== null;
    abrirModal(`
        <div class="modal-header"><h3>${editando ? 'Editar Fornecedor' : 'Novo Fornecedor'}</h3><button class="modal-close" onclick="fecharModal()"><i class="fas fa-times"></i></button></div>
        <div class="form-row">
            <div class="form-group"><label>Nome</label><input type="text" id="fornNome" value="${editando ? fornecedor.nome : ''}"></div>
            <div class="form-group"><label>CNPJ/CPF</label><input type="text" id="fornCnpjCpf" value="${editando ? fornecedor.cnpjCpf : ''}"></div>
            <div class="form-group"><label>E-mail</label><input type="email" id="fornEmail" value="${editando ? fornecedor.email : ''}"></div>
            <div class="form-group"><label>Telefone</label><input type="tel" id="fornTelefone" value="${editando ? fornecedor.telefone : ''}"></div>
            <div class="form-group"><label>Contato</label><input type="text" id="fornContato" value="${editando ? fornecedor.contato : ''}"></div>
        </div>
        <div class="form-actions">
            <button class="btn btn-outline" onclick="fecharModal()">Cancelar</button>
            <button class="btn btn-primary" onclick="salvarFornecedor(${editando ? fornecedor.id : 'null'})">Salvar</button>
        </div>`);
}

function salvarFornecedor(idOriginal) {
    var nome = document.getElementById('fornNome').value.trim();
    var cnpjCpf = document.getElementById('fornCnpjCpf').value.trim();
    var email = document.getElementById('fornEmail').value.trim();
    var telefone = document.getElementById('fornTelefone').value.trim();
    var contato = document.getElementById('fornContato').value.trim();

    if (!nome) return alert('Nome é obrigatório.');

    var objeto = {
        nome: nome,
        cnpjCpf: cnpjCpf,
        email: email,
        telefone: telefone,
        contato: contato
    };

    if (idOriginal !== null && idOriginal !== undefined && idOriginal !== 'null') {
        var idx = fornecedores.findIndex(function(f) { return f.id === idOriginal; });
        if (idx >= 0) {
            objeto.id = idOriginal;
            fornecedores[idx] = objeto;
        }
    } else {
        var novoId = fornecedores.length ? Math.max(...fornecedores.map(f => f.id)) + 1 : 1;
        objeto.id = novoId;
        fornecedores.push(objeto);
    }

    Storage.saveFornecedores();
    fecharModal();
    renderFornecedoresView();
}

function editarFornecedor(id) {
    var f = fornecedores.find(function(x) { return x.id === id; });
    if (f) abrirModalFornecedor(f);
}

function excluirFornecedor(id) {
    if (confirm('Excluir fornecedor?')) {
        fornecedores = fornecedores.filter(function(f) { return f.id !== id; });
        Storage.saveFornecedores();
        renderFornecedoresView();
    }
}