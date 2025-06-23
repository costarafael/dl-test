// Serviços de API para JSON Server
const API_BASE = process.env.NODE_ENV === 'production' 
  ? 'https://epi-bk.onrender.com' 
  : 'http://localhost:3001';

// Helper para fazer requests
const apiRequest = async (url: string, options?: RequestInit) => {
  try {
    console.log(`🔗 API Request: ${API_BASE}${url}`);
    
    const response = await fetch(`${API_BASE}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      mode: 'cors',
      ...options,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`✅ API Response: ${data.length || Object.keys(data).length} items`);
    return data;
  } catch (error) {
    console.error('🚨 API Request failed:', error);
    
    // Verificar se é um erro de conexão
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Não foi possível conectar ao servidor. Verifique se o JSON Server está rodando na porta 3001.');
    }
    
    throw error;
  }
};

// ===== CRUD FACTORY =====
const createCRUDAPI = (endpoint: string) => ({
  getAll: () => apiRequest(`/${endpoint}`),
  getById: (id: string) => apiRequest(`/${endpoint}/${id}`),
  create: (item: any) => apiRequest(`/${endpoint}`, {
    method: 'POST',
    body: JSON.stringify(item),
  }),
  update: (id: string, item: any) => apiRequest(`/${endpoint}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(item),
  }),
  patch: (id: string, updates: any) => apiRequest(`/${endpoint}/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  }),
  delete: (id: string) => apiRequest(`/${endpoint}/${id}`, {
    method: 'DELETE',
  }),
});

// ===== HOLDINGS (MOCK DATA) =====
export const holdingsAPI = {
  getAll: () => import('../mocks/data').then(m => m.holdings),
  getById: (id: string) => import('../mocks/data').then(m => m.holdings.find(h => h.id === id)),
};

// ===== EMPRESAS (MOCK DATA) =====
export const empresasAPI = {
  getAll: () => import('../mocks/data').then(m => m.empresas),
  getById: (id: string) => import('../mocks/data').then(m => m.empresas.find(e => e.id === id)),
  getByTipo: (tipo: 'holding' | 'contratada') => 
    import('../mocks/data').then(m => m.empresas.filter(e => e.tipo === tipo)),
  getContratadas: (holdingId?: string) => 
    import('../mocks/data').then(m => 
      holdingId 
        ? m.empresas.filter(e => e.tipo === 'contratada' && e.holdingId === holdingId)
        : m.empresas.filter(e => e.tipo === 'contratada')
    ),
};

// ===== COLABORADORES (MOCK DATA) =====
export const colaboradoresAPI = {
  getAll: () => import('../mocks/data').then(m => m.colaboradores),
  getById: (id: string) => import('../mocks/data').then(m => m.colaboradores.find(c => c.id === id)),
  getByEmpresa: (empresaId: string) => 
    import('../mocks/data').then(m => m.colaboradores.filter(c => c.empresaId === empresaId)),
  getByStatus: (status: 'ativo' | 'afastado' | 'desligado') =>
    import('../mocks/data').then(m => m.colaboradores.filter(c => c.status === status)),
  search: (query: string) => 
    import('../mocks/data').then(m => m.colaboradores.filter(c => 
      c.nome.toLowerCase().includes(query.toLowerCase())
    )),
};

// ===== TIPOS EPI (CRUD completo) =====
export const tiposEPIAPI = {
  // CRUD básico usando factory
  ...createCRUDAPI('tiposEPI'),
  
  // Métodos específicos
  getByCategoria: (categoria: string) => 
    apiRequest(`/tiposEPI?categoria=${encodeURIComponent(categoria)}`),
  getByStatus: (status: 'ativo' | 'inativo') =>
    apiRequest(`/tiposEPI?status=${status}`),
  search: (query: string) => 
    apiRequest(`/tiposEPI?nomeEquipamento_like=${encodeURIComponent(query)}`),
};

// ===== ESTOQUE (CRUD completo) =====
export const estoqueAPI = {
  // CRUD básico usando factory
  ...createCRUDAPI('estoque'),
  
  // Métodos de consulta específicos
  getByEmpresa: (empresaId: string) => 
    apiRequest(`/estoque?empresaId=${empresaId}`),
  getByTipoEPI: (tipoEPIId: string) => 
    apiRequest(`/estoque?tipoEPIId=${tipoEPIId}`),
  getByStatus: (status: 'disponivel' | 'baixo_estoque' | 'vencido' | 'esgotado') =>
    apiRequest(`/estoque?status=${status}`),
  getBaixoEstoque: () => 
    apiRequest('/estoque?status=baixo_estoque'),
  
  // Operações específicas
  ajustarQuantidade: (id: string, novaQuantidade: number) => 
    apiRequest(`/estoque/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantidade: novaQuantidade }),
    }),
  
  // Operações de movimentação (para registrar no histórico)
  entrada: async (id: string, dados: {
    quantidade: number;
    responsavelId: string;
    motivo: string;
    notaFiscal?: string;
    observacoes?: string;
  }) => {
    // Buscar item atual
    const item = await apiRequest(`/estoque/${id}`);
    const novaQuantidade = item.quantidade + dados.quantidade;
    
    // Atualizar quantidade
    const itemAtualizado = await apiRequest(`/estoque/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantidade: novaQuantidade }),
    });
    
    // Registrar movimentação
    await apiRequest('/movimentacoesEstoque', {
      method: 'POST',
      body: JSON.stringify({
        id: `mov_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        itemEstoqueId: id,
        tipo: 'entrada',
        quantidade: dados.quantidade,
        quantidadeAnterior: item.quantidade,
        quantidadeAtual: novaQuantidade,
        responsavelId: dados.responsavelId,
        motivo: dados.motivo,
        data: new Date().toISOString(),
        observacoes: dados.observacoes,
        notaFiscal: dados.notaFiscal,
      }),
    });
    
    return itemAtualizado;
  },
  
  saida: async (id: string, dados: {
    quantidade: number;
    responsavelId: string;
    motivo: string;
    entregaId?: string;
    observacoes?: string;
  }) => {
    // Buscar item atual
    const item = await apiRequest(`/estoque/${id}`);
    const novaQuantidade = item.quantidade - dados.quantidade;
    
    // Atualizar quantidade
    const itemAtualizado = await apiRequest(`/estoque/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantidade: novaQuantidade }),
    });
    
    // Registrar movimentação
    await apiRequest('/movimentacoesEstoque', {
      method: 'POST',
      body: JSON.stringify({
        id: `mov_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        itemEstoqueId: id,
        tipo: dados.entregaId ? 'entrega' : 'saida',
        quantidade: dados.quantidade,
        quantidadeAnterior: item.quantidade,
        quantidadeAtual: novaQuantidade,
        responsavelId: dados.responsavelId,
        motivo: dados.motivo,
        data: new Date().toISOString(),
        observacoes: dados.observacoes,
        entregaId: dados.entregaId,
      }),
    });
    
    return itemAtualizado;
  },
  
  ajuste: async (id: string, dados: {
    novaQuantidade: number;
    responsavelId: string;
    motivo: string;
    observacoes?: string;
  }) => {
    // Buscar item atual
    const item = await apiRequest(`/estoque/${id}`);
    
    // Atualizar quantidade
    const itemAtualizado = await apiRequest(`/estoque/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantidade: dados.novaQuantidade }),
    });
    
    // Registrar movimentação
    await apiRequest('/movimentacoesEstoque', {
      method: 'POST',
      body: JSON.stringify({
        id: `mov_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        itemEstoqueId: id,
        tipo: 'ajuste',
        quantidade: Math.abs(dados.novaQuantidade - item.quantidade),
        quantidadeAnterior: item.quantidade,
        quantidadeAtual: dados.novaQuantidade,
        responsavelId: dados.responsavelId,
        motivo: dados.motivo,
        data: new Date().toISOString(),
        observacoes: dados.observacoes,
      }),
    });
    
    return itemAtualizado;
  },
};

// ===== FICHAS EPI (CRUD completo) =====
export const fichasEPIAPI = {
  // CRUD básico usando factory
  ...createCRUDAPI('fichasEPI'),
  
  // Métodos de consulta específicos
  getByColaborador: (colaboradorId: string) => 
    apiRequest(`/fichasEPI?colaboradorId=${colaboradorId}`),
  getByEmpresa: (empresaId: string) => 
    apiRequest(`/fichasEPI?empresaId=${empresaId}`),
  getByStatus: (status: 'ativo' | 'suspenso' | 'arquivado' | 'vencido') =>
    apiRequest(`/fichasEPI?status=${status}`),
  
  // Operações específicas
  adicionarItem: (fichaId: string, item: any) => {
    return apiRequest(`/fichasEPI/${fichaId}`)
      .then(ficha => {
        const novosItens = [...(ficha.itens || []), item];
        return apiRequest(`/fichasEPI/${fichaId}`, {
          method: 'PATCH',
          body: JSON.stringify({ itens: novosItens }),
        });
      });
  },
  
  removerItem: (fichaId: string, itemId: string) => {
    return apiRequest(`/fichasEPI/${fichaId}`)
      .then(ficha => {
        const novosItens = (ficha.itens || []).filter((item: any) => item.id !== itemId);
        return apiRequest(`/fichasEPI/${fichaId}`, {
          method: 'PATCH',
          body: JSON.stringify({ itens: novosItens }),
        });
      });
  },
};

// ===== ENTREGAS (CRUD completo) =====
export const entregasAPI = {
  // CRUD básico usando factory
  ...createCRUDAPI('entregas'),
  
  // Métodos de consulta específicos
  getByFicha: (fichaEPIId: string) => 
    apiRequest(`/entregas?fichaEPIId=${fichaEPIId}`),
  getByStatus: (status: 'nao_assinado' | 'assinado' | 'pendente') =>
    apiRequest(`/entregas?status=${status}`),
  getPendentesAssinatura: () => 
    apiRequest('/entregas?status=nao_assinado'),
  
  // Operações específicas
  assinar: (id: string, dadosAssinatura: any) => 
    apiRequest(`/entregas/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        status: 'assinado',
        assinatura: {
          dataAssinatura: new Date().toISOString(),
          ...dadosAssinatura,
        },
      }),
    }),
  
  cancelarAssinatura: (id: string) => 
    apiRequest(`/entregas/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        status: 'nao_assinado',
        assinatura: null,
      }),
    }),
};

// ===== MOVIMENTAÇÕES ESTOQUE (CRUD completo) =====
export const movimentacoesAPI = {
  // CRUD básico usando factory
  ...createCRUDAPI('movimentacoesEstoque'),
  
  // Métodos de consulta específicos
  getByItem: (itemEstoqueId: string) => 
    apiRequest(`/movimentacoesEstoque?itemEstoqueId=${itemEstoqueId}`),
  getByTipo: (tipo: 'entrada' | 'saida' | 'ajuste' | 'devolucao' | 'perda' | 'vencimento') =>
    apiRequest(`/movimentacoesEstoque?tipo=${tipo}`),
  getByResponsavel: (responsavelId: string) => 
    apiRequest(`/movimentacoesEstoque?responsavelId=${responsavelId}`),
};

// ===== NOTIFICAÇÕES (CRUD completo) =====
export const notificacoesAPI = {
  // CRUD básico usando factory
  ...createCRUDAPI('notificacoes'),
  
  // Métodos de consulta específicos
  getNaoLidas: () => apiRequest('/notificacoes?lida=false'),
  getByTipo: (tipo: string) => 
    apiRequest(`/notificacoes?tipo=${tipo}`),
  
  // Operações específicas
  marcarComoLida: (id: string) => 
    apiRequest(`/notificacoes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ lida: true }),
    }),
  
  marcarComoNaoLida: (id: string) => 
    apiRequest(`/notificacoes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ lida: false }),
    }),
};

// ===== HISTÓRICO (CRUD completo) =====
export const historicoAPI = {
  // CRUD básico usando factory
  ...createCRUDAPI('historico'),
  
  // Métodos de consulta específicos
  getByFicha: (fichaEPIId: string) => 
    apiRequest(`/historico?fichaEPIId=${fichaEPIId}&_sort=data&_order=desc`),
  getByTipo: (tipo: string) => 
    apiRequest(`/historico?tipo=${tipo}`),
  getByResponsavel: (responsavel: string) => 
    apiRequest(`/historico?responsavel=${responsavel}`),
};

// ===== HISTÓRICO DE ESTOQUE (específico para movimentações) =====
export const historicoEstoqueAPI = {
  // CRUD básico usando factory (só getAll, getById, create para este caso)
  getAll: () => apiRequest('/historicoEstoque'),
  getById: (id: string) => apiRequest(`/historicoEstoque/${id}`),
  create: (evento: any) => apiRequest('/historicoEstoque', {
    method: 'POST',
    body: JSON.stringify(evento),
  }),
  
  // Métodos de consulta específicos
  getByItem: (itemEstoqueId: string) => 
    apiRequest(`/historicoEstoque?itemEstoqueId=${itemEstoqueId}&_sort=data&_order=desc`),
  getByTipo: (tipo: string) => 
    apiRequest(`/historicoEstoque?tipo=${tipo}`),
  getByResponsavel: (responsavel: string) => 
    apiRequest(`/historicoEstoque?responsavel=${responsavel}`),
  getByPeriodo: (dataInicio: string, dataFim: string) =>
    apiRequest(`/historicoEstoque?data_gte=${dataInicio}&data_lte=${dataFim}&_sort=data&_order=desc`),
  
  // Helper para criar eventos de estoque automaticamente
  registrarEvento: async (dados: {
    itemEstoqueId: string;
    tipo: 'entrada' | 'saida' | 'ajuste' | 'devolucao' | 'perda' | 'vencimento' | 'entrega' | 'cadastro';
    responsavel: string;
    descricao: string;
    quantidadeAnterior: number;
    quantidadeAtual: number;
    quantidade: number;
    detalhes?: any;
  }) => {
    const evento = {
      id: `hist_est_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      ...dados,
      data: new Date().toISOString(),
    };
    
    return apiRequest('/historicoEstoque', {
      method: 'POST',
      body: JSON.stringify(evento),
    });
  }
};

// ===== OPERAÇÕES COMPOSTAS =====
export const operacoesAPI = {
  // Criar entrega completa (entrega + atualizar ficha + movimentar estoque)
  criarEntregaCompleta: async (dadosEntrega: {
    fichaEPIId: string;
    itens: any[];
    responsavel: string;
  }) => {
    try {
      // 0. Buscar dados da ficha para obter empresaId e colaborador
      const ficha = await fichasEPIAPI.getById(dadosEntrega.fichaEPIId);
      const colaborador = await colaboradoresAPI.getById(ficha.colaboradorId);
      
      if (!colaborador) {
        throw new Error('Colaborador não encontrado');
      }
      
      // 1. Criar a entrega
      const entrega = await entregasAPI.create({
        id: `entrega_${Date.now()}`,
        fichaEPIId: dadosEntrega.fichaEPIId,
        dataEntrega: new Date().toISOString(),
        itens: dadosEntrega.itens,
        responsavel: dadosEntrega.responsavel,
        status: 'nao_assinado',
        qrCode: `QR_${Date.now()}`,
        linkAssinatura: `https://app.datalife.com/assinatura/${Date.now()}`,
      });
      
      // 2. Processar redução de estoque automaticamente
      try {
        const { processarEntregaEstoque } = await import('../utils/estoqueHelpers');
        const resultadoEstoque = await processarEntregaEstoque(
          entrega.id,
          dadosEntrega.fichaEPIId,
          dadosEntrega.itens.map(item => ({
            tipoEPIId: item.tipoEPIId,
            quantidade: item.quantidade
          })),
          ficha.empresaId,
          colaborador.nome,
          dadosEntrega.responsavel
        );
        
        if (!resultadoEstoque.sucesso && resultadoEstoque.erros.length > 0) {
          console.warn('Alertas na redução de estoque:', resultadoEstoque.erros);
          // Continuar mesmo com alertas, mas logar para análise
        }
        
        console.log('Estoque processado (entrega):', resultadoEstoque.itensProcessados);
      } catch (error) {
        console.error('Erro ao processar estoque durante entrega:', error);
        // Não falhar a entrega por erro de estoque, mas alertar
        console.warn('Entrega criada, mas estoque não foi atualizado automaticamente');
      }
      
      // 3. Atualizar a ficha com os novos itens
      const novosItensFicha = dadosEntrega.itens.map(item => ({
        id: `ficha_${item.id}`,
        tipoEPIId: item.tipoEPIId,
        quantidade: item.quantidade,
        dataEntrega: entrega.dataEntrega,
        dataValidade: item.dataValidade,
        status: 'entregue',
        entregaId: entrega.id,
        observacoes: `Entrega #${entrega.id}`,
      }));
      
      await fichasEPIAPI.patch(dadosEntrega.fichaEPIId, {
        itens: [...(ficha.itens || []), ...novosItensFicha],
      });
      
      // 4. Registrar no histórico
      await historicoAPI.create({
        id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        fichaEPIId: dadosEntrega.fichaEPIId,
        tipo: 'entrega_criada',
        responsavel: dadosEntrega.responsavel,
        descricao: `Entrega #${entrega.id} criada com ${dadosEntrega.itens.length} item(ns)`,
        data: new Date().toISOString(),
        detalhes: {
          entregaId: entrega.id,
          equipamentos: dadosEntrega.itens.map(item => item.tipoEPIId),
          quantidades: dadosEntrega.itens.map(item => item.quantidade)
        }
      });

      return entrega;
    } catch (error) {
      console.error('Erro ao criar entrega completa:', error);
      throw error;
    }
  },

  // Editar entrega completa (entrega + atualizar ficha + ajustar estoque)
  editarEntregaCompleta: async (
    entregaId: string,
    novosItens: any[]
  ) => {
    try {
      // 1. Buscar entrega atual
      const entregaAtual = await entregasAPI.getById(entregaId);
      const ficha = await fichasEPIAPI.getById(entregaAtual.fichaEPIId);
      const colaborador = await colaboradoresAPI.getById(ficha.colaboradorId);
      
      if (!colaborador) {
        throw new Error('Colaborador não encontrado');
      }
      
      // 2. Preparar dados para comparação do estoque
      const itensAntigos = entregaAtual.itens.map((item: any) => ({
        tipoEPIId: item.tipoEPIId,
        quantidade: item.quantidade
      }));
      
      const itensNovosParaEstoque = novosItens.map((item: any) => ({
        tipoEPIId: item.tipoEPIId,
        quantidade: item.quantidade
      }));
      
      // 3. Processar ajuste de estoque automaticamente
      try {
        const { processarEdicaoEntregaEstoque } = await import('../utils/estoqueHelpers');
        const resultadoEstoque = await processarEdicaoEntregaEstoque(
          entregaId,
          itensAntigos,
          itensNovosParaEstoque,
          ficha.empresaId,
          colaborador.nome,
          entregaAtual.responsavel
        );
        
        if (!resultadoEstoque.sucesso && resultadoEstoque.erros.length > 0) {
          console.warn('Alertas no ajuste de estoque (edição):', resultadoEstoque.erros);
        }
        
        console.log('Estoque ajustado (edição):', resultadoEstoque.ajustes);
      } catch (error) {
        console.error('Erro ao processar ajuste de estoque durante edição:', error);
        // Não falhar a edição por erro de estoque, mas alertar
        console.warn('Entrega editada, mas estoque não foi ajustado automaticamente');
      }
      
      // 4. Atualizar a entrega
      const entregaAtualizada = await entregasAPI.update(entregaId, {
        ...entregaAtual,
        itens: novosItens,
        dataEntrega: new Date().toISOString()
      });

      // 5. Remover itens antigos da ficha que pertencem a esta entrega
      const itensFichaRestantes = ficha.itens.filter((item: any) => item.entregaId !== entregaId);
      
      // 6. Adicionar novos itens à ficha
      const novosItensFicha = novosItens.map((item: any) => ({
        id: `ficha_edit_${item.id}`,
        tipoEPIId: item.tipoEPIId,
        quantidade: item.quantidade,
        dataEntrega: entregaAtualizada.dataEntrega,
        dataValidade: item.dataValidade,
        status: 'entregue',
        entregaId: entregaId,
        observacoes: `Entrega #${entregaId} (editada)`
      }));

      // 7. Atualizar a ficha
      await fichasEPIAPI.update(entregaAtual.fichaEPIId, {
        ...ficha,
        itens: [...itensFichaRestantes, ...novosItensFicha]
      });

      // 8. Registrar no histórico
      await historicoAPI.create({
        id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        fichaEPIId: entregaAtual.fichaEPIId,
        tipo: 'entrega_editada',
        responsavel: entregaAtual.responsavel,
        descricao: `Entrega #${entregaId} editada - ${novosItens.length} item(ns)`,
        data: new Date().toISOString(),
        detalhes: {
          entregaId: entregaId,
          equipamentos: novosItens.map(item => item.tipoEPIId),
          quantidades: novosItens.map(item => item.quantidade)
        }
      });

      return entregaAtualizada;
    } catch (error) {
      console.error('Erro ao editar entrega completa:', error);
      throw error;
    }
  },

  // Excluir entrega completa (entrega + remover da ficha + registrar histórico)
  excluirEntregaCompleta: async (entregaId: string) => {
    try {
      // 1. Buscar entrega atual
      const entrega = await entregasAPI.getById(entregaId);
      const ficha = await fichasEPIAPI.getById(entrega.fichaEPIId);
      
      // 2. Remover itens da ficha que pertencem a esta entrega
      const itensFichaRestantes = ficha.itens.filter((item: any) => item.entregaId !== entregaId);
      
      // 3. Atualizar a ficha
      await fichasEPIAPI.update(entrega.fichaEPIId, {
        ...ficha,
        itens: itensFichaRestantes
      });

      // 4. Registrar no histórico
      await historicoAPI.create({
        id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        fichaEPIId: entrega.fichaEPIId,
        tipo: 'entrega_excluida',
        responsavel: entrega.responsavel,
        descricao: `Entrega #${entregaId} excluída - ${entrega.itens.length} item(ns) removidos`,
        data: new Date().toISOString(),
        detalhes: {
          entregaId: entregaId,
          equipamentos: entrega.itens.map((item: any) => item.tipoEPIId),
          quantidades: entrega.itens.map((item: any) => item.quantidade)
        }
      });

      // 5. Excluir a entrega
      await entregasAPI.delete(entregaId);

      return true;
    } catch (error) {
      console.error('Erro ao excluir entrega completa:', error);
      throw error;
    }
  },

  // Processar devolução de itens EPI
  processarDevolucao: async (dadosDevolucao: {
    fichaEPIId: string;
    itens: Array<{ id: string; tipoEPIId: string; quantidade: number; motivo?: string }>;
    responsavel: string;
  }) => {
    try {
      // 0. Buscar dados da ficha para obter empresaId e colaborador
      const ficha = await fichasEPIAPI.getById(dadosDevolucao.fichaEPIId);
      const colaborador = await colaboradoresAPI.getById(ficha.colaboradorId);
      
      if (!colaborador) {
        throw new Error('Colaborador não encontrado');
      }
      
      // 1. Processar devolução no estoque automaticamente
      try {
        const { processarDevolucaoEstoque } = await import('../utils/estoqueHelpers');
        const resultadoEstoque = await processarDevolucaoEstoque(
          dadosDevolucao.fichaEPIId,
          dadosDevolucao.itens.map((item: any) => ({
            tipoEPIId: item.tipoEPIId,
            quantidade: item.quantidade,
            motivo: item.motivo
          })),
          ficha.empresaId,
          colaborador.nome,
          dadosDevolucao.responsavel
        );
        
        if (!resultadoEstoque.sucesso && resultadoEstoque.erros.length > 0) {
          console.warn('Alertas na devolução de estoque:', resultadoEstoque.erros);
        }
        
        console.log('Estoque processado (devolução):', resultadoEstoque.itensProcessados);
      } catch (error) {
        console.error('Erro ao processar devolução no estoque:', error);
        // Não falha a operação principal, apenas registra o erro
      }
      
      // 2. Atualizar status dos itens na ficha
      const itensAtualizados = ficha.itens.map((item: any) => {
        const itemDevolucao = dadosDevolucao.itens.find(dev => dev.id === item.id);
        if (itemDevolucao) {
          return {
            ...item,
            status: 'devolvido',
            dataVencimento: new Date().toISOString(),
            observacoes: itemDevolucao.motivo || 'Item devolvido'
          };
        }
        return item;
      });
      
      // 3. Atualizar a ficha
      await fichasEPIAPI.update(dadosDevolucao.fichaEPIId, {
        ...ficha,
        itens: itensAtualizados
      });
      
      // 4. Registrar no histórico
      await historicoAPI.create({
        id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        fichaEPIId: dadosDevolucao.fichaEPIId,
        tipo: 'devolucao_processada',
        responsavel: dadosDevolucao.responsavel,
        descricao: `Devolução de ${dadosDevolucao.itens.length} item(ns) processada`,
        data: new Date().toISOString(),
        detalhes: {
          equipamentos: dadosDevolucao.itens.map(item => item.tipoEPIId),
          quantidades: dadosDevolucao.itens.map(item => item.quantidade),
          motivos: dadosDevolucao.itens.map(item => item.motivo || 'Não informado')
        }
      });

      return {
        sucesso: true,
        itensDevolvidos: dadosDevolucao.itens.length
      };
    } catch (error) {
      console.error('Erro ao processar devolução:', error);
      throw error;
    }
  },
  
  // Buscar dados completos de uma ficha (com colaborador, empresa, etc.)
  getFichaCompleta: async (fichaId: string) => {
    try {
      const [ficha, entregas] = await Promise.all([
        fichasEPIAPI.getById(fichaId),
        entregasAPI.getByFicha(fichaId),
      ]);
      
      const [colaborador, empresa] = await Promise.all([
        colaboradoresAPI.getById(ficha.colaboradorId),
        empresasAPI.getById(ficha.empresaId),
      ]);
      
      return {
        ficha,
        colaborador,
        empresa,
        entregas,
      };
    } catch (error) {
      console.error('Erro ao buscar ficha completa:', error);
      throw error;
    }
  },
};

// ===== NOTAS DE ENTRADA (CRUD completo) =====
export const notasEntradaAPI = {
  // CRUD básico usando factory
  ...createCRUDAPI('notasEntrada'),
  
  // Métodos de consulta específicos
  getByEmpresa: (empresaId: string) => 
    apiRequest(`/notasEntrada?empresaId=${empresaId}&_sort=data&_order=desc`),
  getByStatus: (status: 'pendente' | 'processada' | 'cancelada') =>
    apiRequest(`/notasEntrada?status=${status}&_sort=data&_order=desc`),
  getByResponsavel: (responsavel: string) => 
    apiRequest(`/notasEntrada?responsavel=${responsavel}&_sort=data&_order=desc`),
  getByPeriodo: (dataInicio: string, dataFim: string) =>
    apiRequest(`/notasEntrada?data_gte=${dataInicio}&data_lte=${dataFim}&_sort=data&_order=desc`),
  
  // Processar nota de entrada (atualizar estoque)
  processar: async (notaId: string) => {
    const nota = await apiRequest(`/notasEntrada/${notaId}`);
    
    // Atualizar status para processada
    await apiRequest(`/notasEntrada/${notaId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        status: 'processada',
        dataProcessamento: new Date().toISOString()
      })
    });
    
    // Processar cada item da nota
    for (const item of nota.itens) {
      try {
        const estoqueId = `estoque_almox_${item.tipoEPIId}`;
        
        // Verificar se o item de estoque existe
        try {
          await estoqueAPI.getById(estoqueId);
        } catch (error) {
          // Se não existe, criar o item de estoque primeiro
          console.log(`Criando item de estoque para ${item.tipoEPIId}`);
          await estoqueAPI.create({
            id: estoqueId,
            tipoEPIId: item.tipoEPIId,
            empresaId: 'almoxarifado',
            quantidade: 0,
            quantidadeMinima: 10,
            localizacao: 'Almoxarifado Central',
            lote: item.lote || `LOTE-${Date.now()}`,
            dataValidade: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 1 ano
          });
        }
        
        await estoqueAPI.entrada(estoqueId, {
          quantidade: item.quantidade,
          responsavelId: nota.responsavel,
          motivo: `Entrada via Nota ${nota.numeroNota}`,
          notaFiscal: nota.notaFiscal,
          observacoes: `Processamento automático da nota de entrada ${nota.numeroNota}`
        });
      } catch (error) {
        console.error(`Erro ao processar item ${item.tipoEPIId} da nota ${nota.numeroNota}:`, error);
      }
    }
    
    return nota;
  }
};

// ===== NOTAS DE SAÍDA (CRUD completo) =====
export const notasSaidaAPI = {
  // CRUD básico usando factory
  ...createCRUDAPI('notasSaida'),
  
  // Métodos de consulta específicos
  getByEmpresa: (empresaId: string) => 
    apiRequest(`/notasSaida?empresaId=${empresaId}&_sort=data&_order=desc`),
  getByStatus: (status: 'pendente' | 'processada' | 'cancelada') =>
    apiRequest(`/notasSaida?status=${status}&_sort=data&_order=desc`),
  getByResponsavel: (responsavel: string) => 
    apiRequest(`/notasSaida?responsavel=${responsavel}&_sort=data&_order=desc`),
  getByPeriodo: (dataInicio: string, dataFim: string) =>
    apiRequest(`/notasSaida?data_gte=${dataInicio}&data_lte=${dataFim}&_sort=data&_order=desc`),
  
  // Processar nota de saída (reduzir estoque)
  processar: async (notaId: string) => {
    const nota = await apiRequest(`/notasSaida/${notaId}`);
    
    // Atualizar status para processada
    await apiRequest(`/notasSaida/${notaId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        status: 'processada',
        dataProcessamento: new Date().toISOString()
      })
    });
    
    // Processar cada item da nota
    for (const item of nota.itens) {
      try {
        const estoqueId = `estoque_almox_${item.tipoEPIId}`;
        
        // Verificar se o item de estoque existe
        try {
          await estoqueAPI.getById(estoqueId);
        } catch (error) {
          console.warn(`Item de estoque ${estoqueId} não encontrado para saída. Operação cancelada.`);
          continue; // Pular este item se não existe no estoque
        }
        
        await estoqueAPI.saida(estoqueId, {
          quantidade: item.quantidade,
          responsavelId: nota.responsavel,
          motivo: `Saída via Nota ${nota.numeroNota}`,
          observacoes: `Processamento automático da nota de saída ${nota.numeroNota} - ${nota.destinatario || 'Destinatário não informado'}`
        });
      } catch (error) {
        console.error(`Erro ao processar item ${item.tipoEPIId} da nota ${nota.numeroNota}:`, error);
      }
    }
    
    return nota;
  }
};

// ===== OPERAÇÕES DE MOVIMENTAÇÃO (novas funcionalidades) =====
export const movimentacaoNotasAPI = {
  // Criar nova movimentação multi-item (gera nota)
  criarMovimentacao: async (dados: {
    tipo: 'entrada' | 'saida';
    responsavel: string;
    motivo: string;
    observacoes?: string;
    fornecedor?: string;
    notaFiscal?: string;
    destinatario?: string;
    solicitante?: string;
    itens: Array<{
      tipoEPIId: string;
      quantidade: number;
      custoUnitario?: number;
      lote?: string;
      observacoes?: string;
    }>;
  }) => {
    const timestamp = Date.now();
    const numeroNota = `${dados.tipo.toUpperCase()}-${timestamp}`;
    
    // Preparar dados da nota
    const notaData = {
      id: `nota_${dados.tipo}_${timestamp}`,
      numeroNota,
      empresaId: 'almoxarifado',
      data: new Date().toISOString(),
      responsavel: dados.responsavel,
      motivo: dados.motivo,
      status: 'pendente',
      observacoes: dados.observacoes,
      itens: dados.itens.map(item => ({
        id: `item_${timestamp}_${Math.random().toString(36).substr(2, 5)}`,
        ...item
      }))
    };
    
    // Adicionar campos específicos do tipo
    if (dados.tipo === 'entrada') {
      Object.assign(notaData, {
        fornecedor: dados.fornecedor,
        notaFiscal: dados.notaFiscal,
        valorTotal: dados.itens.reduce((total, item) => 
          total + (item.quantidade * (item.custoUnitario || 0)), 0
        )
      });
    } else {
      Object.assign(notaData, {
        destinatario: dados.destinatario,
        solicitante: dados.solicitante
      });
    }
    
    // Criar a nota
    const nota = dados.tipo === 'entrada' 
      ? await notasEntradaAPI.create(notaData)
      : await notasSaidaAPI.create(notaData);
    
    // Processar automaticamente (atualizar estoque)
    if (dados.tipo === 'entrada') {
      await notasEntradaAPI.processar(nota.id);
    } else {
      await notasSaidaAPI.processar(nota.id);
    }
    
    return nota;
  },
  
  // Editar nota existente (com reflexão no estoque)
  editarNota: async (
    notaId: string, 
    tipo: 'entrada' | 'saida',
    novosItens: any[]
  ) => {
    // Buscar nota atual
    const notaAtual = tipo === 'entrada' 
      ? await notasEntradaAPI.getById(notaId)
      : await notasSaidaAPI.getById(notaId);
    
    // Se já foi processada, reverter movimentações antigas
    if (notaAtual.status === 'processada') {
      for (const item of notaAtual.itens) {
        try {
          // Reverter movimentação anterior
          if (tipo === 'entrada') {
            await estoqueAPI.saida(`estoque_almox_${item.tipoEPIId}`, {
              quantidade: item.quantidade,
              responsavelId: notaAtual.responsavel,
              motivo: `Reversão da nota ${notaAtual.numeroNota} (edição)`,
              observacoes: `Estorno automático para edição da nota`
            });
          } else {
            await estoqueAPI.entrada(`estoque_almox_${item.tipoEPIId}`, {
              quantidade: item.quantidade,
              responsavelId: notaAtual.responsavel,
              motivo: `Reversão da nota ${notaAtual.numeroNota} (edição)`,
              observacoes: `Estorno automático para edição da nota`
            });
          }
        } catch (error) {
          console.error(`Erro ao reverter item ${item.tipoEPIId}:`, error);
        }
      }
    }
    
    // Atualizar nota
    const notaAtualizada = {
      ...notaAtual,
      itens: novosItens,
      status: 'pendente' // Reset para pendente após edição
    };
    
    const nota = tipo === 'entrada'
      ? await notasEntradaAPI.update(notaId, notaAtualizada)
      : await notasSaidaAPI.update(notaId, notaAtualizada);
    
    // Processar novamente
    if (tipo === 'entrada') {
      await notasEntradaAPI.processar(notaId);
    } else {
      await notasSaidaAPI.processar(notaId);
    }
    
    return nota;
  }
};

// Exportar todas as APIs
export default {
  holdings: holdingsAPI,
  empresas: empresasAPI,
  colaboradores: colaboradoresAPI,
  tiposEPI: tiposEPIAPI,
  estoque: estoqueAPI,
  fichasEPI: fichasEPIAPI,
  entregas: entregasAPI,
  movimentacoes: movimentacoesAPI,
  notificacoes: notificacoesAPI,
  historico: historicoAPI,
  historicoEstoque: historicoEstoqueAPI,
  operacoes: operacoesAPI,
  notasEntrada: notasEntradaAPI,
  notasSaida: notasSaidaAPI,
  movimentacaoNotas: movimentacaoNotasAPI,
};