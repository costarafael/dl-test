import React from 'react';
import { Modal, Button } from 'flowbite-react';
import { PencilIcon } from '@heroicons/react/24/outline';
import { TipoEPI } from '../../types';
import EPIForm from './EPIForm';

interface EPIDetailsModalProps {
  show: boolean;
  onClose: () => void;
  tipo: TipoEPI | null;
  formData: Partial<TipoEPI>;
  onChange: (field: keyof TipoEPI, value: string | number) => void;
  onEdit: () => void;
  onSave: () => Promise<void>;
  editMode: boolean;
  onCancelEdit: () => void;
  isLoading?: boolean;
}

const EPIDetailsModal: React.FC<EPIDetailsModalProps> = ({
  show,
  onClose,
  tipo,
  formData,
  onChange,
  onEdit,
  onSave,
  editMode,
  onCancelEdit,
  isLoading = false
}) => {
  const handleSubmit = async () => {
    try {
      await onSave();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar alterações.');
    }
  };

  const isFormValid = () => {
    return formData.nomeEquipamento && 
           formData.numeroCA && 
           formData.fabricante && 
           formData.categoria;
  };

  if (!tipo) return null;

  return (
    <Modal 
      show={show} 
      onClose={onClose} 
      size="xl"
    >
      <Modal.Header>
        <div className="flex justify-between items-start w-full">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {editMode ? 'Editar Tipo de EPI' : tipo.nomeEquipamento}
            </h3>
            {!editMode && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                CA {tipo.numeroCA}
              </p>
            )}
          </div>
          {!editMode && (
            <Button 
              onClick={onEdit}
              color="gray" 
              sizing="xs" 
              className="rounded-sm"
            >
              <PencilIcon className="w-4 h-4 mr-2" />
              Editar
            </Button>
          )}
        </div>
      </Modal.Header>

      <Modal.Body className="overflow-y-auto max-h-96">
        {editMode ? (
          <EPIForm
            formData={formData}
            onChange={onChange}
            idPrefix="edit"
            disabled={isLoading}
          />
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Informações Básicas
                </h4>
                <div className="space-y-3">
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Fabricante</span>
                    <p className="text-sm text-gray-900 dark:text-white">{tipo.fabricante}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Categoria</span>
                    <p className="text-sm text-gray-900 dark:text-white">{tipo.categoria}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Vida Útil</span>
                    <p className="text-sm text-gray-900 dark:text-white">{tipo.vidaUtilDias} dias</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Certificação
                </h4>
                <div className="space-y-3">
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Número CA</span>
                    <p className="text-sm text-gray-900 dark:text-white font-mono">{tipo.numeroCA}</p>
                  </div>
                </div>
              </div>
            </div>

            {tipo.descricao && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Descrição
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {tipo.descricao}
                </p>
              </div>
            )}

            {tipo.foto && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Imagem
                </h4>
                <div className="w-32 h-32 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500 dark:text-gray-400 text-xs">Imagem do EPI</span>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal.Body>

      <Modal.Footer>
        <div className="flex justify-end space-x-3 w-full">
          {editMode ? (
            <>
              <Button 
                onClick={onCancelEdit}
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
                Salvar Alterações
              </Button>
            </>
          ) : (
            <Button 
              onClick={onClose}
              color="primary" 
              sizing="xs" 
              className="rounded-sm"
            >
              Fechar
            </Button>
          )}
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default EPIDetailsModal;