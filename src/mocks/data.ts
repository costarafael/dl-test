import { 
  Holding,
  Empresa, 
  Colaborador, 
  TipoEPI, 
  ItemEstoque, 
  FichaEPI, 
  ItemFicha, 
  MovimentacaoEstoque, 
  Notificacao 
} from '../types';

// Mock Holdings do Setor Elétrico
export const holdings: Holding[] = [
  {
    id: '1',
    nome: 'Eletrobras',
    cnpj: '00.001.180/0001-26',
    setor: 'Energia Elétrica',
    status: 'ativa'
  },
  {
    id: '2',
    nome: 'CPFL Energia',
    cnpj: '02.998.611/0001-04',
    setor: 'Energia Elétrica',
    status: 'ativa'
  },
  {
    id: '3',
    nome: 'Enel Brasil',
    cnpj: '09.463.895/0001-04',
    setor: 'Energia Elétrica',
    status: 'ativa'
  },
  {
    id: '4',
    nome: 'EDP Brasil',
    cnpj: '03.983.077/0001-03',
    setor: 'Energia Elétrica',
    status: 'ativa'
  },
  {
    id: '5',
    nome: 'Light S.A.',
    cnpj: '03.378.521/0001-75',
    setor: 'Energia Elétrica',
    status: 'ativa'
  }
];

// Mock Empresas
export const empresas: Empresa[] = [
  // Holdings
  {
    id: 'h1',
    nome: 'Eletrobras',
    cnpj: '00.001.180/0001-26',
    endereco: 'Av. Presidente Vargas, 409 - Rio de Janeiro, RJ',
    status: 'ativa',
    tipo: 'holding'
  },
  {
    id: 'h2',
    nome: 'CPFL Energia',
    cnpj: '02.998.611/0001-04',
    endereco: 'Rod. Eng. Miguel Melhado Campos, 1.200 - Campinas, SP',
    status: 'ativa',
    tipo: 'holding'
  },
  {
    id: 'h3',
    nome: 'Enel Brasil',
    cnpj: '09.463.895/0001-04',
    endereco: 'Rua Aimberê, 2.828 - São Paulo, SP',
    status: 'ativa',
    tipo: 'holding'
  },
  {
    id: 'h4',
    nome: 'EDP Brasil',
    cnpj: '03.983.077/0001-03',
    endereco: 'Av. Olegário Maciel, 1.756 - Belo Horizonte, MG',
    status: 'ativa',
    tipo: 'holding'
  },
  {
    id: 'h5',
    nome: 'Light S.A.',
    cnpj: '03.378.521/0001-75',
    endereco: 'Av. Marechal Floriano, 168 - Rio de Janeiro, RJ',
    status: 'ativa',
    tipo: 'holding'
  },
  // Empresas Contratadas
  {
    id: '1',
    nome: 'Construtora Elétrica ABC Ltda',
    cnpj: '12.345.678/0001-90',
    endereco: 'Rua das Obras, 123 - São Paulo, SP',
    status: 'ativa',
    holdingId: '1',
    tipo: 'contratada'
  },
  {
    id: '2',
    nome: 'Engenharia e Montagem XYZ S.A.',
    cnpj: '98.765.432/0001-10',
    endereco: 'Av. Industrial, 456 - Santos, SP',
    status: 'ativa',
    holdingId: '1',
    tipo: 'contratada'
  },
  {
    id: '3',
    nome: 'Manutenção Elétrica DEF',
    cnpj: '11.222.333/0001-44',
    endereco: 'Rua do Ferro, 789 - Guarulhos, SP',
    status: 'ativa',
    holdingId: '2',
    tipo: 'contratada'
  },
  {
    id: '4',
    nome: 'Serviços Energéticos GHI',
    cnpj: '33.444.555/0001-66',
    endereco: 'Av. das Torres, 321 - Campinas, SP',
    status: 'ativa',
    holdingId: '2',
    tipo: 'contratada'
  },
  {
    id: '5',
    nome: 'Instalações Elétricas JKL',
    cnpj: '77.888.999/0001-00',
    endereco: 'Rua da Energia, 555 - São Paulo, SP',
    status: 'ativa',
    holdingId: '3',
    tipo: 'contratada'
  },
  {
    id: '6',
    nome: 'Subestações e Redes MNO',
    cnpj: '55.666.777/0001-22',
    endereco: 'Av. dos Cabos, 777 - Belo Horizonte, MG',
    status: 'ativa',
    holdingId: '4',
    tipo: 'contratada'
  },
  {
    id: '7',
    nome: 'Manutenção Preventiva PQR',
    cnpj: '99.000.111/0001-33',
    endereco: 'Rua das Linhas, 888 - Rio de Janeiro, RJ',
    status: 'ativa',
    holdingId: '5',
    tipo: 'contratada'
  }
];

// Mock Colaboradores (dados fixos e determinísticos para consistência)
const gerarColaboradores = (): Colaborador[] => {
  const baseColaboradores = [
    { nome: 'João Silva Santos', cargo: 'Eletricista', empresaId: '1' },
    { nome: 'Maria Oliveira Costa', cargo: 'Soldadora', empresaId: '2' },
    { nome: 'Carlos Alberto Ferreira', cargo: 'Operador de Máquinas', empresaId: '3' },
    { nome: 'Ana Paula Rodrigues', cargo: 'Técnica de Segurança', empresaId: '4' },
    { nome: 'Pedro Henrique Lima', cargo: 'Pedreiro', empresaId: '5' },
    { nome: 'Fernanda Santos Silva', cargo: 'Pintora', empresaId: '6' },
    { nome: 'Roberto Carlos Souza', cargo: 'Encanador', empresaId: '7' },
    { nome: 'Juliana Pereira Lima', cargo: 'Carpinteira', empresaId: '1' },
    { nome: 'Anderson Silva Costa', cargo: 'Técnico Industrial', empresaId: '2' },
    { nome: 'Patrícia Mendes Rodrigues', cargo: 'Auxiliar de Produção', empresaId: '3' },
    { nome: 'Rafael Almeida Nunes', cargo: 'Montador', empresaId: '4' },
    { nome: 'Camila Costa Barros', cargo: 'Soldadora', empresaId: '5' },
    { nome: 'Lucas Santos Rocha', cargo: 'Eletricista', empresaId: '6' },
    { nome: 'Mariana Lima Ferreira', cargo: 'Técnica de Segurança', empresaId: '7' },
    { nome: 'Gabriel Rodrigues Silva', cargo: 'Operador de Máquinas', empresaId: '1' },
    { nome: 'Bruna Oliveira Santos', cargo: 'Pedreiro', empresaId: '2' },
    { nome: 'Diego Pereira Costa', cargo: 'Pintor', empresaId: '3' },
    { nome: 'Amanda Silva Lima', cargo: 'Encanadora', empresaId: '4' },
    { nome: 'Thiago Alves Souza', cargo: 'Carpinteiro', empresaId: '5' },
    { nome: 'Larissa Mendes Rocha', cargo: 'Técnica Industrial', empresaId: '6' }
  ];
  
  const colaboradores: Colaborador[] = [];
  
  for (let i = 0; i < 100; i++) {
    const baseIndex = i % baseColaboradores.length;
    const base = baseColaboradores[baseIndex];
    const numero = Math.floor(i / baseColaboradores.length) + 1;
    
    const id = (i + 1).toString();
    const nome = numero > 1 ? `${base.nome} ${numero}` : base.nome;
    
    // CPF determinístico baseado no ID
    const cpfBase = String(i + 1).padStart(3, '0');
    const cpf = `${cpfBase}.${cpfBase}.${cpfBase}-${String((i + 1) % 100).padStart(2, '0')}`;
    
    // Email baseado no nome e empresa
    const empresaNome = empresas.find(e => e.id === base.empresaId)?.nome || 'empresa';
    const emailDomain = empresaNome.toLowerCase().replace(/\s+/g, '').replace(/[^\w]/g, '');
    const email = `${nome.toLowerCase().replace(/\s+/g, '.')}@${emailDomain}.com`;
    
    // Data de admissão determinística
    const anoAdmissao = 2022 + (i % 3);
    const mesAdmissao = (i % 12);
    const diaAdmissao = (i % 28) + 1;
    
    colaboradores.push({
      id,
      nome,
      cpf,
      email,
      cargo: base.cargo,
      dataAdmissao: new Date(anoAdmissao, mesAdmissao, diaAdmissao).toISOString(),
      empresaId: base.empresaId,
      status: i % 20 === 19 ? 'afastado' : (i % 50 === 49 ? 'desligado' : 'ativo'),
      temFichaAtiva: false // Será atualizado dinamicamente
    });
  }
  
  return colaboradores;
};

export const colaboradores = gerarColaboradores();

// Mock Tipos de EPI (expandindo conforme plano - mínimo 50)
const gerarTiposEPI = (): TipoEPI[] => {
  const equipamentos = [
    { nome: 'Capacete de Segurança Classe A', categoria: 'Proteção da Cabeça', vidaUtil: 365 },
    { nome: 'Capacete de Segurança Classe B', categoria: 'Proteção da Cabeça', vidaUtil: 365 },
    { nome: 'Luva de Raspa com Punho', categoria: 'Proteção das Mãos', vidaUtil: 90 },
    { nome: 'Luva de Vaqueta', categoria: 'Proteção das Mãos', vidaUtil: 60 },
    { nome: 'Luva de Látex', categoria: 'Proteção das Mãos', vidaUtil: 30 },
    { nome: 'Bota de Segurança com Bico de Aço', categoria: 'Proteção dos Pés', vidaUtil: 180 },
    { nome: 'Bota de PVC', categoria: 'Proteção dos Pés', vidaUtil: 365 },
    { nome: 'Óculos de Proteção Incolor', categoria: 'Proteção dos Olhos', vidaUtil: 120 },
    { nome: 'Óculos de Proteção Escuro', categoria: 'Proteção dos Olhos', vidaUtil: 120 },
    { nome: 'Respirador PFF2', categoria: 'Proteção Respiratória', vidaUtil: 30 },
    { nome: 'Respirador PFF1', categoria: 'Proteção Respiratória', vidaUtil: 30 },
    { nome: 'Máscara Facial', categoria: 'Proteção Respiratória', vidaUtil: 180 },
    { nome: 'Cinto de Segurança Tipo Paraquedista', categoria: 'Proteção contra Quedas', vidaUtil: 365 },
    { nome: 'Protetor Auricular de Espuma', categoria: 'Proteção Auditiva', vidaUtil: 1 },
    { nome: 'Protetor Auricular de Silicone', categoria: 'Proteção Auditiva', vidaUtil: 30 },
    { nome: 'Colete Refletivo', categoria: 'Sinalização', vidaUtil: 180 },
    { nome: 'Avental de PVC', categoria: 'Proteção do Corpo', vidaUtil: 365 },
    { nome: 'Manga de Raspa', categoria: 'Proteção dos Braços', vidaUtil: 90 }
  ];
  
  const fabricantes = ['EPI Tech', 'ProtectMax', 'SafeStep', 'VisionSafe', 'AirProtect', 'HeightSafe', 'WorkGuard', 'SecurePro', 'SafetyFirst', 'ProEquip'];
  
  const tipos: TipoEPI[] = [];
  
  for (let i = 1; i <= 50; i++) {
    const equipIndex = (i - 1) % equipamentos.length;
    const fabricanteIndex = (i - 1) % fabricantes.length;
    const equipamento = equipamentos[equipIndex];
    const variantNumber = Math.floor((i - 1) / equipamentos.length) + 1;
    
    const nomeVariante = variantNumber > 1 ? 
      `${equipamento.nome} Modelo ${variantNumber}` : 
      equipamento.nome;
    
    tipos.push({
      id: i.toString(),
      numeroCA: (10000 + i).toString(),
      nomeEquipamento: nomeVariante,
      descricao: `${equipamento.nome} de alta qualidade para uso profissional. Modelo ${variantNumber}.`,
      fabricante: fabricantes[fabricanteIndex],
      categoria: equipamento.categoria,
      vidaUtilDias: equipamento.vidaUtil,
      foto: `https://via.placeholder.com/150/2563eb/FFFFFF?text=EPI+${i}`
    });
  }
  
  return tipos;
};

export const tiposEPI = gerarTiposEPI();

// Mock Estoque
export const estoque: ItemEstoque[] = [
  {
    id: '1',
    tipoEPIId: tiposEPI[0].id,
    empresaId: empresas[0].id,
    quantidade: 50,
    quantidadeMinima: 10,
    localizacao: 'Estoque A',
    lote: 'LOTE-001',
    dataValidade: '2028-01-15'
  },
  {
    id: '2',
    tipoEPIId: tiposEPI[1].id,
    empresaId: empresas[0].id,
    quantidade: 200,
    quantidadeMinima: 20,
    localizacao: 'Estoque B',
    lote: 'LOTE-002',
    dataValidade: '2025-06-10'
  },
  {
    id: '3',
    tipoEPIId: tiposEPI[2].id,
    empresaId: empresas[0].id,
    quantidade: 75,
    quantidadeMinima: 15,
    localizacao: 'Estoque A',
    lote: 'LOTE-003',
    dataValidade: '2027-03-20'
  },
  {
    id: '4',
    tipoEPIId: tiposEPI[3].id,
    empresaId: empresas[0].id,
    quantidade: 5,
    quantidadeMinima: 20,
    localizacao: 'Estoque C',
    lote: 'LOTE-004',
    dataValidade: '2026-08-05'
  },
  {
    id: '5',
    tipoEPIId: tiposEPI[4].id,
    empresaId: empresas[1].id,
    quantidade: 300,
    quantidadeMinima: 50,
    localizacao: 'Estoque A',
    lote: 'LOTE-005',
    dataValidade: '2024-09-12'
  },
  {
    id: '6',
    tipoEPIId: tiposEPI[5].id,
    empresaId: empresas[1].id,
    quantidade: 25,
    quantidadeMinima: 10,
    localizacao: 'Estoque B',
    lote: 'LOTE-006',
    dataValidade: '2028-02-28'
  }
];

// Mock Itens de Ficha
const itensColaborador1: ItemFicha[] = [
  {
    id: '1',
    tipoEPIId: tiposEPI[0].id,
    quantidade: 1,
    dataEntrega: '2023-10-01',
    dataValidade: '2024-10-01',
    status: 'entregue',
    entregaId: 'mock-entrega-1-1'
  },
  {
    id: '2',
    tipoEPIId: tiposEPI[1].id,
    quantidade: 2,
    dataEntrega: '2023-10-01',
    dataValidade: '2024-01-01',
    status: 'entregue',
    entregaId: 'mock-entrega-1-2'
  },
  {
    id: '3',
    tipoEPIId: tiposEPI[2].id,
    quantidade: 1,
    dataEntrega: '2023-09-15',
    dataValidade: '2024-03-15',
    status: 'devolvido',
    observacoes: 'Fim do contrato',
    entregaId: 'mock-entrega-1-3'
  }
];

const itensColaborador2: ItemFicha[] = [
  {
    id: '4',
    tipoEPIId: tiposEPI[3].id,
    quantidade: 1,
    dataEntrega: '2023-11-10',
    dataValidade: '2024-03-10',
    status: 'entregue',
    entregaId: 'mock-entrega-2-1'
  },
  {
    id: '5',
    tipoEPIId: tiposEPI[4].id,
    quantidade: 10,
    dataEntrega: '2023-11-10',
    dataValidade: '2023-12-10',
    status: 'entregue',
    entregaId: 'mock-entrega-2-2'
  }
];

// Função para gerar fichas realistas (mínimo 50 conforme plano)
const gerarFichasEPI = (): FichaEPI[] => {
  const fichas: FichaEPI[] = [];
  
  // Primeiras 4 fichas com dados específicos
  fichas.push(
    {
      id: '1',
      colaboradorId: colaboradores[0].id,
      empresaId: colaboradores[0].empresaId,
      dataEmissao: '2023-09-15',
      dataValidade: '2024-09-15',
      status: 'ativo',
      itens: itensColaborador1
    },
    {
      id: '2',
      colaboradorId: colaboradores[1].id,
      empresaId: colaboradores[1].empresaId,
      dataEmissao: '2023-11-10',
      dataValidade: '2024-11-10',
      status: 'ativo',
      itens: itensColaborador2
    },
    {
      id: '3',
      colaboradorId: colaboradores[2].id,
      empresaId: colaboradores[2].empresaId,
      dataEmissao: '2023-08-01',
      dataValidade: '2024-08-01',
      status: 'suspenso',
      itens: []
    },
    {
      id: '4',
      colaboradorId: colaboradores[3].id,
      empresaId: colaboradores[3].empresaId,
      dataEmissao: '2023-12-01',
      dataValidade: '2024-12-01',
      status: 'ativo',
      itens: [
        {
          id: '6',
          tipoEPIId: tiposEPI[5].id,
          quantidade: 1,
          dataEntrega: '2023-12-01',
          dataValidade: '2024-12-01',
          status: 'entregue'
        }
      ]
    }
  );

  // Gerar fichas adicionais para completar pelo menos 80 fichas
  for (let i = 5; i <= 80; i++) {
    const colaboradorIndex = (i - 5) % Math.min(colaboradores.length, 80);
    const colaborador = colaboradores[colaboradorIndex];
    
    if (!colaborador) continue;
    
    // Evitar duplicatas
    if (fichas.find(f => f.colaboradorId === colaborador.id)) continue;
    
    const statusOptions = ['ativo', 'ativo', 'ativo', 'suspenso', 'arquivado']; // Mais ativos
    const status = statusOptions[i % statusOptions.length];
    
    const ano = 2023;
    const mes = (i - 5) % 12;
    const dia = ((i - 5) % 28) + 1;
    const dataEmissao = new Date(ano, mes, dia);
    const dataValidade = new Date(dataEmissao);
    dataValidade.setFullYear(dataValidade.getFullYear() + 1);
    
    // Gerar itens para a ficha (determinístico)
    const numItens = status === 'ativo' ? ((i % 5) + 1) : ((i % 3) + 1);
    const itensFicha: ItemFicha[] = [];
    
    for (let j = 0; j < numItens; j++) {
      const tipoEPIIndex = (i + j) % Math.min(tiposEPI.length, 20);
      const tipoEPI = tiposEPI[tipoEPIIndex];
      
      if (!tipoEPI) continue;
      
      const dataEntrega = new Date(dataEmissao);
      dataEntrega.setDate(dataEntrega.getDate() + ((i + j) % 30));
      
      const dataValidadeItem = new Date(dataEntrega);
      dataValidadeItem.setDate(dataValidadeItem.getDate() + tipoEPI.vidaUtilDias);
      
      const statusItems = ['entregue', 'entregue', 'entregue', 'entregue', 'devolvido', 'danificado', 'perdido'];
      const itemStatus = status === 'ativo' ? 
        ((i + j) % 5 === 0 ? 'devolvido' : 'entregue') : 
        statusItems[(i + j) % statusItems.length];
      
      const observacoes = ['Fim de contrato', 'Substituição', 'Danificado', 'Vencimento'];
      
      itensFicha.push({
        id: `${i}_${j}`,
        tipoEPIId: tipoEPI.id,
        quantidade: ((i + j) % 3) + 1,
        dataEntrega: dataEntrega.toISOString(),
        dataValidade: dataValidadeItem.toISOString(),
        status: itemStatus as any,
        entregaId: `mock-entrega-${i}-${j}`, // Referência mock para entrega
        ...(itemStatus === 'devolvido' && { 
          observacoes: observacoes[(i + j) % observacoes.length]
        })
      });
    }
    
    fichas.push({
      id: i.toString(),
      colaboradorId: colaborador.id,
      empresaId: colaborador.empresaId,
      dataEmissao: dataEmissao.toISOString(),
      dataValidade: dataValidade.toISOString(),
      status: status as 'ativo' | 'suspenso' | 'arquivado',
      itens: itensFicha
    });
  }
  
  return fichas;
};

export const fichasEPI = gerarFichasEPI();

// Mock Movimentações de Estoque
export const movimentacoesEstoque: MovimentacaoEstoque[] = [
  {
    id: '1',
    tipo: 'entrada',
    itemEstoqueId: estoque[0].id,
    quantidade: 100,
    data: '2023-10-01',
    responsavelId: colaboradores[0].id,
    motivo: 'Compra inicial de capacetes',
    observacoes: 'NF-001234'
  },
  {
    id: '2',
    tipo: 'saida',
    itemEstoqueId: estoque[0].id,
    quantidade: 50,
    data: '2023-10-15',
    responsavelId: colaboradores[1].id,
    motivo: 'Entrega para colaboradores'
  },
  {
    id: '3',
    tipo: 'entrada',
    itemEstoqueId: estoque[1].id,
    quantidade: 500,
    data: '2023-09-20',
    responsavelId: colaboradores[0].id,
    motivo: 'Estoque de luvas',
    observacoes: 'NF-001235'
  }
];

// Mock Notificações
export const notificacoes: Notificacao[] = [
  {
    id: '1',
    titulo: 'EPIs próximos ao vencimento',
    mensagem: '23 EPIs vencem nos próximos 30 dias',
    tipo: 'vencimento',
    data: '2023-12-10',
    lida: false,
    link: '/fichas'
  },
  {
    id: '2',
    titulo: 'Estoque baixo - Óculos de Proteção',
    mensagem: 'Apenas 5 unidades em estoque',
    tipo: 'estoque_baixo',
    data: '2023-12-09',
    lida: false,
    link: '/estoque'
  },
  {
    id: '3',
    titulo: 'CA vencendo',
    mensagem: 'Certificado de Aprovação 45678 vence em 15 dias',
    tipo: 'vencendo',
    data: '2023-12-08',
    lida: true,
    link: '/catalogo'
  }
];