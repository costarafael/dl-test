import { useState, useMemo } from 'react';
import { ItemEstoque, TipoEPI } from '../types';
import { calcularStatusEstoque } from '../utils/estoqueHelpers';
import { createEntityLookup } from '../utils/entityHelpers';

interface UseInventoryFiltersResult {
  // Estados de filtros
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  filtroStatus: string;
  setFiltroStatus: React.Dispatch<React.SetStateAction<string>>;
  filtroLocalizacao: string;
  setFiltroLocalizacao: React.Dispatch<React.SetStateAction<string>>;
  
  // Dados processados
  itensFiltrados: ItemEstoque[];
  paginatedItens: ItemEstoque[];
  totalPages: number;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  
  // Estatísticas
  estatisticas: {
    totalItens: number;
    totalDisponivel: number;
    estoqueMinimo: number;
    proximoVencimento: number;
  };
  
  // Helpers
  getTipoEPI: (id: string) => TipoEPI | undefined;
}

const ITEMS_PER_PAGE = 10;

export const useInventoryFilters = (
  itensEstoque: ItemEstoque[] | null,
  tiposEPI: TipoEPI[] | null
): UseInventoryFiltersResult => {
  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [filtroLocalizacao, setFiltroLocalizacao] = useState<string>('todas');
  
  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  
  // Helpers para buscar entidades
  const getTipoEPI = createEntityLookup(tiposEPI);
  
  // Filtrar itens
  const itensFiltrados = useMemo(() => {
    if (!itensEstoque) return [];
    
    return itensEstoque.filter(item => {
      const tipoEPI = getTipoEPI(item.tipoEPIId);
      const status = calcularStatusEstoque(item);
      
      // Filtro de busca
      const searchMatch = !searchTerm || 
        tipoEPI?.nomeEquipamento.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tipoEPI?.numeroCA.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.localizacao.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filtro de status
      const statusMatch = filtroStatus === 'todos' || status === filtroStatus;
      
      // Filtro de localização
      const localizacaoMatch = filtroLocalizacao === 'todas' || item.localizacao === filtroLocalizacao;
      
      return searchMatch && statusMatch && localizacaoMatch;
    });
  }, [itensEstoque, searchTerm, filtroStatus, filtroLocalizacao, getTipoEPI]);
  
  // Paginação
  const totalPages = Math.ceil(itensFiltrados.length / ITEMS_PER_PAGE);
  const paginatedItens = itensFiltrados.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  
  // Calcular estatísticas
  const estatisticas = useMemo(() => {
    if (!itensEstoque) {
      return {
        totalItens: 0,
        totalDisponivel: 0,
        estoqueMinimo: 0,
        proximoVencimento: 0
      };
    }
    
    return {
      totalItens: itensEstoque.length,
      totalDisponivel: itensEstoque.reduce((total, item) => total + item.quantidade, 0),
      estoqueMinimo: itensEstoque.filter(item => calcularStatusEstoque(item) === 'baixo_estoque').length,
      proximoVencimento: itensEstoque.filter(item => calcularStatusEstoque(item) === 'vencido').length
    };
  }, [itensEstoque]);
  
  return {
    // Estados de filtros
    searchTerm,
    setSearchTerm,
    filtroStatus,
    setFiltroStatus,
    filtroLocalizacao,
    setFiltroLocalizacao,
    
    // Dados processados
    itensFiltrados,
    paginatedItens,
    totalPages,
    currentPage,
    setCurrentPage,
    
    // Estatísticas
    estatisticas,
    
    // Helpers
    getTipoEPI
  };
};