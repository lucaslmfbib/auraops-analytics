import React, { useState } from 'react';
import { Sliders, CheckSquare, Sparkles, Copy, AlertTriangle, Info, Check, HelpCircle, Calculator, Edit2 } from 'lucide-react';
import { ColumnMapping, CustomCalculatedMetric, KPIId, KPISelectionState, SheetData } from '../types/analytics';
import { KPI_REGISTRY, checkKPICalculability } from '../services/kpiRegistry';
import { CalculatedMetricBuilder } from './CalculatedMetricBuilder';

interface CustomizationPanelProps {
  sheetData: SheetData | null;
  mapping: ColumnMapping;
  kpiSelections: Record<KPIId, KPISelectionState>;
  onUpdateSelections: (newSelections: Record<KPIId, KPISelectionState>) => void;
  onCopyDashboardToPresentation: () => void;
  customCalculatedMetrics?: CustomCalculatedMetric[];
  onSaveCalculatedMetric?: (metric: CustomCalculatedMetric) => void;
  onDeleteCalculatedMetric?: (id: string) => void;
}

export const CustomizationPanel: React.FC<CustomizationPanelProps> = ({
  sheetData,
  mapping,
  kpiSelections,
  onUpdateSelections,
  onCopyDashboardToPresentation,
  customCalculatedMetrics = [],
  onSaveCalculatedMetric,
  onDeleteCalculatedMetric
}) => {
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'Todos' | 'Vendas' | 'Metas' | 'Rentabilidade' | 'Volume'>('Todos');
  const [customKpiNames, setCustomKpiNames] = useState<Record<string, string>>({});
  const [customKpiUnits, setCustomKpiUnits] = useState<Record<string, string>>({});
  const [editingKpiId, setEditingKpiId] = useState<string | null>(null);

  const kpisList = Object.values(KPI_REGISTRY);

  const filteredKPIs = kpisList.filter(kpi => {
    if (activeCategoryFilter === 'Todos') return true;
    return kpi.category === activeCategoryFilter;
  });

  const toggleDashboard = (kpiId: KPIId) => {
    const current = kpiSelections[kpiId] || { showInDashboard: true, showInPresentation: true };
    const updated = {
      ...kpiSelections,
      [kpiId]: { ...current, showInDashboard: !current.showInDashboard }
    };
    onUpdateSelections(updated);
  };

  const togglePresentation = (kpiId: KPIId) => {
    const current = kpiSelections[kpiId] || { showInDashboard: true, showInPresentation: true };
    const updated = {
      ...kpiSelections,
      [kpiId]: { ...current, showInPresentation: !current.showInPresentation }
    };
    onUpdateSelections(updated);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12 max-w-6xl mx-auto">
      
      {/* Title Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
              <Sliders className="w-6 h-6 text-emerald-600" />
              Personalizar Análise de Dados & KPIs
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Configure as dimensões, métricas calculadas e KPIs exibidos no Dashboard e nas Apresentações.
            </p>
          </div>

          <button
            onClick={onCopyDashboardToPresentation}
            className="flex items-center space-x-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm self-start md:self-auto"
          >
            <Copy className="w-4 h-4" />
            <span>Usar seleção do dashboard na apresentação</span>
          </button>
        </div>

        {/* Category Chips */}
        <div className="mt-4 flex flex-wrap gap-2">
          {(['Todos', 'Vendas', 'Metas', 'Rentabilidade', 'Volume'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategoryFilter(cat)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                activeCategoryFilter === cat
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* GUIDED CALCULATED METRIC BUILDER */}
      {onSaveCalculatedMetric && (
        <CalculatedMetricBuilder
          sheetData={sheetData}
          existingMetrics={customCalculatedMetrics}
          onSaveMetric={onSaveCalculatedMetric}
          onDeleteMetric={onDeleteCalculatedMetric}
        />
      )}

      {/* KPI Catalog Selection Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Catálogo de Indicadores Oficiais</h2>
          <span className="text-xs text-slate-500">{filteredKPIs.length} indicadores catalogados</span>
        </div>

        <div className="space-y-3">
          {filteredKPIs.map(kpi => {
            const { isCalculable, explanation } = checkKPICalculability(kpi.id, mapping);
            const selection = kpiSelections[kpi.id] || { showInDashboard: true, showInPresentation: true };
            const displayName = customKpiNames[kpi.id] || kpi.name;
            const displayUnit = customKpiUnits[kpi.id] || kpi.unit;
            const isEditing = editingKpiId === kpi.id;

            return (
              <div 
                key={kpi.id}
                className={`p-4 rounded-xl border transition-all ${
                  !isCalculable 
                    ? 'bg-slate-50/70 border-slate-200 opacity-75' 
                    : selection.showInDashboard || selection.showInPresentation
                    ? 'bg-white border-emerald-300 shadow-sm'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  
                  {/* Left: Info & Calculability */}
                  <div className="space-y-1 max-w-xl">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      {isEditing ? (
                        <input
                          type="text"
                          value={displayName}
                          onChange={(e) => setCustomKpiNames({ ...customKpiNames, [kpi.id]: e.target.value })}
                          className="bg-slate-50 border border-slate-300 px-2 py-0.5 rounded text-xs font-bold text-slate-900"
                        />
                      ) : (
                        <span className="font-bold text-sm text-slate-900">{displayName}</span>
                      )}

                      <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded border border-slate-200">
                        {kpi.category}
                      </span>
                      
                      {isEditing ? (
                        <input
                          type="text"
                          value={displayUnit}
                          onChange={(e) => setCustomKpiUnits({ ...customKpiUnits, [kpi.id]: e.target.value })}
                          className="bg-slate-50 border border-slate-300 px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-800 w-16"
                        />
                      ) : (
                        <span className="bg-emerald-50 text-emerald-800 text-[10px] font-mono px-2 py-0.5 rounded border border-emerald-200">
                          Unidade: {displayUnit}
                        </span>
                      )}

                      <button
                        onClick={() => setEditingKpiId(isEditing ? null : kpi.id)}
                        className="text-slate-400 hover:text-slate-700 p-0.5 rounded hover:bg-slate-100"
                        title="Personalizar nome e unidade de exibição"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>

                    <p className="text-xs text-slate-600">{kpi.description}</p>

                    <div className="flex items-center space-x-2 text-[11px] pt-1">
                      <span className="font-semibold text-slate-500">Fórmula:</span>
                      <code className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-[10px] font-mono">
                        {kpi.formula}
                      </code>
                    </div>

                    {/* Calculability Alert */}
                    {!isCalculable ? (
                      <div className="flex items-center space-x-1.5 text-xs text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200 mt-2">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                        <span><strong>Não calculável:</strong> {explanation}</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1 text-[11px] text-emerald-700 font-medium mt-1">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Disponível com a estrutura de colunas mapeada.</span>
                      </div>
                    )}
                  </div>

                  {/* Right: Checkboxes */}
                  <div className="flex items-center space-x-4 bg-slate-50 p-3 rounded-lg border border-slate-200 shrink-0">
                    <label className={`flex items-center space-x-2 text-xs font-semibold cursor-pointer ${
                      !isCalculable ? 'opacity-40 cursor-not-allowed' : 'text-slate-800'
                    }`}>
                      <input
                        type="checkbox"
                        disabled={!isCalculable}
                        checked={selection.showInDashboard && isCalculable}
                        onChange={() => toggleDashboard(kpi.id)}
                        className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                      />
                      <span>Mostrar no dashboard</span>
                    </label>

                    <div className="w-px h-6 bg-slate-300"></div>

                    <label className={`flex items-center space-x-2 text-xs font-semibold cursor-pointer ${
                      !isCalculable ? 'opacity-40 cursor-not-allowed' : 'text-slate-800'
                    }`}>
                      <input
                        type="checkbox"
                        disabled={!isCalculable}
                        checked={selection.showInPresentation && isCalculable}
                        onChange={() => togglePresentation(kpi.id)}
                        className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                      />
                      <span>Incluir na apresentação</span>
                    </label>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
