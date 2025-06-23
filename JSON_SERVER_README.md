# 🗄️ JSON Server - DataLife EPI

## 🚀 **Como Usar**

### **Comandos Disponíveis:**
```bash
# Rodar apenas o JSON Server
npm run db

# Rodar React + JSON Server juntos
npm run dev

# Verificar se JSON Server está rodando
npm run check-server
```

### **URLs Base:**
- **JSON Server:** http://localhost:3001
- **React App:** http://localhost:5174

---

## 🏗️ **Arquitetura Híbrida**

O projeto utiliza uma **arquitetura híbrida** que combina dados mockados estáticos com dados dinâmicos via JSON Server:

### **📋 Dados via Mock (src/mocks/data.ts):**
- `holdings` - Holdings do setor elétrico
- `empresas` - Empresas (holdings + contratadas)  
- `colaboradores` - Colaboradores das empresas

### **🔧 Dados no JSON Server (db.json) com CRUD:**
- `tiposEPI` - Catálogo de EPIs
- `estoque` - Controle de estoque
- `fichasEPI` - Fichas de EPI dos colaboradores
- `entregas` - Entregas de EPIs com assinatura
- `movimentacoesEstoque` - Histórico de movimentações
- `historicoEstoque` - Eventos detalhados de estoque
- `historico` - Histórico de operações nas fichas
- `notificacoes` - Notificações do sistema

### **🎯 Endpoints Reais (JSON Server):**
- http://localhost:3001/fichasEPI
- http://localhost:3001/entregas
- http://localhost:3001/estoque
- http://localhost:3001/movimentacoesEstoque
- http://localhost:3001/historicoEstoque
- http://localhost:3001/historico
- http://localhost:3001/notificacoes
- http://localhost:3001/tiposEPI

---

## 🔗 **Rotas Disponíveis**

### **Holdings (via Mock - src/mocks/data.ts)**
```javascript
// Acessível via holdingsAPI.getAll() e holdingsAPI.getById()
// Dados estáticos mockados do setor elétrico brasileiro
```

### **Empresas (via Mock - src/mocks/data.ts)**
```javascript
// Acessível via empresasAPI.getAll(), getById(), getByTipo(), getContratadas()
// Dados estáticos mockados (holdings + contratadas)
```

### **Colaboradores (via Mock - src/mocks/data.ts)**
```javascript
// Acessível via colaboradoresAPI.getAll(), getById(), getByEmpresa(), etc.
// Dados estáticos mockados (100+ colaboradores)
```

### **Tipos EPI (JSON Server - CRUD)**
```
GET    /tiposEPI
GET    /tiposEPI/{id}
GET    /tiposEPI?categoria={categoria}
GET    /tiposEPI?status={status}
GET    /tiposEPI?nomeEquipamento_like={query}
POST   /tiposEPI
PUT    /tiposEPI/{id}
PATCH  /tiposEPI/{id}
DELETE /tiposEPI/{id}
```

### **Estoque (JSON Server - CRUD)**
```
GET    /estoque
GET    /estoque/{id}
GET    /estoque?empresaId={empresaId}
GET    /estoque?tipoEPIId={tipoEPIId}
GET    /estoque?status={status}
POST   /estoque
PUT    /estoque/{id}
PATCH  /estoque/{id}
DELETE /estoque/{id}
```

### **Fichas EPI (JSON Server - CRUD)**
```
GET    /fichasEPI
GET    /fichasEPI/{id}
GET    /fichasEPI?colaboradorId={colaboradorId}
GET    /fichasEPI?empresaId={empresaId}
GET    /fichasEPI?status={status}
POST   /fichasEPI
PUT    /fichasEPI/{id}
PATCH  /fichasEPI/{id}
DELETE /fichasEPI/{id}
```

### **Entregas (JSON Server - CRUD)**
```
GET    /entregas
GET    /entregas/{id}
GET    /entregas?fichaEPIId={fichaEPIId}
GET    /entregas?status={status}
POST   /entregas
PUT    /entregas/{id}
PATCH  /entregas/{id}
DELETE /entregas/{id}
```

### **Movimentações (JSON Server - CRUD)**
```
GET    /movimentacoesEstoque
GET    /movimentacoesEstoque/{id}
GET    /movimentacoesEstoque?itemEstoqueId={itemId}
GET    /movimentacoesEstoque?tipo={tipo}
GET    /movimentacoesEstoque?responsavelId={responsavelId}
POST   /movimentacoesEstoque
PUT    /movimentacoesEstoque/{id}
DELETE /movimentacoesEstoque/{id}
```

### **Histórico de Estoque (JSON Server - CRUD Específico)**
```
GET    /historicoEstoque
GET    /historicoEstoque/{id}
GET    /historicoEstoque?itemEstoqueId={itemId}&_sort=data&_order=desc
GET    /historicoEstoque?tipo={tipo}
GET    /historicoEstoque?responsavel={responsavel}
GET    /historicoEstoque?data_gte={dataInicio}&data_lte={dataFim}
POST   /historicoEstoque
```

### **Histórico (JSON Server - CRUD)**
```
GET    /historico
GET    /historico/{id}
GET    /historico?fichaEPIId={fichaId}&_sort=data&_order=desc
GET    /historico?tipo={tipo}
GET    /historico?responsavel={responsavel}
POST   /historico
PUT    /historico/{id}
DELETE /historico/{id}
```

### **Notificações (JSON Server - CRUD)**
```
GET    /notificacoes
GET    /notificacoes/{id}
GET    /notificacoes?lida=false
GET    /notificacoes?tipo={tipo}
POST   /notificacoes
PUT    /notificacoes/{id}
PATCH  /notificacoes/{id}
DELETE /notificacoes/{id}
```

---

## 🔍 **Filtros e Busca (JSON Server)**

### **Filtros por Campo:**
```
GET /estoque?empresaId=1
GET /fichasEPI?status=ativo
GET /entregas?status=nao_assinado
GET /tiposEPI?categoria=Proteção+Respiratória
```

### **Busca por Texto:**
```
GET /tiposEPI?nomeEquipamento_like=Capacete
GET /fichasEPI?colaboradorId=1
```

### **Ordenação:**
```
GET /fichasEPI?_sort=dataEmissao&_order=desc
GET /entregas?_sort=dataEntrega&_order=asc
GET /historicoEstoque?_sort=data&_order=desc
```

### **Paginação:**
```
GET /fichasEPI?_page=1&_limit=10
GET /estoque?_page=2&_limit=20
```

### **Relacionamentos:**
```
GET /fichasEPI?_embed=entregas
GET /fichasEPI/{id}?_embed=entregas
```

---

## 💡 **Exemplos de Uso**

### **Dados Mockados (Estáticos):**
```javascript
// ✅ Continua usando mocks (dados de referência)
import { colaboradoresAPI } from '../services/api';
const colaboradores = await colaboradoresAPI.getAll(); // Import dos mocks
const empresa = await empresasAPI.getById('1'); // Import dos mocks
```

### **Dados do JSON Server (Dinâmicos):**
```javascript
// ✅ Usa JSON Server (dados modificáveis)
import { fichasEPIAPI } from '../services/api';
const fichas = await fichasEPIAPI.getAll(); // Fetch para localhost:3001
const estoque = await estoqueAPI.getAll(); // Fetch para localhost:3001
```

### **Exemplo de Uso Híbrido:**
```javascript
// Mock para dados de referência
const colaborador = await colaboradoresAPI.getById('1');
const empresa = await empresasAPI.getById('1');

// JSON Server para dados operacionais
const fichas = await fichasEPIAPI.getByColaborador('1');
const entregas = await entregasAPI.getByFicha('ficha_123');
```

### **Criar Nova Ficha:**
```javascript
POST /fichasEPI
{
  "id": "nova_ficha_123",
  "colaboradorId": "1",
  "empresaId": "1", 
  "dataEmissao": "2024-01-15T00:00:00.000Z",
  "dataValidade": "2025-01-15T00:00:00.000Z",
  "status": "ativo",
  "itens": []
}
```

### **Criar Nova Entrega:**
```javascript
POST /entregas
{
  "id": "entrega_123",
  "fichaEPIId": "1",
  "dataEntrega": "2024-01-15T00:00:00.000Z",
  "itens": [
    {
      "id": "item_1",
      "tipoEPIId": "1",
      "quantidade": 1,
      "dataValidade": "2026-01-15T00:00:00.000Z"
    }
  ],
  "responsavel": "Supervisor EPI",
  "status": "nao_assinado"
}
```

---

## ⚙️ **Operações Compostas**

### **Criar Entrega Completa:**
```javascript
// Cria entrega + atualiza ficha + reduz estoque + registra histórico
const entrega = await operacoesAPI.criarEntregaCompleta({
  fichaEPIId: 'ficha_123',
  itens: [{ tipoEPIId: 'epi_001', quantidade: 1 }],
  responsavel: 'João Silva'
});
```

### **Processar Devolução:**
```javascript
// Atualiza ficha + reestoca itens + registra histórico
const resultado = await operacoesAPI.processarDevolucao({
  fichaEPIId: 'ficha_123',
  itens: [{ id: 'item_1', tipoEPIId: 'epi_001', quantidade: 1, motivo: 'Danificado' }],
  responsavel: 'Maria Santos'
});
```

### **Buscar Ficha Completa:**
```javascript
// Busca ficha + colaborador + empresa + entregas em uma operação
const dados = await operacoesAPI.getFichaCompleta('ficha_123');
// Retorna: { ficha, colaborador, empresa, entregas }
```

---

## 🎯 **Status Disponíveis**

### **TipoEPI:**
- `ativo` - Disponível para uso
- `inativo` - Descontinuado

### **Estoque:**
- `disponivel` - Estoque normal
- `baixo_estoque` - Abaixo do mínimo
- `vencido` - Data de validade expirada
- `esgotado` - Quantidade zero

### **FichaEPI:**
- `ativo` - Ficha válida
- `suspenso` - Temporariamente suspensa
- `arquivado` - Colaborador desligado
- `vencido` - Data de validade expirada

### **Entrega:**
- `nao_assinado` - Aguardando assinatura
- `assinado` - Entrega confirmada
- `pendente` - Em processo

### **ItemFicha:**
- `entregue` - Item em uso
- `devolvido` - Item retornado
- `danificado` - Item danificado
- `perdido` - Item extraviado

---

## 🔧 **Troubleshooting**

### **JSON Server não inicia:**
```bash
# Verificar se porta 3001 está ocupada
lsof -i :3001

# Matar processos na porta
kill -9 $(lsof -t -i:3001)

# Reiniciar
npm run db
```

### **Erro de CORS:**
- JSON Server já está configurado para aceitar CORS
- Certificar que `mode: 'cors'` está nas requisições

### **Dados não persistem:**
- Verificar se `db.json` existe e tem permissões de escrita
- Verificar logs do JSON Server para erros de escrita

---

## 📝 **Notas Importantes**

1. **Dados Mockados**: Holdings, Empresas e Colaboradores são **estáticos** e não passam pelo JSON Server
2. **Dados Dinâmicos**: Fichas, Estoque, Entregas são **persistidos** no JSON Server
3. **Operações Compostas**: Use `operacoesAPI` para operações complexas que envolvem múltiplas entidades
4. **Histórico**: Duas tabelas separadas - `historico` (fichas) e `historicoEstoque` (estoque)
5. **Check Server**: O comando `npm start` verifica automaticamente se JSON Server está rodando