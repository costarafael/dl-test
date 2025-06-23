import React from 'react';
import { Modal, Button } from 'flowbite-react';
import { ItemEstoque, TipoEPI } from '../../types';
import MovementForm from './MovementForm';

interface MovementFormData {
  quantidade: number;
  responsavelId: string;
  motivo: string;
  custoUnitario?: number;
  notaFiscal?: string;
  lote?: string;
  observacoes?: string;
}

interface MovementModalProps {
  show: boolean;
  onClose: () => void;
  onSave: () => Promise<void>;
  item: ItemEstoque | null; // Item pré-selecionado para ajuste
  tipo: 'entrada' | 'saida' | 'ajuste';
  formData: MovementFormData;
  onChange: (field: keyof MovementFormData, value: string | number) => void;
  getTipoEPI: (id: string) => TipoEPI | undefined;
  isLoading?: boolean;
}

const getTipoLabel = (tipo: 'entrada' | 'saida' | 'ajuste') => {
  switch (tipo) {
    case 'entrada': return 'Nova Movimentação - Entrada';
    case 'saida': return 'Nova Movimentação - Saída';
    case 'ajuste': return 'Ajustar Quantidade de Item';
    default: return 'Nova Movimentação';
  }
};

const MovementModal: React.FC<MovementModalProps> = ({
  show,
  onClose,
  onSave,
  item,
  tipo,
  formData,
  onChange,
  getTipoEPI,
  isLoading = false
}) => {
  // Para ajuste, item é obrigatório. Para entrada/saída, item é opcional
  const tipoEPI = item ? getTipoEPI(item.tipoEPIId) : null;

  const handleSubmit = async () => {
    try {
      await onSave();
    } catch (error) {
      console.error('Erro na movimentação:', error);
      alert('Erro ao executar movimentação. Tente novamente.');
    }
  };

  const isFormValid = () => {
    return formData.quantidade > 0 && 
           formData.responsavelId && 
           formData.motivo;
  };

  return (
    <Modal 
      show={show} 
      onClose={onClose} 
      size="xl"
    >
      <Modal.Header>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          {getTipoLabel(tipo)}
        </h3>
      </Modal.Header>

      <Modal.Body className="overflow-y-auto max-h-96">
        <div className="space-y-6">
          {/* Informações do Item - apenas para ajuste */}
          {tipo === 'ajuste' && item && (
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Item para Ajuste
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Equipamento:</span>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {tipoEPI?.nomeEquipamento}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">CA:</span>
                  <p className="text-gray-900 dark:text-white">
                    {tipoEPI?.numeroCA}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Localização:</span>
                  <p className="text-gray-900 dark:text-white">
                    {item.localizacao}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Estoque atual:</span>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {item.quantidade} unidades
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Descrição para movimentações gerais */}
          {tipo !== 'ajuste' && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
                {tipo === 'entrada' ? 'Nova Entrada de Estoque' : 'Nova Saída de Estoque'}
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-400">
                {tipo === 'entrada' 
                  ? 'Registre uma nova entrada de itens no estoque. Você pode adicionar múltiplos itens de uma vez.'
                  : 'Registre uma nova saída de itens do estoque. Especifique os itens e quantidades.'}
              </p>
            </div>
          )}

          {/* Formulário de Movimentação */}
          <MovementForm
            tipo={tipo}
            formData={formData}
            onChange={onChange}
            currentStock={item?.quantidade || 0}
            disabled={isLoading}
          />
        </div>
      </Modal.Body>

      <Modal.Footer>
        <div className="flex justify-end space-x-3 w-full">
          <Button 
            onClick={onClose}
            color="gray" 
            sizing="xs" 
            className="rounded-sm"
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit}
            color="primary" 
            sizing="xs" 
            className="rounded-sm"
            disabled={!isFormValid() || isLoading}
          >
            {isLoading ? 'Executando...' : 
             tipo === 'ajuste' ? 'Ajustar Quantidade' : 
             `Registrar ${tipo === 'entrada' ? 'Entrada' : 'Saída'}`}
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default MovementModal;