import React, { useState, useRef, useEffect } from 'react';
import { TextInput, Button } from 'flowbite-react';
import { ChevronDownIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface Option {
  value: string;
  label: string;
  subtitle?: string;
}

interface SearchableDropdownProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  allOptionsLabel?: string;
  sizing?: 'sm' | 'md' | 'lg';
  className?: string;
  showSubtitle?: boolean;
  disabled?: boolean;
}

const SearchableDropdown: React.FC<SearchableDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = "Selecionar...",
  searchPlaceholder = "Buscar...",
  allOptionsLabel = "Todos",
  sizing = "sm",
  className = "",
  showSubtitle = false,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = options.find(option => option.value === value);
  const displayText = value === '' || value === 'todas' || value === 'selecione' ? allOptionsLabel : selectedOption?.label || placeholder;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <Button
        type="button"
        color="light"
        sizing={sizing}
        className="rounded-sm w-full justify-between"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <span className="text-left truncate">{displayText}</span>
        <ChevronDownIcon className={`w-4 h-4 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && !disabled && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-sm shadow-lg dark:bg-gray-700 dark:border-gray-600">
          <div className="p-3 border-b border-gray-200 dark:border-gray-600">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <MagnifyingGlassIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </div>
              <TextInput
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sizing="sm"
                className="pl-10 rounded-sm"
              />
            </div>
          </div>
          
          <div className="max-h-48 overflow-y-auto">
            <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
              <li>
                <Button
                  type="button"
                  color="gray"
                  size="sm"
                  className={`block w-full px-4 py-2 text-left justify-start rounded-none border-none ${
                    (value === '' || value === 'todas' || value === 'selecione') ? 'bg-gray-100 dark:bg-gray-600' : ''
                  }`}
                  onClick={() => handleSelect('selecione')}
                >
                  {allOptionsLabel}
                </Button>
              </li>
              {filteredOptions.map((option) => (
                <li key={option.value}>
                  <Button
                    type="button"
                    color="gray"
                    size="sm"
                    className={`block w-full px-4 py-2 text-left justify-start rounded-none border-none ${
                      value === option.value ? 'bg-gray-100 dark:bg-gray-600' : ''
                    }`}
                    onClick={() => handleSelect(option.value)}
                  >
                    <div className="flex flex-col">
                      <span className="text-sm">{option.label}</span>
                      {showSubtitle && option.subtitle && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {option.subtitle}
                        </span>
                      )}
                    </div>
                  </Button>
                </li>
              ))}
              {filteredOptions.length === 0 && searchTerm && (
                <li>
                  <div className="px-4 py-2 text-gray-500 dark:text-gray-400">
                    Nenhum resultado encontrado
                  </div>
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableDropdown;