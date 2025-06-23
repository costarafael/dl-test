// Constantes para o catálogo de EPIs

export const EPI_CATEGORIES = [
  'Proteção da Cabeça',
  'Proteção dos Olhos e Face',
  'Proteção Auditiva',
  'Proteção Respiratória',
  'Proteção das Mãos',
  'Proteção dos Pés',
  'Proteção do Corpo',
  'Proteção contra Quedas',
  'Outros'
];

export const DEFAULT_VIDA_UTIL_DIAS = 365;

export const ITEMS_PER_PAGE = 10;

// Opções de filtro para status (caso seja implementado no futuro)
export const EPI_STATUS_OPTIONS = [
  { value: 'todos', label: 'Todos os status' },
  { value: 'ativo', label: 'Ativo' },
  { value: 'inativo', label: 'Inativo' }
];

// Campos de busca padrão
export const EPI_SEARCH_FIELDS = ['nomeEquipamento', 'numeroCA', 'fabricante'] as const;

// Campos obrigatórios para validação
export const REQUIRED_FIELDS = [
  'nomeEquipamento',
  'numeroCA', 
  'fabricante',
  'categoria'
] as const;

// Mensagens de validação
export const VALIDATION_MESSAGES = {
  required: 'Este campo é obrigatório',
  numericMin: 'Deve ser um número maior que zero',
  duplicateCA: 'Este número CA já está em uso',
  invalidFormat: 'Formato inválido'
} as const;