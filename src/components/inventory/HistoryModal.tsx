import React, { useState, useEffect } from 'react';
import { Modal, Button, Badge } from 'flowbite-react';
import { ItemEstoque, TipoEPI, EventoEstoque } from '../../types';
import { formatarData } from '../../utils/dateHelpers';
import { historicoEstoqueAPI } from '../../services/api';

interface HistoryModalProps {
  show: boolean;
  onClose: () => void;
  item: ItemEstoque | null;
  getTipoEPI: (id: string) => TipoEPI | undefined;
}

const getTipoInfo = (tipo: string) => {
  switch (tipo) {
    case 'entrada':
      return { color: 'green' as const, label: 'Entrada', symbol: '+' };
    case 'saida':
      return { color: 'red' as const, label: 'Saída', symbol: '-' };
    case 'entrega':
      return { color: 'blue' as const, label: 'Entrega', symbol: '-' };
    case 'devolucao':
      return { color: 'purple' as const, label: 'Devolução', symbol: '+' };
    case 'ajuste':
      return { color: 'yellow' as const, label: 'Ajuste', symbol: '±' };
    case 'cadastro':
      return { color: 'gray' as const, label: 'Cadastro', symbol: '●' };
    case 'perda':
      return { color: 'failure' as const, label: 'Perda', symbol: '-' };
    case 'vencimento':
      return { color: 'warning' as const, label: 'Vencimento', symbol: '-' };
    default:
      return { color: 'gray' as const, label: 'Indefinido', symbol: '?' };
  }
};

const HistoryModal: React.FC<HistoryModalProps> = ({
  show,
  onClose,
  item,
  getTipoEPI
}) => {
  const [historico, setHistorico] = useState<EventoEstoque[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Buscar histórico quando o modal abrir
  useEffect(() => {
    if (show && item) {
      buscarHistorico();
    }
  }, [show, item]);

  const buscarHistorico = async () => {
    if (!item) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const eventos = await historicoEstoqueAPI.getByItem(item.id);
      setHistorico(eventos.sort((a: EventoEstoque, b: EventoEstoque) => new Date(b.data).getTime() - new Date(a.data).getTime()));
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      setError('Erro ao carregar histórico de movimentações');
      setHistorico([]);
    } finally {
      setLoading(false);
    }
  };

  if (!item) return null;

  const tipoEPI = getTipoEPI(item.tipoEPIId);

  return (
    <Modal 
      show={show} 
      onClose={onClose} 
      size="lg"
    >
      <Modal.Header>
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Histórico de Movimentações
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {tipoEPI?.nomeEquipamento} • CA {tipoEPI?.numeroCA}
          </p>
        </div>
      </Modal.Header>

      <Modal.Body className="overflow-y-auto max-h-96">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-400">Carregando histórico...</span>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-red-600 dark:text-red-400 mb-2">{error}</p>
            <Button 
              onClick={buscarHistorico}
              color="gray"
              sizing="xs"
              className="rounded-sm"
            >
              Tentar novamente
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {historico.length > 0 ? (
              historico.map((evento) => {
                const tipoInfo = getTipoInfo(evento.tipo);
                
                return (
                  <div 
                    key={evento.id}
                    className="border border-gray-200 dark:border-gray-600 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Badge 
                        color={tipoInfo.color} 
                        size="sm" 
                        className="w-fit"
                      >
                        {tipoInfo.symbol} {tipoInfo.label}
                      </Badge>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {formatarData(evento.data)}
                      </span>
                    </div>
                    
                    <div className="mb-3">
                      <p className="text-sm text-gray-900 dark:text-white">
                        {evento.descricao}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Quantidade:</span>
                        <p className="text-gray-900 dark:text-white font-medium">
                          {tipoInfo.symbol !== '●' && tipoInfo.symbol !== '±' && tipoInfo.symbol !== '?' ? tipoInfo.symbol : ''}{evento.quantidade} un.
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Responsável:</span>
                        <p className="text-gray-900 dark:text-white">
                          {evento.responsavel}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Estoque:</span>
                        <p className="text-gray-900 dark:text-white">
                          {evento.quantidadeAnterior} → {evento.quantidadeAtual}
                        </p>
                      </div>
                    </div>

                    {evento.detalhes && (
                      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-600">
                        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                          {evento.detalhes.motivo && (
                            <p><strong>Motivo:</strong> {evento.detalhes.motivo}</p>
                          )}
                          {evento.detalhes.colaboradorNome && (
                            <p><strong>Colaborador:</strong> {evento.detalhes.colaboradorNome}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-gray-500 dark:text-gray-400">
                  Nenhuma movimentação encontrada
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                  As movimentações aparecerão aqui conforme forem realizadas
                </p>
              </div>
            )}
          </div>
        )}
      </Modal.Body>

      <Modal.Footer>
        <div className="flex justify-end w-full">
          <Button 
            onClick={onClose}
            color="primary" 
            sizing="xs" 
            className="rounded-sm"
          >
            Fechar
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default HistoryModal;