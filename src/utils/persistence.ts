import { Entrega, FichaEPI } from '../types';

// Chaves para localStorage
const ENTREGAS_STORAGE_KEY = 'datalife_entregas';
const FICHAS_STORAGE_KEY = 'datalife_fichas_modificadas';

// Salvar entregas no localStorage
export const salvarEntregas = (entregas: Entrega[]): void => {
  try {
    localStorage.setItem(ENTREGAS_STORAGE_KEY, JSON.stringify(entregas));
  } catch (error) {
    console.error('Erro ao salvar entregas:', error);
  }
};

// Carregar entregas do localStorage
export const carregarEntregas = (): Entrega[] => {
  try {
    const entregasJson = localStorage.getItem(ENTREGAS_STORAGE_KEY);
    return entregasJson ? JSON.parse(entregasJson) : [];
  } catch (error) {
    console.error('Erro ao carregar entregas:', error);
    return [];
  }
};

// Salvar fichas modificadas no localStorage
export const salvarFichaModificada = (ficha: FichaEPI): void => {
  try {
    const fichasModificadas = carregarFichasModificadas();
    const index = fichasModificadas.findIndex(f => f.id === ficha.id);
    
    if (index >= 0) {
      fichasModificadas[index] = ficha;
    } else {
      fichasModificadas.push(ficha);
    }
    
    localStorage.setItem(FICHAS_STORAGE_KEY, JSON.stringify(fichasModificadas));
  } catch (error) {
    console.error('Erro ao salvar ficha modificada:', error);
  }
};

// Carregar fichas modificadas do localStorage
export const carregarFichasModificadas = (): FichaEPI[] => {
  try {
    const fichasJson = localStorage.getItem(FICHAS_STORAGE_KEY);
    return fichasJson ? JSON.parse(fichasJson) : [];
  } catch (error) {
    console.error('Erro ao carregar fichas modificadas:', error);
    return [];
  }
};

// Buscar entrega por ID
export const buscarEntregaPorId = (id: string): Entrega | null => {
  const entregas = carregarEntregas();
  return entregas.find(e => e.id === id) || null;
};

// Buscar entregas por fichaEPIId
export const buscarEntregasPorFicha = (fichaEPIId: string): Entrega[] => {
  const entregas = carregarEntregas();
  return entregas.filter(e => e.fichaEPIId === fichaEPIId);
};

// Adicionar nova entrega
export const adicionarEntrega = (entrega: Entrega): void => {
  const entregas = carregarEntregas();
  entregas.push(entrega);
  salvarEntregas(entregas);
};

// Atualizar entrega existente
export const atualizarEntrega = (entregaAtualizada: Entrega): void => {
  const entregas = carregarEntregas();
  const index = entregas.findIndex(e => e.id === entregaAtualizada.id);
  
  if (index >= 0) {
    entregas[index] = entregaAtualizada;
    salvarEntregas(entregas);
  }
};

// Remover entrega
export const removerEntrega = (id: string): void => {
  const entregas = carregarEntregas();
  const entregasFiltradas = entregas.filter(e => e.id !== id);
  salvarEntregas(entregasFiltradas);
};

// Limpar todos os dados (útil para desenvolvimento)
export const limparDadosPersistidos = (): void => {
  localStorage.removeItem(ENTREGAS_STORAGE_KEY);
  localStorage.removeItem(FICHAS_STORAGE_KEY);
};