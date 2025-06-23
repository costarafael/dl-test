// Utilitários genéricos para registro de eventos

// Função genérica para gerar IDs de eventos
export const generateEventId = (prefix: string): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
};

// Função genérica para criar evento base
export const createBaseEvent = <T extends { id: string; data: string }>(
  eventData: Omit<T, 'id' | 'data'>,
  idPrefix: string
): T => {
  return {
    ...eventData,
    id: generateEventId(idPrefix),
    data: new Date().toISOString(),
  } as T;
};

// Factory para criar registradores de eventos específicos
export const createEventRegistrar = <T extends { id: string; data: string }>(
  apiService: { create: (event: T) => Promise<T> },
  idPrefix: string
) => {
  return async (eventData: Omit<T, 'id' | 'data'>): Promise<T> => {
    try {
      const evento = createBaseEvent<T>(eventData, idPrefix);
      await apiService.create(evento);
      return evento;
    } catch (error) {
      console.error(`Erro ao registrar evento ${idPrefix}:`, error);
      throw error;
    }
  };
};

// Tipos comuns para eventos
export interface BaseEvent {
  id: string;
  data: string;
  responsavel: string;
  descricao: string;
}

export interface EstoqueEvent extends BaseEvent {
  itemEstoqueId: string;
  tipo: 'entrada' | 'saida' | 'ajuste' | 'devolucao' | 'perda' | 'vencimento' | 'entrega' | 'cadastro';
  quantidadeAnterior: number;
  quantidadeAtual: number;
  quantidade: number;
  detalhes?: any;
}

export interface HistoricoEvent extends BaseEvent {
  fichaEPIId: string;
  tipo: 'ficha_criada' | 'entrega_criada' | 'entrega_editada' | 'entrega_excluida' | 'item_devolvido' | 'item_desativado';
  detalhes?: {
    entregaId?: string;
    itemId?: string;
    equipamentos?: string[];
    quantidades?: number[];
  };
}

// Funções específicas para criar eventos de estoque
export const createEstoqueEventData = {
  cadastro: (
    itemEstoqueId: string,
    nomeEquipamento: string,
    quantidadeInicial: number,
    responsavel = 'Sistema EPI'
  ): Omit<EstoqueEvent, 'id' | 'data'> => ({
    itemEstoqueId,
    tipo: 'cadastro',
    responsavel,
    descricao: `Item de estoque criado - ${nomeEquipamento}`,
    quantidadeAnterior: 0,
    quantidadeAtual: quantidadeInicial,
    quantidade: quantidadeInicial,
    detalhes: {
      motivo: 'Cadastro inicial do item no sistema'
    }
  }),

  entrada: (
    itemEstoqueId: string,
    nomeEquipamento: string,
    quantidadeAnterior: number,
    quantidade: number,
    responsavel: string,
    detalhes: {
      motivo: string;
      notaFiscal?: string;
      custoUnitario?: number;
    }
  ): Omit<EstoqueEvent, 'id' | 'data'> => ({
    itemEstoqueId,
    tipo: 'entrada',
    responsavel,
    descricao: `Entrada de estoque - ${nomeEquipamento}`,
    quantidadeAnterior,
    quantidadeAtual: quantidadeAnterior + quantidade,
    quantidade,
    detalhes
  }),

  saida: (
    itemEstoqueId: string,
    nomeEquipamento: string,
    quantidadeAnterior: number,
    quantidade: number,
    responsavel: string,
    detalhes: {
      motivo: string;
      entregaId?: string;
      fichaEPIId?: string;
      colaboradorNome?: string;
    }
  ): Omit<EstoqueEvent, 'id' | 'data'> => ({
    itemEstoqueId,
    tipo: detalhes.entregaId ? 'entrega' : 'saida',
    responsavel,
    descricao: detalhes.entregaId 
      ? `Saída por entrega - ${nomeEquipamento}`
      : `Saída de estoque - ${nomeEquipamento}`,
    quantidadeAnterior,
    quantidadeAtual: quantidadeAnterior - quantidade,
    quantidade,
    detalhes
  }),

  ajuste: (
    itemEstoqueId: string,
    nomeEquipamento: string,
    quantidadeAnterior: number,
    novaQuantidade: number,
    responsavel: string,
    motivo: string
  ): Omit<EstoqueEvent, 'id' | 'data'> => ({
    itemEstoqueId,
    tipo: 'ajuste',
    responsavel,
    descricao: `Ajuste de estoque - ${nomeEquipamento}`,
    quantidadeAnterior,
    quantidadeAtual: novaQuantidade,
    quantidade: Math.abs(novaQuantidade - quantidadeAnterior),
    detalhes: {
      motivo: `${motivo} - ${novaQuantidade > quantidadeAnterior ? 'Aumento' : 'Redução'} de ${Math.abs(novaQuantidade - quantidadeAnterior)} unidades`
    }
  })
};

// Funções específicas para criar eventos de histórico
export const createHistoricoEventData = {
  fichaCreated: (
    fichaEPIId: string,
    responsavel: string,
    colaboradorNome: string
  ): Omit<HistoricoEvent, 'id' | 'data'> => ({
    fichaEPIId,
    tipo: 'ficha_criada',
    responsavel,
    descricao: `Ficha EPI criada para ${colaboradorNome}`,
    detalhes: {}
  }),

  entregaCreated: (
    fichaEPIId: string,
    entregaId: string,
    responsavel: string,
    equipamentos: string[],
    quantidades: number[]
  ): Omit<HistoricoEvent, 'id' | 'data'> => ({
    fichaEPIId,
    tipo: 'entrega_criada',
    responsavel,
    descricao: `Nova entrega criada com ${equipamentos.length} tipo(s) de EPI`,
    detalhes: {
      entregaId,
      equipamentos,
      quantidades
    }
  }),

  entregaUpdated: (
    fichaEPIId: string,
    entregaId: string,
    responsavel: string,
    descricao: string
  ): Omit<HistoricoEvent, 'id' | 'data'> => ({
    fichaEPIId,
    tipo: 'entrega_editada',
    responsavel,
    descricao,
    detalhes: {
      entregaId
    }
  }),

  entregaDeleted: (
    fichaEPIId: string,
    entregaId: string,
    responsavel: string
  ): Omit<HistoricoEvent, 'id' | 'data'> => ({
    fichaEPIId,
    tipo: 'entrega_excluida',
    responsavel,
    descricao: 'Entrega removida da ficha',
    detalhes: {
      entregaId
    }
  }),

  itemReturned: (
    fichaEPIId: string,
    itemId: string,
    responsavel: string,
    equipamento: string
  ): Omit<HistoricoEvent, 'id' | 'data'> => ({
    fichaEPIId,
    tipo: 'item_devolvido',
    responsavel,
    descricao: `Item devolvido - ${equipamento}`,
    detalhes: {
      itemId
    }
  }),

  itemDeactivated: (
    fichaEPIId: string,
    itemId: string,
    responsavel: string,
    equipamento: string,
    motivo: string
  ): Omit<HistoricoEvent, 'id' | 'data'> => ({
    fichaEPIId,
    tipo: 'item_desativado',
    responsavel,
    descricao: `Item desativado - ${equipamento} (${motivo})`,
    detalhes: {
      itemId
    }
  })
};