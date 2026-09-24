import React from 'react';
import { FileSpreadsheet, LayoutDashboard, MessageSquareCode, Presentation, Layers, Sparkles, X } from 'lucide-react';

interface SidebarProps {
  activeTab: 'import' | 'dashboard' | 'questions' | 'presentation';
  setActiveTab: (tab: 'import' | 'dashboard' | 'questions' | 'presentation') => void;
  isDemoMode: boolean;
  onLoadDemo: () => void;
  recordCount: number;
  isOpenOnMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isDemoMode,
  onLoadDemo,
  recordCount,
  isOpenOnMobile,
  onCloseMobile
}) => {
  const menuItems = [
    { id: 'import', label: 'Dados', icon: FileSpreadsheet, description: 'Importação e conferência' },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, description: 'Indicadores operacionais' },
    { id: 'questions', label: 'Perguntas à IA', icon: MessageSquareCode, description: 'Consultas à base' },
    { id: 'presentation', label: 'Apresentações', icon: Presentation, description: 'Relatório executivo' },
  ] as const;

  const handleSelectTab = (tab: 'import' | 'dashboard' | 'questions' | 'presentation') => {
    setActiveTab(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpenOnMobile && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Drawer */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        w-72 md:w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 min-h-screen border-r border-slate-800
        transform transition-transform duration-300 ease-in-out
        ${isOpenOnMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        
        {/* Brand Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-900/40 shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-base tracking-tight text-white">AuraOps</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-1.5 py-0.5 rounded border border-emerald-500/30">
                  Analytics
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Gestão Operacional de Varejo</p>
            </div>
          </div>

          {/* Close Button on Mobile */}
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            aria-label="Fechar menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Navigation Menu */}
        <nav className="p-3 space-y-1.5 flex-1 overflow-y-auto">
          <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Menu Principal
          </div>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center space-x-3.5 px-3.5 py-3 md:py-2.5 rounded-xl text-xs font-medium transition-all text-left ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-950 font-semibold'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <div>
                  <span className="block text-xs leading-tight font-bold sm:font-medium">{item.label}</span>
                  <span className={`text-[10px] block ${isActive ? 'text-emerald-100' : 'text-slate-400'}`}>
                    {item.description}
                  </span>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Status Box */}
        <div className="px-4 py-3 border-t border-slate-800/80 bg-slate-950/30">
          {isDemoMode ? (
            <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs space-y-1">
              <div className="flex items-center space-x-1.5 font-bold">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Dados de Exemplo</span>
              </div>
              <p className="text-[10px] text-amber-300/80 leading-tight">
                Base demonstrativa ({recordCount} registros).
              </p>
            </div>
          ) : recordCount > 0 ? (
            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs space-y-1">
              <div className="flex items-center space-x-1.5 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Base Ativa Carregada</span>
              </div>
              <p className="text-[10px] text-emerald-300/80 leading-tight">
                {recordCount} registros processados.
              </p>
            </div>
          ) : (
            <div className="p-2.5 rounded-lg bg-slate-800 text-slate-400 text-xs space-y-2">
              <p className="text-[10px]">Nenhuma base enviada ainda.</p>
              <button
                onClick={() => {
                  onLoadDemo();
                  onCloseMobile();
                }}
                className="w-full text-center bg-slate-700 hover:bg-slate-600 text-white text-[10px] font-medium py-1.5 rounded transition-colors"
              >
                Usar dados de exemplo
              </button>
            </div>
          )}
        </div>

        {/* Author & Social Links Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 text-slate-400 space-y-2.5">
          <div className="text-[11px] leading-tight">
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Criado por</span>
            <span className="font-extrabold text-white text-xs">Lucas Martins</span>
          </div>

          {/* Social Media Links */}
          <div className="flex items-center space-x-2.5 pt-0.5">
            <a
              href="https://www.linkedin.com/in/lucaslmf"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-300 transition-colors flex items-center justify-center"
              title="LinkedIn - Lucas Martins"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.74a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2Z" />
              </svg>
            </a>

            <a
              href="https://github.com/lucaslmfbib"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-300 transition-colors flex items-center justify-center"
              title="GitHub - Lucas Martins"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2Z" />
              </svg>
            </a>

            <a
              href="https://www.instagram.com/lucaslmf_/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-300 transition-colors flex items-center justify-center"
              title="Instagram - @lucaslmf_"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4.162 4.162 0 110-8.324 4.162 4.162 0 010 8.324zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
            </a>
          </div>

          <div className="text-[9px] text-slate-400 pt-1 flex items-center justify-between border-t border-slate-900">
            <span>Engenharia & Design</span>
            <span>2026</span>
          </div>
        </div>

      </aside>
    </>
  );
};
