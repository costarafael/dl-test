import React, { useState } from 'react';
import { 
  ChartPieIcon, 
  ShoppingBagIcon, 
  DocumentTextIcon, 
  CogIcon,
  SunIcon,
  MoonIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import { Link, useLocation } from 'react-router-dom';
import { Sidebar, Dropdown } from 'flowbite-react';
import { useTheme } from '../../contexts/ThemeContext';
import Header from './Header';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const [selectedEmpreendimento, setSelectedEmpreendimento] = useState('Empreendimento 1');
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const isActive = (path: string) => {
    if (path === '/estoque' && (location.pathname === '/estoque' || location.pathname === '/catalogo')) {
      return true;
    }
    return location.pathname === path;
  };




  return (
    <>
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      
      {/* Sidebar */}
      <Sidebar
        aria-label="Sidebar"
        className={`fixed top-0 left-0 z-40 w-64 h-screen pt-20 transition-transform bg-white dark:bg-gray-800 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } sm:translate-x-0`}
      >
        <div className="h-full flex flex-col">
          {/* Dropdown de Empreendimentos */}
          <div className="px-3 pt-4 pb-2 border-b border-gray-200 dark:border-gray-700">
            <Dropdown
              label={selectedEmpreendimento}
              dismissOnClick={true}
              size="sm"
              color="light"
              className="w-full"
            >
              <Dropdown.Item 
                onClick={() => setSelectedEmpreendimento('Empreendimento 1')}
                icon={BuildingOfficeIcon}
              >
                Empreendimento 1
              </Dropdown.Item>
              <Dropdown.Item 
                onClick={() => setSelectedEmpreendimento('Empreendimento 2')}
                icon={BuildingOfficeIcon}
              >
                Empreendimento 2
              </Dropdown.Item>
              <Dropdown.Item 
                onClick={() => setSelectedEmpreendimento('Empreendimento 3')}
                icon={BuildingOfficeIcon}
              >
                Empreendimento 3
              </Dropdown.Item>
            </Dropdown>
          </div>

          {/* Menu Items */}
          <div className="flex-1 px-3 pb-4 overflow-y-auto">
            <Sidebar.Items>
              <Sidebar.ItemGroup>
                <Sidebar.Item
                  as={Link}
                  to="/"
                  icon={ChartPieIcon}
                  active={isActive('/')}
                >
                  Dashboard
                </Sidebar.Item>
              </Sidebar.ItemGroup>

              <Sidebar.ItemGroup>
                <Sidebar.Item
                  as={Link}
                  to="/fichas"
                  icon={DocumentTextIcon}
                  active={isActive('/fichas')}
                >
                  Fichas de EPI
                </Sidebar.Item>

                <Sidebar.Collapse
                  icon={ShoppingBagIcon}
                  label="Gestão de Estoque"
                  open={location.pathname === '/estoque' || location.pathname === '/catalogo'}
                >
                  <Sidebar.Item
                    as={Link}
                    to="/estoque"
                    active={location.pathname === '/estoque'}
                  >
                    Estoque
                  </Sidebar.Item>
                  <Sidebar.Item
                    as={Link}
                    to="/catalogo"
                    active={location.pathname === '/catalogo'}
                  >
                    Catálogo de EPIs
                  </Sidebar.Item>
                </Sidebar.Collapse>
              </Sidebar.ItemGroup>

              <Sidebar.ItemGroup>
                <Sidebar.Item
                  as={Link}
                  to="/relatorios"
                  icon={DocumentTextIcon}
                  active={isActive('/relatorios')}
                >
                  Relatórios
                </Sidebar.Item>
              </Sidebar.ItemGroup>
            </Sidebar.Items>
          </div>

          {/* Configurações (at bottom) */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <Sidebar.ItemGroup>
              <Sidebar.Collapse
                icon={CogIcon}
                label="Configurações"
                open={configOpen}
                onClick={() => setConfigOpen(!configOpen)}
              >
                <Sidebar.Item
                  onClick={toggleTheme}
                  icon={theme === 'light' ? MoonIcon : SunIcon}
                >
                  {theme === 'light' ? 'Tema Escuro' : 'Tema Claro'}
                </Sidebar.Item>
              </Sidebar.Collapse>
            </Sidebar.ItemGroup>
          </div>
        </div>
      </Sidebar>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="bg-gray-900 bg-opacity-50 dark:bg-opacity-80 fixed inset-0 z-30 sm:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main content */}
      <div className="sm:ml-64 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="p-6 mt-14">
          {children}
        </div>
      </div>
    </>
  );
};

export default MainLayout;