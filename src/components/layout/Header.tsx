import React from 'react';
import { Dropdown, Avatar, Button, Badge } from 'flowbite-react';
import { 
  Bars3Icon, 
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { ServerStatusIndicator } from '../../utils/serverCheck';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  return (
    <nav className="fixed top-0 z-50 w-full bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
      <div className="px-3 py-3 lg:px-5 lg:pl-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-start rtl:justify-end">
            {/* Mobile menu button */}
            <Button
              onClick={onMenuClick}
              color="light"
              sizing="xs"
              className="sm:hidden rounded-sm"
            >
              <span className="sr-only">Abrir sidebar</span>
              <Bars3Icon className="w-6 h-6" />
            </Button>

            {/* Logo */}
            <Link to="/" className="flex ms-2 md:me-24">
              <Badge color="info" size="lg" className="mr-3 flex items-center justify-center w-8 h-8">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </Badge>
              <span className="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap dark:text-white">
                DataLife EPI
              </span>
            </Link>
          </div>

          <div className="flex items-center">
            <div className="flex items-center ms-3 space-x-4">
              <ServerStatusIndicator />

              {/* Company/Space dropdown */}
              <Dropdown
                arrowIcon={false}
                inline
                label={
                  <div className="flex items-center cursor-pointer">
                    <span className="hidden sm:block text-sm text-gray-700 dark:text-gray-300">Nortetech Serviços</span>
                    <ChevronDownIcon className="w-4 h-4 ms-2 text-gray-500" />
                  </div>
                }
              >
                <Dropdown.Header>
                  <span className="block text-sm font-medium">Empresa Atual</span>
                  <span className="block text-sm truncate">Nortetech Serviços</span>
                </Dropdown.Header>
                <Dropdown.Item>
                  DataLife Corp
                </Dropdown.Item>
                <Dropdown.Item>
                  Alterar empresa
                </Dropdown.Item>
              </Dropdown>

              {/* User menu */}
              <Dropdown
                arrowIcon={false}
                inline
                label={
                  <div className="flex items-center cursor-pointer">
                    <Avatar
                      alt="Admin User"
                      rounded
                      size="sm"
                      className="ms-3"
                    >
                      AU
                    </Avatar>
                    <span className="hidden sm:block text-sm text-gray-700 dark:text-gray-300 ml-2">Admin User</span>
                  </div>
                }
              >
                <Dropdown.Header>
                  <span className="block text-sm">Admin User</span>
                  <span className="block text-sm font-medium truncate">admin@datalife.com</span>
                </Dropdown.Header>
                <Dropdown.Item>
                  Perfil
                </Dropdown.Item>
                <Dropdown.Item>
                  Configurações
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item>
                  Sair
                </Dropdown.Item>
              </Dropdown>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;