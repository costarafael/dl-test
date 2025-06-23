import React from 'react';
import { 
  Button, 
  TextInput, 
  Label, 
  Pagination, 
  Dropdown
} from 'flowbite-react';
import { 
  EllipsisVerticalIcon, 
  PlusIcon, 
  ArrowDownTrayIcon,
  DocumentDuplicateIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import SearchableDropdown from '../components/common/SearchableDropdown';
import EPIFormModal from '../components/epi/EPIFormModal';
import EPIDetailsModal from '../components/epi/EPIDetailsModal';
import EPITable from '../components/epi/EPITable';
import { useEPICatalog } from '../hooks/useEPICatalog';
import { EPI_CATEGORIES } from '../constants/epiConstants';

const CatalogoEPIsPage: React.FC = () => {
  // Hook principal que gerencia todos os estados e operações
  const {
    // Dados
    loading,
    error,
    
    // Estados do formulário
    formData,
    
    // Estados dos modais
    showNovoTipoModal,
    setShowNovoTipoModal,
    showDetalhesModal,
    setShowDetalhesModal,
    selectedTipo,
    editMode,
    
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
    duplicarTipo
  } = useEPICatalog();

  const onPageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const handleCancelEdit = () => {
    resetForm();
  };

  // Mostrar loading se estiver carregando
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando catálogo...</p>
        </div>
      </div>
    );
  }

  // Mostrar erro se houver
  if (error) {
    return (
      <div className="max-w-4xl mx-auto mt-8 p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Erro ao carregar catálogo</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
                <p className="mt-2">Verifique se o JSON Server está rodando na porta 3001.</p>
              </div>
              <div className="mt-4">
                <Button
                  onClick={refetch}
                  color="failure"
                  size="sm"
                  className="rounded-sm"
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
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Catálogo de EPIs</h1>
              <p className="text-gray-500 dark:text-gray-400">Gerencie tipos de equipamentos de proteção individual</p>
            </div>
            <div className="w-full md:w-auto flex flex-col md:flex-row space-y-2 md:space-y-0 items-stretch md:items-center justify-end md:space-x-3 flex-shrink-0">
              <Button 
                onClick={() => {
                  resetForm();
                  setShowNovoTipoModal(true);
                }} 
                color="primary"
                sizing="xs"
                className="rounded-sm"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Novo tipo EPI
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
                  Exportar catálogo
                </Dropdown.Item>
                <Dropdown.Item icon={DocumentDuplicateIcon}>
                  Importar tipos
                </Dropdown.Item>
              </Dropdown>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 p-4 border-t dark:border-gray-700">
            <div className="w-full md:w-1/3">
              <Label htmlFor="table-search" className="sr-only">Buscar</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"></path>
                  </svg>
                </div>
                <TextInput
                  id="table-search"
                  placeholder="Buscar por nome, CA ou fabricante..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  sizing="sm"
                  className="pl-10 rounded-sm"
                />
              </div>
            </div>
            <div className="w-full md:w-auto flex flex-col md:flex-row space-y-2 md:space-y-0 items-stretch md:items-center justify-end md:space-x-3 flex-shrink-0">
              <SearchableDropdown
                options={EPI_CATEGORIES.map(cat => ({
                  value: cat,
                  label: cat
                }))}
                value={filtroCategoria}
                onChange={setFiltroCategoria}
                placeholder="Selecionar categoria..."
                searchPlaceholder="Buscar categorias..."
                allOptionsLabel="Todas as categorias"
                sizing="sm"
              />
              <Button color="light" sizing="xs" className="rounded-sm">
                <FunnelIcon className="w-4 h-4 mr-2" />
                Filtros
              </Button>
            </div>
          </div>

          {/* Table */}
          <EPITable 
            tipos={paginatedTipos}
            onView={abrirDetalhes}
            onDuplicate={duplicarTipo}
            onDelete={excluirTipo}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0 p-4">
              <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                Mostrando <span className="font-semibold text-gray-900 dark:text-white">{((currentPage - 1) * 10) + 1}-{Math.min(currentPage * 10, tiposFiltrados.length)}</span> de <span className="font-semibold text-gray-900 dark:text-white">{tiposFiltrados.length}</span>
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
      <EPIFormModal
        show={showNovoTipoModal}
        onClose={() => {
          setShowNovoTipoModal(false);
          resetForm();
        }}
        onSave={handleSubmit}
        formData={formData}
        onChange={handleInputChange}
        editMode={editMode}
      />

      <EPIDetailsModal
        show={showDetalhesModal}
        onClose={() => {
          setShowDetalhesModal(false);
          resetForm();
        }}
        tipo={selectedTipo}
        formData={formData}
        onChange={handleInputChange}
        onEdit={iniciarEdicao}
        onSave={handleSubmit}
        editMode={editMode}
        onCancelEdit={handleCancelEdit}
      />
    </div>
  );
};

export default CatalogoEPIsPage;