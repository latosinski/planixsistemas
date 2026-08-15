// Módulo de persistência local (localStorage)

var Storage = {
    KEYS: {
        PRODUTOS: 'erp_produtos',
        PEDIDOS: 'erp_pedidos',
        CUSTOS_FIXOS: 'erp_custos_fixos',
        MARKETPLACES: 'erp_marketplaces',
        CONTAS: 'erp_contas',
        FORNECEDORES: 'erp_fornecedores',
        CFG_ANTIGA: 'erp_cfg'
    },

    loadAll: function() {
        // Migração de dados antigos (somente se necessário)
        this.migrarDadosAntigos();

        var savedProdutos = localStorage.getItem(this.KEYS.PRODUTOS);
        produtos = savedProdutos ? JSON.parse(savedProdutos) : [];

        var savedPedidos = localStorage.getItem(this.KEYS.PEDIDOS);
        pedidos = savedPedidos ? JSON.parse(savedPedidos) : [];

        var savedCustos = localStorage.getItem(this.KEYS.CUSTOS_FIXOS);
        custosFixos = savedCustos ? JSON.parse(savedCustos) : [];

        var savedMarketplaces = localStorage.getItem(this.KEYS.MARKETPLACES);
        marketplaces = savedMarketplaces ? JSON.parse(savedMarketplaces) : [];

        var savedContas = localStorage.getItem(this.KEYS.CONTAS);
        contas = savedContas ? JSON.parse(savedContas) : [];

        var savedFornecedores = localStorage.getItem(this.KEYS.FORNECEDORES);
        fornecedores = savedFornecedores ? JSON.parse(savedFornecedores) : [];

        // Marca automaticamente contas vencidas
        this.marcarContasVencidas();
    },

    migrarDadosAntigos: function() {
        var cfgAntiga = localStorage.getItem(this.KEYS.CFG_ANTIGA);
        var marketAntigos = localStorage.getItem(this.KEYS.MARKETPLACES);

        if (marketAntigos) {
            try {
                var lista = JSON.parse(marketAntigos);
                var precisaMigrar = lista.some(function(m) {
                    return m.hasOwnProperty('taxaPerc') || m.hasOwnProperty('taxaFixa');
                });

                if (precisaMigrar) {
                    var listaNova = lista.map(function(m) {
                        return {
                            nome: m.nome,
                            taxa: (m.taxaPerc || 0) + (cfgAntiga ? parseFloat(JSON.parse(cfgAntiga).taxaPag || 0) : 0) + (cfgAntiga ? parseFloat(JSON.parse(cfgAntiga).impostos || 0) : 0),
                            custosAdicionais: m.taxaFixa || 0,
                            valorHora: cfgAntiga ? parseFloat(JSON.parse(cfgAntiga).hora || 22) : 22
                        };
                    });
                    localStorage.setItem(this.KEYS.MARKETPLACES, JSON.stringify(listaNova));
                }
            } catch (e) {
                // Mantém como está
            }
        }

        if (cfgAntiga) {
            localStorage.removeItem(this.KEYS.CFG_ANTIGA);
        }
    },

    marcarContasVencidas: function() {
        var hoje = new Date().toISOString().split('T')[0];
        var alterou = false;
        contas.forEach(function(c) {
            if (c.status !== 'pago' && c.dataVencimento < hoje) {
                c.status = 'vencido';
                alterou = true;
            }
        });
        if (alterou) {
            this.saveContas();
        }
    },

    saveProdutos: function() {
        localStorage.setItem(this.KEYS.PRODUTOS, JSON.stringify(produtos));
    },

    savePedidos: function() {
        localStorage.setItem(this.KEYS.PEDIDOS, JSON.stringify(pedidos));
    },

    saveCustosFixos: function() {
        localStorage.setItem(this.KEYS.CUSTOS_FIXOS, JSON.stringify(custosFixos));
    },

    saveMarketplaces: function() {
        localStorage.setItem(this.KEYS.MARKETPLACES, JSON.stringify(marketplaces));
    },

    saveContas: function() {
        localStorage.setItem(this.KEYS.CONTAS, JSON.stringify(contas));
    },

    saveFornecedores: function() {
        localStorage.setItem(this.KEYS.FORNECEDORES, JSON.stringify(fornecedores));
    }
};

// Inicializa os dados imediatamente
Storage.loadAll();