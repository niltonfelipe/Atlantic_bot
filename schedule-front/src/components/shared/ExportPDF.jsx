import React from 'react';
import { Button } from 'antd';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const ExportarPDFButton = ({ tabelaRef, graficoRef, nomeArquivo }) => {
  const gerarPDF = async () => {
    try {
      // Cria um novo documento PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Adiciona o título
      pdf.setFontSize(20);
      pdf.text('Relatório de Coletas', 105, 15, { align: 'center' });
      
      // Adiciona a data de geração
      pdf.setFontSize(12);
      pdf.text(`Gerado em: ${new Date().toLocaleDateString()}`, 105, 25, { align: 'center' });
      
      let yPos = 40; // Posição vertical inicial para os conteúdos
      
      // Captura e adiciona a tabela
      if (tabelaRef.current) {
        const canvasTabela = await html2canvas(tabelaRef.current, {
          scale: 2,
          useCORS: true,
        });
        
        const imgDataTabela = canvasTabela.toDataURL('image/png');
        const imgWidth = 190; // Largura da imagem no PDF (mm)
        const imgHeight = (canvasTabela.height * imgWidth) / canvasTabela.width;
        
        // Adiciona a tabela ao PDF
        pdf.addImage(imgDataTabela, 'PNG', 10, yPos, imgWidth, imgHeight);
        yPos += imgHeight + 10;
      }
      
      // Captura e adiciona o gráfico
      if (graficoRef.current) {
        const canvasGrafico = await html2canvas(graficoRef.current, {
          scale: 2,
          useCORS: true,
        });
        
        const imgDataGrafico = canvasGrafico.toDataURL('image/png');
        const imgWidth = 190; // Largura da imagem no PDF (mm)
        const imgHeight = (canvasGrafico.height * imgWidth) / canvasGrafico.width;
        
        // Verifica se há espaço na página atual
        if (yPos + imgHeight > 280) { // 280mm é aproximadamente a altura de uma página A4
          pdf.addPage();
          yPos = 20;
        }
        
        // Adiciona o gráfico ao PDF
        pdf.addImage(imgDataGrafico, 'PNG', 10, yPos, imgWidth, imgHeight);
      }
      
      // Salva o PDF
      pdf.save(`${nomeArquivo}.pdf`);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
    }
  };

  return (
    <Button type="primary" onClick={gerarPDF}>
      Exportar para PDF
    </Button>
  );
};

export default ExportarPDFButton;