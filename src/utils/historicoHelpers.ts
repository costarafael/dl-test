import { EventoHistorico } from '../types';
import { historicoAPI } from '../services/api';

export const registrarEventoHistorico = async (evento: Omit<EventoHistorico, 'id' | 'data'>) => {
  try {
    const novoEvento: EventoHistorico = {
      ...evento,
      id: `hist_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      data: new Date().toISOString(),
    };
    
    await historicoAPI.create(novoEvento);
    return novoEvento;
  } catch (error) {
    console.error('Erro ao registrar evento no histórico:', error);
    // Não bloquear operação principal se histórico falhar
  }
};

export const criarEventoFichaCriada = (fichaEPIId: string, colaboradorNome: string) => ({
  fichaEPIId,
  tipo: 'ficha_criada' as const,
  responsavel: 'Sistema EPI',
  descricao: `Ficha de EPI criada para o colaborador ${colaboradorNome}`
});

export const criarEventoEntregaCriada = (
  fichaEPIId: string, 
  entregaId: string, 
  equipamentos: string[], 
  quantidades: number[],
  responsavel: string
) => ({
  fichaEPIId,
  tipo: 'entrega_criada' as const,
  responsavel,
  descricao: `Nova entrega criada com ${equipamentos.length} equipamento(s): ${equipamentos.join(', ')}`,
  detalhes: {
    entregaId,
    equipamentos,
    quantidades
  }
});

export const criarEventoEntregaEditada = (
  fichaEPIId: string, 
  entregaId: string, 
  equipamentos: string[], 
  quantidades: number[],
  responsavel: string
) => ({
  fichaEPIId,
  tipo: 'entrega_editada' as const,
  responsavel,
  descricao: `Entrega #${entregaId} foi editada - ${equipamentos.length} equipamento(s): ${equipamentos.join(', ')}`,
  detalhes: {
    entregaId,
    equipamentos,
    quantidades
  }
});

export const criarEventoEntregaExcluida = (
  fichaEPIId: string, 
  entregaId: string, 
  equipamentos: string[],
  responsavel: string
) => ({
  fichaEPIId,
  tipo: 'entrega_excluida' as const,
  responsavel,
  descricao: `Entrega #${entregaId} foi excluída - Equipamentos removidos: ${equipamentos.join(', ')}`,
  detalhes: {
    entregaId,
    equipamentos
  }
});

export const criarEventoItemDevolvido = (
  fichaEPIId: string,
  equipamento: string,
  responsavel: string
) => ({
  fichaEPIId,
  tipo: 'item_devolvido' as const,
  responsavel,
  descricao: `Equipamento devolvido: ${equipamento}`
});

export const criarEventoItemDesativado = (
  fichaEPIId: string,
  equipamento: string,
  responsavel: string
) => ({
  fichaEPIId,
  tipo: 'item_desativado' as const,
  responsavel,
  descricao: `Equipamento desativado: ${equipamento}`
});