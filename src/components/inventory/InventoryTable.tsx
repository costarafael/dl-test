import React from 'react';
import { Table, Badge, Button } from 'flowbite-react';
import { 
  AdjustmentsHorizontalIcon, 
  ClockIcon 
} from '@heroicons/react/24/outline';
import { ItemEstoque, TipoEPI } from '../../types';
import { calcularStatusEstoque, isProximoVencimento } from '../../utils/estoqueHelpers';
import { formatarData } from '../../utils/dateHelpers';

interface InventoryTableProps {
  itens: ItemEstoque[];
  getTipoEPI: (id: string) => TipoEPI | undefined;
  onAjuste: (item: ItemEstoque) => void;
  onHistorico: (item: ItemEstoque) => void;
}

const getStatusInfo = (status: string) => {
  switch (status) {
    case 'disponivel':
      return { color: 'green' as const, label: 'Disponível' };
    case 'baixo':
      return { color: 'yellow' as const, label: 'Estoque baixo' };
    case 'vencendo':
      return { color: 'orange' as const, label: 'Próximo ao vencimento' };
    case 'vencido':
      return { color: 'red' as const, label: 'Vencido' };
    default:
      return { color: 'gray' as const, label: 'Indefinido' };
  }
};

const InventoryTable: React.FC<InventoryTableProps> = ({
  itens,
  getTipoEPI,
  onAjuste,
  onHistorico
}) => {
  return (
    <div className="overflow-x-auto">
      <Table hoverable className="min-w-full">
        <Table.Head>
          <Table.HeadCell>Equipamento</Table.HeadCell>
          <Table.HeadCell>Localização</Table.HeadCell>
          <Table.HeadCell>Lote</Table.HeadCell>
          <Table.HeadCell>Quantidade</Table.HeadCell>
          <Table.HeadCell>Status</Table.HeadCell>
          <Table.HeadCell>Validade</Table.HeadCell>
          <Table.HeadCell className="w-32">
            <span className="sr-only">Ações</span>
          </Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y">
          {itens.length > 0 ? (
            itens.map((item) => {
              const tipoEPI = getTipoEPI(item.tipoEPIId);
              const status = calcularStatusEstoque(item);
              const statusInfo = getStatusInfo(status);
              const proximoVencimento = isProximoVencimento(item);
              
              return (
                <Table.Row 
                  key={item.id} 
                  className="bg-white dark:border-gray-700 dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  <Table.Cell>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {tipoEPI?.nomeEquipamento}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        CA {tipoEPI?.numeroCA} • {tipoEPI?.fabricante}
                      </div>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="text-sm text-gray-900 dark:text-white">
                      {item.localizacao}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="text-sm text-gray-900 dark:text-white">
                      {item.lote}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex items-center">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {item.quantidade}
                      </span>
                      <span className="ml-1 text-sm text-gray-500 dark:text-gray-400">
                        un.
                      </span>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge 
                      color={statusInfo.color} 
                      size="sm" 
                      className="w-fit"
                    >
                      {statusInfo.label}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-900 dark:text-white">
                        {formatarData(item.dataValidade)}
                      </span>
                      {proximoVencimento && (
                        <ClockIcon className="w-4 h-4 ml-2 text-orange-500" title="Próximo ao vencimento" />
                      )}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex space-x-1">
                      <Button
                        sizing="xs"
                        color="gray"
                        onClick={() => onAjuste(item)}
                        title="Ajustar quantidade"
                        className="rounded-sm"
                      >
                        <AdjustmentsHorizontalIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        sizing="xs"
                        color="light"
                        onClick={() => onHistorico(item)}
                        title="Ver histórico"
                        className="rounded-sm"
                      >
                        <ClockIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              );
            })
          ) : (
            <Table.Row>
              <Table.Cell colSpan={7} className="text-center py-8">
                <div className="flex flex-col items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-4m-12 0H4m16 0H4" />
                  </svg>
                  <p className="text-gray-500 dark:text-gray-400">Nenhum item encontrado</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                    Ajuste os filtros ou adicione novos itens ao estoque
                  </p>
                </div>
              </Table.Cell>
            </Table.Row>
          )}
        </Table.Body>
      </Table>
    </div>
  );
};

export default InventoryTable;