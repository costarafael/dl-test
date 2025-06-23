import React from 'react';
import { Button, TextInput, Label } from 'flowbite-react';
import { FunnelIcon } from '@heroicons/react/24/outline';
import SearchableDropdown from '../common/SearchableDropdown';

interface InventoryFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filtroStatus: string;
  setFiltroStatus: (value: string) => void;
  filtroLocalizacao: string;
  setFiltroLocalizacao: (value: string) => void;
  localizacoes: string[];
}

const statusOptions = [
  { value: 'disponivel', label: 'Disponível' },
  { value: 'baixo', label: 'Estoque baixo' },
  { value: 'vencendo', label: 'Próximo ao vencimento' },
  { value: 'vencido', label: 'Vencido' }
];

const InventoryFilters: React.FC<InventoryFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  filtroStatus,
  setFiltroStatus,
  filtroLocalizacao,
  setFiltroLocalizacao,
  localizacoes
}) => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 p-4 border-t dark:border-gray-700">
      <div className="w-full md:w-1/3">
        <Label htmlFor="table-search" className="sr-only">Buscar</Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"></path>
            </svg>
          </div>
          <TextInput
            id="table-search"
            placeholder="Buscar por equipamento, CA ou localização..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sizing="sm"
            className="pl-10 rounded-sm"
          />
        </div>
      </div>
      
      <div className="w-full md:w-auto flex flex-col md:flex-row space-y-2 md:space-y-0 items-stretch md:items-center justify-end md:space-x-3 flex-shrink-0">
        <SearchableDropdown
          options={statusOptions}
          value={filtroStatus}
          onChange={setFiltroStatus}
          placeholder="Selecionar status..."
          searchPlaceholder="Buscar status..."
          allOptionsLabel="Todos os status"
          sizing="sm"
        />
        
        <SearchableDropdown
          options={localizacoes.map(loc => ({
            value: loc,
            label: loc
          }))}
          value={filtroLocalizacao}
          onChange={setFiltroLocalizacao}
          placeholder="Selecionar localização..."
          searchPlaceholder="Buscar localizações..."
          allOptionsLabel="Todas as localizações"
          sizing="sm"
        />
        
        <Button color="light" sizing="xs" className="rounded-sm">
          <FunnelIcon className="w-4 h-4 mr-2" />
          Filtros
        </Button>
      </div>
    </div>
  );
};

export default InventoryFilters;