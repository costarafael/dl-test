import React from 'react';
import {
  Modal,
  Button,
  Table,
  TextInput,
  Badge
} from 'flowbite-react';
import { PrinterIcon } from '@heroicons/react/24/outline';
import { Entrega, TipoEPI } from '../../types';
import { createEntityLookup } from '../../utils/entityHelpers';
import { formatarData } from '../../utils/dateHelpers';

interface AssinaturaDigitalModalProps {
  show: boolean;
  onClose: () => void;
  entrega: Entrega | null;
  tiposEPI: TipoEPI[] | null;
  onPrint?: (entrega: Entrega) => void;
  onCopyLink?: (link: string) => void;
}

const AssinaturaDigitalModal: React.FC<AssinaturaDigitalModalProps> = ({
  show,
  onClose,
  entrega,
  tiposEPI,
  onPrint,
  onCopyLink
}) => {
  // Helper para buscar tipo EPI
  const getTipoEPI = createEntityLookup(tiposEPI);

  const handlePrint = () => {
    if (onPrint && entrega) {
      onPrint(entrega);
    }
  };

  const handleCopyLink = () => {
    if (entrega?.linkAssinatura) {
      navigator.clipboard.writeText(entrega.linkAssinatura)
        .then(() => {
          if (onCopyLink) {
            onCopyLink(entrega.linkAssinatura!);
          }
          // Feedback visual simples
          alert('Link copiado para a área de transferência!');
        })
        .catch(() => {
          alert('Erro ao copiar o link. Tente novamente.');
        });
    }
  };

  if (!entrega) return null;

  return (
    <Modal 
      show={show} 
      onClose={onClose}
      size="3xl"
    >
      <Modal.Header>
        <div className="flex justify-between items-start w-full">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Coletar Assinatura Digital
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Entrega #{entrega.id} - {formatarData(entrega.dataEntrega)}
            </p>
          </div>
          <Badge 
            color="warning"
            size="sm"
            className="w-fit"
          >
            Aguardando Assinatura
          </Badge>
        </div>
      </Modal.Header>

      <Modal.Body className="overflow-y-auto max-h-96">
        {/* Lista de Itens da Entrega */}
        <div className="mb-6">
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
            Equipamentos para Assinatura
          </h4>
          <Table>
            <Table.Head>
              <Table.HeadCell>Equipamento</Table.HeadCell>
              <Table.HeadCell>Quantidade</Table.HeadCell>
              <Table.HeadCell>Validade</Table.HeadCell>
            </Table.Head>
            <Table.Body>
              {entrega.itens.map(item => {
                const tipoEPI = getTipoEPI(item.tipoEPIId);
                return (
                  <Table.Row key={item.id}>
                    <Table.Cell>
                      <div>
                        <p className="font-medium">{tipoEPI?.nomeEquipamento}</p>
                        <p className="text-xs text-gray-500">CA {tipoEPI?.numeroCA}</p>
                      </div>
                    </Table.Cell>
                    <Table.Cell>{item.quantidade}</Table.Cell>
                    <Table.Cell>{formatarData(item.dataValidade)}</Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table>
        </div>

        {/* QR Code e Link para Assinatura */}
        <div className="mb-6 p-6 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
            Assinatura Digital
          </h4>
          
          <div className="w-40 h-40 bg-white border-2 border-gray-300 mx-auto mb-4 flex items-center justify-center rounded-lg">
            <div className="text-center">
              <div className="text-2xl mb-2">📱</div>
              <span className="text-xs text-gray-500">QR Code</span>
              <p className="text-xs text-gray-400 mt-1">#{entrega.qrCode}</p>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Escaneie o QR Code ou use o link abaixo para assinar digitalmente
          </p>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <TextInput
                value={entrega.linkAssinatura || ''}
                readOnly
                sizing="sm"
                className="flex-1 rounded-sm"
              />
              <Button 
                size="sm" 
                color="primary" 
                className="rounded-sm"
                onClick={handleCopyLink}
              >
                Copiar Link
              </Button>
            </div>
            
            <div className="text-xs text-gray-500 dark:text-gray-400 text-left">
              <p>• O colaborador pode assinar pelo celular ou computador</p>
              <p>• A assinatura é válida juridicamente</p>
              <p>• Após assinar, o status será atualizado automaticamente</p>
            </div>
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer>
        <div className="flex justify-between w-full">
          <Button 
            onClick={handlePrint}
            color="gray" 
            sizing="xs" 
            className="rounded-sm"
          >
            <PrinterIcon className="w-4 h-4 mr-2" />
            Imprimir Termo
          </Button>
          <Button 
            onClick={onClose}
            color="primary" 
            sizing="xs" 
            className="rounded-sm"
          >
            Fechar
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default AssinaturaDigitalModal;