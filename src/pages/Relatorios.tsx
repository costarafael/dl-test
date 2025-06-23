import React, { useState } from 'react';
import { 
  Button, 
  Badge, 
  Select, 
  Label, 
  TextInput,
  Card,
  Table
} from 'flowbite-react';
import { 
  DocumentTextIcon,
  ChartBarIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  ArrowDownTrayIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { fichasEPI, empresas, colaboradores } from '../mocks/data';
import type { Empresa } from '../types';

const Relatorios: React.FC = () => {
  const [tipoRelatorio, setTipoRelatorio] = useState<string>('');
  const [periodoInicio, setPeriodoInicio] = useState<string>('');
  const [periodoFim, setPeriodoFim] = useState<string>('');

  // Métricas calculadas
  const totalFichas = fichasEPI.length;
  const fichasAtivas = fichasEPI.filter(f => f.status === 'ativo').length;
  // Removida variável não utilizada
  // const colaboradoresAtivos = colaboradores.filter(c => c.status === 'ativo').length;
  const totalEPIsEntregues = fichasEPI.reduce((acc, ficha) => 
    acc + (ficha.itens?.filter(item => item.status === 'entregue').length || 0), 0
  );
  const episPorVencer = fichasEPI.reduce((acc, ficha) => {
    const itensVencendo = ficha.itens?.filter(item => {
      if (item.status !== 'entregue') return false;
      const dataValidade = new Date(item.dataValidade);
      const hoje = new Date();
      const diasParaVencer = Math.ceil((dataValidade.getTime() - hoje.getTime()) / (1000 * 3600 * 24));
      return diasParaVencer <= 30 && diasParaVencer > 0;
    }).length || 0;
    return acc + itensVencendo;
  }, 0);

  const gerarRelatorio = () => {
    // Simulação de geração de relatório
    alert(`Relatório "${tipoRelatorio}" gerado com sucesso!\nPeríodo: ${periodoInicio} até ${periodoFim}`);
  };

  const relatoriosDisponiveis = [
    {
      id: 'fichas-ativas',
      nome: 'Fichas Ativas por Colaborador',
      descricao: 'Lista de todas as fichas ativas com itens entregues',
      icon: UserGroupIcon
    },
    {
      id: 'posicao-estoque',
      nome: 'Posição Atual de Estoque',
      descricao: 'Relatório detalhado do estoque atual por EPI',
      icon: ClipboardDocumentListIcon
    },
    {
      id: 'epis-vencimento',
      nome: 'EPIs Próximos ao Vencimento',
      descricao: 'Lista de EPIs que vencem nos próximos 30 dias',
      icon: CalendarIcon
    },
    {
      id: 'movimentacao',
      nome: 'Movimentação de Estoque',
      descricao: 'Histórico de entradas e saídas do estoque',
      icon: ChartBarIcon
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Relatórios</h1>
      </div>

      {/* Dashboard de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center">
            <Badge color="primary" size="lg" className="p-3 rounded-full w-fit">
              <DocumentTextIcon className="w-6 h-6" />
            </Badge>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Fichas</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalFichas}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <Badge color="green" size="lg" className="p-3 rounded-full w-fit">
              <UserGroupIcon className="w-6 h-6" />
            </Badge>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Fichas Ativas</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{fichasAtivas}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <Badge color="purple" size="lg" className="p-3 rounded-full w-fit">
              <ClipboardDocumentListIcon className="w-6 h-6" />
            </Badge>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">EPIs Entregues</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalEPIsEntregues}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <Badge color="yellow" size="lg" className="p-3 rounded-full w-fit">
              <CalendarIcon className="w-6 h-6" />
            </Badge>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Vencendo (30d)</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{episPorVencer}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Gerador de Relatórios */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Gerar Relatório</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <Label htmlFor="tipoRelatorio" className="text-gray-700 dark:text-gray-300">Tipo de Relatório</Label>
              <Select 
                id="tipoRelatorio" 
                value={tipoRelatorio} 
                onChange={(e) => setTipoRelatorio(e.target.value)}
                sizing="sm"
                className="rounded-sm"
              >
                <option value="">Selecione o tipo</option>
                {relatoriosDisponiveis.map(rel => (
                  <option key={rel.id} value={rel.id}>
                    {rel.nome}
                  </option>
                ))}
              </Select>
            </div>
            
            <div>
              <Label htmlFor="periodoInicio" className="text-gray-700 dark:text-gray-300">Data Inicial</Label>
              <TextInput
                id="periodoInicio"
                type="date"
                value={periodoInicio}
                onChange={(e) => setPeriodoInicio(e.target.value)}
                sizing="sm"
                className="rounded-sm"
              />
            </div>
            
            <div>
              <Label htmlFor="periodoFim" className="text-gray-700 dark:text-gray-300">Data Final</Label>
              <TextInput
                id="periodoFim"
                type="date"
                value={periodoFim}
                onChange={(e) => setPeriodoFim(e.target.value)}
                sizing="sm"
                className="rounded-sm"
              />
            </div>
          </div>

          <div className="flex space-x-3">
            <Button 
              onClick={gerarRelatorio}
              disabled={!tipoRelatorio}
              color="primary"
              sizing="xs"
              className="rounded-sm"
            >
              <DocumentTextIcon className="w-4 h-4 mr-2" />
              Visualizar
            </Button>
            <Button 
              onClick={gerarRelatorio}
              disabled={!tipoRelatorio}
              color="success"
              sizing="xs"
              className="rounded-sm"
            >
              <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
              Exportar PDF
            </Button>
          </div>
        </div>
      </Card>

      {/* Lista de Relatórios Disponíveis */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Relatórios Disponíveis</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {relatoriosDisponiveis.map((relatorio) => {
              const IconComponent = relatorio.icon;
              return (
                <Card key={relatorio.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <div className="flex items-start space-x-3">
                    <Badge color="gray" size="lg" className="p-2 rounded-sm w-fit">
                      <IconComponent className="w-5 h-5" />
                    </Badge>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">{relatorio.nome}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{relatorio.descricao}</p>
                      <div className="mt-2">
                        <Badge color="gray" size="sm" className="w-fit">Disponível</Badge>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Resumo por Empresa */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Resumo por Empresa</h3>
          
          <div className="overflow-x-auto">
            <Table hoverable>
              <Table.Head>
                <Table.HeadCell>Empresa</Table.HeadCell>
                <Table.HeadCell>Colaboradores</Table.HeadCell>
                <Table.HeadCell>Fichas Ativas</Table.HeadCell>
                <Table.HeadCell>EPIs Entregues</Table.HeadCell>
                <Table.HeadCell>Status</Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y">
                {empresas.map((empresa: Empresa) => {
                  const colaboradoresDaEmpresa = colaboradores.filter(c => c.empresaId === empresa.id);
                  const fichasDaEmpresa = fichasEPI.filter(f => f.empresaId === empresa.id);
                  const fichasAtivasDaEmpresa = fichasDaEmpresa.filter(f => f.status === 'ativo');
                  const episEntreguesDaEmpresa = fichasDaEmpresa.reduce((acc, ficha) => 
                    acc + (ficha.itens?.filter(item => item.status === 'entregue').length || 0), 0
                  );
                  
                  return (
                    <Table.Row key={empresa.id} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                      <Table.Cell className="font-medium text-gray-900 dark:text-white">
                        {empresa.nome}
                      </Table.Cell>
                      <Table.Cell className="text-gray-900 dark:text-white">
                        {colaboradoresDaEmpresa.length}
                      </Table.Cell>
                      <Table.Cell className="text-gray-900 dark:text-white">
                        {fichasAtivasDaEmpresa.length}
                      </Table.Cell>
                      <Table.Cell className="text-gray-900 dark:text-white">
                        {episEntreguesDaEmpresa}
                      </Table.Cell>
                      <Table.Cell className="text-gray-900 dark:text-white">
                        <Badge color={empresa.status === 'ativa' ? 'success' : 'gray'}>
                          {empresa.status}
                        </Badge>
                      </Table.Cell>
                    </Table.Row>
                  );
                })}
              </Table.Body>
            </Table>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Relatorios;