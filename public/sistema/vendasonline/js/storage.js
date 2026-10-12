// Módulo de persistência local (localStorage)

var Storage = {
    KEYS: {
        PRODUTOS: 'erp_produtos',
        PEDIDOS: 'erp_pedidos',
        CUSTOS_FIXOS: 'erp_custos_fixos',
        MARKETPLACES: 'erp_marketplaces',
        CONTAS: 'erp_contas',
        CONTAS_RECEBER: 'erp_contas_receber',
        FORNECEDORES: 'erp_fornecedores',
        CLIENTES: 'erp_clientes',
        CATEGORIAS: 'erp_categorias',
        CFG_ANTIGA: 'erp_cfg'
    },

    loadAll: function() {
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

        var savedContasReceber = localStorage.getItem(this.KEYS.CONTAS_RECEBER);
        contasReceber = savedContasReceber ? JSON.parse(savedContasReceber) : [];

        var savedFornecedores = localStorage.getItem(this.KEYS.FORNECEDORES);
        fornecedores = savedFornecedores ? JSON.parse(savedFornecedores) : [];

        var savedClientes = localStorage.getItem(this.KEYS.CLIENTES);
        clientes = savedClientes ? JSON.parse(savedClientes) : [];

        var savedCategorias = localStorage.getItem(this.KEYS.CATEGORIAS);
        categorias = savedCategorias ? JSON.parse(savedCategorias) : [];

        // Limpa qualquer resquício de hierarquia antiga
        var precisaSalvar = false;
        categorias.forEach(function(c) {
            if (c.paiId !== undefined) {
                delete c.paiId;
                precisaSalvar = true;
            }
        });
        if (precisaSalvar) this.saveCategorias();

        this.migrarCategoriasDeProdutos();
        this.marcarContasVencidas();
    },

    migrarDadosAntigos: function() {
        var cfgAntiga = localStorage.getItem(this.KEYS.CFG_ANTIGA);
        var marketAntigos = localStorage.getItem(this.KEYS.MARKETPLACES);

        if (marketAntigos) {
            try {
                var lista = JSON.parse(marketAntigos);
                var precisaMigrar = lista.some(function(m) {
                    return m.hasOwnProperty('taxaPerc') || m.hasOwnProperty('taxaFixa') || !m.hasOwnProperty('prazoRecebimento');
                });

                if (precisaMigrar) {
                    var listaNova = lista.map(function(m) {
                        var novaTaxa = m.taxa !== undefined ? m.taxa :
                            ((m.taxaPerc || 0) + (cfgAntiga ? parseFloat(JSON.parse(cfgAntiga).taxaPag || 0) : 0) + (cfgAntiga ? parseFloat(JSON.parse(cfgAntiga).impostos || 0) : 0));
                        var novoCustosAdicionais = m.custosAdicionais !== undefined ? m.custosAdicionais : (m.taxaFixa || 0);
                        var novoValorHora = m.valorHora !== undefined ? m.valorHora : (cfgAntiga ? parseFloat(JSON.parse(cfgAntiga).hora || 22) : 22);
                        return {
                            nome: m.nome,
                            taxa: novaTaxa,
                            custosAdicionais: novoCustosAdicionais,
                            valorHora: novoValorHora,
                            prazoRecebimento: m.prazoRecebimento !== undefined ? m.prazoRecebimento : 0
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

    migrarCategoriasDeProdutos: function() {
        if (categorias.length > 0) return;
        if (produtos.length === 0) return;

        var nomesUnicos = {};
        produtos.forEach(function(p) {
            if (p.cat && p.cat.trim()) {
                nomesUnicos[p.cat.trim()] = true;
            }
        });

        var nomes = Object.keys(nomesUnicos);
        if (nomes.length === 0) return;

        var maxId = 0;
        nomes.forEach(function(nome) {
            categorias.push({
                id: ++maxId,
                nome: nome,
                descricao: ''
            });
        });

        produtos.forEach(function(p) {
            if (p.cat && p.cat.trim()) {
                var cat = categorias.find(function(c) { return c.nome === p.cat.trim(); });
                if (cat) p.categoriaId = cat.id;
            }
        });

        this.saveCategorias();
        this.saveProdutos();
    },

    marcarContasVencidas: function() {
        var hoje = new Date().toISOString().split('T')[0];
        var alterouPagar = false;
        var alterouReceber = false;

        contas.forEach(function(c) {
            if (c.status !== 'pago' && c.dataVencimento < hoje) {
                c.status = 'vencido';
                alterouPagar = true;
            }
        });

        contasReceber.forEach(function(c) {
            if (c.status !== 'recebido' && c.dataVencimento < hoje) {
                c.status = 'vencido';
                alterouReceber = true;
            }
        });

        if (alterouPagar) this.saveContas();
        if (alterouReceber) this.saveContasReceber();
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

    saveContasReceber: function() {
        localStorage.setItem(this.KEYS.CONTAS_RECEBER, JSON.stringify(contasReceber));
    },

    saveFornecedores: function() {
        localStorage.setItem(this.KEYS.FORNECEDORES, JSON.stringify(fornecedores));
    },

    saveClientes: function() {
        localStorage.setItem(this.KEYS.CLIENTES, JSON.stringify(clientes));
    },

    saveCategorias: function() {
        localStorage.setItem(this.KEYS.CATEGORIAS, JSON.stringify(categorias));
    }
};

// Inicializa os dados imediatamente
Storage.loadAll();