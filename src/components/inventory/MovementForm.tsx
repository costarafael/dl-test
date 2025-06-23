import React from 'react';
import { Label, TextInput, Select, Textarea } from 'flowbite-react';

interface MovementFormData {
  quantidade: number;
  responsavelId: string;
  motivo: string;
  custoUnitario?: number;
  notaFiscal?: string;
  lote?: string;
  observacoes?: string;
}

interface MovementFormProps {
  tipo: 'entrada' | 'saida' | 'ajuste';
  formData: MovementFormData;
  onChange: (field: keyof MovementFormData, value: string | number) => void;
  currentStock: number;
  disabled?: boolean;
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

const motivosAjuste = [
  'Contagem física',
  'Correção de erro',
  'Avaria detectada',
  'Atualização do sistema',
  'Outros'
];

const MovementForm: React.FC<MovementFormProps> = ({
  tipo,
  formData,
  onChange,
  currentStock,
  disabled = false
}) => {
  const getMotivos = () => {
    switch (tipo) {
      case 'entrada': return motivosEntrada;
      case 'saida': return motivosSaida;
      case 'ajuste': return motivosAjuste;
      default: return [];
    }
  };

  const getQuantidadeLabel = () => {
    switch (tipo) {
      case 'entrada': return 'Quantidade a adicionar';
      case 'saida': return 'Quantidade a retirar';
      case 'ajuste': return 'Nova quantidade total';
      default: return 'Quantidade';
    }
  };

  const getMaxQuantidade = () => {
    return tipo === 'saida' ? currentStock : undefined;
  };

  return (
    <div className="space-y-4">
      {/* Quantidade */}
      <div>
        <Label htmlFor="quantidade" className="text-gray-700 dark:text-gray-300 mb-2 block">
          {getQuantidadeLabel()} <span className="text-red-500">*</span>
        </Label>
        <TextInput
          id="quantidade"
          type="number"
          min="1"
          max={getMaxQuantidade()}
          value={formData.quantidade}
          onChange={(e) => onChange('quantidade', parseInt(e.target.value) || 0)}
          placeholder="Digite a quantidade"
          sizing="sm"
          className="rounded-sm"
          required
          disabled={disabled}
        />
        {tipo === 'saida' && (
          <p className="text-xs text-gray-500 mt-1">
            Máximo disponível: {currentStock} unidades
          </p>
        )}
      </div>

      {/* Responsável */}
      <div>
        <Label htmlFor="responsavel" className="text-gray-700 dark:text-gray-300 mb-2 block">
          Responsável <span className="text-red-500">*</span>
        </Label>
        <TextInput
          id="responsavel"
          value={formData.responsavelId}
          onChange={(e) => onChange('responsavelId', e.target.value)}
          placeholder="Nome do responsável"
          sizing="sm"
          className="rounded-sm"
          required
          disabled={disabled}
        />
      </div>

      {/* Motivo */}
      <div>
        <Label htmlFor="motivo" className="text-gray-700 dark:text-gray-300 mb-2 block">
          Motivo <span className="text-red-500">*</span>
        </Label>
        <Select
          id="motivo"
          value={formData.motivo}
          onChange={(e) => onChange('motivo', e.target.value)}
          sizing="sm"
          className="rounded-sm"
          required
          disabled={disabled}
        >
          <option value="">Selecione o motivo</option>
          {getMotivos().map(motivo => (
            <option key={motivo} value={motivo}>{motivo}</option>
          ))}
        </Select>
      </div>

      {/* Campos específicos para entrada */}
      {tipo === 'entrada' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="custoUnitario" className="text-gray-700 dark:text-gray-300 mb-2 block">
                Custo Unitário (R$)
              </Label>
              <TextInput
                id="custoUnitario"
                type="number"
                step="0.01"
                min="0"
                value={formData.custoUnitario || ''}
                onChange={(e) => onChange('custoUnitario', parseFloat(e.target.value) || 0)}
                placeholder="0,00"
                sizing="sm"
                className="rounded-sm"
                disabled={disabled}
              />
            </div>
            <div>
              <Label htmlFor="notaFiscal" className="text-gray-700 dark:text-gray-300 mb-2 block">
                Nota Fiscal
              </Label>
              <TextInput
                id="notaFiscal"
                value={formData.notaFiscal || ''}
                onChange={(e) => onChange('notaFiscal', e.target.value)}
                placeholder="Número da NF"
                sizing="sm"
                className="rounded-sm"
                disabled={disabled}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="lote" className="text-gray-700 dark:text-gray-300 mb-2 block">
              Lote/Série
            </Label>
            <TextInput
              id="lote"
              value={formData.lote || ''}
              onChange={(e) => onChange('lote', e.target.value)}
              placeholder="Número do lote ou série"
              sizing="sm"
              className="rounded-sm"
              disabled={disabled}
            />
          </div>
        </>
      )}

      {/* Observações */}
      <div>
        <Label htmlFor="observacoes" className="text-gray-700 dark:text-gray-300 mb-2 block">
          Observações
        </Label>
        <Textarea
          id="observacoes"
          value={formData.observacoes || ''}
          onChange={(e) => onChange('observacoes', e.target.value)}
          placeholder="Observações adicionais sobre a movimentação..."
          rows={3}
          className="rounded-sm"
          disabled={disabled}
        />
      </div>
    </div>
  );
};

export default MovementForm;