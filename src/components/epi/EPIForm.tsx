import React from 'react';
import {
  Label,
  TextInput,
  Select,
  Textarea,
  FileInput
} from 'flowbite-react';
import { TipoEPI } from '../../types';
import { EPI_CATEGORIES, DEFAULT_VIDA_UTIL_DIAS } from '../../constants/epiConstants';

interface EPIFormProps {
  formData: Partial<TipoEPI>;
  onChange: (field: keyof TipoEPI, value: string | number) => void;
  idPrefix?: string;
  disabled?: boolean;
}

const EPIForm: React.FC<EPIFormProps> = ({
  formData,
  onChange,
  idPrefix = '',
  disabled = false
}) => {
  const getFieldId = (field: string) => `${idPrefix}${field}`;

  return (
    <div className="space-y-6">
      {/* Nome do Equipamento */}
      <div>
        <Label htmlFor={getFieldId('nomeEquipamento')} className="text-gray-700 dark:text-gray-300 mb-2 block">
          Nome do Equipamento <span className="text-red-500">*</span>
        </Label>
        <TextInput
          id={getFieldId('nomeEquipamento')}
          value={formData.nomeEquipamento || ''}
          onChange={(e) => onChange('nomeEquipamento', e.target.value)}
          placeholder="Ex: Capacete de Segurança Classe A"
          sizing="sm"
          className="rounded-sm"
          required
          disabled={disabled}
        />
      </div>

      {/* CA e Fabricante */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor={getFieldId('numeroCA')} className="text-gray-700 dark:text-gray-300 mb-2 block">
            Número CA <span className="text-red-500">*</span>
          </Label>
          <TextInput
            id={getFieldId('numeroCA')}
            value={formData.numeroCA || ''}
            onChange={(e) => onChange('numeroCA', e.target.value)}
            placeholder="Ex: 12345"
            sizing="sm"
            className="rounded-sm"
            required
            disabled={disabled}
          />
        </div>
        <div>
          <Label htmlFor={getFieldId('fabricante')} className="text-gray-700 dark:text-gray-300 mb-2 block">
            Fabricante <span className="text-red-500">*</span>
          </Label>
          <TextInput
            id={getFieldId('fabricante')}
            value={formData.fabricante || ''}
            onChange={(e) => onChange('fabricante', e.target.value)}
            placeholder="Ex: 3M do Brasil"
            sizing="sm"
            className="rounded-sm"
            required
            disabled={disabled}
          />
        </div>
      </div>

      {/* Categoria e Vida Útil */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor={getFieldId('categoria')} className="text-gray-700 dark:text-gray-300 mb-2 block">
            Categoria <span className="text-red-500">*</span>
          </Label>
          <Select
            id={getFieldId('categoria')}
            value={formData.categoria || ''}
            onChange={(e) => onChange('categoria', e.target.value)}
            sizing="sm"
            className="rounded-sm"
            required
            disabled={disabled}
          >
            <option value="">Selecione uma categoria</option>
            {EPI_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor={getFieldId('vidaUtilDias')} className="text-gray-700 dark:text-gray-300 mb-2 block">
            Vida Útil (dias) <span className="text-red-500">*</span>
          </Label>
          <TextInput
            id={getFieldId('vidaUtilDias')}
            type="number"
            min="1"
            value={formData.vidaUtilDias || DEFAULT_VIDA_UTIL_DIAS}
            onChange={(e) => onChange('vidaUtilDias', parseInt(e.target.value) || DEFAULT_VIDA_UTIL_DIAS)}
            sizing="sm"
            className="rounded-sm"
            required
            disabled={disabled}
          />
        </div>
      </div>

      {/* Descrição */}
      <div>
        <Label htmlFor={getFieldId('descricao')} className="text-gray-700 dark:text-gray-300 mb-2 block">
          Descrição
        </Label>
        <Textarea
          id={getFieldId('descricao')}
          value={formData.descricao || ''}
          onChange={(e) => onChange('descricao', e.target.value)}
          placeholder="Descreva as características e especificações do EPI..."
          rows={3}
          className="rounded-sm"
          disabled={disabled}
        />
      </div>

      {/* Foto */}
      <div>
        <Label htmlFor={getFieldId('foto')} className="text-gray-700 dark:text-gray-300 mb-2 block">
          Foto do Equipamento
        </Label>
        <FileInput
          id={getFieldId('foto')}
          helperText="Selecione uma imagem do equipamento (opcional)"
          className="rounded-sm"
          disabled={disabled}
        />
      </div>
    </div>
  );
};

export default EPIForm;