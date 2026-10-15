// ═══════════════════════════════════════════════════════════════
// Planix Vendasonline — Módulo de Backup e Restauração
// ═══════════════════════════════════════════════════════════════

async function renderBackupView() {
    var isElectron = (typeof window.db !== 'undefined' && typeof window.db.exportar === 'function');

    if (!isElectron) {
        document.getElementById('contentArea').innerHTML = `
            <div class="panel">
                <div class="panel-header">
                    <div class="panel-title"><i class="fas fa-database"></i> Backup e Restauração</div>
                </div>
                <div class="panel-body" style="text-align:center; padding:3rem;">
                    <i class="fas fa-info-circle" style="font-size:3rem; color:var(--text-muted); margin-bottom:1rem;"></i>
                    <h3 style="color:var(--text-light);">Disponível apenas na versão desktop</h3>
                    <p style="color:var(--text-muted);">Esta funcionalidade está disponível somente quando o sistema é executado como aplicativo.</p>
                </div>
            </div>`;
        return;
    }

    document.getElementById('contentArea').innerHTML = `
        <div class="panel" style="margin-bottom:1.5rem;">
            <div class="panel-header">
                <div class="panel-title"><i class="fas fa-database"></i> Backup e Restauração</div>
            </div>
            <div class="panel-body">
                <p style="color: var(--text-light); margin-bottom: 1.5rem; font-size: 0.9rem;">
                    Faça uma cópia de segurança do banco de dados para guardar em local seguro ou restaure a partir de um arquivo existente.
                </p>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem;">

                    <!-- Card Exportar -->
                    <div style="background: var(--bg); border: 1px solid var(--border); border-radius: 12px; padding: 1.5rem;">
                        <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem;">
                            <div class="stat-icon blue" style="width: 44px; height: 44px; border-radius: 10px;">
                                <i class="fas fa-file-export"></i>
                            </div>
                            <h3 style="font-size: 1rem; margin: 0;">Exportar banco de dados</h3>
                        </div>
                        <p style="font-size: 0.85rem; color: var(--text-light); margin-bottom: 1.25rem; line-height: 1.5;">
                            Salva uma cópia completa do banco atual. Você pode guardá-la em um pendrive, na nuvem ou em outra pasta do computador.
                        </p>
                        <button class="btn btn-primary btn-sm" onclick="exportarBackup()">
                            <i class="fas fa-download"></i> Salvar cópia de segurança
                        </button>
                    </div>

                    <!-- Card Importar -->
                    <div style="background: var(--bg); border: 1px solid var(--border); border-radius: 12px; padding: 1.5rem;">
                        <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem;">
                            <div class="stat-icon orange" style="width: 44px; height: 44px; border-radius: 10px;">
                                <i class="fas fa-file-import"></i>
                            </div>
                            <h3 style="font-size: 1rem; margin: 0;">Restaurar banco de dados</h3>
                        </div>
                        <p style="font-size: 0.85rem; color: var(--text-light); margin-bottom: 1.25rem; line-height: 1.5;">
                            <strong style="color: var(--danger-dark);">Atenção:</strong> ao restaurar, todos os dados atuais serão substituídos pelo conteúdo do arquivo escolhido. O aplicativo será reiniciado.
                        </p>
                        <button class="btn btn-outline btn-sm" onclick="importarBackup()">
                            <i class="fas fa-upload"></i> Restaurar a partir de arquivo
                        </button>
                    </div>

                </div>
            </div>
        </div>

        <div class="panel">
            <div class="panel-header">
                <div class="panel-title"><i class="fas fa-info-circle"></i> Informações do banco de dados</div>
            </div>
            <div class="panel-body" id="infoBanco">
                <p style="color: var(--text-muted); font-size: 0.85rem;">Carregando informações...</p>
            </div>
        </div>`;

    // Carrega as informações do banco
    try {
        var info = await window.db.info();
        var infoBox = document.getElementById('infoBanco');
        if (!info) {
            infoBox.innerHTML = '<p style="color: var(--text-muted); font-size: 0.85rem;">Arquivo do banco de dados ainda não foi criado.</p>';
            return;
        }

        var tamanho = info.tamanho < 1024
            ? info.tamanho + ' bytes'
            : (info.tamanho < 1024 * 1024
                ? (info.tamanho / 1024).toFixed(2) + ' KB'
                : (info.tamanho / (1024 * 1024)).toFixed(2) + ' MB');

        var dataMod = new Date(info.modificado);
        var dataFormatada = dataMod.toLocaleDateString('pt-BR') + ' às ' + dataMod.toLocaleTimeString('pt-BR');

        infoBox.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 0.75rem; font-size: 0.88rem;">
                <div style="display: flex; gap: 0.75rem; align-items: center;">
                    <i class="fas fa-folder" style="color: var(--primary); width: 20px; text-align: center;"></i>
                    <span style="color: var(--text-light);">Localização:</span>
                    <code style="background: var(--bg); padding: 0.25rem 0.6rem; border-radius: 6px; font-size: 0.8rem; color: var(--text); word-break: break-all;">${info.caminho}</code>
                </div>
                <div style="display: flex; gap: 0.75rem; align-items: center;">
                    <i class="fas fa-clock" style="color: var(--primary); width: 20px; text-align: center;"></i>
                    <span style="color: var(--text-light);">Última modificação:</span>
                    <strong style="color: var(--text); font-weight: 600;">${dataFormatada}</strong>
                </div>
                <div style="display: flex; gap: 0.75rem; align-items: center;">
                    <i class="fas fa-weight-hanging" style="color: var(--primary); width: 20px; text-align: center;"></i>
                    <span style="color: var(--text-light);">Tamanho:</span>
                    <strong style="color: var(--text); font-weight: 600;">${tamanho}</strong>
                </div>
            </div>`;
    } catch (err) {
        document.getElementById('infoBanco').innerHTML = '<p style="color: var(--text-muted); font-size: 0.85rem;">Não foi possível obter informações do banco.</p>';
    }
}

// ═══════════════════════════════════════════════════════════════
// Exportar
// ═══════════════════════════════════════════════════════════════
async function exportarBackup() {
    try {
        var resultado = await window.db.exportar();
        if (resultado.cancelado) return;
        if (!resultado.ok) {
            alert('Não foi possível exportar o backup.\n\n' + (resultado.erro || 'Erro desconhecido.'));
            return;
        }
        alert('Backup salvo com sucesso!\n\nArquivo: ' + resultado.caminho);
        renderBackupView();
    } catch (err) {
        console.error('[Backup] Erro ao exportar:', err);
        alert('Erro inesperado ao exportar o backup.');
    }
}

// ═══════════════════════════════════════════════════════════════
// Importar
// ═══════════════════════════════════════════════════════════════
async function importarBackup() {
    var confirmado = await confirmar(
        'Ao restaurar, TODOS os dados atuais serão substituídos pelo conteúdo do arquivo escolhido. Esta ação não pode ser desfeita.<br><br>Deseja continuar?',
        {
            titulo: 'Restaurar banco de dados',
            tipo: 'perigo',
            textoConfirmar: 'Continuar',
            textoCancelar: 'Cancelar'
        }
    );

    if (!confirmado) return;

    try {
        var resultado = await window.db.importar();
        if (resultado.cancelado) return;
        if (!resultado.ok) {
            alert('Não foi possível restaurar o backup.\n\n' + (resultado.erro || 'Erro desconhecido.'));
            return;
        }

        // Avisa e reinicia o aplicativo
        alert('Backup restaurado com sucesso!\n\nO aplicativo será reiniciado para carregar os novos dados.');
        await window.app.relaunch();
    } catch (err) {
        console.error('[Backup] Erro ao importar:', err);
        alert('Erro inesperado ao restaurar o backup.');
    }
}