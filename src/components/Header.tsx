import React from 'react';
import { Sparkles, RefreshCw, FileText, CheckCircle, Menu } from 'lucide-react';

interface HeaderProps {
  isDemoMode: boolean;
  onLoadDemo: () => void;
  onReset: () => void;
  recordCount: number;
  currentFileName?: string;
  currentSheetName?: string;
  onOpenMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isDemoMode,
  onLoadDemo,
  onReset,
  recordCount,
  currentFileName,
  currentSheetName,
  onOpenMobileMenu
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-6 py-3 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        
        {/* Left Section: Mobile Menu Trigger + Active Base Info */}
        <div className="flex items-center space-x-3">
          
          {/* Mobile Hamburger Button */}
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-lg text-slate-600 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 transition-colors shrink-0"
            aria-label="Abrir menu lateral"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="p-2 rounded-lg bg-slate-100 text-slate-600 hidden sm:block shrink-0">
            <FileText className="w-4 h-4" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center space-x-1.5 flex-wrap">
              <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Base Ativa:</span>
              <span className="text-xs sm:text-sm font-extrabold text-slate-900 truncate max-w-[200px] sm:max-w-xs md:max-w-md">
                {isDemoMode 
                  ? 'Planilha Exemplo Demonstrativa (Cosméticos)' 
                  : (currentFileName ? `${currentFileName} (${currentSheetName || 'Aba 1'})` : 'Nenhum arquivo carregado')}
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-500 truncate">
              {recordCount > 0 ? `${recordCount} registros prontos para análise` : 'Selecione ou envie um arquivo para iniciar'}
            </p>
          </div>
        </div>

        {/* Right Section: Status Badge & Quick Actions */}
        <div className="flex items-center space-x-2 self-start sm:self-auto flex-wrap">
          {isDemoMode ? (
            <div className="flex items-center space-x-1 bg-amber-50 text-amber-900 border border-amber-300 text-[11px] sm:text-xs font-semibold px-2.5 sm:px-3 py-1 rounded-lg shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>MODO DEMONSTRAÇÃO</span>
            </div>
          ) : recordCount > 0 ? (
            <div className="flex items-center space-x-1 bg-emerald-50 text-emerald-900 border border-emerald-200 text-[11px] sm:text-xs font-semibold px-2.5 sm:px-3 py-1 rounded-lg">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Base do Usuário ({recordCount} reg.)</span>
            </div>
          ) : null}

          {!isDemoMode && recordCount === 0 && (
            <button
              onClick={onLoadDemo}
              className="text-[11px] sm:text-xs bg-slate-900 hover:bg-slate-800 text-amber-300 font-semibold px-3 py-1.5 rounded-lg flex items-center space-x-1 transition-colors shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Usar Dados de Exemplo</span>
            </button>
          )}

          {recordCount > 0 && (
            <button
              onClick={onReset}
              className="text-[11px] sm:text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1 font-medium"
              title="Limpar dados e carregar outro arquivo"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Trocar Arquivo</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
