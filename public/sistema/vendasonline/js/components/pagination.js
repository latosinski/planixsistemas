// ═══════════════════════════════════════════════════════════════
// Planix Vendasonline — Paginação Reutilizável
// ═══════════════════════════════════════════════════════════════
// Uso:
//   - Cada módulo registra um callback: Pagination.registrar('produtos', fn)
//   - fn é chamada quando o usuário clica numa página, e deve
//     atualizar a variável de página e re-renderizar
//   - Para obter a fatia da lista atual: Pagination.fatia(lista, pagina, porPagina)
//   - Para renderizar os botões: Pagination.controles('produtos', total, pagina, porPagina)

var Pagination = (function () {

    var POR_PAGINA_PADRAO = 10;
    var registrados = {};

    // Retorna a fatia da lista correspondente à página
    function fatia(lista, paginaAtual, porPagina) {
        porPagina = porPagina || POR_PAGINA_PADRAO;
        var inicio = (paginaAtual - 1) * porPagina;
        return lista.slice(inicio, inicio + porPagina);
    }

    // Registra o callback de troca de página de um módulo
    function registrar(chave, callback) {
        registrados[chave] = callback;
    }

    // Chamado pelos botões
    function irPara(chave, pagina) {
        if (registrados[chave]) registrados[chave](pagina);
    }

    // Retorna o HTML dos controles (footer + botões)
    function controles(chave, totalItens, paginaAtual, porPagina) {
        porPagina = porPagina || POR_PAGINA_PADRAO;
        var totalPaginas = Math.ceil(totalItens / porPagina);
        if (totalPaginas <= 1) return '';

        var inicio = (paginaAtual - 1) * porPagina + 1;
        var fim = Math.min(paginaAtual * porPagina, totalItens);

        var botoes = '';
        botoes += '<button class="page-btn" ' + (paginaAtual === 1 ? 'disabled' : '') +
                  ' onclick="Pagination.irPara(\'' + chave + '\', ' + (paginaAtual - 1) + ')">' +
                  '<i class="fas fa-chevron-left"></i></button>';

        var inicioMostrar = Math.max(1, paginaAtual - 2);
        var fimMostrar = Math.min(totalPaginas, paginaAtual + 2);

        if (inicioMostrar > 1) {
            botoes += '<button class="page-btn" onclick="Pagination.irPara(\'' + chave + '\', 1)">1</button>';
            if (inicioMostrar > 2) botoes += '<span style="padding:0 0.3rem; color:var(--text-muted);">…</span>';
        }

        for (var i = inicioMostrar; i <= fimMostrar; i++) {
            botoes += '<button class="page-btn ' + (i === paginaAtual ? 'active' : '') +
                      '" onclick="Pagination.irPara(\'' + chave + '\', ' + i + ')">' + i + '</button>';
        }

        if (fimMostrar < totalPaginas) {
            if (fimMostrar < totalPaginas - 1) botoes += '<span style="padding:0 0.3rem; color:var(--text-muted);">…</span>';
            botoes += '<button class="page-btn" onclick="Pagination.irPara(\'' + chave + '\', ' + totalPaginas + ')">' + totalPaginas + '</button>';
        }

        botoes += '<button class="page-btn" ' + (paginaAtual === totalPaginas ? 'disabled' : '') +
                  ' onclick="Pagination.irPara(\'' + chave + '\', ' + (paginaAtual + 1) + ')">' +
                  '<i class="fas fa-chevron-right"></i></button>';

        return '<div class="table-footer">' +
            '<span style="font-size:0.82rem; color:var(--text-muted);">' +
                'Mostrando <strong>' + inicio + '</strong>–<strong>' + fim + '</strong> de <strong>' + totalItens + '</strong> registro(s)' +
            '</span>' +
            '<div class="pagination">' + botoes + '</div>' +
        '</div>';
    }

    return {
        fatia: fatia,
        controles: controles,
        registrar: registrar,
        irPara: irPara,
        POR_PAGINA_PADRAO: POR_PAGINA_PADRAO
    };
})();