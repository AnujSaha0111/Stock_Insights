import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { POPULAR_COMPANIES, searchCompanies } from '../data/companies';
import { Company } from '../types/stock';

interface CompanySearchProps {
  onSelect: (company: Company) => void;
  selectedCompany?: Company;
}

export function CompanySearch({ onSelect, selectedCompany }: CompanySearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>(POPULAR_COMPANIES);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchTerm) {
      setFilteredCompanies(searchCompanies(searchTerm));
    } else {
      setFilteredCompanies(POPULAR_COMPANIES);
    }
  }, [searchTerm]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (company: Company) => {
    onSelect(company);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && filteredCompanies.length > 0) {
      handleSelect(filteredCompanies[0]);
    } else if (event.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label htmlFor="company-search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Select Company
      </label>
      
      <div className="relative">
        <div className="flex">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              ref={inputRef}
              id="company-search"
              type="text"
              placeholder={selectedCompany ? selectedCompany.name : "Search companies..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsOpen(true)}
              onKeyDown={handleKeyDown}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              aria-expanded={isOpen}
              aria-haspopup="listbox"
              role="combobox"
            />
          </div>
          
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="px-3 py-2 border border-l-0 border-gray-300 dark:border-gray-600 rounded-r-lg bg-gray-50 dark:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-500 transition-colors"
            aria-label="Toggle dropdown"
          >
            <ChevronDown className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {selectedCompany && !searchTerm && (
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Selected: {selectedCompany.name} ({selectedCompany.symbol})
          </div>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto">
          {filteredCompanies.length > 0 ? (
            <ul role="listbox" className="py-1">
              {filteredCompanies.map((company) => (
                <li key={company.symbol}>
                  <button
                    type="button"
                    onClick={() => handleSelect(company)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 focus:bg-gray-100 dark:focus:bg-gray-600 focus:outline-none transition-colors"
                    role="option"
                    aria-selected={selectedCompany?.symbol === company.symbol}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {company.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {company.symbol} • {company.sector}
                        </div>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-2 text-gray-500 dark:text-gray-400">
              No companies found
            </div>
          )}
        </div>
      )}
    </div>
  );
}