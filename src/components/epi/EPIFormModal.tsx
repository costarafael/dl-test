import React from 'react';
import { Modal, Button } from 'flowbite-react';
import { TipoEPI } from '../../types';
import EPIForm from './EPIForm';

interface EPIFormModalProps {
  show: boolean;
  onClose: () => void;
  onSave: () => Promise<void>;
  formData: Partial<TipoEPI>;
  onChange: (field: keyof TipoEPI, value: string | number) => void;
  editMode: boolean;
  isLoading?: boolean;
}

const EPIFormModal: React.FC<EPIFormModalProps> = ({
  show,
  onClose,
  onSave,
  formData,
  onChange,
  editMode,
  isLoading = false
}) => {
  const handleSubmit = async () => {
    try {
      await onSave();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar tipo EPI. Verifique se o JSON Server está rodando.');
    }
  };

  const isFormValid = () => {
    return formData.nomeEquipamento && 
           formData.numeroCA && 
           formData.fabricante && 
           formData.categoria;
  };

  return (
    <Modal 
      show={show} 
      onClose={onClose} 
      size="2xl"
    >
      <Modal.Header>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          {editMode ? 'Editar Tipo de EPI' : 'Novo Tipo de EPI'}
        </h3>
      </Modal.Header>

      <Modal.Body className="overflow-y-auto max-h-96">
        <EPIForm
          formData={formData}
          onChange={onChange}
          disabled={isLoading}
        />
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
            {editMode ? 'Salvar Alterações' : 'Criar Tipo EPI'}
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default EPIFormModal;