import React, { useState } from 'react';
import { Card, Tabs, Badge, Button, Table, TextInput, Select } from 'flowbite-react';
import { PlusIcon, MagnifyingGlassIcon, PencilIcon, EyeIcon } from '@heroicons/react/24/outline';
import { NotaEntrada, NotaSaida } from '../types';
import { useAPI } from '../hooks/useAPI';
import { notasEntradaAPI, notasSaidaAPI, tiposEPIAPI, estoqueAPI, movimentacaoNotasAPI } from '../services/api';
import { formatarData } from '../utils/dateHelpers';
import NewMovementModal from '../components/inventory/NewMovementModal';

const MovimentacoesEstoque: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'entradas' | 'saidas'>('entradas');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'pendente' | 'processada' | 'cancelada'>('todos');
  const [showNewModal, setShowNewModal] = useState(false);

  // Carregar dados
  const { data: notasEntrada = [], loading: loadingEntradas, refetch: refetchEntradas } = useAPI(notasEntradaAPI.getAll);
  const { data: notasSaida = [], loading: loadingSaidas, refetch: refetchSaidas } = useAPI(notasSaidaAPI.getAll);
  const { data: tiposEPI = [], loading: loadingTipos } = useAPI(tiposEPIAPI.getAll);
  const { data: estoque = [] } = useAPI(estoqueAPI.getAll);


  const isLoading = loadingEntradas || loadingSaidas || loadingTipos;

  // Filtrar dados baseado na aba ativa
  const currentData = activeTab === 'entradas' ? (notasEntrada || []) : (notasSaida || []);
  
  // Aplicar filtros
  const filteredData = currentData.filter((nota: any) => {
    const searchMatch = searchTerm === '' || 
      nota.numeroNota?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nota.responsavel?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nota.motivo?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const statusMatch = statusFilter === 'todos' || nota.status === statusFilter;
    
    return searchMatch && statusMatch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pendente':
        return <Badge color="warning" className="w-fit">Pendente</Badge>;
      case 'processada':
        return <Badge color="success" className="w-fit">Processada</Badge>;
      case 'cancelada':
        return <Badge color="failure" className="w-fit">Cancelada</Badge>;
      default:
        return <Badge color="gray" className="w-fit">{status}</Badge>;
    }
  };

  const handleNewMovement = async (movementData: any) => {
    try {
      await movimentacaoNotasAPI.criarMovimentacao(movementData);
      
      // Refetch dados
      if (movementData.tipo === 'entrada') {
        await refetchEntradas();
      } else {
        await refetchSaidas();
      }
    } catch (error) {
      console.error('Erro ao criar movimentação:', error);
      throw error;
    }
  };

  const handleEditNote = (nota: NotaEntrada | NotaSaida) => {
    console.log('Edit note:', nota);
    // TODO: Implementar modal de edição
  };

  const handleViewNote = (nota: NotaEntrada | NotaSaida) => {
    console.log('View note:', nota);
    // TODO: Implementar modal de visualização
  };

  const calculateTotal = (nota: NotaEntrada | NotaSaida) => {
    if ('valorTotal' in nota && nota.valorTotal) {
      return `R$ ${nota.valorTotal.toFixed(2)}`;
    }
    return '-';
  };

  const getItemsCount = (nota: NotaEntrada | NotaSaida) => {
    return nota.itens.reduce((total: number, item: any) => total + item.quantidade, 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Movimentações de Estoque
        </h1>
        <Button
          onClick={() => setShowNewModal(true)}
          color="primary"
          size="sm"
          className="rounded-sm"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Nova Movimentação
        </Button>
      </div>

      {/* Filtros */}
      <Card className="rounded-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Buscar
            </label>
            <div className="relative">
              <TextInput
                icon={MagnifyingGlassIcon}
                placeholder="Buscar por número, responsável ou motivo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sizing="sm"
                className="rounded-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              sizing="sm"
              className="rounded-sm"
            >
              <option value="todos">Todos os status</option>
              <option value="pendente">Pendente</option>
              <option value="processada">Processada</option>
              <option value="cancelada">Cancelada</option>
            </Select>
          </div>
          <div className="flex items-end">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">{filteredData.length}</span> registro(s) encontrado(s)
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs de Entrada/Saída */}
      <Card className="rounded-sm">
        <Tabs.Group
          style="underline"
          onActiveTabChange={(tab) => setActiveTab(tab === 0 ? 'entradas' : 'saidas')}
        >
          <Tabs.Item title={`Notas de Entrada (${(notasEntrada || []).length})`} active={activeTab === 'entradas'}>
            <div className="space-y-4">
              {/* Estatísticas das Entradas */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <div className="text-sm text-green-600 dark:text-green-400">Total Processadas</div>
                  <div className="text-xl font-semibold text-green-700 dark:text-green-300">
                    {(notasEntrada || []).filter((n: any) => n.status === 'processada').length}
                  </div>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                  <div className="text-sm text-yellow-600 dark:text-yellow-400">Pendentes</div>
                  <div className="text-xl font-semibold text-yellow-700 dark:text-yellow-300">
                    {(notasEntrada || []).filter((n: any) => n.status === 'pendente').length}
                  </div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="text-sm text-blue-600 dark:text-blue-400">Valor Total</div>
                  <div className="text-xl font-semibold text-blue-700 dark:text-blue-300">
                    R$ {(notasEntrada || [])
                      .filter((n: any) => n.status === 'processada')
                      .reduce((total: number, n: any) => total + (n.valorTotal || 0), 0)
                      .toFixed(2)}
                  </div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                  <div className="text-sm text-purple-600 dark:text-purple-400">Itens Recebidos</div>
                  <div className="text-xl font-semibold text-purple-700 dark:text-purple-300">
                    {(notasEntrada || [])
                      .filter((n: any) => n.status === 'processada')
                      .reduce((total: number, n: any) => total + getItemsCount(n), 0)} un.
                  </div>
                </div>
              </div>

              {/* Tabela de Entradas */}
              <div className="overflow-x-auto">
                <Table>
                  <Table.Head>
                    <Table.HeadCell>Número da Nota</Table.HeadCell>
                    <Table.HeadCell>Data</Table.HeadCell>
                    <Table.HeadCell>Responsável</Table.HeadCell>
                    <Table.HeadCell>Fornecedor</Table.HeadCell>
                    <Table.HeadCell>Valor Total</Table.HeadCell>
                    <Table.HeadCell>Itens</Table.HeadCell>
                    <Table.HeadCell>Status</Table.HeadCell>
                    <Table.HeadCell>Ações</Table.HeadCell>
                  </Table.Head>
                  <Table.Body>
                    {filteredData.map((nota: any) => (
                      <Table.Row key={nota.id}>
                        <Table.Cell className="font-medium">
                          {nota.numeroNota}
                        </Table.Cell>
                        <Table.Cell>
                          {formatarData(nota.data)}
                        </Table.Cell>
                        <Table.Cell>{nota.responsavel}</Table.Cell>
                        <Table.Cell>
                          {'fornecedor' in nota ? nota.fornecedor || '-' : '-'}
                        </Table.Cell>
                        <Table.Cell>{calculateTotal(nota)}</Table.Cell>
                        <Table.Cell>
                          <Badge color="blue" className="w-fit">
                            {getItemsCount(nota)} un.
                          </Badge>
                        </Table.Cell>
                        <Table.Cell>{getStatusBadge(nota.status)}</Table.Cell>
                        <Table.Cell>
                          <div className="flex space-x-2">
                            <Button
                              onClick={() => handleViewNote(nota)}
                              color="gray"
                              size="xs"
                              className="rounded-sm"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </Button>
                            <Button
                              onClick={() => handleEditNote(nota)}
                              color="primary"
                              size="xs"
                              className="rounded-sm"
                              disabled={nota.status === 'cancelada'}
                            >
                              <PencilIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              </div>
            </div>
          </Tabs.Item>

          <Tabs.Item title={`Notas de Saída (${(notasSaida || []).length})`} active={activeTab === 'saidas'}>
            <div className="space-y-4">
              {/* Estatísticas das Saídas */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                  <div className="text-sm text-red-600 dark:text-red-400">Total Processadas</div>
                  <div className="text-xl font-semibold text-red-700 dark:text-red-300">
                    {(notasSaida || []).filter((n: any) => n.status === 'processada').length}
                  </div>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                  <div className="text-sm text-yellow-600 dark:text-yellow-400">Pendentes</div>
                  <div className="text-xl font-semibold text-yellow-700 dark:text-yellow-300">
                    {(notasSaida || []).filter((n: any) => n.status === 'pendente').length}
                  </div>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                  <div className="text-sm text-orange-600 dark:text-orange-400">Itens Expedidos</div>
                  <div className="text-xl font-semibold text-orange-700 dark:text-orange-300">
                    {(notasSaida || [])
                      .filter((n: any) => n.status === 'processada')
                      .reduce((total: number, n: any) => total + getItemsCount(n), 0)} un.
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Destinatários</div>
                  <div className="text-xl font-semibold text-gray-700 dark:text-gray-300">
                    {new Set((notasSaida || [])
                      .filter((n: any) => 'destinatario' in n && n.destinatario)
                      .map((n: any) => 'destinatario' in n ? n.destinatario : '')
                    ).size}
                  </div>
                </div>
              </div>

              {/* Tabela de Saídas */}
              <div className="overflow-x-auto">
                <Table>
                  <Table.Head>
                    <Table.HeadCell>Número da Nota</Table.HeadCell>
                    <Table.HeadCell>Data</Table.HeadCell>
                    <Table.HeadCell>Responsável</Table.HeadCell>
                    <Table.HeadCell>Destinatário</Table.HeadCell>
                    <Table.HeadCell>Solicitante</Table.HeadCell>
                    <Table.HeadCell>Itens</Table.HeadCell>
                    <Table.HeadCell>Status</Table.HeadCell>
                    <Table.HeadCell>Ações</Table.HeadCell>
                  </Table.Head>
                  <Table.Body>
                    {filteredData.map((nota: any) => (
                      <Table.Row key={nota.id}>
                        <Table.Cell className="font-medium">
                          {nota.numeroNota}
                        </Table.Cell>
                        <Table.Cell>
                          {formatarData(nota.data)}
                        </Table.Cell>
                        <Table.Cell>{nota.responsavel}</Table.Cell>
                        <Table.Cell>
                          {'destinatario' in nota ? nota.destinatario || '-' : '-'}
                        </Table.Cell>
                        <Table.Cell>
                          {'solicitante' in nota ? nota.solicitante || '-' : '-'}
                        </Table.Cell>
                        <Table.Cell>
                          <Badge color="blue" className="w-fit">
                            {getItemsCount(nota)} un.
                          </Badge>
                        </Table.Cell>
                        <Table.Cell>{getStatusBadge(nota.status)}</Table.Cell>
                        <Table.Cell>
                          <div className="flex space-x-2">
                            <Button
                              onClick={() => handleViewNote(nota)}
                              color="gray"
                              size="xs"
                              className="rounded-sm"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </Button>
                            <Button
                              onClick={() => handleEditNote(nota)}
                              color="primary"
                              size="xs"
                              className="rounded-sm"
                              disabled={nota.status === 'cancelada'}
                            >
                              <PencilIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              </div>
            </div>
          </Tabs.Item>
        </Tabs.Group>
      </Card>

      {/* Modal Nova Movimentação */}
      <NewMovementModal
        show={showNewModal}
        onClose={() => setShowNewModal(false)}
        onSave={handleNewMovement}
        tiposEPI={tiposEPI}
        estoque={estoque}
        isLoading={isLoading}
      />

      {/* TODO: Modal de Edição */}
      {/* TODO: Modal de Visualização */}

      {isLoading && (
        <div className="text-center py-8">
          <div className="text-gray-500 dark:text-gray-400">
            Carregando movimentações...
          </div>
        </div>
      )}

      {!isLoading && filteredData.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-500 dark:text-gray-400">
            {searchTerm || statusFilter !== 'todos' 
              ? 'Nenhuma movimentação encontrada com os filtros aplicados.'
              : `Nenhuma nota de ${activeTab === 'entradas' ? 'entrada' : 'saída'} cadastrada.`
            }
          </div>
        </div>
      )}
    </div>
  );
};

export default MovimentacoesEstoque;