// Módulo de gráficos (Chart.js) com gerenciamento de instâncias
window.Charts = (function() {
  const instances = [];

  function createChart(ctx, config) {
    const chart = new Chart(ctx, config);
    instances.push(chart);
    return chart;
  }

  function destroyAll() {
    instances.forEach(chart => chart.destroy());
    instances.length = 0;
  }

  // Retorna as cores do tema atual
  function getThemeColors() {
    const style = getComputedStyle(document.documentElement);
    return {
      textSecondary: style.getPropertyValue('--text-secondary').trim(),
      borderColor: style.getPropertyValue('--border-color').trim(),
      primary: style.getPropertyValue('--primary').trim(),
      success: style.getPropertyValue('--success').trim(),
      danger: style.getPropertyValue('--danger').trim(),
      primaryLight: style.getPropertyValue('--primary-light').trim()
    };
  }

  // Opções padrão reutilizáveis
  function defaultOptions() {
    const colors = getThemeColors();
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: colors.textSecondary }
        }
      },
      scales: {
        y: {
          grid: { color: colors.borderColor },
          ticks: { color: colors.textSecondary }
        },
        x: {
          grid: { display: false },
          ticks: { color: colors.textSecondary }
        }
      }
    };
  }

  return { createChart, destroyAll, defaultOptions, getThemeColors };
})();