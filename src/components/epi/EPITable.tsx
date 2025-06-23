import React from 'react';
import { Table, Badge, Button } from 'flowbite-react';
import { 
  EyeIcon, 
  DocumentDuplicateIcon, 
  TrashIcon, 
  ShoppingCartIcon 
} from '@heroicons/react/24/outline';
import { TipoEPI } from '../../types';

interface EPITableProps {
  tipos: TipoEPI[];
  onView: (tipo: TipoEPI) => void;
  onDuplicate: (tipo: TipoEPI) => void;
  onDelete: (tipo: TipoEPI) => void;
}

const EPITable: React.FC<EPITableProps> = ({
  tipos,
  onView,
  onDuplicate,
  onDelete
}) => {
  const handleDelete = async (tipo: TipoEPI) => {
    if (window.confirm(`Deseja realmente excluir o tipo EPI "${tipo.nomeEquipamento}"?`)) {
      try {
        await onDelete(tipo);
      } catch (error) {
        console.error('Erro ao excluir tipo EPI:', error);
        alert('Erro ao excluir tipo EPI.');
      }
    }
  };

  return (
    <div className="overflow-x-auto">
      <Table hoverable className="min-w-full">
        <Table.Head>
          <Table.HeadCell>Equipamento</Table.HeadCell>
          <Table.HeadCell>CA</Table.HeadCell>
          <Table.HeadCell>Fabricante</Table.HeadCell>
          <Table.HeadCell>Categoria</Table.HeadCell>
          <Table.HeadCell>Vida Útil</Table.HeadCell>
          <Table.HeadCell className="w-20">
            <span className="sr-only">Ações</span>
          </Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y">
          {tipos.length > 0 ? (
            tipos.map((tipo) => (
              <Table.Row 
                key={tipo.id} 
                className="bg-white dark:border-gray-700 dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer"
                onClick={() => onView(tipo)}
              >
                <Table.Cell>
                  <div className="font-medium text-gray-900 dark:text-white">{tipo.nomeEquipamento}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                    {tipo.descricao}
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <Badge color="gray" size="sm" className="w-fit">
                    {tipo.numeroCA}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <div className="text-sm text-gray-900 dark:text-white">{tipo.fabricante}</div>
                </Table.Cell>
                <Table.Cell>
                  <Badge color="primary" size="sm" className="w-fit">
                    {tipo.categoria}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <div className="text-sm text-gray-900 dark:text-white">
                    {tipo.vidaUtilDias} dias
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <div className="flex space-x-1">
                    <Button 
                      sizing="xs" 
                      color="gray"
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        onView(tipo);
                      }}
                      title="Visualizar"
                      className="rounded-sm"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </Button>
                    <Button 
                      sizing="xs" 
                      color="gray"
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        onDuplicate(tipo);
                      }}
                      title="Duplicar"
                      className="rounded-sm"
                    >
                      <DocumentDuplicateIcon className="w-4 h-4" />
                    </Button>
                    <Button 
                      sizing="xs" 
                      color="gray"
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        handleDelete(tipo);
                      }}
                      title="Excluir"
                      className="rounded-sm"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </Table.Cell>
              </Table.Row>
            ))
          ) : (
            <Table.Row>
              <Table.Cell colSpan={6} className="text-center py-8">
                <div className="flex flex-col items-center justify-center">
                  <ShoppingCartIcon className="w-12 h-12 text-gray-400 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">Nenhum tipo de EPI encontrado</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                    Comece cadastrando tipos de EPIs no catálogo
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

export default EPITable;