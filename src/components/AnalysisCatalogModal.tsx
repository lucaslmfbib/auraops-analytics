import React, { useState } from 'react';
import { 
  X, 
  HelpCircle, 
  Sparkles, 
  Check, 
  AlertTriangle, 
  TrendingUp, 
  Store, 
  Target, 
  ShoppingBag, 
  PieChart, 
  BarChart3, 
  Activity, 
  ScatterChart as ReScatterIcon, 
  Layers, 
  Calendar,
  Grid
} from 'lucide-react';
import { AnalysisQuestionItem, ColumnMapping, CustomChartConfig } from '../types/analytics';
import { ANALYSIS_QUESTIONS_CATALOG, checkAnalysisCompatibility } from '../services/analysisCatalog';

interface AnalysisCatalogModalProps {
  mapping: ColumnMapping;
  onSelectAnalysis: (question: AnalysisQuestionItem) => void;
  onClose: () => void;
}

export const AnalysisCatalogModal: React.FC<AnalysisCatalogModalProps> = ({
  mapping,
  onSelectAnalysis,
  onClose
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');

  const categories = ['Todas', 'Evolução', 'Lojas', 'Produtos', 'Margem', 'Distribuição'];

  const filteredCatalog = ANALYSIS_QUESTIONS_CATALOG.filter(q => {
    if (selectedCategory === 'Todas') return true;
    return q.category === selectedCategory;
  });

  const getIconForCategory = (cat: string) => {
    switch (cat) {
      case 'Evolução': return <TrendingUp className="w-4 h-4 text-emerald-600" />;
      case 'Lojas': return <Store className="w-4 h-4 text-blue-600" />;
      case 'Produtos': return <ShoppingBag className="w-4 h-4 text-indigo-600" />;
      case 'Margem': return <Activity className="w-4 h-4 text-amber-600" />;
      case 'Distribuição': return <PieChart className="w-4 h-4 text-rose-600" />;
      default: return <BarChart3 className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden my-auto">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Adicionar Análise ao Dashboard</h2>
              <p className="text-xs text-slate-500">Escolha uma pergunta de negócio para gerar uma visualização automática com seus dados</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Filter Pills */}
        <div className="px-6 py-3 border-b border-slate-100 bg-white flex items-center space-x-2 overflow-x-auto">
          <span className="text-xs font-semibold text-slate-500 shrink-0 mr-1">Filtrar:</span>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all shrink-0 ${
                selectedCategory === cat
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Catalog List Grid */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 max-h-[60vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCatalog.map(item => {
              const { isCompatible, missingFields } = checkAnalysisCompatibility(item, mapping);

              return (
                <div
                  key={item.id}
                  className={`border rounded-xl p-4 flex flex-col justify-between transition-all ${
                    isCompatible
                      ? 'border-slate-200 bg-white hover:border-emerald-500 hover:shadow-md cursor-pointer'
                      : 'border-slate-200/80 bg-slate-50/60 opacity-80 cursor-not-allowed'
                  }`}
                  onClick={() => {
                    if (isCompatible) {
                      onSelectAnalysis(item);
                    }
                  }}
                >
                  <div className="space-y-2.5">
                    
                    {/* Header line: category badge & compatibility */}
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        {getIconForCategory(item.category)}
                        <span>{item.category}</span>
                      </span>

                      {isCompatible ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded flex items-center space-x-1">
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>Compatível</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded flex items-center space-x-1">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          <span>Faltam campos</span>
                        </span>
                      )}
                    </div>

                    {/* Question Title & Description */}
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                        {item.question}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    {/* Mini Illustrative Preview Box */}
                    <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-between text-[11px] text-slate-600">
                      <div className="flex items-center space-x-2">
                        <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase bg-slate-200 text-slate-700 rounded">
                          Exemplo
                        </span>
                        <span className="font-semibold text-slate-800">{item.defaultTitle}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 capitalize">{item.defaultChartType}</span>
                    </div>

                    {/* Fields Requirement Info */}
                    <div className="text-[11px] space-y-1 pt-1">
                      <span className="font-semibold text-slate-700">Campos necessários:</span>
                      <div className="flex flex-wrap gap-1">
                        {item.requiredFields.map(req => {
                          let hasField = true;
                          if (req.key === 'categoryCol') {
                            hasField = !!(mapping.categoryCol || mapping.productCol);
                          } else {
                            hasField = !!mapping[req.key];
                          }

                          return (
                            <span
                              key={req.label}
                              className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                                hasField
                                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-800'
                                  : 'bg-rose-50 border-rose-200 text-rose-700'
                              }`}
                            >
                              {hasField ? '✓ ' : '✗ '}{req.label}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                  </div>

                  {/* Footer Action or Missing Reason */}
                  <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                    {isCompatible ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectAnalysis(item);
                        }}
                        className="w-full py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-all flex items-center justify-center space-x-1"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Adicionar esta Análise</span>
                      </button>
                    ) : (
                      <p className="text-[11px] text-rose-700 font-medium">
                        Faltam na planilha: {missingFields.join(', ')}
                      </p>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Outros indicadores podem ser personalizados manualmente na aba "Personalizar".</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-all"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
