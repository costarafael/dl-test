import { ItemEstoque, TipoEPI } from '../types';
import { estoqueAPI, tiposEPIAPI } from '../services/api';
import { registrarEventoEstoque, criarEventoCadastroItem } from './estoqueHelpers';

/**
 * Sincroniza automaticamente todos os tipos de EPI do catálogo com o estoque único centralizado
 * Cria um item de estoque para cada tipo EPI que não existe no estoque
 */
export const sincronizarCatalogoComEstoque = async (): Promise<{
  sucesso: boolean;
  itensAdicionados: number;
  erros: string[];
}> => {
  try {
    console.log('🔄 Iniciando sincronização catálogo → estoque centralizado...');
    
    // Buscar todos os tipos EPI e itens de estoque existentes
    const [tiposEPI, itensEstoque] = await Promise.all([
      tiposEPIAPI.getAll(),
      estoqueAPI.getAll()
    ]);

    const erros: string[] = [];
    let itensAdicionados = 0;
    
    console.log(`📋 ${tiposEPI.length} tipos EPI, ${itensEstoque.length} itens em estoque`);

    // Para cada tipo EPI, verificar se existe no estoque centralizado
    for (const tipoEPI of tiposEPI) {
      try {
        // Verificar se já existe item de estoque para este tipo (estoque único, sem empresa)
        const itemExistente = itensEstoque.find((item: any) => item.tipoEPIId === tipoEPI.id);

        if (!itemExistente) {
          // Criar item de estoque com quantidade zero no almoxarifado central
          const novoItemEstoque: Omit<ItemEstoque, 'id'> = {
            tipoEPIId: tipoEPI.id,
            empresaId: 'almoxarifado', // ID fixo para almoxarifado central
            quantidade: 0,
            quantidadeMinima: calcularQuantidadeMinima(tipoEPI),
            localizacao: 'Almoxarifado Central',
            lote: `LOTE-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            dataValidade: calcularDataValidade(tipoEPI)
          };

          const itemCriado = await estoqueAPI.create({
            id: `estoque_${Date.now()}_${tipoEPI.id}`,
            ...novoItemEstoque
          });

          // Registrar evento de cadastro no histórico
          await registrarEventoEstoque(
            criarEventoCadastroItem(
              String(itemCriado.id),
              tipoEPI.nomeEquipamento,
              0,
              'Sistema'
            )
          );

          itensAdicionados++;
          console.log(`✅ Criado item estoque: ${tipoEPI.nomeEquipamento} no almoxarifado central`);
        }
      } catch (error) {
        const mensagemErro = `Erro ao criar item ${tipoEPI.nomeEquipamento}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`;
        erros.push(mensagemErro);
        console.error('❌', mensagemErro);
      }
    }

    console.log(`🎉 Sincronização concluída: ${itensAdicionados} itens adicionados, ${erros.length} erros`);

    return {
      sucesso: erros.length === 0,
      itensAdicionados,
      erros
    };

  } catch (error) {
    const mensagemErro = `Erro geral na sincronização: ${error instanceof Error ? error.message : 'Erro desconhecido'}`;
    console.error('💥', mensagemErro);
    
    return {
      sucesso: false,
      itensAdicionados: 0,
      erros: [mensagemErro]
    };
  }
};

/**
 * Calcula quantidade mínima baseada na categoria do EPI
 */
const calcularQuantidadeMinima = (tipoEPI: TipoEPI): number => {
  const categoriaMinimos: Record<string, number> = {
    'Proteção da Cabeça': 10,
    'Proteção dos Olhos': 20,
    'Proteção Auditiva': 50,
    'Proteção Respiratória': 100,
    'Proteção das Mãos': 20,
    'Proteção dos Pés': 10,
    'Proteção do Corpo': 5,
    'Proteção contra Quedas': 5,
    'Sinalização': 15
  };

  return categoriaMinimos[tipoEPI.categoria] || 10;
};

/**
 * Calcula data de validade baseada na vida útil do EPI
 */
const calcularDataValidade = (tipoEPI: TipoEPI): string => {
  const hoje = new Date();
  const dataValidade = new Date(hoje);
  
  // Adicionar vida útil em dias mais um período extra para estoque
  const diasEstoque = tipoEPI.vidaUtilDias + 365; // +1 ano para margem de estoque
  dataValidade.setDate(dataValidade.getDate() + diasEstoque);
  
  return dataValidade.toISOString().split('T')[0]; // Formato YYYY-MM-DD
};

/**
 * Cria automaticamente item de estoque no almoxarifado central quando um novo tipo EPI é cadastrado
 */
export const criarEstoqueParaNovoTipoEPI = async (tipoEPI: TipoEPI): Promise<{
  sucesso: boolean;
  itensAdicionados: number;
  erros: string[];
}> => {
  try {
    console.log(`🆕 Criando estoque para novo tipo EPI: ${tipoEPI.nomeEquipamento}`);
    
    const erros: string[] = [];
    let itensAdicionados = 0;

    // Criar item de estoque único no almoxarifado central
    try {
      const novoItemEstoque: Omit<ItemEstoque, 'id'> = {
        tipoEPIId: tipoEPI.id,
        empresaId: 'almoxarifado', // ID fixo para almoxarifado central
        quantidade: 0,
        quantidadeMinima: calcularQuantidadeMinima(tipoEPI),
        localizacao: 'Almoxarifado Central',
        lote: `LOTE-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        dataValidade: calcularDataValidade(tipoEPI)
      };

      const itemCriado = await estoqueAPI.create({
        id: `estoque_${Date.now()}_${tipoEPI.id}`,
        ...novoItemEstoque
      });

      // Registrar evento de cadastro
      await registrarEventoEstoque(
        criarEventoCadastroItem(
          String(itemCriado.id),
          tipoEPI.nomeEquipamento,
          0,
          'Sistema'
        )
      );

      itensAdicionados++;
      console.log(`✅ Estoque criado no almoxarifado central`);

    } catch (error) {
      const mensagemErro = `Erro ao criar estoque: ${error instanceof Error ? error.message : 'Erro desconhecido'}`;
      erros.push(mensagemErro);
      console.error('❌', mensagemErro);
    }

    return {
      sucesso: erros.length === 0,
      itensAdicionados,
      erros
    };

  } catch (error) {
    const mensagemErro = `Erro ao criar estoque para novo tipo EPI: ${error instanceof Error ? error.message : 'Erro desconhecido'}`;
    console.error('💥', mensagemErro);
    
    return {
      sucesso: false,
      itensAdicionados: 0,
      erros: [mensagemErro]
    };
  }
};

/**
 * Remove itens de estoque quando um tipo EPI é excluído
 * (apenas se quantidade for 0)
 */
export const removerEstoqueParaTipoEPIExcluido = async (tipoEPIId: string): Promise<{
  sucesso: boolean;
  itensRemovidos: number;
  erros: string[];
}> => {
  try {
    console.log(`🗑️ Removendo estoque para tipo EPI excluído: ${tipoEPIId}`);
    
    // Buscar todos os itens de estoque deste tipo
    const itensEstoque = await estoqueAPI.getByTipoEPI(tipoEPIId);
    
    const erros: string[] = [];
    let itensRemovidos = 0;

    for (const item of itensEstoque) {
      try {
        if (item.quantidade === 0) {
          // Só remove se não há estoque
          await estoqueAPI.delete(item.id);
          itensRemovidos++;
          console.log(`✅ Item de estoque removido: ${item.id}`);
        } else {
          erros.push(`Item ${item.id} não removido - possui quantidade ${item.quantidade}`);
        }
      } catch (error) {
        const mensagemErro = `Erro ao remover item ${item.id}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`;
        erros.push(mensagemErro);
        console.error('❌', mensagemErro);
      }
    }

    return {
      sucesso: erros.length === 0,
      itensRemovidos,
      erros
    };

  } catch (error) {
    const mensagemErro = `Erro ao remover estoque para tipo EPI: ${error instanceof Error ? error.message : 'Erro desconhecido'}`;
    console.error('💥', mensagemErro);
    
    return {
      sucesso: false,
      itensRemovidos: 0,
      erros: [mensagemErro]
    };
  }
};