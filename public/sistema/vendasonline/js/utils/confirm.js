// Modal de confirmação assíncrono
// Uso: confirmarAcao({ titulo, mensagem, textoConfirmar, tipo, icone }).then(ok => { if (ok) ... })

function confirmarAcao(opcoes) {
    opcoes = opcoes || {};
    var titulo        = opcoes.titulo        || 'Confirmar ação';
    var mensagem      = opcoes.mensagem      || 'Tem certeza que deseja continuar?';
    var textoConfirmar= opcoes.textoConfirmar|| 'Confirmar';
    var textoCancelar = opcoes.textoCancelar || 'Cancelar';
    var tipo          = opcoes.tipo          || 'danger'; // danger | warning | info
    var icone         = opcoes.icone         || 'fa-exclamation-triangle';

    return new Promise(function(resolve) {
        abrirModal(`
            <div class="confirm-dialog">
                <div class="confirm-icon confirm-icon-${tipo}">
                    <i class="fas ${icone}"></i>
                </div>
                <h3 class="confirm-title">${titulo}</h3>
                <p class="confirm-message">${mensagem}</p>
                <div class="confirm-actions">
                    <button class="btn btn-outline" data-confirm="cancel">${textoCancelar}</button>
                    <button class="btn btn-${tipo}"  data-confirm="ok">${textoConfirmar}</button>
                </div>
            </div>
        `);

        var modal   = document.getElementById('modalContent');
        var overlay = document.getElementById('modalOverlay');

        function finalizar(resultado) {
            overlay.removeEventListener('click', onOverlayClick);
            document.removeEventListener('keydown', onEsc);
            resolve(resultado);
        }
        function onOverlayClick(e) {
            // Só conta se o clique foi fora do modal (o main.js já chama fecharModal)
            if (e.target === overlay) finalizar(false);
        }
        function onEsc(e) {
            if (e.key === 'Escape') { fecharModal(); finalizar(false); }
        }

        overlay.addEventListener('click', onOverlayClick);
        document.addEventListener('keydown', onEsc);

        modal.querySelectorAll('[data-confirm]').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var acao = btn.getAttribute('data-confirm');
                fecharModal();
                finalizar(acao === 'ok');
            });
        });
    });
}

// Helper para incluir nomes de itens com segurança no HTML
function escapeHtml(texto) {
    if (texto == null) return '';
    return String(texto).replace(/[&<>"']/g, function(m) {
        return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[m];
    });
}