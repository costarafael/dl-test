import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Button, 
  TextInput, 
  Select,
  Label, 
  Table, 
  Modal, 
  Badge,
  Pagination, 
  Dropdown 
} from 'flowbite-react';
import { 
 
  EllipsisVerticalIcon, 
  UserPlusIcon, 
  EyeIcon,
  DocumentDuplicateIcon,
  ArrowDownTrayIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import SearchableDropdown from '../components/common/SearchableDropdown';
import { FichaEPI, Colaborador, Empresa } from '../types';
import { colaboradoresAPI, empresasAPI } from '../services/api';
import { useFichasEPI, useAPI } from '../hooks/useAPI';
import StatusIndicator from '../components/StatusIndicator';
import { format } from 'date-fns';
import { registrarEventoHistorico, criarEventoFichaCriada } from '../utils/historicoHelpers';

const FichasEPIPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Hook para gerenciar fichas via API
  const { fichas, loading, error, createFicha, loadFichas } = useFichasEPI();
  
  // Hooks para carregar dados da API
  const { data: empresas, loading: loadingEmpresas } = useAPI<Empresa[]>(empresasAPI.getAll);
  const { data: colaboradores } = useAPI<Colaborador[]>(colaboradoresAPI.getAll);
  
  // Estados da aplicação
  const [showNovaFichaModal, setShowNovaFichaModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [filtroEmpresa, setFiltroEmpresa] = useState<string>('todas');
  
  // Estados do modal Nova Ficha
  const [selectedEmpresa, setSelectedEmpresa] = useState<string>('');
  const [selectedColaborador, setSelectedColaborador] = useState<string>('');

  const getColaborador = (colaboradorId: string): Colaborador | undefined => {
    return colaboradores?.find(c => c.id === colaboradorId);
  };

  const getEmpresa = (empresaId: string) => {
    return empresas?.find(e => e.id === empresaId);
  };
  
  
  
  const getColaboradoresEmpresa = (empresaId: string): Colaborador[] => {
    return colaboradores?.filter(c => c.empresaId === empresaId && c.status === 'ativo' && !c.temFichaAtiva) || [];
  };


  const formatarData = (data: Date | string | null | undefined): string => {
    if (!data) return '';
    const date = typeof data === 'string' ? new Date(data) : data;
    return format(date, 'dd/MM/yyyy');
  };
  
  const fichasFiltradas = fichas.filter(ficha => {
    const statusMatch = filtroStatus === 'todos' || ficha.status === filtroStatus;
    const empresaMatch = filtroEmpresa === 'todas' || ficha.empresaId === filtroEmpresa;
    const colaborador = getColaborador(ficha.colaboradorId);
    const searchMatch = !searchTerm || 
      colaborador?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      colaborador?.cargo.toLowerCase().includes(searchTerm.toLowerCase());
    return statusMatch && empresaMatch && searchMatch;
  });

  const abrirFicha = (ficha: FichaEPI) => {
    navigate(`/fichas/${ficha.id}`);
  };

  const contarItensAtivos = (ficha: FichaEPI): number => {
    return ficha.itens?.filter(item => item.status === 'entregue').length || 0;
  };


  // Estado e lógica de paginação
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(fichasFiltradas.length / itemsPerPage);
  const paginatedFichas = fichasFiltradas.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const onPageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  // Mostrar loading se estiver carregando
  const isLoading = loading || loadingEmpresas;
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando fichas...</p>
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
              <h3 className="text-sm font-medium text-red-800">Erro ao carregar fichas</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
                <p className="mt-2">Verifique se o JSON Server está rodando na porta 3001.</p>
              </div>
              <div className="mt-4">
                <Button
                  onClick={loadFichas}
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
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Fichas de EPI</h1>
              <p className="text-gray-500 dark:text-gray-400">Gerencie fichas de equipamentos de proteção individual</p>
            </div>
            <div className="w-full md:w-auto flex flex-col md:flex-row space-y-2 md:space-y-0 items-stretch md:items-center justify-end md:space-x-3 flex-shrink-0">
              <Button 
                onClick={() => setShowNovaFichaModal(true)} 
                color="primary"
                sizing="xs"
                className="rounded-sm"
              >
                <UserPlusIcon className="w-4 h-4 mr-2" />
                Nova ficha
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
                  Exportar
                </Dropdown.Item>
                <Dropdown.Item icon={DocumentDuplicateIcon}>
                  Duplicar selecionados
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
                  placeholder="Buscar fichas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  sizing="sm"
                  className="pl-10 rounded-sm"
                />
              </div>
            </div>
            <div className="w-full md:w-auto flex flex-col md:flex-row space-y-2 md:space-y-0 items-stretch md:items-center justify-end md:space-x-3 flex-shrink-0">
              <Select 
                value={filtroStatus} 
                onChange={(e) => setFiltroStatus(e.target.value)} 
                sizing="sm"
                className="rounded-sm"
              >
                <option value="todos">Todos os status</option>
                <option value="ativo">Ativo</option>
                <option value="suspenso">Suspenso</option>
                <option value="arquivado">Arquivado</option>
              </Select>
              <SearchableDropdown
                options={empresas?.map(empresa => ({
                  value: empresa.id,
                  label: empresa.nome
                })) || []}
                value={filtroEmpresa}
                onChange={setFiltroEmpresa}
                placeholder="Selecionar empresa..."
                searchPlaceholder="Buscar empresas..."
                allOptionsLabel="Todas as empresas"
                sizing="sm"
                disabled={loadingEmpresas}
              />
              <Button color="light" sizing="xs" className="rounded-sm">
                <FunnelIcon className="w-4 h-4 mr-2" />
                Filtros
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <Table hoverable className="min-w-full">
              <Table.Head>
                <Table.HeadCell>Colaborador</Table.HeadCell>
                <Table.HeadCell>Empresa</Table.HeadCell>
                <Table.HeadCell>EPIs Ativos</Table.HeadCell>
                <Table.HeadCell>Status</Table.HeadCell>
                <Table.HeadCell>Última Atualização</Table.HeadCell>
                <Table.HeadCell className="w-20">
                  <span className="sr-only">Ações</span>
                </Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y">
                {paginatedFichas.length > 0 ? (
                  paginatedFichas.map((ficha) => {
                    const colaborador = getColaborador(ficha.colaboradorId);
                    const empresa = getEmpresa(ficha.empresaId);
                    
                    if (!colaborador || !empresa) return null;

                    return (
                      <Table.Row 
                        key={ficha.id} 
                        className="bg-white dark:border-gray-700 dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer"
                        onClick={() => abrirFicha(ficha)}
                      >
                        <Table.Cell>
                          <div className="font-medium text-gray-900 dark:text-white">{colaborador.nome}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{colaborador.cargo}</div>
                        </Table.Cell>
                        <Table.Cell>
                          <div className="text-sm text-gray-900 dark:text-white">{empresa.nome}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{empresa.cnpj}</div>
                        </Table.Cell>
                        <Table.Cell>
                          <Badge color="primary" size="sm" className="w-fit">
                            {contarItensAtivos(ficha)}
                          </Badge>
                        </Table.Cell>
                        <Table.Cell>
                          <StatusIndicator status={ficha.status} />
                        </Table.Cell>
                        <Table.Cell>
                          <div className="text-sm text-gray-900 dark:text-white">
                            {formatarData(ficha.dataEmissao)}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {ficha.itens?.length || 0} itens
                          </div>
                        </Table.Cell>
                        <Table.Cell>
                          <div className="flex justify-end">
                            <Button 
                              sizing="xs" 
                              color="primary"
                              onClick={(e: React.MouseEvent) => {
                                e.stopPropagation();
                                abrirFicha(ficha);
                              }}
                              title="Visualizar"
                              className="rounded-sm"
                            >
                              <EyeIcon className="w-4 h-4" />
                            </Button>
                          </div>
                        </Table.Cell>
                      </Table.Row>
                    );
                  })
                ) : (
                  <Table.Row>
                    <Table.Cell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center">
                        <p className="text-gray-500 dark:text-gray-400">Nenhuma ficha encontrada</p>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                )}
              </Table.Body>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0 p-4">
            <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
              Mostrando <span className="font-semibold text-gray-900 dark:text-white">{((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, fichasFiltradas.length)}</span> de <span className="font-semibold text-gray-900 dark:text-white">{fichasFiltradas.length}</span>
            </span>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
              showIcons
              className="mb-4"
            />
          </div>
        </div>
      </div>

      {/* Modal Nova Ficha */}
      <Modal 
        show={showNovaFichaModal} 
        onClose={() => {
          setShowNovaFichaModal(false);
          // Reset form
          setSelectedEmpresa('');
          setSelectedColaborador('');
        }} 
        size="xl"
      >
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
            Nova Ficha de EPI
          </h3>
          <div className="space-y-6">
            {/* Seleção de Empresa Contratada */}
            <div>
              <Label htmlFor="empresa" className="text-gray-700 dark:text-gray-300 mb-2 block">
                Empresa Contratada <span className="text-red-500">*</span>
              </Label>
              <SearchableDropdown
                options={empresas?.filter(e => e.tipo === 'contratada').map(empresa => ({
                  value: empresa.id,
                  label: empresa.nome
                })) || []}
                value={selectedEmpresa}
                onChange={(value) => {
                  setSelectedEmpresa(value);
                  setSelectedColaborador(''); // Reset colaborador
                }}
                placeholder="Selecione uma empresa..."
                searchPlaceholder="Buscar empresas..."
                allOptionsLabel="Selecione"
                sizing="sm"
                disabled={loadingEmpresas}
              />
            </div>

            {/* Seleção de Colaborador */}
            {selectedEmpresa && (
              <div>
                <Label htmlFor="colaborador" className="text-gray-700 dark:text-gray-300 mb-2 block">
                  Colaborador <span className="text-red-500">*</span>
                </Label>
                <SearchableDropdown
                  options={getColaboradoresEmpresa(selectedEmpresa).map(colaborador => ({
                    value: colaborador.id,
                    label: `${colaborador.nome} - CPF: ${colaborador.cpf}`,
                    subtitle: colaborador.cargo
                  }))}
                  value={selectedColaborador}
                  onChange={setSelectedColaborador}
                  placeholder="Selecione um colaborador..."
                  searchPlaceholder="Buscar por nome ou CPF..."
                  sizing="sm"
                  showSubtitle
                />
              </div>
            )}

          </div>
          
          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button 
              onClick={() => {
                setShowNovaFichaModal(false);
                // Reset form
                setSelectedEmpresa('');
                setSelectedColaborador('');
              }} 
              color="gray" 
              sizing="xs" 
              className="rounded-sm"
            >
              Cancelar
            </Button>
            <Button 
              onClick={async () => {
                if (selectedEmpresa && selectedColaborador) {
                  try {
                    // Criar nova ficha
                    const hoje = new Date();
                    const proximoAno = new Date(hoje);
                    proximoAno.setFullYear(proximoAno.getFullYear() + 1);
                    
                    const novaFicha = {
                      id: `nova_${Date.now()}`, // ID único baseado em timestamp
                      colaboradorId: selectedColaborador,
                      empresaId: selectedEmpresa,
                      dataEmissao: hoje.toISOString(),
                      dataValidade: proximoAno.toISOString(),
                      status: 'ativo',
                      itens: []
                    };
                    
                    // Criar via API
                    const fichaCriada = await createFicha(novaFicha);
                    
                    // Registrar evento no histórico
                    const colaborador = colaboradores?.find(c => c.id === selectedColaborador);
                    if (colaborador) {
                      await registrarEventoHistorico(
                        criarEventoFichaCriada(fichaCriada.id, colaborador.nome)
                      );
                    }
                    
                    console.log('Nova ficha criada:', fichaCriada);
                    
                    // Recarregar colaboradores para atualizar temFichaAtiva
                    // (Isto seria feito automaticamente se tivéssemos um hook para atualizar colaboradores)
                    
                    // Fechar modal e resetar form
                    setShowNovaFichaModal(false);
                    setSelectedEmpresa('');
                    setSelectedColaborador('');
                    
                    // Navegar para a nova ficha
                    navigate(`/fichas/${fichaCriada.id}`);
                  } catch (error) {
                    console.error('Erro ao criar ficha:', error);
                    alert('Erro ao criar ficha. Verifique se o JSON Server está rodando.');
                  }
                }
              }}
              color="primary" 
              sizing="xs" 
              className="rounded-sm"
              disabled={!selectedEmpresa || !selectedColaborador}
            >
              Criar Ficha
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default FichasEPIPage;