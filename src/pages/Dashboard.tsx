import React from 'react';
import { 
  Card, 
  Badge, 
  Spinner,
  Alert 
} from 'flowbite-react';
import { 
  DocumentTextIcon,
  ShoppingBagIcon,
  ExclamationTriangleIcon as ExclamationIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const Dashboard: React.FC = () => {
  const metrics = [
    {
      title: 'Fichas Ativas',
      value: '150',
      icon: DocumentTextIcon,
      color: 'info'
    },
    {
      title: 'EPIs Entregues',
      value: '1,245',
      icon: CheckCircleIcon,
      color: 'success'
    },
    {
      title: 'EPIs Vencendo',
      value: '23',
      icon: ExclamationIcon,
      color: 'warning'
    },
    {
      title: 'Estoque Baixo',
      value: '12',
      icon: ShoppingBagIcon,
      color: 'failure'
    }
  ];

  const charts = [
    {
      title: 'Entregas por Mês',
      content: 'Gráfico será implementado'
    },
    {
      title: 'EPIs por Categoria',
      content: 'Gráfico será implementado'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
      </div>

      {/* Cards de métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <div className="flex items-center">
                <Badge color={metric.color as any} size="lg" className="p-3 rounded-full w-fit">
                  <Icon className="w-6 h-6" />
                </Badge>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{metric.title}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {metric.value}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Gráficos e tabelas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {charts.map((chart, index) => (
          <Card key={index} className="h-full">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              {chart.title}
            </h3>
            <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-gray-500 dark:text-gray-400">{chart.content}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Alertas e notificações podem ser adicionados assim: */}
      <Alert color="info" withBorderAccent>
        <div className="flex items-center">
          <Spinner size="sm" className="mr-3" />
          <span>Carregando dados atualizados...</span>
        </div>
      </Alert>
    </div>
  );
};

export default Dashboard;