import React, { useState, useEffect } from 'react';
import { Badge } from 'flowbite-react';

// Verificar se o JSON Server está rodando
export const checkServerStatus = async (): Promise<boolean> => {
  try {
    const response = await fetch('http://localhost:3001/holdings', {
      method: 'HEAD',
      mode: 'cors',
    });
    return response.ok;
  } catch (error) {
    console.warn('JSON Server não está acessível:', error);
    return false;
  }
};

// Hook para verificar status do servidor
export const useServerStatus = () => {
  const [isOnline, setIsOnline] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      setChecking(true);
      const status = await checkServerStatus();
      setIsOnline(status);
      setChecking(false);
    };

    checkStatus();
    
    // Verificar a cada 30 segundos
    const interval = setInterval(checkStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return { isOnline, checking };
};

// Componente para mostrar status do servidor
export const ServerStatusIndicator: React.FC = () => {
  const { isOnline, checking } = useServerStatus();

  if (checking) {
    return (
      <Badge color="gray" size="sm" className="w-fit">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-400 mr-2"></div>
          Verificando...
        </div>
      </Badge>
    );
  }

  return (
    <Badge 
      color={isOnline ? 'success' : 'failure'} 
      size="sm" 
      className="w-fit"
    >
      {isOnline ? 'Servidor online' : 'Servidor offline'}
    </Badge>
  );
};