function cmo(tempo, valorHora) {
    return (tempo / 60) * valorHora;
}

function custoTotal(produto, valorHora) {
    return produto.custoMat + cmo(produto.tempo, valorHora);
}

function calcularPedidoValues(produto, qtd, marketplace) {
    var rec = produto.preco * qtd;
    var valorHora = marketplace ? marketplace.valorHora : 0;
    var custoMaterial = produto.custoMat * qtd;
    var custoMaoDeObra = (produto.tempo / 60) * valorHora * qtd;
    var custoTotal = custoMaterial + custoMaoDeObra;

    var taxaMarketplace = (rec * (marketplace ? marketplace.taxa : 0) / 100);
    var custosAdicionais = marketplace ? marketplace.custosAdicionais : 0;

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

// Função auxiliar para formatar datas sem problemas de fuso horário
function formatarData(dataISO) {
    var partes = dataISO.split('-');
    if (partes.length !== 3) return dataISO;
    var dia = partes[2];
    var mes = partes[1];
    var ano = partes[0];
    return dia + '/' + mes + '/' + ano;
}