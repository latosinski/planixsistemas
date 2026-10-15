// ═══════════════════════════════════════════════════════════════
// Planix Vendasonline — Camada de Persistência
// ═══════════════════════════════════════════════════════════════

var Storage = (function () {

    var isElectron = (typeof window !== 'undefined' && typeof window.db !== 'undefined');

    var KEYS = {
        PRODUTOS: 'erp_produtos',
        PEDIDOS: 'erp_pedidos',
        CUSTOS_FIXOS: 'erp_custos_fixos',
        MARKETPLACES: 'erp_marketplaces',
        CONTAS: 'erp_contas',
        CONTAS_RECEBER: 'erp_contas_receber',
        FORNECEDORES: 'erp_fornecedores',
        CLIENTES: 'erp_clientes',
        CATEGORIAS: 'erp_categorias',
        TAXAS_PRODUTO: 'erp_taxas_produto',
        CFG_ANTIGA: 'erp_cfg'
    };

    function lsGet(key) {
        var v = localStorage.getItem(key);
        return v ? JSON.parse(v) : null;
    }

    function lsSet(key, valor) {
        localStorage.setItem(key, JSON.stringify(valor));
    }

    function migrarDadosAntigosLocalStorage() {
        var cfgAntiga = localStorage.getItem(KEYS.CFG_ANTIGA);
        var marketAntigos = localStorage.getItem(KEYS.MARKETPLACES);

        if (marketAntigos) {
            try {
                var lista = JSON.parse(marketAntigos);
                var precisaMigrar = lista.some(function (m) {
                    return m.hasOwnProperty('taxa') || m.hasOwnProperty('custosAdicionais') || !m.hasOwnProperty('ativo');
                });
                if (precisaMigrar) {
                    var listaNova = lista.map(function (m, idx) {
                        return {
                            id: m.id != null ? m.id : (idx + 1),
                            nome: m.nome,
                            valorHora: m.valorHora !== undefined ? m.valorHora : 22,
                            prazoRecebimento: m.prazoRecebimento !== undefined ? m.prazoRecebimento : 0,
                            ativo: m.ativo !== undefined ? m.ativo : true
                        };
                    });
                    lsSet(KEYS.MARKETPLACES, listaNova);
                }
            } catch (e) { /* ignora */ }
        }

        if (cfgAntiga) localStorage.removeItem(KEYS.CFG_ANTIGA);
    }

    function marcarContasVencidas() {
        var hoje = new Date().toISOString().split('T')[0];
        var alterouPagar = false;
        var alterouReceber = false;

        contas.forEach(function (c) {
            if (c.status !== 'pago' && c.dataVencimento < hoje) { c.status = 'vencido'; alterouPagar = true; }
        });
        contasReceber.forEach(function (c) {
            if (c.status !== 'recebido' && c.dataVencimento < hoje) { c.status = 'vencido'; alterouReceber = true; }
        });

        if (alterouPagar) Storage.saveContas();
        if (alterouReceber) Storage.saveContasReceber();
    }

    function loadFromLocalStorage() {
        migrarDadosAntigosLocalStorage();
        return {
            produtos: lsGet(KEYS.PRODUTOS) || [],
            pedidos: lsGet(KEYS.PEDIDOS) || [],
            custosFixos: lsGet(KEYS.CUSTOS_FIXOS) || [],
            marketplaces: lsGet(KEYS.MARKETPLACES) || [],
            contas: lsGet(KEYS.CONTAS) || [],
            contasReceber: lsGet(KEYS.CONTAS_RECEBER) || [],
            fornecedores: lsGet(KEYS.FORNECEDORES) || [],
            clientes: lsGet(KEYS.CLIENTES) || [],
            categorias: lsGet(KEYS.CATEGORIAS) || [],
            taxasProduto: lsGet(KEYS.TAXAS_PRODUTO) || []
        };
    }

    async function loadFromSQLite() {
        return await window.db.loadAll();
    }

    async function migrarLocalStorageParaSQLite(dadosSQLite) {
        var total = dadosSQLite.produtos.length + dadosSQLite.categorias.length +
            dadosSQLite.clientes.length + dadosSQLite.pedidos.length +
            dadosSQLite.custosFixos.length + dadosSQLite.marketplaces.length +
            dadosSQLite.fornecedores.length + dadosSQLite.contas.length +
            dadosSQLite.contasReceber.length;
        if (total > 0) return dadosSQLite;

        var temLS = localStorage.getItem(KEYS.PRODUTOS) || localStorage.getItem(KEYS.MARKETPLACES);
        if (!temLS) return dadosSQLite;

        console.log('[Storage] Migrando dados do localStorage para SQLite...');
        var dados = loadFromLocalStorage();

        await window.db.saveProdutos(dados.produtos);
        await window.db.saveCategorias(dados.categorias);
        await window.db.saveClientes(dados.clientes);
        await window.db.savePedidos(dados.pedidos);
        await window.db.saveCustosFixos(dados.custosFixos);
        await window.db.saveMarketplaces(dados.marketplaces);
        await window.db.saveFornecedores(dados.fornecedores);
        await window.db.saveContas(dados.contas);
        await window.db.saveContasReceber(dados.contasReceber);

        return dados;
    }

    function aplicarNasVariaveisGlobais(dados) {
        produtos = dados.produtos || [];
        categorias = dados.categorias || [];
        clientes = dados.clientes || [];
        pedidos = dados.pedidos || [];
        custosFixos = dados.custosFixos || [];
        marketplaces = dados.marketplaces || [];
        fornecedores = dados.fornecedores || [];
        contas = dados.contas || [];
        contasReceber = dados.contasReceber || [];
        taxasProduto = dados.taxasProduto || [];
    }

    async function inicializar() {
        try {
            if (isElectron) {
                var dados = await loadFromSQLite();
                dados = await migrarLocalStorageParaSQLite(dados);
                aplicarNasVariaveisGlobais(dados);
                console.log('[Storage] Dados carregados do SQLite.');
            } else {
                var dadosLS = loadFromLocalStorage();
                aplicarNasVariaveisGlobais(dadosLS);
                console.log('[Storage] Dados carregados do localStorage.');
            }
            marcarContasVencidas();
        } catch (err) {
            console.error('[Storage] Erro na inicialização:', err);
            try {
                aplicarNasVariaveisGlobais(loadFromLocalStorage());
            } catch (e) {
                aplicarNasVariaveisGlobais({
                    produtos: [], categorias: [], clientes: [], pedidos: [],
                    custosFixos: [], marketplaces: [], fornecedores: [],
                    contas: [], contasReceber: [], taxasProduto: []
                });
            }
        }
    }

    function salvarGenerico(nomeDB, chaveLS, dados) {
        if (isElectron && window.db && typeof window.db[nomeDB] === 'function') {
            window.db[nomeDB](dados).catch(function (err) {
                console.error('[Storage] Erro ao salvar ' + nomeDB + ':', err);
            });
        } else {
            lsSet(chaveLS, dados);
        }
    }

    var api = {
        ready: null,
        saveProdutos: function () { salvarGenerico('saveProdutos', KEYS.PRODUTOS, produtos); },
        saveCategorias: function () { salvarGenerico('saveCategorias', KEYS.CATEGORIAS, categorias); },
        saveClientes: function () { salvarGenerico('saveClientes', KEYS.CLIENTES, clientes); },
        savePedidos: function () { salvarGenerico('savePedidos', KEYS.PEDIDOS, pedidos); },
        saveCustosFixos: function () { salvarGenerico('saveCustosFixos', KEYS.CUSTOS_FIXOS, custosFixos); },
        saveMarketplaces: function () { salvarGenerico('saveMarketplaces', KEYS.MARKETPLACES, marketplaces); },
        saveFornecedores: function () { salvarGenerico('saveFornecedores', KEYS.FORNECEDORES, fornecedores); },
        saveContas: function () { salvarGenerico('saveContas', KEYS.CONTAS, contas); },
        saveContasReceber: function () { salvarGenerico('saveContasReceber', KEYS.CONTAS_RECEBER, contasReceber); },
        saveTaxasProduto: function () { salvarGenerico('saveTaxasProduto', KEYS.TAXAS_PRODUTO, taxasProduto); },
        inicializar: inicializar,
        marcarContasVencidas: marcarContasVencidas
    };

    api.ready = inicializar();
    return api;
})();