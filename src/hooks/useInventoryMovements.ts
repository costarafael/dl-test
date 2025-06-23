import { useState } from 'react';
import { ItemEstoque } from '../types';
import { estoqueAPI } from '../services/api';

interface MovementFormData {
  quantidade: number;
  responsavelId: string;
  motivo: string;
  custoUnitario?: number;
  notaFiscal?: string;
  lote?: string;
  observacoes?: string;
}

interface UseInventoryMovementsResult {
  // Estados do modal
  showMovimentacaoModal: boolean;
  setShowMovimentacaoModal: React.Dispatch<React.SetStateAction<boolean>>;
  showHistoricoModal: boolean;
  setShowHistoricoModal: React.Dispatch<React.SetStateAction<boolean>>;
  
  // Estados da movimentação
  tipoMovimentacao: 'entrada' | 'saida' | 'ajuste';
  setTipoMovimentacao: React.Dispatch<React.SetStateAction<'entrada' | 'saida' | 'ajuste'>>;
  selectedItem: ItemEstoque | null;
  setSelectedItem: React.Dispatch<React.SetStateAction<ItemEstoque | null>>;
  
  // Estados do formulário
  formData: MovementFormData;
  setFormData: React.Dispatch<React.SetStateAction<MovementFormData>>;
  
  // Operações
  abrirMovimentacao: (item: ItemEstoque, tipo: 'entrada' | 'saida' | 'ajuste') => void;
  executarMovimentacao: () => Promise<void>;
  resetForm: () => void;
  handleInputChange: (field: keyof MovementFormData, value: string | number) => void;
}

const INITIAL_FORM_DATA: MovementFormData = {
  quantidade: 1,
  responsavelId: '',
  motivo: '',
  observacoes: ''
};

export const useInventoryMovements = (refetch: () => Promise<void>): UseInventoryMovementsResult => {
  // Estados dos modais
  const [showMovimentacaoModal, setShowMovimentacaoModal] = useState(false);
  const [showHistoricoModal, setShowHistoricoModal] = useState(false);
  
  // Estados da movimentação
  const [tipoMovimentacao, setTipoMovimentacao] = useState<'entrada' | 'saida' | 'ajuste'>('entrada');
  const [selectedItem, setSelectedItem] = useState<ItemEstoque | null>(null);
  
  // Estados do formulário
  const [formData, setFormData] = useState<MovementFormData>(INITIAL_FORM_DATA);

  // Abrir modal de movimentação
  const abrirMovimentacao = (item: ItemEstoque, tipo: 'entrada' | 'saida' | 'ajuste') => {
    setSelectedItem(item);
    setTipoMovimentacao(tipo);
    setShowMovimentacaoModal(true);
    resetForm();
  };

  // Resetar formulário
  const resetForm = () => {
    setFormData(INITIAL_FORM_DATA);
  };

  // Handler para mudanças no formulário
  const handleInputChange = (field: keyof MovementFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Executar movimentação de estoque
  const executarMovimentacao = async () => {
    if (!selectedItem) return;

    try {
      // Executar movimentação específica baseada no tipo
      switch (tipoMovimentacao) {
        case 'entrada':
          await estoqueAPI.entrada(selectedItem.id, {
            quantidade: formData.quantidade,
            responsavelId: formData.responsavelId,
            motivo: formData.motivo,
            notaFiscal: formData.notaFiscal,
            observacoes: formData.observacoes
          });
          break;
          
        case 'saida':
          await estoqueAPI.saida(selectedItem.id, {
            quantidade: formData.quantidade,
            responsavelId: formData.responsavelId,
            motivo: formData.motivo,
            observacoes: formData.observacoes
          });
          break;
          
        case 'ajuste':
          await estoqueAPI.ajuste(selectedItem.id, {
            novaQuantidade: formData.quantidade,
            responsavelId: formData.responsavelId,
            motivo: formData.motivo,
            observacoes: formData.observacoes
          });
          break;
      }
      
      // Recarregar dados
      await refetch();
      
      // Fechar modal e resetar
      setShowMovimentacaoModal(false);
      resetForm();
      setSelectedItem(null);
      
    } catch (error) {
      console.error('Erro ao executar movimentação:', error);
      throw error;
    }
  };

  return {
    // Estados do modal
    showMovimentacaoModal,
    setShowMovimentacaoModal,
    showHistoricoModal,
    setShowHistoricoModal,
    
    // Estados da movimentação
    tipoMovimentacao,
    setTipoMovimentacao,
    selectedItem,
    setSelectedItem,
    
    // Estados do formulário
    formData,
    setFormData,
    
    // Operações
    abrirMovimentacao,
    executarMovimentacao,
    resetForm,
    handleInputChange
  };
};