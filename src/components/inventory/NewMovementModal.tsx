import React, { useState, useEffect } from 'react';
import { Modal, Button, Label, TextInput, Select, Textarea, Table, Badge } from 'flowbite-react';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { TipoEPI, ItemEstoque, NovaMovimentacaoForm } from '../../types';
import { createEntityLookup, createFieldLookup } from '../../utils/entityHelpers';

interface NewMovementModalProps {
  show: boolean;
  onClose: () => void;
  onSave: (movement: NovaMovimentacaoForm) => Promise<void>;
  tiposEPI: TipoEPI[];
  estoque: ItemEstoque[];
  isLoading?: boolean;
}

const motivosEntrada = [
  'Compra',
  'Doação',
  'Transferência',
  'Devolução',
  'Ajuste de inventário',
  'Outros'
];

const motivosSaida = [
  'Entrega ao colaborador',
  'Transferência',
  'Descarte por vencimento',
  'Descarte por avaria',
  'Perda',
  'Outros'
];

const NewMovementModal: React.FC<NewMovementModalProps> = ({
  show,
  onClose,
  onSave,
  tiposEPI,
  estoque,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<NovaMovimentacaoForm>({
    tipo: 'entrada',
    responsavel: '',
    motivo: '',
    observacoes: '',
    itens: [{ tipoEPIId: '', quantidade: 1, custoUnitario: 0, lote: '', observacoes: '' }]
  });

  const getEstoque = createFieldLookup(estoque || [], 'tipoEPIId');
  const getTipoEPI = createEntityLookup(tiposEPI || []);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (show) {
      setFormData({
        tipo: 'entrada',
        responsavel: '',
        motivo: '',
        observacoes: '',
        itens: [{ tipoEPIId: '', quantidade: 1, custoUnitario: 0, lote: '', observacoes: '' }]
      });
    }
  }, [show]);

  const getMotivos = () => {
    return formData.tipo === 'entrada' ? motivosEntrada : motivosSaida;
  };

  const handleFormChange = (field: keyof NovaMovimentacaoForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (index: number, field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      itens: prev.itens.map((item, i) => 
        i === index 
          ? { ...item, [field]: field === 'quantidade' || field === 'custoUnitario' ? Number(value) : value }
          : item
      )
    }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      itens: [...prev.itens, { tipoEPIId: '', quantidade: 1, custoUnitario: 0, lote: '', observacoes: '' }]
    }));
  };

  const removeItem = (index: number) => {
    if (formData.itens.length > 1) {
      setFormData(prev => ({
        ...prev,
        itens: prev.itens.filter((_, i) => i !== index)
      }));
    }
  };

  const getCurrentStock = (tipoEPIId: string): number => {
    const itemEstoque = getEstoque(tipoEPIId);
    return itemEstoque?.quantidade || 0;
  };

  const isFormValid = () => {
    return formData.responsavel.trim() !== '' &&
           formData.motivo !== '' &&
           formData.itens.every(item => 
             item.tipoEPIId !== '' && 
             item.quantidade > 0 &&
             (formData.tipo === 'entrada' || item.quantidade <= getCurrentStock(item.tipoEPIId))
           );
  };

  const handleSubmit = async () => {
    if (!isFormValid()) return;
    
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Erro ao criar movimentação:', error);
      alert('Erro ao criar movimentação. Tente novamente.');
    }
  };

  const getStockValidationMessage = (item: typeof formData.itens[0]) => {
    if (formData.tipo === 'saida' && item.tipoEPIId) {
      const currentStock = getCurrentStock(item.tipoEPIId);
      if (item.quantidade > currentStock) {
        return `Quantidade excede estoque disponível (${currentStock})`;
      }
    }
    return null;
  };

  return (
    <Modal show={show} onClose={onClose} size="6xl">
      <Modal.Header>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Nova Movimentação - {formData.tipo === 'entrada' ? 'Entrada' : 'Saída'}
        </h3>
      </Modal.Header>

      <Modal.Body className="overflow-y-auto max-h-[70vh]">
        <div className="space-y-6">
          {/* Tipo de Movimentação */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-700 dark:text-gray-300 mb-2 block">
                Tipo de Movimentação <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.tipo}
                onChange={(e) => handleFormChange('tipo', e.target.value)}
                sizing="sm"
                className="rounded-sm"
                disabled={isLoading}
              >
                <option value="entrada">Entrada</option>
                <option value="saida">Saída</option>
              </Select>
            </div>
            <div>
              <Label className="text-gray-700 dark:text-gray-300 mb-2 block">
                Responsável <span className="text-red-500">*</span>
              </Label>
              <TextInput
                value={formData.responsavel}
                onChange={(e) => handleFormChange('responsavel', e.target.value)}
                placeholder="Nome do responsável"
                sizing="sm"
                className="rounded-sm"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Motivo e campos específicos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-gray-700 dark:text-gray-300 mb-2 block">
                Motivo <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.motivo}
                onChange={(e) => handleFormChange('motivo', e.target.value)}
                sizing="sm"
                className="rounded-sm"
                disabled={isLoading}
              >
                <option value="">Selecione o motivo</option>
                {getMotivos().map(motivo => (
                  <option key={motivo} value={motivo}>{motivo}</option>
                ))}
              </Select>
            </div>
            
            {formData.tipo === 'entrada' ? (
              <>
                <div>
                  <Label className="text-gray-700 dark:text-gray-300 mb-2 block">
                    Fornecedor
                  </Label>
                  <TextInput
                    value={formData.fornecedor || ''}
                    onChange={(e) => handleFormChange('fornecedor', e.target.value)}
                    placeholder="Nome do fornecedor"
                    sizing="sm"
                    className="rounded-sm"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <Label className="text-gray-700 dark:text-gray-300 mb-2 block">
                    Nota Fiscal
                  </Label>
                  <TextInput
                    value={formData.notaFiscal || ''}
                    onChange={(e) => handleFormChange('notaFiscal', e.target.value)}
                    placeholder="Número da NF"
                    sizing="sm"
                    className="rounded-sm"
                    disabled={isLoading}
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <Label className="text-gray-700 dark:text-gray-300 mb-2 block">
                    Destinatário
                  </Label>
                  <TextInput
                    value={formData.destinatario || ''}
                    onChange={(e) => handleFormChange('destinatario', e.target.value)}
                    placeholder="Nome do destinatário"
                    sizing="sm"
                    className="rounded-sm"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <Label className="text-gray-700 dark:text-gray-300 mb-2 block">
                    Solicitante
                  </Label>
                  <TextInput
                    value={formData.solicitante || ''}
                    onChange={(e) => handleFormChange('solicitante', e.target.value)}
                    placeholder="Nome do solicitante"
                    sizing="sm"
                    className="rounded-sm"
                    disabled={isLoading}
                  />
                </div>
              </>
            )}
          </div>

          {/* Lista de Itens */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <Label className="text-gray-700 dark:text-gray-300">
                Itens da Movimentação <span className="text-red-500">*</span>
              </Label>
              <Button
                onClick={addItem}
                color="primary"
                size="xs"
                className="rounded-sm"
                disabled={isLoading}
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Adicionar Item
              </Button>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <Table.Head>
                  <Table.HeadCell>Equipamento</Table.HeadCell>
                  <Table.HeadCell>Quantidade</Table.HeadCell>
                  <Table.HeadCell>Estoque Atual</Table.HeadCell>
                  {formData.tipo === 'entrada' && (
                    <>
                      <Table.HeadCell>Custo Unit.</Table.HeadCell>
                      <Table.HeadCell>Lote</Table.HeadCell>
                    </>
                  )}
                  <Table.HeadCell>Observações</Table.HeadCell>
                  <Table.HeadCell>Ações</Table.HeadCell>
                </Table.Head>
                <Table.Body>
                  {formData.itens.map((item, index) => {
                    const currentStock = getCurrentStock(item.tipoEPIId);
                    const validationMessage = getStockValidationMessage(item);

                    return (
                      <Table.Row key={index}>
                        <Table.Cell className="min-w-[200px]">
                          <Select
                            value={item.tipoEPIId}
                            onChange={(e) => handleItemChange(index, 'tipoEPIId', e.target.value)}
                            sizing="sm"
                            className="rounded-sm"
                            disabled={isLoading}
                          >
                            <option value="">Selecione o equipamento</option>
                            {(tiposEPI || []).map(tipo => (
                              <option key={tipo.id} value={tipo.id}>
                                {tipo.nomeEquipamento} - CA {tipo.numeroCA}
                              </option>
                            ))}
                          </Select>
                        </Table.Cell>
                        
                        <Table.Cell>
                          <div className="space-y-1">
                            <TextInput
                              type="number"
                              min="1"
                              max={formData.tipo === 'saida' ? currentStock : undefined}
                              value={item.quantidade}
                              onChange={(e) => handleItemChange(index, 'quantidade', e.target.value)}
                              sizing="sm"
                              className="rounded-sm w-20"
                              disabled={isLoading}
                            />
                            {validationMessage && (
                              <p className="text-xs text-red-500">{validationMessage}</p>
                            )}
                          </div>
                        </Table.Cell>
                        
                        <Table.Cell>
                          {item.tipoEPIId && (
                            <Badge
                              color={currentStock > 0 ? 'green' : 'red'}
                              className="w-fit"
                            >
                              {currentStock} un.
                            </Badge>
                          )}
                        </Table.Cell>

                        {formData.tipo === 'entrada' && (
                          <>
                            <Table.Cell>
                              <TextInput
                                type="number"
                                step="0.01"
                                min="0"
                                value={item.custoUnitario || ''}
                                onChange={(e) => handleItemChange(index, 'custoUnitario', e.target.value)}
                                placeholder="0,00"
                                sizing="sm"
                                className="rounded-sm w-24"
                                disabled={isLoading}
                              />
                            </Table.Cell>
                            <Table.Cell>
                              <TextInput
                                value={item.lote || ''}
                                onChange={(e) => handleItemChange(index, 'lote', e.target.value)}
                                placeholder="Lote/Série"
                                sizing="sm"
                                className="rounded-sm w-32"
                                disabled={isLoading}
                              />
                            </Table.Cell>
                          </>
                        )}
                        
                        <Table.Cell className="min-w-[150px]">
                          <TextInput
                            value={item.observacoes || ''}
                            onChange={(e) => handleItemChange(index, 'observacoes', e.target.value)}
                            placeholder="Observações..."
                            sizing="sm"
                            className="rounded-sm"
                            disabled={isLoading}
                          />
                        </Table.Cell>
                        
                        <Table.Cell>
                          {formData.itens.length > 1 && (
                            <Button
                              onClick={() => removeItem(index)}
                              color="failure"
                              size="xs"
                              className="rounded-sm"
                              disabled={isLoading}
                            >
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          )}
                        </Table.Cell>
                      </Table.Row>
                    );
                  })}
                </Table.Body>
              </Table>
            </div>
          </div>

          {/* Observações Gerais */}
          <div>
            <Label className="text-gray-700 dark:text-gray-300 mb-2 block">
              Observações Gerais
            </Label>
            <Textarea
              value={formData.observacoes || ''}
              onChange={(e) => handleFormChange('observacoes', e.target.value)}
              placeholder="Observações sobre a movimentação..."
              rows={3}
              className="rounded-sm"
              disabled={isLoading}
            />
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer>
        <div className="flex justify-end space-x-3 w-full">
          <Button
            onClick={onClose}
            color="gray"
            sizing="sm"
            className="rounded-sm"
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            color="primary"
            sizing="sm"
            className="rounded-sm"
            disabled={!isFormValid() || isLoading}
          >
            {isLoading ? 'Processando...' : `Registrar ${formData.tipo === 'entrada' ? 'Entrada' : 'Saída'}`}
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default NewMovementModal;