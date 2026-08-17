// Dados de exemplo para demonstração
window.SampleData = {
  planoContasReceitas: [
    { id: 1, nome: 'Vendas', tipo: 'receita' },
    { id: 2, nome: 'Serviços', tipo: 'receita' },
    { id: 3, nome: 'Investimentos', tipo: 'receita' },
    { id: 4, nome: 'Outras Receitas', tipo: 'receita' }
  ],
  planoContasDespesas: [
    { id: 1, nome: 'Pessoal', tipo: 'despesa' },
    { id: 2, nome: 'Marketing', tipo: 'despesa' },
    { id: 3, nome: 'Operacional', tipo: 'despesa' },
    { id: 4, nome: 'Tributos', tipo: 'despesa' }
  ],
  lancamentos: (function() {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = hoje.getMonth(); // 0-based
    const pad = (n) => String(n).padStart(2, '0');
    const diaAtual = hoje.getDate();
    const dados = [];

    // Gera lançamentos de exemplo para o mês atual até hoje
    for (let dia = 1; dia <= diaAtual; dia++) {
      const data = `${ano}-${pad(mes+1)}-${pad(dia)}`;
      // Receitas variáveis
      if (dia % 3 === 0 || dia === 1) {
        dados.push({ id: dados.length+1, data, descricao: 'Venda produtos', valor: 1500 + (dia * 20), tipo: 'receita', categoriaId: 1, dataPagamento: data, status: 'pago' });
      }
      if (dia % 5 === 0) {
        dados.push({ id: dados.length+1, data, descricao: 'Serviço prestado', valor: 800, tipo: 'receita', categoriaId: 2, dataPagamento: data, status: 'pago' });
      }
      // Despesas
      if (dia === 5 || dia === 20) {
        dados.push({ id: dados.length+1, data, descricao: 'Salários', valor: 5000, tipo: 'despesa', categoriaId: 1, dataPagamento: data, status: 'pago' });
      }
      if (dia % 7 === 0) {
        dados.push({ id: dados.length+1, data, descricao: 'Marketing digital', valor: 350, tipo: 'despesa', categoriaId: 2, dataPagamento: data, status: 'pago' });
      }
      if (dia % 10 === 0) {
        dados.push({ id: dados.length+1, data, descricao: 'Material de escritório', valor: 120, tipo: 'despesa', categoriaId: 3, dataPagamento: data, status: 'pago' });
      }
    }
    return dados;
  })(),
  metas: {
    receita: 20000,
    despesa: 12000
  }
};