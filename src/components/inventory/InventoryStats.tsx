import React from 'react';
import { 
  ChartBarIcon, 
  ClockIcon, 
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';

interface InventoryStatsProps {
  stats: {
    totalItens: number;
    totalDisponivel: number;
    estoqueMinimo: number;
    proximoVencimento: number;
  };
}

const InventoryStats: React.FC<InventoryStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-600 dark:text-blue-400">Total de Itens</p>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
              {stats.totalItens}
            </p>
          </div>
          <ChartBarIcon className="w-8 h-8 text-blue-500" />
        </div>
      </div>

      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-green-600 dark:text-green-400">Disponível</p>
            <p className="text-2xl font-bold text-green-700 dark:text-green-300">
              {stats.totalDisponivel}
            </p>
          </div>
          <ChartBarIcon className="w-8 h-8 text-green-500" />
        </div>
      </div>

      <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-orange-600 dark:text-orange-400">Estoque Baixo</p>
            <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
              {stats.estoqueMinimo}
            </p>
          </div>
          <ExclamationTriangleIcon className="w-8 h-8 text-orange-500" />
        </div>
      </div>

      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-red-600 dark:text-red-400">Próx. Vencimento</p>
            <p className="text-2xl font-bold text-red-700 dark:text-red-300">
              {stats.proximoVencimento}
            </p>
          </div>
          <ClockIcon className="w-8 h-8 text-red-500" />
        </div>
      </div>
    </div>
  );
};

export default InventoryStats;