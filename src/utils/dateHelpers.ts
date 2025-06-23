import { format, differenceInDays, isAfter, isBefore } from 'date-fns';

// Formatar data no padrão brasileiro
export const formatarData = (data: Date | string | null | undefined, defaultValue = ''): string => {
  if (!data) return defaultValue;
  
  try {
    const date = typeof data === 'string' ? new Date(data) : data;
    return format(date, 'dd/MM/yyyy');
  } catch (error) {
    console.warn('Erro ao formatar data:', data, error);
    return defaultValue;
  }
};

// Formatar data e hora no padrão brasileiro
export const formatarDataHora = (data: Date | string | null | undefined, defaultValue = ''): string => {
  if (!data) return defaultValue;
  
  try {
    const date = typeof data === 'string' ? new Date(data) : data;
    return format(date, 'dd/MM/yyyy HH:mm');
  } catch (error) {
    console.warn('Erro ao formatar data e hora:', data, error);
    return defaultValue;
  }
};

// Formatar apenas hora
export const formatarHora = (data: Date | string | null | undefined, defaultValue = ''): string => {
  if (!data) return defaultValue;
  
  try {
    const date = typeof data === 'string' ? new Date(data) : data;
    return format(date, 'HH:mm');
  } catch (error) {
    console.warn('Erro ao formatar hora:', data, error);
    return defaultValue;
  }
};

// Verificar se uma data está vencida
export const isDataVencida = (dataValidade: Date | string | null | undefined): boolean => {
  if (!dataValidade) return false;
  
  try {
    const date = typeof dataValidade === 'string' ? new Date(dataValidade) : dataValidade;
    return isBefore(date, new Date());
  } catch (error) {
    console.warn('Erro ao verificar vencimento:', dataValidade, error);
    return false;
  }
};

// Verificar se uma data está próxima do vencimento
export const isProximoVencimento = (dataValidade: Date | string | null | undefined, diasAlerta = 30): boolean => {
  if (!dataValidade) return false;
  
  try {
    const date = typeof dataValidade === 'string' ? new Date(dataValidade) : dataValidade;
    const hoje = new Date();
    const diasParaVencer = differenceInDays(date, hoje);
    
    return diasParaVencer <= diasAlerta && diasParaVencer > 0;
  } catch (error) {
    console.warn('Erro ao verificar proximidade do vencimento:', dataValidade, error);
    return false;
  }
};

// Calcular dias restantes até o vencimento
export const diasParaVencimento = (dataValidade: Date | string | null | undefined): number => {
  if (!dataValidade) return 0;
  
  try {
    const date = typeof dataValidade === 'string' ? new Date(dataValidade) : dataValidade;
    return Math.max(0, differenceInDays(date, new Date()));
  } catch (error) {
    console.warn('Erro ao calcular dias para vencimento:', dataValidade, error);
    return 0;
  }
};

// Calcular idade de uma data (em dias)
export const calcularIdadeDias = (dataInicio: Date | string | null | undefined): number => {
  if (!dataInicio) return 0;
  
  try {
    const date = typeof dataInicio === 'string' ? new Date(dataInicio) : dataInicio;
    return differenceInDays(new Date(), date);
  } catch (error) {
    console.warn('Erro ao calcular idade em dias:', dataInicio, error);
    return 0;
  }
};

// Formatar período relativo (ex: "há 2 dias", "em 5 dias")
export const formatarPeriodoRelativo = (data: Date | string | null | undefined): string => {
  if (!data) return '';
  
  try {
    const date = typeof data === 'string' ? new Date(data) : data;
    const hoje = new Date();
    const dias = differenceInDays(date, hoje);
    
    if (dias === 0) return 'hoje';
    if (dias === 1) return 'amanhã';
    if (dias === -1) return 'ontem';
    if (dias > 0) return `em ${dias} dias`;
    return `há ${Math.abs(dias)} dias`;
  } catch (error) {
    console.warn('Erro ao formatar período relativo:', data, error);
    return '';
  }
};

// Verificar se uma data está dentro de um período
export const isDataNoPeriodo = (
  data: Date | string | null | undefined,
  dataInicio: Date | string | null | undefined,
  dataFim: Date | string | null | undefined
): boolean => {
  if (!data || !dataInicio || !dataFim) return false;
  
  try {
    const date = typeof data === 'string' ? new Date(data) : data;
    const inicio = typeof dataInicio === 'string' ? new Date(dataInicio) : dataInicio;
    const fim = typeof dataFim === 'string' ? new Date(dataFim) : dataFim;
    
    return !isBefore(date, inicio) && !isAfter(date, fim);
  } catch (error) {
    console.warn('Erro ao verificar data no período:', data, dataInicio, dataFim, error);
    return false;
  }
};