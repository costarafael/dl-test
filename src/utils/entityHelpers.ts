// Utilitários para busca e lookup de entidades

// Função genérica para criar lookups por ID
export const createEntityLookup = <T extends { id: string }>(entities: T[] | null | undefined) => 
  (id: string): T | undefined => entities?.find(e => e.id === id);

// Função genérica para criar lookups por qualquer campo
export const createFieldLookup = <T, K extends keyof T>(entities: T[] | undefined, field: K) => 
  (value: T[K]): T | undefined => entities?.find(e => e[field] === value);

// Função para buscar múltiplas entidades por IDs
export const findEntitiesByIds = <T extends { id: string }>(
  entities: T[] | undefined, 
  ids: string[]
): T[] => {
  if (!entities || !ids.length) return [];
  return entities.filter(entity => ids.includes(entity.id));
};

// Função para agrupar entidades por um campo
export const groupEntitiesBy = <T, K extends keyof T>(
  entities: T[] | undefined,
  field: K
): Record<string, T[]> => {
  if (!entities) return {};
  
  return entities.reduce((groups, entity) => {
    const key = String(entity[field]);
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(entity);
    return groups;
  }, {} as Record<string, T[]>);
};

// Função para filtrar entidades por múltiplos critérios
export const filterEntities = <T>(
  entities: T[] | undefined,
  filters: Partial<Record<keyof T, any>>
): T[] => {
  if (!entities) return [];
  
  return entities.filter(entity => {
    return Object.entries(filters).every(([key, value]) => {
      if (value === undefined || value === null || value === '' || value === 'todos' || value === 'todas') {
        return true;
      }
      return entity[key as keyof T] === value;
    });
  });
};

// Função para buscar entidades por texto
export const searchEntities = <T>(
  entities: T[] | undefined,
  searchTerm: string,
  searchFields: (keyof T)[]
): T[] => {
  if (!entities || !searchTerm.trim()) return entities || [];
  
  const normalizedSearch = searchTerm.toLowerCase().trim();
  
  return entities.filter(entity => {
    return searchFields.some(field => {
      const fieldValue = entity[field];
      if (typeof fieldValue === 'string') {
        return fieldValue.toLowerCase().includes(normalizedSearch);
      }
      if (typeof fieldValue === 'number') {
        return String(fieldValue).includes(normalizedSearch);
      }
      return false;
    });
  });
};

// Função para paginar entidades
export const paginateEntities = <T>(
  entities: T[] | undefined,
  page: number,
  itemsPerPage: number
): {
  items: T[];
  totalPages: number;
  totalItems: number;
  currentPage: number;
  hasNext: boolean;
  hasPrev: boolean;
} => {
  if (!entities) {
    return {
      items: [],
      totalPages: 0,
      totalItems: 0,
      currentPage: page,
      hasNext: false,
      hasPrev: false,
    };
  }

  const totalItems = entities.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  
  return {
    items: entities.slice(startIndex, endIndex),
    totalPages,
    totalItems,
    currentPage: page,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
};

// Função para ordenar entidades
export const sortEntities = <T>(
  entities: T[] | undefined,
  sortField: keyof T,
  sortDirection: 'asc' | 'desc' = 'asc'
): T[] => {
  if (!entities) return [];
  
  return [...entities].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    // Handle null/undefined values
    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return sortDirection === 'asc' ? 1 : -1;
    if (bValue == null) return sortDirection === 'asc' ? -1 : 1;
    
    // Handle string comparison
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      const comparison = aValue.localeCompare(bValue, 'pt-BR');
      return sortDirection === 'asc' ? comparison : -comparison;
    }
    
    // Handle number/date comparison
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });
};

// Função combinada para aplicar filtros, busca, ordenação e paginação
export const processEntities = <T>(
  entities: T[] | undefined,
  {
    filters = {},
    searchTerm = '',
    searchFields = [],
    sortField,
    sortDirection = 'asc',
    page = 1,
    itemsPerPage = 10
  }: {
    filters?: Partial<Record<keyof T, any>>;
    searchTerm?: string;
    searchFields?: (keyof T)[];
    sortField?: keyof T;
    sortDirection?: 'asc' | 'desc';
    page?: number;
    itemsPerPage?: number;
  }
) => {
  let processedEntities = entities || [];
  
  // 1. Apply filters
  processedEntities = filterEntities(processedEntities, filters);
  
  // 2. Apply search
  if (searchTerm && searchFields.length > 0) {
    processedEntities = searchEntities(processedEntities, searchTerm, searchFields);
  }
  
  // 3. Apply sorting
  if (sortField) {
    processedEntities = sortEntities(processedEntities, sortField, sortDirection);
  }
  
  // 4. Apply pagination
  return paginateEntities(processedEntities, page, itemsPerPage);
};