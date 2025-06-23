import React, { useState, useEffect } from 'react';
import {
  Modal,
  Button,
  Label,
  Select,
  Table,
  TextInput,
  Badge
} from 'flowbite-react';
import { XMarkIcon, PrinterIcon } from '@heroicons/react/24/outline';
import { Entrega, TipoEPI, ItemEntrega } from '../../types';
import { createEntityLookup } from '../../utils/entityHelpers';
import { formatarData } from '../../utils/dateHelpers';

interface VisualizarEntregaModalProps {
  show: boolean;
  onClose: () => void;
  entrega: Entrega | null;
  tiposEPI: TipoEPI[] | null;
  onSave?: (entregaId: string, itens: ItemEntrega[]) => void;
  onPrint?: (entrega: Entrega) => void;
  isLoading?: boolean;
}

const VisualizarEntregaModal: React.FC<VisualizarEntregaModalProps> = ({
  show,
  onClose,
  entrega,
  tiposEPI,
  onSave,
  onPrint,
  isLoading = false
}) => {
  const [editMode, setEditMode] = useState(false);
  const [editingItens, setEditingItens] = useState<ItemEntrega[]>([]);

  // Helper para buscar tipo EPI
  const getTipoEPI = createEntityLookup(tiposEPI);

  // Resetar estado quando a entrega mudar
  useEffect(() => {
    if (entrega) {
      setEditingItens([...entrega.itens]);
    }
    setEditMode(false);
  }, [entrega]);

  // Calcular data de validade padrão (1 ano a partir de hoje)
  const getDataValidadePadrao = () => {
    const hoje = new Date();
    const umAnoDepois = new Date(hoje.getFullYear() + 1, hoje.getMonth(), hoje.getDate());
    return umAnoDepois.toISOString();
  };

  const iniciarEdicao = () => {
    setEditMode(true);
    setEditingItens([...entrega!.itens]);
  };

  const cancelarEdicao = () => {
    setEditMode(false);
    setEditingItens([...entrega!.itens]);
  };

  const adicionarEPIEdicao = (tipoEPIId: string) => {
    // Verificar se já foi adicionado
    if (editingItens.some(item => item.tipoEPIId === tipoEPIId)) {
      alert('Este EPI já está na entrega');
      return;
    }

    const novoItem: ItemEntrega = {
      id: `epi_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      tipoEPIId,
      quantidade: 1,
      dataValidade: getDataValidadePadrao(),
    };

    setEditingItens(prev => [...prev, novoItem]);
  };

  const removerEPIEdicao = (itemId: string) => {
    setEditingItens(prev => prev.filter(item => item.id !== itemId));
  };

  const atualizarQuantidadeEdicao = (itemId: string, quantidade: number) => {
    if (quantidade < 1) return;
    
    setEditingItens(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, quantidade }
          : item
      )
    );
  };

  const atualizarDataValidadeEdicao = (itemId: string, dataValidade: string) => {
    setEditingItens(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, dataValidade }
          : item
      )
    );
  };

  const salvarEdicao = () => {
    if (editingItens.length === 0) {
      alert('A entrega deve ter pelo menos um item');
      return;
    }
    
    if (onSave && entrega) {
      onSave(entrega.id, editingItens);
    }
    setEditMode(false);
  };

  const handleClose = () => {
    setEditMode(false);
    setEditingItens(entrega?.itens || []);
    onClose();
  };

  const handlePrint = () => {
    if (onPrint && entrega) {
      onPrint(entrega);
    }
  };

  if (!entrega) return null;

  return (
    <Modal 
      show={show} 
      onClose={handleClose}
      size="4xl"
    >
      <Modal.Header>
        <div className="flex justify-between items-start w-full">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Entrega #{entrega.id}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {formatarData(entrega.dataEntrega)} - {entrega.responsavel}
            </p>
          </div>
          <Badge 
            color={entrega.status === 'assinado' ? 'success' : entrega.status === 'pendente' ? 'warning' : 'gray'}
            size="sm"
            className="w-fit"
          >
            {entrega.status === 'nao_assinado' ? 'Não assinado' : 
             entrega.status === 'assinado' ? 'Assinado' : 'Pendente'}
          </Badge>
        </div>
      </Modal.Header>

      <Modal.Body className="overflow-y-auto max-h-96">
        {/* Lista de Itens */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-md font-medium text-gray-900 dark:text-white">
              Itens da Entrega
            </h4>
            {!editMode && entrega.status === 'nao_assinado' && (
              <Button 
                sizing="xs" 
                color="gray" 
                className="rounded-sm"
                onClick={iniciarEdicao}
                disabled={isLoading}
              >
                Editar
              </Button>
            )}
          </div>

          {editMode ? (
            <>
              {/* Buscar EPIs no modo edição */}
              <div className="mb-4">
                <Label htmlFor="searchEPIEdicao" className="text-gray-700 dark:text-gray-300 mb-2 block">
                  Adicionar EPI
                </Label>
                <div className="flex space-x-2">
                  <Select 
                    sizing="sm"
                    className="flex-1 rounded-sm"
                    onChange={(e) => {
                      if (e.target.value) {
                        adicionarEPIEdicao(e.target.value);
                        e.target.value = '';
                      }
                    }}
                  >
                    <option value="">Selecione um EPI para adicionar...</option>
                    {tiposEPI?.map(tipo => (
                      <option key={tipo.id} value={tipo.id}>
                        {tipo.nomeEquipamento} - CA {tipo.numeroCA}
                      </option>
                    )) || []}
                  </Select>
                </div>
              </div>

              {/* Tabela editável */}
              <Table>
                <Table.Head>
                  <Table.HeadCell>Equipamento</Table.HeadCell>
                  <Table.HeadCell>Quantidade</Table.HeadCell>
                  <Table.HeadCell>Validade</Table.HeadCell>
                  <Table.HeadCell>Ações</Table.HeadCell>
                </Table.Head>
                <Table.Body>
                  {editingItens.map(item => {
                    const tipoEPI = getTipoEPI(item.tipoEPIId);
                    return (
                      <Table.Row key={item.id}>
                        <Table.Cell>
                          <div>
                            <p className="font-medium">{tipoEPI?.nomeEquipamento}</p>
                            <p className="text-xs text-gray-500">CA {tipoEPI?.numeroCA}</p>
                          </div>
                        </Table.Cell>
                        <Table.Cell>
                          <TextInput
                            type="number"
                            min="1"
                            value={item.quantidade}
                            onChange={(e) => atualizarQuantidadeEdicao(item.id, parseInt(e.target.value) || 1)}
                            sizing="sm"
                            className="w-20 rounded-sm"
                          />
                        </Table.Cell>
                        <Table.Cell>
                          <TextInput
                            type="date"
                            value={item.dataValidade.split('T')[0]}
                            onChange={(e) => atualizarDataValidadeEdicao(item.id, new Date(e.target.value).toISOString())}
                            sizing="sm"
                            className="rounded-sm"
                          />
                        </Table.Cell>
                        <Table.Cell>
                          <Button 
                            sizing="xs" 
                            color="gray" 
                            className="rounded-sm"
                            onClick={() => removerEPIEdicao(item.id)}
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </Button>
                        </Table.Cell>
                      </Table.Row>
                    );
                  })}
                </Table.Body>
              </Table>
            </>
          ) : (
            /* Tabela read-only */
            <Table>
              <Table.Head>
                <Table.HeadCell>Equipamento</Table.HeadCell>
                <Table.HeadCell>Quantidade</Table.HeadCell>
                <Table.HeadCell>Validade</Table.HeadCell>
              </Table.Head>
              <Table.Body>
                {entrega.itens.map(item => {
                  const tipoEPI = getTipoEPI(item.tipoEPIId);
                  return (
                    <Table.Row key={item.id}>
                      <Table.Cell>
                        <div>
                          <p className="font-medium">{tipoEPI?.nomeEquipamento}</p>
                          <p className="text-xs text-gray-500">CA {tipoEPI?.numeroCA}</p>
                        </div>
                      </Table.Cell>
                      <Table.Cell>{item.quantidade}</Table.Cell>
                      <Table.Cell>{formatarData(item.dataValidade)}</Table.Cell>
                    </Table.Row>
                  );
                })}
              </Table.Body>
            </Table>
          )}
        </div>
      </Modal.Body>

      <Modal.Footer>
        {editMode ? (
          /* Botões no modo edição */
          <div className="flex justify-between w-full">
            <Button 
              onClick={cancelarEdicao}
              color="gray" 
              sizing="xs" 
              className="rounded-sm"
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button 
              onClick={salvarEdicao}
              color="primary" 
              sizing="xs" 
              className="rounded-sm"
              disabled={editingItens.length === 0 || isLoading}
            >
              {isLoading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        ) : (
          /* Botões no modo visualização */
          <div className="flex justify-between w-full">
            <Button 
              onClick={handlePrint}
              color="gray" 
              sizing="xs" 
              className="rounded-sm"
              disabled={isLoading}
            >
              <PrinterIcon className="w-4 h-4 mr-2" />
              Imprimir PDF
            </Button>
            <Button 
              onClick={handleClose}
              color="primary" 
              sizing="xs" 
              className="rounded-sm"
            >
              Fechar
            </Button>
          </div>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default VisualizarEntregaModal;