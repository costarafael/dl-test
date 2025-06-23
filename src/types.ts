export interface Holding {
  id: string;
  nome: string;
  cnpj: string;
  setor: string;
  status: 'ativa' | 'inativa';
}

export interface Empresa {
  id: string;
  nome: string;
  cnpj: string;
  endereco: string;
  status: 'ativa' | 'inativa';
  holdingId?: string;
  tipo: 'holding' | 'contratada';
}

export interface Colaborador {
  id: string;
  nome: string;
  cpf: string;
  email: string;
  cargo: string;
  dataAdmissao: string;
  empresaId: string;
  status: 'ativo' | 'afastado' | 'desligado';
  temFichaAtiva: boolean;
}

export interface TipoEPI {
  id: string;
  numeroCA: string;
  nomeEquipamento: string;
  descricao: string;
  fabricante: string;
  categoria: string;
  vidaUtilDias: number;
  foto?: string;
}

export interface ItemEstoque {
  id: string;
  tipoEPIId: string;
  empresaId: string;
  quantidade: number;
  quantidadeMinima: number;
  localizacao: string;
  lote?: string;
  dataValidade?: string;
  status?: 'disponivel' | 'baixo_estoque' | 'vencido' | 'esgotado';
  dataUltimaMovimentacao?: string;
  custoUnitario?: number;
  fornecedor?: string;
}

export interface FichaEPI {
  id: string;
  colaboradorId: string;
  empresaId: string;
  dataEmissao: string;
  dataValidade: string;
  status: 'ativo' | 'vencido' | 'suspenso' | 'arquivado';
  itens: ItemFicha[];
}

export interface ItemFicha {
  id: string;
  tipoEPIId: string;
  quantidade: number;
  dataEntrega: string;
  dataValidade: string;
  status: 'entregue' | 'devolvido' | 'danificado' | 'perdido';
  entregaId: string; // Referência à entrega que criou este item
  observacoes?: string;
}

export interface MovimentacaoEstoque {
  id: string;
  tipo: 'entrada' | 'saida' | 'ajuste' | 'devolucao' | 'perda' | 'vencimento' | 'entrega';
  itemEstoqueId: string;
  quantidade: number;
  quantidadeAnterior: number;
  quantidadeAtual: number;
  data: string;
  responsavelId: string;
  motivo: string;
  observacoes?: string;
  entregaId?: string;  // Para rastrear quando a movimentação foi por uma entrega
  custoUnitario?: number;
  notaFiscal?: string;
  lote?: string;
}

export interface Entrega {
  id: string;
  fichaEPIId: string;
  dataEntrega: string;
  itens: ItemEntrega[];
  responsavel: string;
  status: 'nao_assinado' | 'assinado' | 'pendente';
  assinatura?: {
    dataAssinatura: string;
    ip?: string;
    device?: string;
  };
  qrCode?: string;
  linkAssinatura?: string;
}

export interface ItemEntrega {
  id: string;
  tipoEPIId: string;
  quantidade: number;
  dataValidade: string;
}

export interface Notificacao {
  id: string;
  titulo: string;
  mensagem: string;
  tipo: 'alerta' | 'informacao' | 'importante' | 'vencimento' | 'estoque_baixo' | 'vencendo';
  data: string;
  lida: boolean;
  link?: string;
  usuarioId?: string;
  empresaId?: string;
}

export interface EventoHistorico {
  id: string;
  fichaEPIId: string;
  tipo: 'ficha_criada' | 'entrega_criada' | 'entrega_editada' | 'entrega_excluida' | 'item_devolvido' | 'item_desativado';
  data: string;
  responsavel: string;
  descricao: string;
  detalhes?: {
    entregaId?: string;
    itemId?: string;
    equipamentos?: string[];
    quantidades?: number[];
  };
}

// Interface específica para histórico de estoque
export interface EventoEstoque {
  id: string;
  itemEstoqueId: string;
  tipo: 'entrada' | 'saida' | 'ajuste' | 'devolucao' | 'perda' | 'vencimento' | 'entrega' | 'cadastro';
  data: string;
  responsavel: string;
  descricao: string;
  quantidadeAnterior: number;
  quantidadeAtual: number;
  quantidade: number;
  detalhes?: {
    entregaId?: string;
    fichaEPIId?: string;
    colaboradorNome?: string;
    custoUnitario?: number;
    notaFiscal?: string;
    lote?: string;
    motivo?: string;
  };
}

// Interface para item de uma nota (entrada ou saída)
export interface ItemNota {
  id: string;
  tipoEPIId: string;
  quantidade: number;
  custoUnitario?: number;
  lote?: string;
  observacoes?: string;
}

// Interface para Notas de Entrada
export interface NotaEntrada {
  id: string;
  numeroNota: string;
  empresaId: string;
  data: string;
  responsavel: string;
  motivo: string;
  fornecedor?: string;
  notaFiscal?: string;
  valorTotal?: number;
  status: 'pendente' | 'processada' | 'cancelada';
  itens: ItemNota[];
  observacoes?: string;
  dataProcessamento?: string;
}

// Interface para Notas de Saída
export interface NotaSaida {
  id: string;
  numeroNota: string;
  empresaId: string;
  data: string;
  responsavel: string;
  motivo: string;
  destinatario?: string;
  solicitante?: string;
  status: 'pendente' | 'processada' | 'cancelada';
  itens: ItemNota[];
  observacoes?: string;
  dataProcessamento?: string;
}

// Interface para formulário de nova movimentação multi-item
export interface NovaMovimentacaoForm {
  tipo: 'entrada' | 'saida';
  responsavel: string;
  motivo: string;
  observacoes?: string;
  fornecedor?: string; // para entrada
  notaFiscal?: string; // para entrada
  destinatario?: string; // para saída
  solicitante?: string; // para saída
  itens: Array<{
    tipoEPIId: string;
    quantidade: number;
    custoUnitario?: number;
    lote?: string;
    observacoes?: string;
  }>;
}
