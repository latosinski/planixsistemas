// Módulo de exportação (PDF e Excel) – funções utilitárias
window.Export = (function() {
  function toExcel(data, filename = 'export.xlsx') {
    if (typeof XLSX === 'undefined') {
      console.error('XLSX não carregado');
      return;
    }
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, filename);
  }

  function toPDF(elementId, filename = 'export.pdf') {
    if (typeof html2canvas === 'undefined' || typeof jspdf === 'undefined') {
      console.error('html2canvas ou jsPDF não carregados');
      return;
    }
    const element = document.getElementById(elementId);
    if (!element) return;
    html2canvas(element, { scale: 2 }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const imgHeight = canvas.height * imgWidth / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(filename);
    });
  }

  return { toExcel, toPDF };
})();