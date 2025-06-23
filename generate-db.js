const fs = require('fs');
const path = require('path');

// Template de banco de dados limpo com estrutura básica
const createCleanDatabase = () => {
  return {
    fichasEPI: [],
    entregas: [],
    estoque: [
      {
        id: "estoque_almox_epi_001",
        tipoEPIId: "epi_001",
        empresaId: "almoxarifado",
        quantidade: 50,
        quantidadeMinima: 10,
        localizacao: "Almoxarifado Central",
        lote: "LOTE-001-2025",
        dataValidade: "2027-12-31"
      },
      {
        id: "estoque_almox_epi_002",
        tipoEPIId: "epi_002",
        empresaId: "almoxarifado",
        quantidade: 30,
        quantidadeMinima: 20,
        localizacao: "Almoxarifado Central",
        lote: "LOTE-002-2025",
        dataValidade: "2026-12-31"
      },
      {
        id: "estoque_almox_epi_003",
        tipoEPIId: "epi_003",
        empresaId: "almoxarifado",
        quantidade: 100,
        quantidadeMinima: 50,
        localizacao: "Almoxarifado Central",
        lote: "LOTE-003-2025",
        dataValidade: "2025-12-31"
      },
      {
        id: "estoque_almox_epi_004",
        tipoEPIId: "epi_004",
        empresaId: "almoxarifado",
        quantidade: 200,
        quantidadeMinima: 100,
        localizacao: "Almoxarifado Central",
        lote: "LOTE-004-2025",
        dataValidade: "2025-07-31"
      },
      {
        id: "estoque_almox_epi_005",
        tipoEPIId: "epi_005",
        empresaId: "almoxarifado",
        quantidade: 40,
        quantidadeMinima: 20,
        localizacao: "Almoxarifado Central",
        lote: "LOTE-005-2025",
        dataValidade: "2026-06-30"
      }
    ],
    movimentacoesEstoque: [],
    historicoEstoque: [],
    historico: [],
    notificacoes: [],
    tiposEPI: [
      {
        id: "epi_001",
        numeroCA: "12345",
        nomeEquipamento: "Capacete de Segurança Classe A",
        descricao: "Capacete de segurança em polietileno de alta densidade, classe A",
        fabricante: "3M",
        categoria: "Proteção da Cabeça",
        vidaUtilDias: 1095,
        foto: "",
        status: "ativo"
      },
      {
        id: "epi_002",
        numeroCA: "23456",
        nomeEquipamento: "Óculos de Proteção Ampla Visão",
        descricao: "Óculos de proteção com lentes em policarbonato",
        fabricante: "MSA",
        categoria: "Proteção dos Olhos",
        vidaUtilDias: 730,
        foto: "",
        status: "ativo"
      },
      {
        id: "epi_003",
        numeroCA: "34567",
        nomeEquipamento: "Luvas de Segurança Vaqueta",
        descricao: "Luvas em vaqueta com reforço em raspa",
        fabricante: "Danny",
        categoria: "Proteção das Mãos",
        vidaUtilDias: 365,
        foto: "",
        status: "ativo"
      },
      {
        id: "epi_004",
        numeroCA: "45678",
        nomeEquipamento: "Botina de Segurança com Bico de Aço",
        descricao: "Botina de segurança em couro com bico de aço",
        fabricante: "Marluvas",
        categoria: "Proteção dos Pés",
        vidaUtilDias: 365,
        foto: "",
        status: "ativo"
      },
      {
        id: "epi_005",
        numeroCA: "56789",
        nomeEquipamento: "Respirador PFF2",
        descricao: "Respirador descartável contra partículas PFF2",
        fabricante: "3M",
        categoria: "Proteção Respiratória",
        vidaUtilDias: 30,
        foto: "",
        status: "ativo"
      }
    ]
  };
};

const generateDatabase = () => {
  const dbPath = path.join(__dirname, 'db.json');
  const backupPath = path.join(__dirname, 'db-backup.json');
  
  try {
    // Fazer backup do banco atual se existir
    if (fs.existsSync(dbPath)) {
      console.log('📦 Fazendo backup do banco atual...');
      const currentDb = fs.readFileSync(dbPath, 'utf8');
      fs.writeFileSync(backupPath, currentDb);
      console.log('✅ Backup salvo em db-backup.json');
    }
    
    // Gerar novo banco limpo
    console.log('🔄 Gerando novo banco de dados...');
    const cleanDb = createCleanDatabase();
    
    fs.writeFileSync(dbPath, JSON.stringify(cleanDb, null, 2));
    console.log('✅ Novo banco de dados gerado em db.json');
    console.log('📊 Estrutura criada:');
    console.log(`   - ${cleanDb.tiposEPI.length} tipos de EPI`);
    console.log(`   - ${cleanDb.estoque.length} itens de estoque`);
    console.log(`   - Tabelas: fichasEPI, entregas, movimentacoesEstoque, historicoEstoque, historico, notificacoes`);
    
  } catch (error) {
    console.error('❌ Erro ao gerar banco de dados:', error);
    process.exit(1);
  }
};

// Se executado diretamente
if (require.main === module) {
  generateDatabase();
}

module.exports = { generateDatabase, createCleanDatabase };