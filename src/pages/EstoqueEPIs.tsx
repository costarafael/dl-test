import React, { useState } from 'react';
import { 
  Button, 
  Dropdown,
  Pagination
} from 'flowbite-react';
import { 
  EllipsisVerticalIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

// Componentes extraídos
import InventoryStats from '../components/inventory/InventoryStats';
import InventoryFilters from '../components/inventory/InventoryFilters';
import InventoryTable from '../components/inventory/InventoryTable';
import MovementModal from '../components/inventory/MovementModal';
import HistoryModal from '../components/inventory/HistoryModal';
import NewMovementModal from '../components/inventory/NewMovementModal';

// Hooks
import { useAPI } from '../hooks/useAPI';
import { useInventoryMovements } from '../hooks/useInventoryMovements';
import { useInventoryFilters } from '../hooks/useInventoryFilters';

// Types e APIs
import { ItemEstoque, TipoEPI } from '../types';
import { estoqueAPI, tiposEPIAPI } from '../services/api';

const EstoqueEPIsPage: React.FC = () => {
  const navigate = useNavigate();
  const [showNewMovementModal, setShowNewMovementModal] = useState(false);
  
  // Hooks para carregar dados da API
  const { data: itensEstoque, loading, error, refetch } = useAPI<ItemEstoque[]>(estoqueAPI.getAll);
  const { data: tiposEPI } = useAPI<TipoEPI[]>(tiposEPIAPI.getAll);
  
  // Hook para movimentações de estoque
  const {
    showMovimentacaoModal,
    setShowMovimentacaoModal,
    showHistoricoModal,
    setShowHistoricoModal,
    tipoMovimentacao,
    selectedItem,
    setSelectedItem,
    formData,
    abrirMovimentacao,
    executarMovimentacao,
    resetForm,
    handleInputChange
  } = useInventoryMovements(refetch);
  
  // Hook para filtros e paginação
  const {
    searchTerm,
    setSearchTerm,
    filtroStatus,
    setFiltroStatus,
    filtroLocalizacao,
    setFiltroLocalizacao,
    paginatedItens,
    totalPages,
    currentPage,
    setCurrentPage,
    estatisticas,
    getTipoEPI
  } = useInventoryFilters(itensEstoque, tiposEPI);
  
  // Localizações únicas para filtro
  const localizacoes = [...new Set(itensEstoque?.map(item => item.localizacao) || [])];
  
  // Handlers para ações da tabela
  const handleAjuste = (item: ItemEstoque) => {
    abrirMovimentacao(item, 'ajuste');
  };
  
  const handleHistorico = (item: ItemEstoque) => {
    setSelectedItem(item);
    setShowHistoricoModal(true);
  };
  
  const onPageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  // Handler para nova movimentação multi-item
  const handleNewMovement = async (movementData: any) => {
    try {
      const { movimentacaoNotasAPI } = await import('../services/api');
      await movimentacaoNotasAPI.criarMovimentacao(movementData);
      await refetch(); // Recarregar estoque
    } catch (error) {
      console.error('Erro ao criar movimentação:', error);
      throw error;
    }
  };

  // Sincronização automática removida - itens são criados automaticamente no catálogo

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando estoque...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-4xl mx-auto mt-8 p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Erro ao carregar estoque</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <Button
                  onClick={refetch}
                  color="gray"
                  size="sm"
                >
                  Tentar novamente
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-full">
        {/* Header */}
        <div className="bg-white dark:bg-gray-900 relative shadow-md sm:rounded-lg overflow-hidden">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 p-4">
            <div className="w-full md:w-1/2">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Estoque de EPIs</h1>
              <p className="text-gray-500 dark:text-gray-400">Controle movimentações e inventário de equipamentos de proteção</p>
            </div>
            <div className="w-full md:w-auto flex flex-col md:flex-row space-y-2 md:space-y-0 items-stretch md:items-center justify-end md:space-x-3 flex-shrink-0">
              <Button 
                onClick={() => setShowNewMovementModal(true)}
                color="primary"
                sizing="xs"
                className="rounded-sm"
              >
                <ArrowUpTrayIcon className="w-4 h-4 mr-2" />
                Nova Movimentação
              </Button>
              <Button 
                onClick={() => navigate('/movimentacoes')}
                color="gray"
                sizing="xs"
                className="rounded-sm"
              >
                <ClipboardDocumentListIcon className="w-4 h-4 mr-2" />
                Ver Movimentações
              </Button>
              <Dropdown
                label=""
                dismissOnClick={false}
                renderTrigger={() => (
                  <Button color="light" sizing="xs" className="rounded-sm">
                    <EllipsisVerticalIcon className="w-4 h-4" />
                  </Button>
                )}
              >
                <Dropdown.Item icon={ArrowDownTrayIcon}>
                  Exportar relatório
                </Dropdown.Item>
              </Dropdown>
            </div>
          </div>

          {/* Estatísticas */}
          <InventoryStats stats={estatisticas} />

          {/* Filtros */}
          <InventoryFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filtroStatus={filtroStatus}
            setFiltroStatus={setFiltroStatus}
            filtroLocalizacao={filtroLocalizacao}
            setFiltroLocalizacao={setFiltroLocalizacao}
            localizacoes={localizacoes}
          />

          {/* Tabela */}
          <InventoryTable
            itens={paginatedItens}
            getTipoEPI={getTipoEPI}
            onAjuste={handleAjuste}
            onHistorico={handleHistorico}
          />

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0 p-4">
              <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                Mostrando <span className="font-semibold text-gray-900 dark:text-white">{((currentPage - 1) * 10) + 1}-{Math.min(currentPage * 10, paginatedItens.length)}</span> de <span className="font-semibold text-gray-900 dark:text-white">{paginatedItens.length}</span>
              </span>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={onPageChange}
                showIcons
              />
            </div>
          )}
        </div>
      </div>

      {/* Modais */}
      {/* Modal para ajustes individuais (mantido para compatibilidade) */}
      <MovementModal
        show={showMovimentacaoModal}
        onClose={() => {
          setShowMovimentacaoModal(false);
          resetForm();
        }}
        onSave={executarMovimentacao}
        item={selectedItem}
        tipo={tipoMovimentacao}
        formData={formData}
        onChange={handleInputChange}
        getTipoEPI={getTipoEPI}
      />

      {/* Novo modal para movimentações multi-item */}
      <NewMovementModal
        show={showNewMovementModal}
        onClose={() => setShowNewMovementModal(false)}
        onSave={handleNewMovement}
        tiposEPI={tiposEPI || []}
        estoque={itensEstoque || []}
        isLoading={loading}
      />

      <HistoryModal
        show={showHistoricoModal}
        onClose={() => {
          setShowHistoricoModal(false);
          setSelectedItem(null);
        }}
        item={selectedItem}
        getTipoEPI={getTipoEPI}
      />
    </div>
  );
};

export default EstoqueEPIsPage;