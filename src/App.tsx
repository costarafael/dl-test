import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Alert, Button, Spinner, Flowbite } from 'flowbite-react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { ThemeProvider } from './contexts/ThemeContext';
import MainLayout from './components/layout/MainLayout';

// Tema customizado do Flowbite
const customTheme = {
  button: {
    color: {
      primary: 'text-white bg-primary-700 border border-transparent enabled:hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 disabled:hover:bg-primary-700 dark:bg-primary-600 dark:enabled:hover:bg-primary-700 dark:focus:ring-primary-800 dark:disabled:hover:bg-primary-600',
    }
  }
};

// Componente de carregamento
const LoadingFallback = () => (
  <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900">
    <div className="text-center">
      <Spinner size="xl" className="mb-4" />
      <h2 className="text-lg font-medium text-gray-700 dark:text-gray-300">Carregando...</h2>
    </div>
  </div>
);

// Componente de erro
const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    const errorHandler = (error: ErrorEvent) => {
      console.error('Erro na aplicação:', error);
      setHasError(true);
    };

    window.addEventListener('error', errorHandler);
    return () => window.removeEventListener('error', errorHandler);
  }, []);

  if (hasError) {
    return (
      <div className="max-w-4xl mx-auto mt-8 p-6">
        <Alert color="failure" withBorderAccent>
          <ExclamationTriangleIcon className="h-4 w-4" />
          <span className="font-medium">Ocorreu um erro na aplicação</span>
          <div className="mt-2 mb-4">
            <p>Por favor, recarregue a página ou tente novamente mais tarde.</p>
            <p>Se o problema persistir, entre em contato com o suporte.</p>
          </div>
          <div className="flex">
            <Button 
              size="sm" 
              color="failure" 
              onClick={() => window.location.reload()}
              className="rounded-sm"
            >
              Recarregar Página
            </Button>
          </div>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
};

// Carregamento dinâmico dos componentes com React.lazy
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const CatalogoEPIs = React.lazy(() => import('./pages/CatalogoEPIs'));
const EstoqueEPIs = React.lazy(() => import('./pages/EstoqueEPIs'));
const MovimentacoesEstoque = React.lazy(() => import('./pages/MovimentacoesEstoque'));
const FichasEPI = React.lazy(() => import('./pages/FichasEPI'));
const FichaEPIDetalhes = React.lazy(() => import('./pages/FichaEPIDetalhes'));
const Relatorios = React.lazy(() => import('./pages/Relatorios'));

function App() {
  return (
    <ErrorBoundary>
      <Flowbite theme={{ theme: customTheme }}>
        <ThemeProvider>
          <Router>
            <Suspense fallback={<LoadingFallback />}>
              <MainLayout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/catalogo" element={<CatalogoEPIs />} />
                  <Route path="/estoque" element={<EstoqueEPIs />} />
                  <Route path="/movimentacoes" element={<MovimentacoesEstoque />} />
                  <Route path="/fichas" element={<FichasEPI />} />
                  <Route path="/fichas/:id" element={<FichaEPIDetalhes />} />
                  <Route path="/relatorios" element={<Relatorios />} />
                  <Route path="*" element={<div>Página não encontrada</div>} />
                </Routes>
              </MainLayout>
            </Suspense>
          </Router>
        </ThemeProvider>
      </Flowbite>
    </ErrorBoundary>
  );
}

export default App;
