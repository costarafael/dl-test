const http = require('http');

const checkServer = () => {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:3001/tiposEPI', (res) => {
      resolve(res.statusCode === 200);
    });
    
    req.on('error', () => {
      resolve(false);
    });
    
    req.setTimeout(1000, () => {
      req.destroy();
      resolve(false);
    });
  });
};

const waitForServer = async (maxWaitTime = 30000) => {
  const startTime = Date.now();
  
  console.log('🔍 Verificando se JSON Server está rodando...');
  
  while (Date.now() - startTime < maxWaitTime) {
    const isRunning = await checkServer();
    
    if (isRunning) {
      console.log('✅ JSON Server está rodando na porta 3001');
      return true;
    }
    
    console.log('⏳ Aguardando JSON Server...');
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('❌ JSON Server não foi encontrado após 30s');
  console.log('💡 Execute: npm run db (em outro terminal)');
  return false;
};

// Se executado diretamente
if (require.main === module) {
  waitForServer().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { checkServer, waitForServer };