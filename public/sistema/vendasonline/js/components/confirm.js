// ═══════════════════════════════════════════════════════════════
// Planix Vendasonline — Modal de Confirmação + Escolha
// ═══════════════════════════════════════════════════════════════

// ─── Confirmação (Sim/Não) ───
var _confirmResolver = null;

function confirmar(mensagem, opcoes) {
    opcoes = opcoes || {};
    var titulo = opcoes.titulo || 'Confirmar ação';
    var tipo = opcoes.tipo || 'perigo';
    var textoConfirmar = opcoes.textoConfirmar || (tipo === 'perigo' ? 'Excluir' : 'Confirmar');
    var textoCancelar = opcoes.textoCancelar || 'Cancelar';
    var icone = tipo === 'perigo' ? 'fa-triangle-exclamation' : 'fa-circle-question';

    return new Promise(function (resolve) {
        _confirmResolver = resolve;

        var anterior = document.getElementById('confirmOverlay');
        if (anterior) anterior.remove();

        var overlay = document.createElement('div');
        overlay.className = 'confirm-overlay';
        overlay.id = 'confirmOverlay';
        overlay.innerHTML = `
            <div class="confirm-modal confirm-${tipo}" role="dialog" aria-modal="true">
                <div class="confirm-icon"><i class="fas ${icone}"></i></div>
                <h3 class="confirm-title">${titulo}</h3>
                <p class="confirm-message">${mensagem}</p>
                <div class="confirm-actions">
                    <button class="confirm-btn confirm-btn-cancel" id="confirmCancelar">${textoCancelar}</button>
                    <button class="confirm-btn confirm-btn-confirm" id="confirmConfirmar">${textoConfirmar}</button>
                </div>
            </div>`;

        document.body.appendChild(overlay);
        void overlay.offsetWidth;
        overlay.classList.add('active');

        var finalizado = false;

        function finalizar(valor) {
            if (finalizado) return;
            finalizado = true;

            document.removeEventListener('keydown', onKey);
            overlay.classList.remove('active');
            setTimeout(function () {
                overlay.remove();
                _confirmResolver = null;
                resolve(valor);
            }, 220);
        }

        document.getElementById('confirmCancelar').addEventListener('click', function () { finalizar(false); });
        document.getElementById('confirmConfirmar').addEventListener('click', function () { finalizar(true); });
        overlay.addEventListener('click', function (e) { if (e.target === overlay) finalizar(false); });

        // Teclado: Enter confirma, Esc cancela
        function onKey(e) {
            if (e.key === 'Escape') {
                e.preventDefault();
                finalizar(false);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                finalizar(true);
            }
        }
        document.addEventListener('keydown', onKey);

        // Foco inicial no botão de confirmar (Enter funciona naturalmente)
        setTimeout(function () {
            var btn = document.getElementById('confirmConfirmar');
            if (btn) btn.focus();
        }, 60);
    });
}

// ─── Escolha entre opções (usado em conflitos) ───
// opcoes = [{ valor, label, sublabel }, ...]
// Retorna o `valor` escolhido ou null se cancelado.
var _escolhaResolver = null;

function escolherOpcao(titulo, mensagem, opcoes, textoConfirmar) {
    textoConfirmar = textoConfirmar || 'Confirmar';

    return new Promise(function (resolve) {
        _escolhaResolver = resolve;

        var html = `
            <div class="modal-header">
                <h3>${titulo}</h3>
                <button class="modal-close" onclick="fecharEscolha(null)"><i class="fas fa-times"></i></button>
            </div>
            <p style="color:var(--text-light); margin-bottom:1rem; font-size:0.9rem; line-height:1.5;">${mensagem}</p>
            <div class="escolha-list">
                ${opcoes.map(function (o, i) {
                    return `<label class="escolha-item">
                        <input type="radio" name="escolhaOpt" value="${o.valor}" ${i === 0 ? 'checked' : ''}>
                        <div>
                            <div class="escolha-label">${o.label}</div>
                            ${o.sublabel ? '<div class="escolha-sublabel">' + o.sublabel + '</div>' : ''}
                        </div>
                    </label>`;
                }).join('')}
            </div>
            <div class="form-actions">
                <button class="btn btn-outline" onclick="fecharEscolha(null)">Cancelar</button>
                <button class="btn btn-primary" onclick="fecharEscolha('confirm')">${textoConfirmar}</button>
            </div>
        `;

        abrirModalNested(html);

        // Teclado: Enter confirma, Esc cancela
        function onKey(e) {
            if (e.key === 'Escape') {
                e.preventDefault();
                document.removeEventListener('keydown', onKey);
                fecharEscolha(null);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                document.removeEventListener('keydown', onKey);
                fecharEscolha('confirm');
            }
        }
        document.addEventListener('keydown', onKey);
    });
}

function fecharEscolha(acao) {
    var resolver = _escolhaResolver;
    _escolhaResolver = null;

    if (acao === 'confirm') {
        var sel = document.querySelector('input[name="escolhaOpt"]:checked');
        var valor = sel ? sel.value : null;
        fecharModalNested();
        if (resolver) resolver(valor);
    } else {
        fecharModalNested();
        if (resolver) resolver(null);
    }
}