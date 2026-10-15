function cmo(tempo, valorHora) {
    return (tempo / 60) * valorHora;
}

function custoTotal(produto, valorHora) {
    return produto.custoMat + cmo(produto.tempo, valorHora);
}

// Nova assinatura: taxaPerc e custoFixo são números (já resolvidos pelo chamador)
function calcularPedidoValues(produto, qtd, marketplace, taxaPerc, custoFixo) {
    var rec = produto.preco * qtd;
    var valorHora = marketplace ? marketplace.valorHora : 0;
    var custoMaterial = produto.custoMat * qtd;
    var custoMaoDeObra = (produto.tempo / 60) * valorHora * qtd;
    var custoTotal = custoMaterial + custoMaoDeObra;

    var taxa = Number(taxaPerc) || 0;
    var custo = Number(custoFixo) || 0;

    var taxaMarketplace = rec * taxa / 100;
    var custosAdicionais = custo;

    var lb = rec - custoTotal;
    var ll = lb - taxaMarketplace - custosAdicionais;
    var mg = rec > 0 ? (ll / rec) * 100 : 0;

    return {
        rec: rec,
        taxas: taxaMarketplace + custosAdicionais,
        lucroBruto: lb,
        lucroLiq: ll,
        margem: mg
    };
}

// Formata datas ISO (AAAA-MM-DD) para DD/MM/AAAA
function formatarData(dataISO) {
    var partes = dataISO.split('-');
    if (partes.length !== 3) return dataISO;
    return partes[2] + '/' + partes[1] + '/' + partes[0];
}

// Adiciona dias a uma data ISO e devolve ISO
function adicionarDiasISO(dataISO, dias) {
    var partes = dataISO.split('-');
    var data = new Date(parseInt(partes[0]), parseInt(partes[1]) - 1, parseInt(partes[2]));
    data.setDate(data.getDate() + dias);
    var ano = data.getFullYear();
    var mes = String(data.getMonth() + 1).padStart(2, '0');
    var dia = String(data.getDate()).padStart(2, '0');
    return ano + '-' + mes + '-' + dia;
}

// Busca a taxa de um produto para um determinado marketplace
function obterTaxaDoProduto(produtoCod, marketplaceId) {
    var t = taxasProduto.find(function (x) {
        return x.produtoCod === produtoCod && Number(x.marketplaceId) === Number(marketplaceId);
    });
    return t || null;
}