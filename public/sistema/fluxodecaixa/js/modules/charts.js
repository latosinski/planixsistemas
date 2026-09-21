/**
 * Módulo de gráficos (Chart.js).
 *
 * - Mantém uma lista de instâncias criadas.
 * - Fornece `defaultOptions()` e `getThemeColors()` lendo variáveis CSS.
 * - Escuta o evento `themechange` e atualiza as cores de todos os gráficos
 *   ativos sem recriá-los (apenas `chart.update()`).
 */
window.Charts = (function() {
  const instances = [];

  /**
   * Retorna as cores do tema atual, lendo as variáveis CSS.
   */
  function getThemeColors() {
    const style = getComputedStyle(document.documentElement);
    return {
      text: style.getPropertyValue('--text').trim() || '#1a1a2e',
      textSecondary: style.getPropertyValue('--muted').trim() || '#64748b',
      borderColor: style.getPropertyValue('--border').trim() || '#dde3e9',
      primary: style.getPropertyValue('--primary').trim() || '#0c4257',
      success: style.getPropertyValue('--success').trim() || '#059669',
      danger: style.getPropertyValue('--danger').trim() || '#dc2626',
      warning: style.getPropertyValue('--warning').trim() || '#d97706'
    };
  }

  /**
   * Opções padrão reutilizáveis.
   */
  function defaultOptions() {
    const colors = getThemeColors();
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: colors.textSecondary,
            font: { size: 11 }
          }
        },
        tooltip: {
          backgroundColor: colors.primary,
          titleColor: '#fff',
          bodyColor: '#fff'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: colors.borderColor },
          ticks: { color: colors.textSecondary, font: { size: 10 } }
        },
        x: {
          grid: { display: false },
          ticks: { color: colors.textSecondary, font: { size: 10 } }
        }
      }
    };
  }

  /**
   * Cria um gráfico e registra na lista para atualização de tema.
   */
  function createChart(ctx, config) {
    const chart = new Chart(ctx, config);
    instances.push(chart);
    return chart;
  }

  /**
   * Destrói todos os gráficos e limpa a lista.
   */
  function destroyAll() {
    while (instances.length) {
      const c = instances.pop();
      try { c.destroy(); } catch (e) { /* ignora */ }
    }
  }

  /**
   * Atualiza as cores dos gráficos existentes conforme o tema atual.
   * Percorre cada gráfico e reescreve as cores de ticks, legendas,
   * eixos e datasets básicos (mantendo os dados).
   */
  function atualizarCores() {
    const colors = getThemeColors();
    instances.forEach(chart => {
      const opts = chart.options;

      // Legendas
      if (opts.plugins?.legend?.labels) {
        opts.plugins.legend.labels.color = colors.textSecondary;
      }
      // Tooltip
      if (opts.plugins?.tooltip) {
        opts.plugins.tooltip.backgroundColor = colors.primary;
        opts.plugins.tooltip.titleColor = '#fff';
        opts.plugins.tooltip.bodyColor = '#fff';
      }
      // Escalas
      if (opts.scales) {
        Object.values(opts.scales).forEach(scale => {
          if (!scale) return;
          if (scale.ticks) scale.ticks.color = colors.textSecondary;
          if (scale.grid && scale.grid.color) scale.grid.color = colors.borderColor;
          if (scale.title) scale.title.color = colors.textSecondary;
        });
      }

      // Datasets que usam as cores semânticas do tema
      if (chart.data?.datasets) {
        chart.data.datasets.forEach(ds => {
          // Reconhece pelo label para não afetar gráficos com cores específicas
          const label = (ds.label || '').toLowerCase();
          if (label.includes('entrada') || label.includes('receita')) {
            ds.backgroundColor = colors.success;
            ds.borderColor = colors.success;
          } else if (label.includes('saída') || label.includes('saida') || label.includes('despesa')) {
            ds.backgroundColor = colors.danger;
            ds.borderColor = colors.danger;
          } else if (label.includes('saldo acumulado') || label.includes('saldo')) {
            ds.borderColor = colors.primary;
            ds.backgroundColor = 'transparent';
          }
        });
      }

      chart.update('none');
    });
  }

  // Escuta o evento de troca de tema e atualiza as cores
  window.addEventListener('themechange', () => {
    // Aguarda o próximo frame para garantir que as variáveis CSS
    // já foram recalculadas pelo navegador
    requestAnimationFrame(() => atualizarCores());
  });

  return { createChart, destroyAll, defaultOptions, getThemeColors, atualizarCores };
})();