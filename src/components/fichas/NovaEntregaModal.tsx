import React, { useState } from 'react';
import {
  Modal,
  Button,
  Label,
  Select,
  Table,
  TextInput
} from 'flowbite-react';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { TipoEPI } from '../../types';
import { createEntityLookup } from '../../utils/entityHelpers';

interface SelectedEPI {
  id: string;
  tipoEPIId: string;
  quantidade: number;
  dataValidade: string;
}

interface NovaEntregaModalProps {
  show: boolean;
  onClose: () => void;
  onSave: (epis: SelectedEPI[]) => void;
  tiposEPI: TipoEPI[] | null;
  isLoading?: boolean;
}

const NovaEntregaModal: React.FC<NovaEntregaModalProps> = ({
  show,
  onClose,
  onSave,
  tiposEPI,
  isLoading = false
}) => {
  const [selectedEPIs, setSelectedEPIs] = useState<SelectedEPI[]>([]);
  const [searchEPI, setSearchEPI] = useState('');

  // Helper para buscar tipo EPI
  const getTipoEPI = createEntityLookup(tiposEPI);

  // Calcular data de validade padrão (1 ano a partir de hoje)
  const getDataValidadePadrao = () => {
    const hoje = new Date();
    const umAnoDepois = new Date(hoje.getFullYear() + 1, hoje.getMonth(), hoje.getDate());
    return umAnoDepois.toISOString();
  };

  const adicionarEPI = (tipoEPIId: string) => {
    // Verificar se já foi adicionado
    if (selectedEPIs.some(item => item.tipoEPIId === tipoEPIId)) {
      alert('Este EPI já foi adicionado à entrega');
      return;
    }

    const novoItem: SelectedEPI = {
      id: `epi_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      tipoEPIId,
      quantidade: 1,
      dataValidade: getDataValidadePadrao(),
    };

    setSelectedEPIs(prev => [...prev, novoItem]);
  };

  const removerEPI = (itemId: string) => {
    setSelectedEPIs(prev => prev.filter(item => item.id !== itemId));
  };

  const atualizarQuantidade = (itemId: string, quantidade: number) => {
    if (quantidade < 1) return;
    
    setSelectedEPIs(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, quantidade }
          : item
      )
    );
  };

  const atualizarDataValidade = (itemId: string, dataValidade: string) => {
    setSelectedEPIs(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, dataValidade }
          : item
      )
    );
  };

  const handleClose = () => {
    setSelectedEPIs([]);
    setSearchEPI('');
    onClose();
  };

  const handleSave = () => {
    if (selectedEPIs.length === 0) {
      alert('Selecione pelo menos um EPI para a entrega');
      return;
    }
    
    onSave(selectedEPIs);
    handleClose();
  };

  return (
    <Modal 
      show={show} 
      onClose={handleClose}
      size="4xl"
    >
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
          Nova Entrega de EPIs
        </h3>
        
        {/* Buscar EPIs */}
        <div className="mb-6">
          <Label htmlFor="searchEPI" className="text-gray-700 dark:text-gray-300 mb-2 block">
            Buscar EPI
          </Label>
          <div className="flex space-x-2">
            <Select 
              value={searchEPI}
              onChange={(e) => setSearchEPI(e.target.value)}
              sizing="sm"
              className="flex-1 rounded-sm"
            >
              <option value="">Selecione um EPI...</option>
              {tiposEPI?.map(tipo => (
                <option key={tipo.id} value={tipo.id}>
                  {tipo.nomeEquipamento} - CA {tipo.numeroCA}
                </option>
              )) || []}
            </Select>
            <Button 
              color="primary" 
              sizing="sm" 
              className="rounded-sm"
              onClick={() => {
                if (searchEPI) {
                  adicionarEPI(searchEPI);
                  setSearchEPI('');
                }
              }}
              disabled={!searchEPI}
            >
              <PlusIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Lista de EPIs Selecionados */}
        {selectedEPIs.length > 0 && (
          <div className="mb-6">
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
              EPIs Selecionados ({selectedEPIs.length})
            </h4>
            <Table>
              <Table.Head>
                <Table.HeadCell>Equipamento</Table.HeadCell>
                <Table.HeadCell>Quantidade</Table.HeadCell>
                <Table.HeadCell>Validade</Table.HeadCell>
                <Table.HeadCell>Ações</Table.HeadCell>
              </Table.Head>
              <Table.Body>
                {selectedEPIs.map(item => {
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
                          onChange={(e) => atualizarQuantidade(item.id, parseInt(e.target.value) || 1)}
                          sizing="sm"
                          className="w-20 rounded-sm"
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <TextInput
                          type="date"
                          value={item.dataValidade.split('T')[0]}
                          onChange={(e) => atualizarDataValidade(item.id, new Date(e.target.value).toISOString())}
                          sizing="sm"
                          className="rounded-sm"
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <Button 
                          sizing="xs" 
                          color="gray" 
                          className="rounded-sm"
                          onClick={() => removerEPI(item.id)}
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </Button>
                      </Table.Cell>
                    </Table.Row>
                  );
                })}
              </Table.Body>
            </Table>
          </div>
        )}
        
        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button 
            onClick={handleClose}
            color="gray" 
            sizing="xs" 
            className="rounded-sm"
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSave}
            color="primary" 
            sizing="xs" 
            className="rounded-sm"
            disabled={selectedEPIs.length === 0 || isLoading}
          >
            {isLoading ? 'Salvando...' : 'Salvar Entrega'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default NovaEntregaModal;