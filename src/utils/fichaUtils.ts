import { FichaEPI, Entrega, EventoHistorico } from '../types';

// Contar itens entregues na ficha
export const contarItensEntregues = (ficha: FichaEPI | null): number => {
  if (!ficha?.itens) return 0;
  return ficha.itens.reduce((total, item) => total + item.quantidade, 0);
};

// Contar itens ativos (não devolvidos/descartados)
export const contarItensAtivos = (ficha: FichaEPI | null): number => {
  if (!ficha?.itens) return 0;
  return ficha.itens
    .filter(item => item.status === 'entregue')
    .reduce((total, item) => total + item.quantidade, 0);
};

// Verificar se a ficha está ativa
export const isFichaAtiva = (ficha: FichaEPI | null): boolean => {
  return ficha?.status === 'ativo';
};

// Verificar se a ficha está vencida
export const isFichaVencida = (ficha: FichaEPI | null): boolean => {
  if (!ficha) return false;
  const hoje = new Date();
  const dataValidade = new Date(ficha.dataValidade);
  return dataValidade < hoje;
};

// Obter status descritivo da ficha
export const getStatusFicha = (ficha: FichaEPI | null): string => {
  if (!ficha) return 'Indisponível';
  
  switch (ficha.status) {
    case 'ativo':
      return isFichaVencida(ficha) ? 'Vencida' : 'Ativa';
    case 'vencido':
      return 'Vencida';
    case 'suspenso':
      return 'Suspensa';
    case 'arquivado':
      return 'Arquivada';
    default:
      return ficha.status;
  }
};

// Obter cor do status para badges
export const getCorStatusFicha = (ficha: FichaEPI | null): string => {
  if (!ficha) return 'gray';
  
  switch (ficha.status) {
    case 'ativo':
      return isFichaVencida(ficha) ? 'red' : 'green';
    case 'vencido':
      return 'red';
    case 'suspenso':
      return 'yellow';
    case 'arquivado':
      return 'gray';
    default:
      return 'gray';
  }
};

// Encontrar entrega de um item específico da ficha
export const getEntregaDoItem = (
  entregaId: string, 
  entregas: Entrega[]
): Entrega | undefined => {
  return entregas.find(entrega => entrega.id === entregaId);
};

// Verificar se uma entrega pode ser editada
export const podeEditarEntrega = (entrega: Entrega): boolean => {
  return entrega.status === 'nao_assinado';
};

// Verificar se uma entrega pode ser excluída
export const podeExcluirEntrega = (entrega: Entrega): boolean => {
  return entrega.status === 'nao_assinado';
};

// Obter total de EPIs em uma entrega
export const getTotalEPIsEntrega = (entrega: Entrega): number => {
  return entrega.itens.reduce((total, item) => total + item.quantidade, 0);
};

// Formatar informações da entrega para exibição
export const formatarInfoEntrega = (entrega: Entrega): string => {
  const totalItens = getTotalEPIsEntrega(entrega);
  const tiposDistintos = entrega.itens.length;
  
  return `${totalItens} EPI${totalItens !== 1 ? 's' : ''} (${tiposDistintos} tipo${tiposDistintos !== 1 ? 's' : ''})`;
};

// Mapear tipos de eventos para exibição
export const mapearTipoEvento = (tipo: EventoHistorico['tipo']): string => {
  const mapeamento = {
    'ficha_criada': 'Ficha criada',
    'entrega_criada': 'Nova entrega',
    'entrega_editada': 'Entrega editada',
    'entrega_excluida': 'Entrega excluída',
    'item_devolvido': 'Item devolvido',
    'item_desativado': 'Item desativado'
  };
  
  return mapeamento[tipo] || tipo;
};

// Obter ícone para tipo de evento
export const getIconeEvento = (tipo: EventoHistorico['tipo']): string => {
  const icones = {
    'ficha_criada': '📋',
    'entrega_criada': '📦',
    'entrega_editada': '✏️',
    'entrega_excluida': '🗑️',
    'item_devolvido': '↩️',
    'item_desativado': '❌'
  };
  
  return icones[tipo] || '📝';
};

// Obter cor para tipo de evento
export const getCorEvento = (tipo: EventoHistorico['tipo']): string => {
  const cores = {
    'ficha_criada': 'blue',
    'entrega_criada': 'green',
    'entrega_editada': 'yellow',
    'entrega_excluida': 'red',
    'item_devolvido': 'gray',
    'item_desativado': 'red'
  };
  
  return cores[tipo] || 'gray';
};

// Criar evento de histórico para ficha
export const criarEventoFicha = (
  fichaId: string,
  tipo: EventoHistorico['tipo'],
  responsavel: string,
  descricao: string,
  detalhes?: EventoHistorico['detalhes']
): Omit<EventoHistorico, 'id' | 'data'> => {
  return {
    fichaEPIId: fichaId,
    tipo,
    responsavel,
    descricao,
    detalhes: detalhes || {}
  };
};

// Validar dados de nova entrega
export const validarNovaEntrega = (itens: any[]): { valido: boolean; erros: string[] } => {
  const erros: string[] = [];
  
  if (!itens || itens.length === 0) {
    erros.push('A entrega deve ter pelo menos um item');
  }
  
  itens.forEach((item, index) => {
    if (!item.tipoEPIId) {
      erros.push(`Item ${index + 1}: Tipo de EPI é obrigatório`);
    }
    
    if (!item.quantidade || item.quantidade < 1) {
      erros.push(`Item ${index + 1}: Quantidade deve ser maior que zero`);
    }
    
    if (!item.dataValidade) {
      erros.push(`Item ${index + 1}: Data de validade é obrigatória`);
    } else {
      const dataValidade = new Date(item.dataValidade);
      const hoje = new Date();
      if (dataValidade <= hoje) {
        erros.push(`Item ${index + 1}: Data de validade deve ser futura`);
      }
    }
  });
  
  return {
    valido: erros.length === 0,
    erros
  };
};

// Agrupar entregas por status
export const agruparEntregasPorStatus = (entregas: Entrega[]): Record<string, Entrega[]> => {
  return entregas.reduce((grupos, entrega) => {
    const status = entrega.status;
    if (!grupos[status]) {
      grupos[status] = [];
    }
    grupos[status].push(entrega);
    return grupos;
  }, {} as Record<string, Entrega[]>);
};

// Obter estatísticas de entregas
export const getEstatisticasEntregas = (entregas: Entrega[]) => {
  const total = entregas.length;
  const assinadas = entregas.filter(e => e.status === 'assinado').length;
  const pendentes = entregas.filter(e => e.status === 'nao_assinado').length;
  const totalEPIs = entregas.reduce((total, entrega) => 
    total + getTotalEPIsEntrega(entrega), 0
  );
  
  return {
    total,
    assinadas,
    pendentes,
    totalEPIs,
    percentualAssinadas: total > 0 ? Math.round((assinadas / total) * 100) : 0
  };
};