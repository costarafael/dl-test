import { useState, useEffect } from 'react';
import { FichaEPI, Colaborador, Empresa, Entrega, ItemEntrega } from '../types';
import { operacoesAPI, entregasAPI } from '../services/api';
import { useAPI } from './useAPI';

interface UseFichaDataResult {
  // Estados
  fichaAtual: FichaEPI | null;
  colaborador: Colaborador | null;
  empresa: Empresa | null;
  loading: boolean;
  error: string | null;
  
  // Dados relacionados
  entregas: Entrega[];
  entregasLoading: boolean;
  
  // Operações
  criarEntrega: (itens: ItemEntrega[]) => Promise<void>;
  atualizarEntrega: (entregaId: string, itens: ItemEntrega[]) => Promise<void>;
  excluirEntrega: (entregaId: string) => Promise<void>;
  recarregarDados: () => Promise<void>;
}

export const useFichaData = (fichaId: string): UseFichaDataResult => {
  const [fichaAtual, setFichaAtual] = useState<FichaEPI | null>(null);
  const [colaborador, setColaborador] = useState<Colaborador | null>(null);
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Hook para entregas
  const { 
    data: entregas = [], 
    loading: entregasLoading, 
    refetch: refetchEntregas 
  } = useAPI<Entrega[]>(() => entregasAPI.getByFicha(fichaId), [fichaId]);

  // Carregar dados da ficha completa
  const carregarFichaCompleta = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const dadosCompletos = await operacoesAPI.getFichaCompleta(fichaId);
      
      setFichaAtual(dadosCompletos.ficha);
      setColaborador(dadosCompletos.colaborador || null);
      setEmpresa(dadosCompletos.empresa || null);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar dados da ficha';
      setError(errorMessage);
      console.error('Erro ao carregar ficha completa:', err);
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    if (fichaId) {
      carregarFichaCompleta();
    }
  }, [fichaId]);

  // Criar nova entrega
  const criarEntrega = async (itens: ItemEntrega[]) => {
    try {
      if (!fichaAtual) {
        throw new Error('Ficha não encontrada');
      }

      const novaEntrega = await operacoesAPI.criarEntregaCompleta({
        fichaEPIId: fichaAtual.id,
        itens,
        responsavel: 'Supervisor EPI'
      });

      // Recarregar entregas e ficha
      await Promise.all([
        refetchEntregas(),
        carregarFichaCompleta()
      ]);

      return novaEntrega;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar entrega';
      setError(errorMessage);
      throw err;
    }
  };

  // Atualizar entrega existente
  const atualizarEntrega = async (entregaId: string, itens: ItemEntrega[]) => {
    try {
      await operacoesAPI.editarEntregaCompleta(entregaId, itens);
      
      // Recarregar dados completos
      await Promise.all([
        refetchEntregas(),
        carregarFichaCompleta()
      ]);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar entrega';
      setError(errorMessage);
      throw err;
    }
  };

  // Excluir entrega
  const excluirEntrega = async (entregaId: string) => {
    try {
      await operacoesAPI.excluirEntregaCompleta(entregaId);
      
      // Recarregar dados completos
      await Promise.all([
        refetchEntregas(),
        carregarFichaCompleta()
      ]);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir entrega';
      setError(errorMessage);
      throw err;
    }
  };

  // Recarregar todos os dados
  const recarregarDados = async () => {
    await Promise.all([
      carregarFichaCompleta(),
      refetchEntregas()
    ]);
  };

  return {
    // Estados
    fichaAtual,
    colaborador,
    empresa,
    loading,
    error,
    
    // Dados relacionados
    entregas: entregas || [],
    entregasLoading,
    
    // Operações
    criarEntrega,
    atualizarEntrega,
    excluirEntrega,
    recarregarDados,
  };
};