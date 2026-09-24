import React from 'react';
import { Filter, Calendar, Store, Tag, X, Check } from 'lucide-react';
import { FilterState } from '../types/analytics';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  availableStores: string[];
  availableCategories: string[];
  totalFilteredRecords: number;
  totalRecords: number;
  dateRangeText: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  availableStores,
  availableCategories,
  totalFilteredRecords,
  totalRecords,
  dateRangeText
}) => {
  const hasActiveFilters = 
    filters.startDate || 
    filters.endDate || 
    filters.selectedStores.length > 0 || 
    filters.selectedCategories.length > 0 || 
    filters.searchQuery;

  const handleResetFilters = () => {
    onFilterChange({
      startDate: '',
      endDate: '',
      selectedStores: [],
      selectedCategories: [],
      searchQuery: ''
    });
  };

  const toggleStore = (store: string) => {
    const exists = filters.selectedStores.includes(store);
    const updated = exists 
      ? filters.selectedStores.filter(s => s !== store)
      : [...filters.selectedStores, store];
    onFilterChange({ ...filters, selectedStores: updated });
  };

  const toggleCategory = (cat: string) => {
    const exists = filters.selectedCategories.includes(cat);
    const updated = exists 
      ? filters.selectedCategories.filter(c => c !== cat)
      : [...filters.selectedCategories, cat];
    onFilterChange({ ...filters, selectedCategories: updated });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Title & Scope Indicator */}
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
            <Filter className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-slate-900">Filtros da Operação</h3>
              <span className="text-xs bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded-full border border-slate-200">
                {totalFilteredRecords} de {totalRecords} registros ({dateRangeText})
              </span>
            </div>
            <p className="text-xs text-slate-500">Refine a análise por período, unidades de loja ou categorias.</p>
          </div>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={handleResetFilters}
            className="flex items-center space-x-1 text-xs text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-colors font-medium self-start lg:self-auto"
          >
            <X className="w-3.5 h-3.5" />
            <span>Limpar Filtros</span>
          </button>
        )}

      </div>

      {/* Filter Controls Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
        
        {/* Date Start */}
        <div className="flex items-center space-x-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
          <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
          <div className="w-full">
            <label className="block text-[10px] font-bold text-slate-500 uppercase">Data Início</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => onFilterChange({ ...filters, startDate: e.target.value })}
              className="bg-transparent text-xs text-slate-800 font-medium w-full focus:outline-none"
            />
          </div>
        </div>

        {/* Date End */}
        <div className="flex items-center space-x-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
          <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
          <div className="w-full">
            <label className="block text-[10px] font-bold text-slate-500 uppercase">Data Fim</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => onFilterChange({ ...filters, endDate: e.target.value })}
              className="bg-transparent text-xs text-slate-800 font-medium w-full focus:outline-none"
            />
          </div>
        </div>

        {/* Store Selector */}
        {availableStores.length > 0 && (
          <div className="relative group">
            <div className="flex items-center space-x-2 bg-slate-50 p-2 rounded-lg border border-slate-200 cursor-pointer">
              <Store className="w-4 h-4 text-slate-400 shrink-0" />
              <div className="w-full">
                <label className="block text-[10px] font-bold text-slate-500 uppercase">Lojas Selecionadas</label>
                <span className="text-xs text-slate-800 font-medium truncate block">
                  {filters.selectedStores.length === 0 
                    ? 'Todas as Lojas' 
                    : `${filters.selectedStores.length} loja(s)`}
                </span>
              </div>
            </div>

            {/* Dropdown Menu */}
            <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-slate-200 rounded-lg shadow-xl p-2 z-30 hidden group-hover:block max-h-56 overflow-y-auto">
              <div className="text-[11px] font-semibold text-slate-400 uppercase px-2 py-1">Filtrar Lojas</div>
              {availableStores.map(store => {
                const isSel = filters.selectedStores.includes(store);
                return (
                  <div
                    key={store}
                    onClick={() => toggleStore(store)}
                    className="flex items-center justify-between px-2 py-1.5 hover:bg-slate-50 rounded cursor-pointer text-xs text-slate-700"
                  >
                    <span className="truncate">{store}</span>
                    {isSel && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Category Selector */}
        {availableCategories.length > 0 && (
          <div className="relative group">
            <div className="flex items-center space-x-2 bg-slate-50 p-2 rounded-lg border border-slate-200 cursor-pointer">
              <Tag className="w-4 h-4 text-slate-400 shrink-0" />
              <div className="w-full">
                <label className="block text-[10px] font-bold text-slate-500 uppercase">Categorias Selecionadas</label>
                <span className="text-xs text-slate-800 font-medium truncate block">
                  {filters.selectedCategories.length === 0 
                    ? 'Todas as Categorias' 
                    : `${filters.selectedCategories.length} categoria(s)`}
                </span>
              </div>
            </div>

            {/* Dropdown Menu */}
            <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-slate-200 rounded-lg shadow-xl p-2 z-30 hidden group-hover:block max-h-56 overflow-y-auto">
              <div className="text-[11px] font-semibold text-slate-400 uppercase px-2 py-1">Filtrar Categorias</div>
              {availableCategories.map(cat => {
                const isSel = filters.selectedCategories.includes(cat);
                return (
                  <div
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className="flex items-center justify-between px-2 py-1.5 hover:bg-slate-50 rounded cursor-pointer text-xs text-slate-700"
                  >
                    <span className="truncate">{cat}</span>
                    {isSel && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
