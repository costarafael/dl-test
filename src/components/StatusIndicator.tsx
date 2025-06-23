import React from 'react';
import { Badge } from 'flowbite-react';

interface StatusIndicatorProps {
  status: string;
  variant?: 'user' | 'ficha' | 'estoque';
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status, variant = 'user' }) => {
  const getStatusConfig = (status: string, variant: string) => {
    const configs = {
      user: {
        ativo: { color: 'success' as const, text: 'Ativo' },
        inativo: { color: 'gray' as const, text: 'Inativo' },
        afastado: { color: 'warning' as const, text: 'Afastado' },
        desligado: { color: 'failure' as const, text: 'Desligado' }
      },
      ficha: {
        ativo: { color: 'success' as const, text: 'Ativo' },
        suspenso: { color: 'warning' as const, text: 'Suspenso' },
        arquivado: { color: 'gray' as const, text: 'Arquivado' },
        vencido: { color: 'failure' as const, text: 'Vencido' }
      },
      estoque: {
        normal: { color: 'success' as const, text: 'Normal' },
        baixo: { color: 'warning' as const, text: 'Baixo' },
        'em falta': { color: 'failure' as const, text: 'Em falta' },
        falta: { color: 'failure' as const, text: 'Em falta' }
      }
    } as const;

    const variantConfigs = configs[variant as keyof typeof configs];
    if (!variantConfigs) return { color: 'gray' as const, text: status };
    
    const statusConfig = variantConfigs[status as keyof typeof variantConfigs];
    return statusConfig || { color: 'gray' as const, text: status };
  };

  const { color, text } = getStatusConfig(status, variant);

  return (
    <Badge color={color} size="sm" className="w-fit">
      {text}
    </Badge>
  );
};

export default StatusIndicator;