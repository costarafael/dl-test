import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Entrega, Colaborador, Empresa, TipoEPI } from '../types';
import { format } from 'date-fns';

interface PDFData {
  entrega: Entrega;
  colaborador: Colaborador;
  empresa: Empresa;
  tiposEPI: TipoEPI[];
}

export const gerarPDFEntrega = ({ entrega, colaborador, empresa, tiposEPI }: PDFData): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;
  let yPosition = 20;

  // Helper para formatar data
  const formatarData = (data: string): string => {
    return format(new Date(data), 'dd/MM/yyyy');
  };

  // Header com logo e título
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('CONTROLE DE ENTREGA DE EPIs', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('DataLife EPI - Sistema de Gestão de Equipamentos', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 20;

  // Informações da Empresa
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('DADOS DA EMPRESA', margin, yPosition);
  yPosition += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Empresa: ${empresa.nome}`, margin, yPosition);
  yPosition += 5;
  doc.text(`CNPJ: ${empresa.cnpj}`, margin, yPosition);
  yPosition += 5;
  doc.text(`Endereço: ${empresa.endereco}`, margin, yPosition);
  yPosition += 15;

  // Informações do Colaborador
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('DADOS DO COLABORADOR', margin, yPosition);
  yPosition += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nome: ${colaborador.nome}`, margin, yPosition);
  yPosition += 5;
  doc.text(`CPF: ${colaborador.cpf}`, margin, yPosition);
  yPosition += 5;
  doc.text(`Cargo: ${colaborador.cargo}`, margin, yPosition);
  yPosition += 5;
  doc.text(`Email: ${colaborador.email}`, margin, yPosition);
  yPosition += 15;

  // Informações da Entrega
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('DADOS DA ENTREGA', margin, yPosition);
  yPosition += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`ID da Entrega: ${entrega.id}`, margin, yPosition);
  yPosition += 5;
  doc.text(`Data da Entrega: ${formatarData(entrega.dataEntrega)}`, margin, yPosition);
  yPosition += 5;
  doc.text(`Responsável: ${entrega.responsavel}`, margin, yPosition);
  yPosition += 5;
  doc.text(`Status: ${entrega.status === 'nao_assinado' ? 'Não Assinado' : entrega.status === 'assinado' ? 'Assinado' : 'Pendente'}`, margin, yPosition);
  yPosition += 15;

  // Tabela de EPIs
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('EQUIPAMENTOS DE PROTEÇÃO INDIVIDUAL ENTREGUES', margin, yPosition);
  yPosition += 10;

  // Preparar dados da tabela
  const tableData = entrega.itens.map(item => {
    const tipoEPI = tiposEPI.find(t => t.id === item.tipoEPIId);
    return [
      tipoEPI?.nomeEquipamento || 'EPI não encontrado',
      tipoEPI?.numeroCA || 'N/A',
      item.quantidade.toString(),
      formatarData(item.dataValidade),
      tipoEPI?.categoria || 'N/A'
    ];
  });

  // Configuração da tabela
  autoTable(doc, {
    startY: yPosition,
    head: [['Equipamento', 'CA', 'Qtd', 'Validade', 'Categoria']],
    body: tableData,
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [37, 99, 235], // primary-600
      textColor: 255,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251] // gray-50
    },
    margin: { left: margin, right: margin },
  });

  // Posição após a tabela
  yPosition = (doc as any).lastAutoTable.finalY + 20;

  // Texto de responsabilidade
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('TERMO DE RESPONSABILIDADE', margin, yPosition);
  yPosition += 10;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const textoResponsabilidade = [
    'Declaro ter recebido os Equipamentos de Proteção Individual (EPIs) relacionados acima, em perfeitas',
    'condições de uso e conservação. Comprometo-me a:',
    '',
    '• Utilizar os EPIs apenas durante a execução das atividades para as quais foram destinados;',
    '• Responsabilizar-me pela guarda, conservação e higienização dos equipamentos;',
    '• Comunicar imediatamente qualquer alteração que os torne impróprios para uso;',
    '• Devolver os EPIs quando solicitado pela empresa ou ao término do contrato de trabalho.',
    '',
    'Estou ciente de que o descumprimento das normas de segurança constitui ato faltoso, podendo',
    'acarretar as penalidades previstas em lei e na CLT, incluindo a rescisão do contrato por justa causa.'
  ];

  textoResponsabilidade.forEach(linha => {
    if (yPosition > 250) { // Verificar se precisa de nova página
      doc.addPage();
      yPosition = 20;
    }
    doc.text(linha, margin, yPosition);
    yPosition += 4;
  });

  yPosition += 15;

  // Campo de assinatura
  if (yPosition > 240) {
    doc.addPage();
    yPosition = 20;
  }

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('ASSINATURA DO COLABORADOR', margin, yPosition);
  yPosition += 20;

  // Linha para assinatura
  doc.line(margin, yPosition, pageWidth - margin - 100, yPosition);
  yPosition += 5;
  doc.setFont('helvetica', 'normal');
  doc.text(`${colaborador.nome}`, margin, yPosition);
  doc.text(`Data: ___/___/______`, pageWidth - margin - 80, yPosition);
  yPosition += 15;

  // Assinatura do responsável
  doc.setFont('helvetica', 'bold');
  doc.text('ASSINATURA DO RESPONSÁVEL', margin, yPosition);
  yPosition += 20;

  doc.line(margin, yPosition, pageWidth - margin - 100, yPosition);
  yPosition += 5;
  doc.setFont('helvetica', 'normal');
  doc.text(`${entrega.responsavel}`, margin, yPosition);
  doc.text(`Data: ${formatarData(entrega.dataEntrega)}`, pageWidth - margin - 80, yPosition);

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `DataLife EPI - Página ${i} de ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }

  // Salvar o PDF
  const nomeArquivo = `Entrega_${entrega.id}_${colaborador.nome.replace(/\s+/g, '_')}.pdf`;
  doc.save(nomeArquivo);
};

export const gerarPDFEntregaParaImpressao = ({ entrega, colaborador, empresa, tiposEPI }: PDFData): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;
  let yPosition = 20;

  // Helper para formatar data
  const formatarData = (data: string): string => {
    return format(new Date(data), 'dd/MM/yyyy');
  };

  // Header com logo e título
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('CONTROLE DE ENTREGA DE EPIs', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('DataLife EPI - Sistema de Gestão de Equipamentos', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 20;

  // Informações da Empresa
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('DADOS DA EMPRESA', margin, yPosition);
  yPosition += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Empresa: ${empresa.nome}`, margin, yPosition);
  yPosition += 5;
  doc.text(`CNPJ: ${empresa.cnpj}`, margin, yPosition);
  yPosition += 5;
  doc.text(`Endereço: ${empresa.endereco}`, margin, yPosition);
  yPosition += 15;

  // Informações do Colaborador
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('DADOS DO COLABORADOR', margin, yPosition);
  yPosition += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nome: ${colaborador.nome}`, margin, yPosition);
  yPosition += 5;
  doc.text(`CPF: ${colaborador.cpf}`, margin, yPosition);
  yPosition += 5;
  doc.text(`Cargo: ${colaborador.cargo}`, margin, yPosition);
  yPosition += 5;
  doc.text(`Email: ${colaborador.email}`, margin, yPosition);
  yPosition += 15;

  // Informações da Entrega
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('DADOS DA ENTREGA', margin, yPosition);
  yPosition += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`ID da Entrega: ${entrega.id}`, margin, yPosition);
  yPosition += 5;
  doc.text(`Data da Entrega: ${formatarData(entrega.dataEntrega)}`, margin, yPosition);
  yPosition += 5;
  doc.text(`Responsável: ${entrega.responsavel}`, margin, yPosition);
  yPosition += 5;
  doc.text(`Status: ${entrega.status === 'nao_assinado' ? 'Não Assinado' : entrega.status === 'assinado' ? 'Assinado' : 'Pendente'}`, margin, yPosition);
  yPosition += 15;

  // Tabela de EPIs
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('EQUIPAMENTOS DE PROTEÇÃO INDIVIDUAL ENTREGUES', margin, yPosition);
  yPosition += 10;

  // Preparar dados da tabela
  const tableData = entrega.itens.map(item => {
    const tipoEPI = tiposEPI.find(t => t.id === item.tipoEPIId);
    return [
      tipoEPI?.nomeEquipamento || 'EPI não encontrado',
      tipoEPI?.numeroCA || 'N/A',
      item.quantidade.toString(),
      formatarData(item.dataValidade),
      tipoEPI?.categoria || 'N/A'
    ];
  });

  // Configuração da tabela
  autoTable(doc, {
    startY: yPosition,
    head: [['Equipamento', 'CA', 'Qtd', 'Validade', 'Categoria']],
    body: tableData,
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [37, 99, 235], // primary-600
      textColor: 255,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251] // gray-50
    },
    margin: { left: margin, right: margin },
  });

  // Posição após a tabela
  yPosition = (doc as any).lastAutoTable.finalY + 20;

  // Texto de responsabilidade
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('TERMO DE RESPONSABILIDADE', margin, yPosition);
  yPosition += 10;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const textoResponsabilidade = [
    'Declaro ter recebido os Equipamentos de Proteção Individual (EPIs) relacionados acima, em perfeitas',
    'condições de uso e conservação. Comprometo-me a:',
    '',
    '• Utilizar os EPIs apenas durante a execução das atividades para as quais foram destinados;',
    '• Responsabilizar-me pela guarda, conservação e higienização dos equipamentos;',
    '• Comunicar imediatamente qualquer alteração que os torne impróprios para uso;',
    '• Devolver os EPIs quando solicitado pela empresa ou ao término do contrato de trabalho.',
    '',
    'Estou ciente de que o descumprimento das normas de segurança constitui ato faltoso, podendo',
    'acarretar as penalidades previstas em lei e na CLT, incluindo a rescisão do contrato por justa causa.'
  ];

  textoResponsabilidade.forEach(linha => {
    if (yPosition > 250) { // Verificar se precisa de nova página
      doc.addPage();
      yPosition = 20;
    }
    doc.text(linha, margin, yPosition);
    yPosition += 4;
  });

  yPosition += 15;

  // Campo de assinatura
  if (yPosition > 240) {
    doc.addPage();
    yPosition = 20;
  }

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('ASSINATURA DO COLABORADOR', margin, yPosition);
  yPosition += 20;

  // Linha para assinatura
  doc.line(margin, yPosition, pageWidth - margin - 100, yPosition);
  yPosition += 5;
  doc.setFont('helvetica', 'normal');
  doc.text(`${colaborador.nome}`, margin, yPosition);
  doc.text(`Data: ___/___/______`, pageWidth - margin - 80, yPosition);
  yPosition += 15;

  // Assinatura do responsável
  doc.setFont('helvetica', 'bold');
  doc.text('ASSINATURA DO RESPONSÁVEL', margin, yPosition);
  yPosition += 20;

  doc.line(margin, yPosition, pageWidth - margin - 100, yPosition);
  yPosition += 5;
  doc.setFont('helvetica', 'normal');
  doc.text(`${entrega.responsavel}`, margin, yPosition);
  doc.text(`Data: ${formatarData(entrega.dataEntrega)}`, pageWidth - margin - 80, yPosition);

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `DataLife EPI - Página ${i} de ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }

  // Abrir preview de impressão do navegador ao invés de fazer download
  try {
    const pdfBlob = doc.output('blob');
    const url = URL.createObjectURL(pdfBlob);
    
    // Criar uma nova janela com o PDF para impressão
    const printWindow = window.open(url, '_blank');
    
    if (printWindow) {
      printWindow.onload = () => {
        // Aguardar um pouco para o PDF carregar completamente
        setTimeout(() => {
          printWindow.print();
        }, 250);
        
        // Limpar o URL após um tempo para liberar memória
        setTimeout(() => {
          URL.revokeObjectURL(url);
        }, 5000);
      };
    } else {
      // Fallback se não conseguir abrir nova janela (popup bloqueado)
      alert('Por favor, permita popups para abrir o preview de impressão, ou use o download do PDF.');
      const nomeArquivo = `Entrega_${entrega.id}_${colaborador.nome.replace(/\s+/g, '_')}.pdf`;
      doc.save(nomeArquivo);
    }
  } catch (error) {
    console.error('Erro ao gerar preview de impressão:', error);
    // Fallback para download se houver erro
    const nomeArquivo = `Entrega_${entrega.id}_${colaborador.nome.replace(/\s+/g, '_')}.pdf`;
    doc.save(nomeArquivo);
  }
};