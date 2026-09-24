import React from 'react';
import { Sparkles, RefreshCw, FileText, CheckCircle } from 'lucide-react';

interface HeaderProps {
  isDemoMode: boolean;
  onLoadDemo: () => void;
  onReset: () => void;
  recordCount: number;
  currentFileName?: string;
  currentSheetName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  isDemoMode,
  onLoadDemo,
  onReset,
  recordCount,
  currentFileName,
  currentSheetName
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 py-3.5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        
        {/* Active Base Identification */}
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-slate-100 text-slate-600">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Base Ativa:</span>
              <span className="text-xs font-bold text-slate-900">
                {isDemoMode 
                  ? 'Planilha Exemplo Demonstrativa (Vendas Cosméticos)' 
                  : (currentFileName ? `${currentFileName} (${currentSheetName || 'Aba 1'})` : 'Nenhum arquivo carregado')}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              {recordCount > 0 ? `${recordCount} registros prontos para análise` : 'Selecione ou envie um arquivo para iniciar'}
            </p>
          </div>
        </div>

        {/* Status Badge & Actions */}
        <div className="flex items-center space-x-3">
          {isDemoMode ? (
            <div className="flex items-center space-x-1.5 bg-amber-50 text-amber-900 border border-amber-300 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>MODO DEMONSTRAÇÃO (Dados de Exemplo)</span>
            </div>
          ) : recordCount > 0 ? (
            <div className="flex items-center space-x-1.5 bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-semibold px-3 py-1.5 rounded-lg">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Base do Usuário ({recordCount} reg.)</span>
            </div>
          ) : null}

          {!isDemoMode && recordCount === 0 && (
            <button
              onClick={onLoadDemo}
              className="text-xs bg-slate-900 hover:bg-slate-800 text-amber-300 font-semibold px-3.5 py-1.5 rounded-lg flex items-center space-x-1.5 transition-colors shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Usar Dados de Exemplo</span>
            </button>
          )}

          {recordCount > 0 && (
            <button
              onClick={onReset}
              className="text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1 font-medium"
              title="Limpar dados e carregar outro arquivo"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              <span>Trocar Arquivo</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
