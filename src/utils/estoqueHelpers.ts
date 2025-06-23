import { ItemEstoque, EventoEstoque, TipoEPI } from '../types';
import { estoqueAPI, historicoEstoqueAPI, tiposEPIAPI } from '../services/api';
import { createEventRegistrar, createEstoqueEventData } from './eventHelpers';
import { isDataVencida, isProximoVencimento as isProximoVencimentoDate } from './dateHelpers';

// Calcular status do item de estoque
export const calcularStatusEstoque = (item: ItemEstoque): 'disponivel' | 'baixo_estoque' | 'vencido' | 'esgotado' => {
  // Verificar se esgotado
  if (item.quantidade === 0) {
    return 'esgotado';
  }
  
  // Verificar se vencido usando helper
  if (isDataVencida(item.dataValidade)) {
    return 'vencido';
  }
  
  // Verificar se baixo estoque
  if (item.quantidade <= item.quantidadeMinima) {
    return 'baixo_estoque';
  }
  
  return 'disponivel';
};

// Verificar se está próximo ao vencimento
export const isProximoVencimento = (item: ItemEstoque, diasAlerta: number = 30): boolean => {
  return isProximoVencimentoDate(item.dataValidade, diasAlerta);
};

// Registrar evento no histórico de estoque usando helper genérico
export const registrarEventoEstoque = createEventRegistrar<EventoEstoque>(
  historicoEstoqueAPI,
  'hist_est'
);

// Usar helpers genéricos para criar eventos
export const {
  cadastro: criarEventoCadastroItem,
  entrada: criarEventoEntrada,
  saida: criarEventoSaida,
  ajuste: criarEventoAjuste
} = createEstoqueEventData;

// Função para processar entrega e reduzir estoque centralizado automaticamente
export const processarEntregaEstoque = async (
  entregaId: string,
  fichaEPIId: string,
  itensEntrega: Array<{ tipoEPIId: string; quantidade: number }>,
  empresaId: string, // Mantido para referência do colaborador, mas não afeta estoque
  colaboradorNome: string,
  responsavel: string
): Promise<{ sucesso: boolean; itensProcessados: any[]; erros: string[] }> => {
  const itensProcessados: any[] = [];
  const erros: string[] = [];
  
  try {
    // Buscar todos os tipos EPI para nomes
    const tiposEPI = await tiposEPIAPI.getAll();
    const getTipoEPI = (id: string) => tiposEPI.find((t: TipoEPI) => t.id === id);
    
    for (const itemEntrega of itensEntrega) {
      try {
        const tipoEPI = getTipoEPI(itemEntrega.tipoEPIId);
        if (!tipoEPI) {
          erros.push(`Tipo EPI ${itemEntrega.tipoEPIId} não encontrado`);
          continue;
        }
        
        // Buscar item no estoque centralizado (estoque único por tipo EPI)
        const itensEstoque = await estoqueAPI.getByTipoEPI(itemEntrega.tipoEPIId);
        const itemEstoque = itensEstoque.find((item: ItemEstoque) => 
          calcularStatusEstoque(item) === 'disponivel'
        );
        
        if (!itemEstoque) {
          erros.push(`Não há estoque disponível de ${tipoEPI.nomeEquipamento}`);
          continue;
        }
        
        // Permitir estoque negativo - apenas alertar se quantidade insuficiente
        if (itemEstoque.quantidade < itemEntrega.quantidade) {
          console.warn(`⚠️ Estoque insuficiente de ${tipoEPI.nomeEquipamento}. Disponível: ${itemEstoque.quantidade}, Solicitado: ${itemEntrega.quantidade}. Permitindo estoque negativo.`);
        }
        
        // Realizar saída do estoque centralizado
        await estoqueAPI.saida(itemEstoque.id, {
          quantidade: itemEntrega.quantidade,
          responsavelId: responsavel,
          motivo: 'Entrega para colaborador',
          entregaId,
          observacoes: `Entrega para ${colaboradorNome} (${empresaId})`
        });
        
        // Registrar evento no histórico de estoque
        await registrarEventoEstoque(
          criarEventoSaida(
            itemEstoque.id,
            tipoEPI.nomeEquipamento,
            itemEstoque.quantidade,
            itemEntrega.quantidade,
            responsavel,
            {
              motivo: 'Entrega para colaborador',
              entregaId,
              fichaEPIId,
              colaboradorNome
            }
          )
        );
        
        itensProcessados.push({
          itemEstoqueId: itemEstoque.id,
          tipoEPI: tipoEPI.nomeEquipamento,
          quantidadeDescontada: itemEntrega.quantidade,
          lote: itemEstoque.lote
        });
        
      } catch (error) {
        console.error(`Erro ao processar item ${itemEntrega.tipoEPIId}:`, error);
        erros.push(`Erro ao processar ${itemEntrega.tipoEPIId}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      }
    }
    
    return {
      sucesso: erros.length === 0,
      itensProcessados,
      erros
    };
    
  } catch (error) {
    console.error('Erro ao processar entrega no estoque:', error);
    return {
      sucesso: false,
      itensProcessados: [],
      erros: [`Erro geral: ${error instanceof Error ? error.message : 'Erro desconhecido'}`]
    };
  }
};

// Função para processar edição de entrega e ajustar estoque
export const processarEdicaoEntregaEstoque = async (
  entregaId: string,
  itensAntigos: Array<{ tipoEPIId: string; quantidade: number }>,
  itensNovos: Array<{ tipoEPIId: string; quantidade: number }>,
  _empresaId: string,
  colaboradorNome: string,
  responsavel: string
): Promise<{ sucesso: boolean; ajustes: any[]; erros: string[] }> => {
  const ajustes: any[] = [];
  const erros: string[] = [];
  
  try {
    // Buscar todos os tipos EPI para nomes
    const tiposEPI = await tiposEPIAPI.getAll();
    const getTipoEPI = (id: string) => tiposEPI.find((t: TipoEPI) => t.id === id);
    
    // Criar mapa de itens antigos e novos para comparação
    const mapaAntigos = new Map<string, number>();
    const mapaNovos = new Map<string, number>();
    
    itensAntigos.forEach(item => {
      mapaAntigos.set(item.tipoEPIId, (mapaAntigos.get(item.tipoEPIId) || 0) + item.quantidade);
    });
    
    itensNovos.forEach(item => {
      mapaNovos.set(item.tipoEPIId, (mapaNovos.get(item.tipoEPIId) || 0) + item.quantidade);
    });
    
    // Identificar todos os tipos EPI afetados
    const todosOsTipos = new Set([...mapaAntigos.keys(), ...mapaNovos.keys()]);
    
    for (const tipoEPIId of todosOsTipos) {
      try {
        const tipoEPI = getTipoEPI(tipoEPIId);
        if (!tipoEPI) {
          erros.push(`Tipo EPI ${tipoEPIId} não encontrado`);
          continue;
        }
        
        const quantidadeAntiga = mapaAntigos.get(tipoEPIId) || 0;
        const quantidadeNova = mapaNovos.get(tipoEPIId) || 0;
        const diferenca = quantidadeNova - quantidadeAntiga;
        
        // Se não há diferença, não fazer nada
        if (diferenca === 0) {
          continue;
        }
        
        // Buscar item no estoque centralizado
        const itensEstoque = await estoqueAPI.getByTipoEPI(tipoEPIId);
        const itemEstoque = itensEstoque.find((item: ItemEstoque) => 
          calcularStatusEstoque(item) === 'disponivel' || item.quantidade >= 0
        );
        
        if (!itemEstoque) {
          erros.push(`Item de estoque não encontrado para ${tipoEPI.nomeEquipamento}`);
          continue;
        }
        
        if (diferenca > 0) {
          // Aumentou a quantidade - fazer saída adicional do estoque
          await estoqueAPI.saida(itemEstoque.id, {
            quantidade: diferenca,
            responsavelId: responsavel,
            motivo: 'Edição de entrega - quantidade aumentada',
            entregaId,
            observacoes: `Edição da entrega para ${colaboradorNome} - acréscimo de ${diferenca} unidade(s)`
          });
          
          // Registrar evento
          await registrarEventoEstoque(
            criarEventoSaida(
              itemEstoque.id,
              tipoEPI.nomeEquipamento,
              itemEstoque.quantidade,
              diferenca,
              responsavel,
              {
                motivo: 'Edição de entrega - quantidade aumentada',
                entregaId,
                colaboradorNome
              }
            )
          );
          
          ajustes.push({
            tipoEPIId,
            nomeEquipamento: tipoEPI.nomeEquipamento,
            tipo: 'saida',
            quantidade: diferenca,
            motivo: 'Edição de entrega - quantidade aumentada'
          });
          
        } else {
          // Diminuiu a quantidade - fazer entrada de volta no estoque
          const quantidadeRetorno = Math.abs(diferenca);
          
          await estoqueAPI.entrada(itemEstoque.id, {
            quantidade: quantidadeRetorno,
            responsavelId: responsavel,
            motivo: 'Edição de entrega - quantidade diminuída',
            observacoes: `Edição da entrega para ${colaboradorNome} - retorno de ${quantidadeRetorno} unidade(s)`
          });
          
          // Registrar evento
          await registrarEventoEstoque(
            criarEventoEntrada(
              itemEstoque.id,
              tipoEPI.nomeEquipamento,
              itemEstoque.quantidade,
              quantidadeRetorno,
              responsavel,
              {
                motivo: 'Edição de entrega - quantidade diminuída'
              }
            )
          );
          
          ajustes.push({
            tipoEPIId,
            nomeEquipamento: tipoEPI.nomeEquipamento,
            tipo: 'entrada',
            quantidade: quantidadeRetorno,
            motivo: 'Edição de entrega - quantidade diminuída'
          });
        }
        
      } catch (error) {
        console.error(`Erro ao processar ajuste para ${tipoEPIId}:`, error);
        erros.push(`Erro ao ajustar ${tipoEPIId}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      }
    }
    
    return {
      sucesso: erros.length === 0,
      ajustes,
      erros
    };
    
  } catch (error) {
    console.error('Erro ao processar edição de entrega no estoque:', error);
    return {
      sucesso: false,
      ajustes: [],
      erros: [`Erro geral: ${error instanceof Error ? error.message : 'Erro desconhecido'}`]
    };
  }
};

// Função para verificar alertas de estoque
export const verificarAlertasEstoque = async (): Promise<{
  baixoEstoque: ItemEstoque[];
  proximosVencimento: ItemEstoque[];
  vencidos: ItemEstoque[];
}> => {
  try {
    const todosItens = await estoqueAPI.getAll();
    
    const baixoEstoque: ItemEstoque[] = [];
    const proximosVencimento: ItemEstoque[] = [];
    const vencidos: ItemEstoque[] = [];
    
    for (const item of todosItens) {
      const status = calcularStatusEstoque(item);
      
      if (status === 'baixo_estoque') {
        baixoEstoque.push(item);
      } else if (status === 'vencido') {
        vencidos.push(item);
      } else if (isProximoVencimento(item)) {
        proximosVencimento.push(item);
      }
    }
    
    return { baixoEstoque, proximosVencimento, vencidos };
  } catch (error) {
    console.error('Erro ao verificar alertas de estoque:', error);
    return { baixoEstoque: [], proximosVencimento: [], vencidos: [] };
  }
};

// Função para processar devolução e aumentar estoque centralizado automaticamente
export const processarDevolucaoEstoque = async (
  _fichaEPIId: string,
  itensDevolucao: Array<{ tipoEPIId: string; quantidade: number; motivo?: string }>,
  empresaId: string, // Mantido para referência do colaborador, mas não afeta estoque
  colaboradorNome: string,
  responsavel: string
): Promise<{ sucesso: boolean; itensProcessados: any[]; erros: string[] }> => {
  const itensProcessados: any[] = [];
  const erros: string[] = [];
  
  try {
    // Buscar todos os tipos EPI para nomes
    const tiposEPI = await tiposEPIAPI.getAll();
    const getTipoEPI = (id: string) => tiposEPI.find((t: TipoEPI) => t.id === id);
    
    for (const itemDevolucao of itensDevolucao) {
      try {
        const tipoEPI = getTipoEPI(itemDevolucao.tipoEPIId);
        if (!tipoEPI) {
          erros.push(`Tipo EPI ${itemDevolucao.tipoEPIId} não encontrado`);
          continue;
        }
        
        // Buscar item no estoque centralizado (único por tipo EPI)
        const itensEstoque = await estoqueAPI.getByTipoEPI(itemDevolucao.tipoEPIId);
        let itemEstoque = itensEstoque.find((item: ItemEstoque) => item.empresaId === 'almoxarifado');
        
        if (!itemEstoque) {
          // Se não existe item de estoque, criar um novo no almoxarifado central
          itemEstoque = await estoqueAPI.create({
            id: `estoque_dev_${Date.now()}_${itemDevolucao.tipoEPIId}`,
            tipoEPIId: itemDevolucao.tipoEPIId,
            empresaId: 'almoxarifado', // ID fixo para almoxarifado central
            quantidade: 0,
            quantidadeMinima: 10,
            localizacao: 'Almoxarifado Central',
            lote: `LOTE-DEV-${Date.now()}`,
            dataValidade: new Date(Date.now() + (tipoEPI.vidaUtilDias * 24 * 60 * 60 * 1000)).toISOString().split('T')[0]
          });
        }
        
        // Realizar entrada (devolução) no estoque centralizado
        await estoqueAPI.entrada(itemEstoque.id, {
          quantidade: itemDevolucao.quantidade,
          responsavelId: responsavel,
          motivo: itemDevolucao.motivo || 'Devolução de colaborador',
          observacoes: `Devolução de ${colaboradorNome} (${empresaId})`
        });
        
        // Registrar evento no histórico de estoque
        await registrarEventoEstoque(
          criarEventoEntrada(
            itemEstoque.id,
            tipoEPI.nomeEquipamento,
            itemEstoque.quantidade,
            itemDevolucao.quantidade,
            responsavel,
            {
              motivo: itemDevolucao.motivo || 'Devolução de colaborador'
            }
          )
        );
        
        itensProcessados.push({
          itemEstoqueId: itemEstoque.id,
          tipoEPI: tipoEPI.nomeEquipamento,
          quantidadeDevolvida: itemDevolucao.quantidade,
          lote: itemEstoque.lote
        });
        
      } catch (error) {
        console.error(`Erro ao processar devolução ${itemDevolucao.tipoEPIId}:`, error);
        erros.push(`Erro ao processar devolução ${itemDevolucao.tipoEPIId}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      }
    }
    
    return {
      sucesso: erros.length === 0,
      itensProcessados,
      erros
    };
    
  } catch (error) {
    console.error('Erro ao processar devolução no estoque:', error);
    return {
      sucesso: false,
      itensProcessados: [],
      erros: [`Erro geral: ${error instanceof Error ? error.message : 'Erro desconhecido'}`]
    };
  }
};

// Função para formatar histórico de movimentações
export const formatarHistoricoMovimentacao = (evento: EventoEstoque): string => {
  const tipos = {
    cadastro: 'Cadastro',
    entrada: 'Entrada',
    saida: 'Saída',
    entrega: 'Entrega',
    ajuste: 'Ajuste',
    devolucao: 'Devolução',
    perda: 'Perda',
    vencimento: 'Vencimento'
  };
  
  return tipos[evento.tipo] || evento.tipo;
};