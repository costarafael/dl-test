import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Button, 
  Badge, 
  Tabs, 
  Table, 
  Timeline,
  Breadcrumb
} from 'flowbite-react';
import { 
  IdentificationIcon,
  ClipboardDocumentListIcon,
  TruckIcon,
  ClockIcon,
  PlusIcon,
  ArrowUturnLeftIcon,
  CheckIcon,
  ArrowLeftIcon,
  EyeIcon,
  TrashIcon,
  PencilSquareIcon
} from '@heroicons/react/24/outline';

// Componentes extraídos
import NovaEntregaModal from '../components/fichas/NovaEntregaModal';
import VisualizarEntregaModal from '../components/fichas/VisualizarEntregaModal';
import AssinaturaDigitalModal from '../components/fichas/AssinaturaDigitalModal';

// Hooks e utilities
import { useFichaData } from '../hooks/useFichaData';
import { useAPI } from '../hooks/useAPI';
import { 
  contarItensEntregues, 
  contarItensAtivos, 
  getStatusFicha, 
  getCorStatusFicha,
  getEntregaDoItem,
  podeExcluirEntrega,
  formatarInfoEntrega,
  mapearTipoEvento,
  getIconeEvento
} from '../utils/fichaUtils';
import { formatarData } from '../utils/dateHelpers';

// APIs
import { tiposEPIAPI, historicoAPI } from '../services/api';
import { gerarPDFEntrega } from '../utils/pdfGenerator';
import { Entrega, ItemEntrega, EventoHistorico } from '../types';

const FichaEPIDetalhes: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Estados dos modais
  const [showNovaEntregaModal, setShowNovaEntregaModal] = useState(false);
  const [showEntregaModal, setShowEntregaModal] = useState(false);
  const [showAssinaturaModal, setShowAssinaturaModal] = useState(false);
  const [selectedEntrega, setSelectedEntrega] = useState<Entrega | null>(null);
  const [entregaAssinatura, setEntregaAssinatura] = useState<Entrega | null>(null);

  // Hook principal para dados da ficha
  const {
    fichaAtual,
    colaborador,
    empresa,
    loading,
    error,
    entregas,
    entregasLoading,
    criarEntrega,
    atualizarEntrega,
    excluirEntrega,
    recarregarDados
  } = useFichaData(id || '');

  // Dados auxiliares
  const { data: tiposEPI } = useAPI(tiposEPIAPI.getAll);
  const { data: historico } = useAPI(() => 
    id ? historicoAPI.getByFicha(id) : Promise.resolve([]), [id]
  );

  // Helpers
  const getTipoEPI = (id: string) => {
    return tiposEPI?.find(tipo => tipo.id === id);
  };

  // Se não tem ID, redirecionar
  if (!id) {
    navigate('/fichas');
    return null;
  }

  // Handlers dos modais
  const handleNovaEntrega = async (epis: ItemEntrega[]) => {
    try {
      await criarEntrega(epis);
      setShowNovaEntregaModal(false);
    } catch (error) {
      console.error('Erro ao criar entrega:', error);
      alert('Erro ao criar entrega. Tente novamente.');
    }
  };

  const handleEditarEntrega = async (entregaId: string, itens: ItemEntrega[]) => {
    try {
      await atualizarEntrega(entregaId, itens);
      setShowEntregaModal(false);
      setSelectedEntrega(null);
    } catch (error) {
      console.error('Erro ao editar entrega:', error);
      alert('Erro ao editar entrega. Tente novamente.');
    }
  };

  const handleExcluirEntrega = async (entrega: Entrega) => {
    if (window.confirm(`Deseja realmente excluir a entrega #${entrega.id}?`)) {
      try {
        await excluirEntrega(entrega.id);
      } catch (error) {
        console.error('Erro ao excluir entrega:', error);
        alert('Erro ao excluir entrega. Tente novamente.');
      }
    }
  };

  const abrirEntrega = (entrega: Entrega) => {
    setSelectedEntrega(entrega);
    setShowEntregaModal(true);
  };

  const abrirAssinatura = (entrega: Entrega) => {
    setEntregaAssinatura(entrega);
    setShowAssinaturaModal(true);
  };

  const imprimirEntrega = (entrega: Entrega) => {
    if (colaborador && empresa && tiposEPI) {
      gerarPDFEntrega({ entrega, colaborador, empresa, tiposEPI });
    }
  };

  const copiarLinkAssinatura = (link: string) => {
    console.log('Link copiado:', link);
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando ficha...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !fichaAtual) {
    return (
      <div className="max-w-4xl mx-auto mt-8 p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Erro ao carregar ficha</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error || 'Ficha não encontrada'}</p>
              </div>
              <div className="mt-4">
                <Button
                  onClick={() => navigate('/fichas')}
                  color="gray"
                  size="sm"
                >
                  Voltar às Fichas
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
      <div className="mx-auto max-w-5xl px-4 py-6">
        {/* Breadcrumb */}
        <div className="mb-4">
          <Breadcrumb aria-label="Default breadcrumb">
            <Breadcrumb.Item href="/">
              Dashboard
            </Breadcrumb.Item>
            <Breadcrumb.Item href="/fichas">
              Fichas de EPI
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {colaborador?.nome || 'Carregando...'}
            </Breadcrumb.Item>
          </Breadcrumb>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => navigate('/fichas')}
              color="gray"
              sizing="sm"
              className="rounded-sm"
              title="Voltar às Fichas de EPI"
            >
              <ArrowLeftIcon className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {colaborador?.nome}
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                {empresa?.nome} • {colaborador?.cargo}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Badge 
              color={getCorStatusFicha(fichaAtual)} 
              size="sm" 
              className="w-fit"
            >
              {getStatusFicha(fichaAtual)}
            </Badge>
            <Button
              onClick={() => setShowNovaEntregaModal(true)}
              color="primary"
              sizing="sm"
              className="rounded-sm"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Nova Entrega
            </Button>
          </div>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400">EPIs Entregues</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {contarItensEntregues(fichaAtual)}
                </p>
              </div>
              <ClipboardDocumentListIcon className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 dark:text-green-400">EPIs Ativos</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {contarItensAtivos(fichaAtual)}
                </p>
              </div>
              <CheckIcon className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 dark:text-purple-400">Entregas</p>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                  {entregas.length}
                </p>
              </div>
              <TruckIcon className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs.Group style="underline" className="tabs-primary">
          <Tabs.Item active title="Equipamentos" icon={IdentificationIcon}>
            <div className="overflow-x-auto">
              <Table hoverable>
                <Table.Head>
                  <Table.HeadCell>Equipamento</Table.HeadCell>
                  <Table.HeadCell>Quantidade</Table.HeadCell>
                  <Table.HeadCell>Data Entrega</Table.HeadCell>
                  <Table.HeadCell>Validade</Table.HeadCell>
                  <Table.HeadCell>Entrega</Table.HeadCell>
                  <Table.HeadCell>Status</Table.HeadCell>
                  <Table.HeadCell>Ações</Table.HeadCell>
                </Table.Head>
                <Table.Body>
                  {fichaAtual.itens.map(item => {
                    const tipoEPI = getTipoEPI(item.tipoEPIId);
                    const entrega = item.entregaId ? getEntregaDoItem(item.entregaId, entregas) : undefined;
                    return (
                      <Table.Row key={item.id}>
                        <Table.Cell>
                          <div>
                            <p className="font-medium">{tipoEPI?.nomeEquipamento}</p>
                            <p className="text-xs text-gray-500">CA {tipoEPI?.numeroCA}</p>
                          </div>
                        </Table.Cell>
                        <Table.Cell>{item.quantidade}</Table.Cell>
                        <Table.Cell>{formatarData(item.dataEntrega)}</Table.Cell>
                        <Table.Cell>{formatarData(item.dataValidade)}</Table.Cell>
                        <Table.Cell>
                          {entrega ? (
                            <Badge 
                              color="blue" 
                              size="sm" 
                              className="w-fit cursor-pointer"
                              onClick={() => entrega && abrirEntrega(entrega)}
                            >
                              #{entrega.id.slice(-8)}
                            </Badge>
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </Table.Cell>
                        <Table.Cell>
                          <Badge 
                            color={item.status === 'entregue' ? 'green' : 'gray'} 
                            size="sm" 
                            className="w-fit"
                          >
                            {item.status === 'entregue' ? 'Ativo' : item.status}
                          </Badge>
                        </Table.Cell>
                        <Table.Cell>
                          <div className="flex space-x-1">
                            {entrega && (
                              <Button
                                sizing="xs"
                                color="gray"
                                className="rounded-sm"
                                onClick={() => abrirEntrega(entrega)}
                                title="Ver entrega"
                              >
                                <EyeIcon className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              sizing="xs"
                              color="gray"
                              className="rounded-sm"
                              title="Devolver"
                            >
                              <ArrowUturnLeftIcon className="w-4 h-4" />
                            </Button>
                          </div>
                        </Table.Cell>
                      </Table.Row>
                    );
                  })}
                </Table.Body>
              </Table>
            </div>
          </Tabs.Item>

          <Tabs.Item title="Entregas" icon={TruckIcon}>
            <div className="overflow-x-auto">
              <Table hoverable>
                <Table.Head>
                  <Table.HeadCell>Entrega</Table.HeadCell>
                  <Table.HeadCell>Data</Table.HeadCell>
                  <Table.HeadCell>Itens</Table.HeadCell>
                  <Table.HeadCell>Responsável</Table.HeadCell>
                  <Table.HeadCell>Status</Table.HeadCell>
                  <Table.HeadCell>Ações</Table.HeadCell>
                </Table.Head>
                <Table.Body>
                  {entregas.map(entrega => (
                    <Table.Row key={entrega.id}>
                      <Table.Cell>#{entrega.id}</Table.Cell>
                      <Table.Cell>{formatarData(entrega.dataEntrega)}</Table.Cell>
                      <Table.Cell>{formatarInfoEntrega(entrega)}</Table.Cell>
                      <Table.Cell>{entrega.responsavel}</Table.Cell>
                      <Table.Cell>
                        <Badge 
                          color={entrega.status === 'assinado' ? 'green' : 'gray'} 
                          size="sm" 
                          className="w-fit"
                        >
                          {entrega.status === 'nao_assinado' ? 'Não assinado' : 
                           entrega.status === 'assinado' ? 'Assinado' : 'Pendente'}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex space-x-1">
                          <Button
                            sizing="xs"
                            color="gray"
                            className="rounded-sm"
                            onClick={() => abrirEntrega(entrega)}
                            title="Visualizar"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </Button>
                          <Button
                            sizing="xs"
                            color="gray"
                            className="rounded-sm"
                            onClick={() => abrirAssinatura(entrega)}
                            title="Coletar assinatura"
                          >
                            <PencilSquareIcon className="w-4 h-4" />
                          </Button>
                          {podeExcluirEntrega(entrega) && (
                            <Button
                              sizing="xs"
                              color="gray"
                              className="rounded-sm"
                              onClick={() => handleExcluirEntrega(entrega)}
                              title="Excluir"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </div>
          </Tabs.Item>

          <Tabs.Item title="Histórico" icon={ClockIcon}>
            <Timeline>
              {historico?.map((evento: EventoHistorico) => (
                <Timeline.Item key={evento.id}>
                  <Timeline.Point 
                    icon={() => (
                      <span className="text-sm">
                        {getIconeEvento(evento.tipo)}
                      </span>
                    )} 
                  />
                  <Timeline.Content>
                    <Timeline.Time>{formatarData(evento.data)}</Timeline.Time>
                    <Timeline.Title>{mapearTipoEvento(evento.tipo)}</Timeline.Title>
                    <Timeline.Body>
                      {evento.descricao}
                      {evento.responsavel && (
                        <span className="text-sm text-gray-500 ml-2">
                          • {evento.responsavel}
                        </span>
                      )}
                    </Timeline.Body>
                  </Timeline.Content>
                </Timeline.Item>
              )) || []}
            </Timeline>
          </Tabs.Item>
        </Tabs.Group>
      </div>

      {/* Modais */}
      <NovaEntregaModal
        show={showNovaEntregaModal}
        onClose={() => setShowNovaEntregaModal(false)}
        onSave={handleNovaEntrega}
        tiposEPI={tiposEPI}
        isLoading={false}
      />

      <VisualizarEntregaModal
        show={showEntregaModal}
        onClose={() => {
          setShowEntregaModal(false);
          setSelectedEntrega(null);
        }}
        entrega={selectedEntrega}
        tiposEPI={tiposEPI}
        onSave={handleEditarEntrega}
        onPrint={imprimirEntrega}
        isLoading={false}
      />

      <AssinaturaDigitalModal
        show={showAssinaturaModal}
        onClose={() => {
          setShowAssinaturaModal(false);
          setEntregaAssinatura(null);
        }}
        entrega={entregaAssinatura}
        tiposEPI={tiposEPI}
        onPrint={imprimirEntrega}
        onCopyLink={copiarLinkAssinatura}
      />
    </div>
  );
};

export default FichaEPIDetalhes;