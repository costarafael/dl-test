import React, { useState } from 'react';
import { TipoEPI } from '../types';
import { tiposEPIAPI } from '../services/api';
import { useAPI } from './useAPI';
import { processEntities } from '../utils/entityHelpers';
import { criarEstoqueParaNovoTipoEPI, removerEstoqueParaTipoEPIExcluido } from '../utils/inventorySync';

interface UseEPICatalogResult {
  // Dados
  tiposEPI: TipoEPI[] | null;
  loading: boolean;
  error: string | null;
  
  // Estados do formulário
  formData: Partial<TipoEPI>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<TipoEPI>>>;
  
  // Estados dos modais
  showNovoTipoModal: boolean;
  setShowNovoTipoModal: React.Dispatch<React.SetStateAction<boolean>>;
  showDetalhesModal: boolean;
  setShowDetalhesModal: React.Dispatch<React.SetStateAction<boolean>>;
  selectedTipo: TipoEPI | null;
  setSelectedTipo: React.Dispatch<React.SetStateAction<TipoEPI | null>>;
  editMode: boolean;
  setEditMode: React.Dispatch<React.SetStateAction<boolean>>;
  
  // Estados de filtros
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  filtroCategoria: string;
  setFiltroCategoria: React.Dispatch<React.SetStateAction<string>>;
  
  // Dados processados
  tiposFiltrados: TipoEPI[];
  paginatedTipos: TipoEPI[];
  totalPages: number;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  
  // Operações
  refetch: () => Promise<void>;
  resetForm: () => void;
  handleInputChange: (field: keyof TipoEPI, value: string | number) => void;
  handleSubmit: () => Promise<void>;
  abrirDetalhes: (tipo: TipoEPI) => void;
  iniciarEdicao: () => void;
  excluirTipo: (tipo: TipoEPI) => Promise<void>;
  duplicarTipo: (tipo: TipoEPI) => void;
}

const INITIAL_FORM_DATA: Partial<TipoEPI> = {
  numeroCA: '',
  nomeEquipamento: '',
  descricao: '',
  fabricante: '',
  categoria: '',
  vidaUtilDias: 365,
  foto: ''
};

export const useEPICatalog = (): UseEPICatalogResult => {
  // Hook para dados da API
  const { data: tiposEPI, loading, error, refetch } = useAPI<TipoEPI[]>(tiposEPIAPI.getAll);
  
  // Estados dos modais
  const [showNovoTipoModal, setShowNovoTipoModal] = useState(false);
  const [showDetalhesModal, setShowDetalhesModal] = useState(false);
  const [selectedTipo, setSelectedTipo] = useState<TipoEPI | null>(null);
  const [editMode, setEditMode] = useState(false);
  
  // Estados de filtros e busca
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todas');
  
  // Estados do formulário
  const [formData, setFormData] = useState<Partial<TipoEPI>>(INITIAL_FORM_DATA);

  // Estados de paginação
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filtrar e processar dados
  const { items: tiposFiltrados } = processEntities(tiposEPI || [], {
    filters: { categoria: filtroCategoria },
    searchTerm,
    searchFields: ['nomeEquipamento', 'numeroCA', 'fabricante'],
    sortField: 'nomeEquipamento',
    sortDirection: 'asc'
  });

  // Paginação
  const totalPages = Math.ceil(tiposFiltrados.length / itemsPerPage);
  const paginatedTipos = tiposFiltrados.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Resetar formulário
  const resetForm = () => {
    setFormData(INITIAL_FORM_DATA);
    setEditMode(false);
  };

  // Handler para mudanças no formulário
  const handleInputChange = (field: keyof TipoEPI, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Submeter formulário (criar ou editar)
  const handleSubmit = async () => {
    try {
      let tipoEPISalvo: TipoEPI;
      
      if (editMode && selectedTipo) {
        // Editar tipo existente
        tipoEPISalvo = await tiposEPIAPI.update(selectedTipo.id, {
          ...selectedTipo,
          ...formData
        });
      } else {
        // Criar novo tipo
        const novoTipo = {
          id: `tipo_${Date.now()}`,
          ...formData
        };
        tipoEPISalvo = await tiposEPIAPI.create(novoTipo);
        
        // Criar automaticamente itens de estoque para todas as empresas
        try {
          console.log('🔄 Criando estoque automaticamente para novo tipo EPI...');
          const resultadoEstoque = await criarEstoqueParaNovoTipoEPI(tipoEPISalvo);
          
          if (resultadoEstoque.sucesso) {
            console.log(`✅ ${resultadoEstoque.itensAdicionados} itens de estoque criados automaticamente`);
          } else {
            console.warn('⚠️ Alguns itens de estoque não foram criados:', resultadoEstoque.erros);
          }
        } catch (error) {
          console.error('❌ Erro ao criar estoque automaticamente:', error);
          // Não falha a operação principal, apenas registra o erro
        }
      }
      
      // Recarregar dados
      await refetch();
      
      // Fechar modal e resetar
      setShowNovoTipoModal(false);
      setShowDetalhesModal(false);
      resetForm();
      setSelectedTipo(null);
      
    } catch (error) {
      console.error('Erro ao salvar tipo EPI:', error);
      throw error; // Re-throw para permitir tratamento na UI
    }
  };

  // Abrir detalhes de um tipo
  const abrirDetalhes = (tipo: TipoEPI) => {
    setSelectedTipo(tipo);
    setShowDetalhesModal(true);
    setEditMode(false);
  };

  // Iniciar edição
  const iniciarEdicao = () => {
    if (selectedTipo) {
      setFormData(selectedTipo);
      setEditMode(true);
    }
  };

  // Excluir tipo
  const excluirTipo = async (tipo: TipoEPI) => {
    try {
      // Primeiro, tentar remover itens de estoque relacionados (apenas os vazios)
      try {
        console.log('🔄 Removendo itens de estoque relacionados...');
        const resultadoEstoque = await removerEstoqueParaTipoEPIExcluido(tipo.id);
        
        if (resultadoEstoque.sucesso) {
          console.log(`✅ ${resultadoEstoque.itensRemovidos} itens de estoque removidos`);
        } else {
          console.warn('⚠️ Alguns itens de estoque não foram removidos:', resultadoEstoque.erros);
          // Continua com a exclusão do tipo mesmo se há itens com estoque
        }
      } catch (error) {
        console.error('❌ Erro ao remover estoque:', error);
        // Não falha a operação principal
      }
      
      // Excluir o tipo EPI
      await tiposEPIAPI.delete(tipo.id);
      await refetch();
    } catch (error) {
      console.error('Erro ao excluir tipo EPI:', error);
      throw error;
    }
  };

  // Duplicar tipo (para criação baseada em existente)
  const duplicarTipo = (tipo: TipoEPI) => {
    setFormData({
      ...tipo,
      numeroCA: '', // CA deve ser único
      nomeEquipamento: `${tipo.nomeEquipamento} (Cópia)`
    });
    setShowNovoTipoModal(true);
    setEditMode(false);
  };

  // Resetar página quando filtros mudarem
  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  // Effect para resetar página quando filtros mudarem
  React.useEffect(() => {
    handleFilterChange();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, filtroCategoria]);

  return {
    // Dados
    tiposEPI,
    loading,
    error,
    
    // Estados do formulário
    formData,
    setFormData,
    
    // Estados dos modais
    showNovoTipoModal,
    setShowNovoTipoModal,
    showDetalhesModal,
    setShowDetalhesModal,
    selectedTipo,
    setSelectedTipo,
    editMode,
    setEditMode,
    
    // Estados de filtros
    searchTerm,
    setSearchTerm,
    filtroCategoria,
    setFiltroCategoria,
    
    // Dados processados
    tiposFiltrados,
    paginatedTipos,
    totalPages,
    currentPage,
    setCurrentPage,
    
    // Operações
    refetch,
    resetForm,
    handleInputChange,
    handleSubmit,
    abrirDetalhes,
    iniciarEdicao,
    excluirTipo,
    duplicarTipo,
  };
};