import { useState, useEffect } from 'react';

// Hook genérico para operações de API
export function useAPI<T>(
  apiCall: () => Promise<T>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await apiCall();
        
        if (isMounted) {
          setData(result);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Erro desconhecido');
          console.error('API Error:', err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, dependencies);

  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      console.error('API Refetch Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch };
}

// Hook para operações CRUD
export function useCRUD<T>(apiService: {
  getAll: () => Promise<T[]>;
  create: (item: any) => Promise<T>;
  update: (id: string, item: any) => Promise<T>;
  delete: (id: string) => Promise<void>;
}) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar dados iniciais
  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getAll();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
      console.error('Load Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const createItem = async (item: any) => {
    try {
      const newItem = await apiService.create(item);
      setItems(prev => [...prev, newItem]);
      return newItem;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar item');
      throw err;
    }
  };

  const updateItem = async (id: string, updates: any) => {
    try {
      const updatedItem = await apiService.update(id, updates);
      setItems(prev => prev.map(item => 
        (item as any).id === id ? updatedItem : item
      ));
      return updatedItem;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar item');
      throw err;
    }
  };

  const deleteItem = async (id: string) => {
    try {
      await apiService.delete(id);
      setItems(prev => prev.filter(item => (item as any).id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar item');
      throw err;
    }
  };

  return {
    items,
    loading,
    error,
    loadItems,
    createItem,
    updateItem,
    deleteItem,
  };
}

// Hook específico para fichas EPI
export function useFichasEPI() {
  const [fichas, setFichas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFichas = async (retryCount = 0) => {
    try {
      setLoading(true);
      setError(null);
      
      // Importar API dinamicamente para evitar problemas de importação circular
      const { fichasEPIAPI } = await import('../services/api');
      const data = await fichasEPIAPI.getAll();
      setFichas(data);
    } catch (err) {
      console.error('Load Fichas Error:', err);
      
      // Tentar novamente até 3 vezes se for erro de conexão
      if (retryCount < 3 && err instanceof Error && err.message.includes('conectar ao servidor')) {
        console.log(`Tentativa ${retryCount + 1}/3 de reconexão em 2s...`);
        setTimeout(() => loadFichas(retryCount + 1), 2000);
        return;
      }
      
      setError(err instanceof Error ? err.message : 'Erro ao carregar fichas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFichas();
  }, []);

  const createFicha = async (ficha: any) => {
    try {
      const { fichasEPIAPI } = await import('../services/api');
      const newFicha = await fichasEPIAPI.create(ficha);
      setFichas(prev => [...prev, newFicha]);
      return newFicha;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar ficha');
      throw err;
    }
  };

  const updateFicha = async (id: string, updates: any) => {
    try {
      const { fichasEPIAPI } = await import('../services/api');
      const updatedFicha = await fichasEPIAPI.update(id, updates);
      setFichas(prev => prev.map(ficha => 
        ficha.id === id ? updatedFicha : ficha
      ));
      return updatedFicha;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar ficha');
      throw err;
    }
  };

  return {
    fichas,
    loading,
    error,
    loadFichas,
    createFicha,
    updateFicha,
  };
}

// Hook específico para entregas
export function useEntregas(fichaId?: string) {
  const [entregas, setEntregas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEntregas = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { entregasAPI } = await import('../services/api');
      const data = fichaId 
        ? await entregasAPI.getByFicha(fichaId)
        : await entregasAPI.getAll();
      setEntregas(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar entregas');
      console.error('Load Entregas Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEntregas();
  }, [fichaId]);

  const createEntrega = async (entrega: any) => {
    try {
      const { entregasAPI } = await import('../services/api');
      const newEntrega = await entregasAPI.create(entrega);
      setEntregas(prev => [...prev, newEntrega]);
      return newEntrega;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar entrega');
      throw err;
    }
  };

  const updateEntrega = async (id: string, updates: any) => {
    try {
      const { entregasAPI } = await import('../services/api');
      const updatedEntrega = await entregasAPI.update(id, updates);
      setEntregas(prev => prev.map(entrega => 
        entrega.id === id ? updatedEntrega : entrega
      ));
      return updatedEntrega;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar entrega');
      throw err;
    }
  };

  return {
    entregas,
    loading,
    error,
    loadEntregas,
    createEntrega,
    updateEntrega,
  };
}

// Hook para gerenciar filtros de páginas
export function useFilters<T extends Record<string, any>>(initialFilters: T) {
  const [filters, setFilters] = useState<T>(initialFilters);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const updateFilter = (key: keyof T, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setCurrentPage(1); // Reset page when filter changes
  };

  const resetFilters = () => {
    setFilters(initialFilters);
    setSearchTerm('');
    setCurrentPage(1);
  };

  const resetSearch = () => {
    setSearchTerm('');
    setCurrentPage(1);
  };

  return {
    filters,
    searchTerm,
    currentPage,
    setSearchTerm,
    setCurrentPage,
    updateFilter,
    resetFilters,
    resetSearch,
  };
}