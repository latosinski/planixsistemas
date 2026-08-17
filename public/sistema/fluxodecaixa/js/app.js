// Arquivo principal – inicialização da aplicação
(function() {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('Iniciando aplicação...');

    UI.init();

    if (!Storage.get(Storage.KEYS.PLANO_CONTAS_RECEITAS)) {
      Storage.set(Storage.KEYS.PLANO_CONTAS_RECEITAS, SampleData.planoContasReceitas);
    }
    if (!Storage.get(Storage.KEYS.PLANO_CONTAS_DESPESAS)) {
      Storage.set(Storage.KEYS.PLANO_CONTAS_DESPESAS, SampleData.planoContasDespesas);
    }
    if (!Storage.get(Storage.KEYS.LANCAMENTOS)) {
      Storage.set(Storage.KEYS.LANCAMENTOS, SampleData.lancamentos);
    }
    if (!Storage.get(Storage.KEYS.METAS)) {
      Storage.set(Storage.KEYS.METAS, SampleData.metas);
    }

    // Registrar páginas
    if (window.DashboardPage) Router.register('dashboard', DashboardPage.render);
    if (window.LancamentosPage) Router.register('lancamentos', LancamentosPage.render);
    if (window.FluxoCaixaPage) Router.register('fluxo-caixa', FluxoCaixaPage.render);
    if (window.MetasPage) Router.register('metas', MetasPage.render);
    if (window.DREPage) Router.register('dre', DREPage.render);
    if (window.ContasPagarPage) Router.register('contas-pagar', ContasPagarPage.render);
    if (window.ContasReceberPage) Router.register('contas-receber', ContasReceberPage.render);
    if (window.ValoresAbertosPage) Router.register('valores-abertos', ValoresAbertosPage.render);
    if (window.PlanoContasPage) Router.register('plano-contas', PlanoContasPage.render);
    if (window.RelatorioImpressaoPage) Router.register('relatorio-impressao', RelatorioImpressaoPage.render);

    Router.init();

    document.getElementById('refresh-btn')?.addEventListener('click', () => {
      const current = window.location.hash.substring(1) || 'dashboard';
      Router.navigate(current);
      UI.showToast('Dados atualizados com sucesso!', 'success');
    });

    document.getElementById('logout-btn')?.addEventListener('click', () => {
      window.close();
      setTimeout(() => {
        if (!window.closed) {
          alert('Para encerrar, feche a janela manualmente ou utilize o comando do sistema.');
        }
      }, 200);
    });

    console.log('✅ Aplicação inicializada.');
  });
})();