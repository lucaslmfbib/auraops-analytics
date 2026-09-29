import React, { useState } from 'react';
import { 
  Settings, 
  Palette, 
  ShieldCheck, 
  Lock, 
  BarChart2, 
  RotateCcw, 
  Save, 
  Info, 
  AlertTriangle, 
  Check, 
  Upload, 
  UserCheck, 
  Calculator, 
  Layers 
} from 'lucide-react';
import { 
  ChartStyleConfig, 
  OfficialKPIFormula, 
  OrgSettings, 
  PPTXTheme, 
  ProjectSettings, 
  UserProfile, 
  UserRole 
} from '../types/analytics';
import { canEditOfficialKPIFormulas, canEditOrgDefaults, isViewerOnly, setActiveUserRole } from '../services/authService';
import { KPI_REGISTRY } from '../services/kpiRegistry';

interface SettingsModuleProps {
  currentUser: UserProfile;
  onUserRoleChange: (newRole: UserRole) => void;
  orgSettings: OrgSettings;
  onUpdateOrgSettings: (next: OrgSettings) => void;
  projectSettings: ProjectSettings;
  onUpdateProjectSettings: (next: ProjectSettings) => void;
}

export const SettingsModule: React.FC<SettingsModuleProps> = ({
  currentUser,
  onUserRoleChange,
  orgSettings,
  onUpdateOrgSettings,
  projectSettings,
  onUpdateProjectSettings
}) => {
  const [activeTab, setActiveTab] = useState<'org' | 'project' | 'users'>('project');
  
  // Org Brand State
  const [tempBrandTheme, setTempBrandTheme] = useState<PPTXTheme>(orgSettings.brandTheme);
  const [showOrgConfirmModal, setShowOrgConfirmModal] = useState<boolean>(false);

  // Project Settings State
  const [tempProjectTheme, setTempProjectTheme] = useState<PPTXTheme>(projectSettings.projectTheme || orgSettings.brandTheme);
  const [tempChartStyles, setTempChartStyles] = useState<ChartStyleConfig>(projectSettings.chartStyles);

  // Formula State
  const [officialFormulas, setOfficialFormulas] = useState<OfficialKPIFormula[]>(orgSettings.officialKPIFormulas || []);

  const isAdmin = canEditOrgDefaults(currentUser);
  const isReadOnly = isViewerOnly(currentUser);

  const handleSaveOrgSettings = () => {
    if (!isAdmin) {
      alert('Apenas administradores podem alterar os padrões compartilhados da organização.');
      return;
    }
    setShowOrgConfirmModal(true);
  };

  const confirmSaveOrgSettings = () => {
    onUpdateOrgSettings({
      ...orgSettings,
      brandTheme: tempBrandTheme,
      officialKPIFormulas: officialFormulas
    });
    setShowOrgConfirmModal(false);
    alert('Padrões da Organização atualizados com sucesso!');
  };

  const handleSaveProjectSettings = () => {
    if (isReadOnly) {
      alert('Usuários no perfil Leitor não possuem permissão de escrita.');
      return;
    }
    onUpdateProjectSettings({
      ...projectSettings,
      projectTheme: tempProjectTheme,
      chartStyles: tempChartStyles
    });
    alert('Configurações do Projeto atualizadas!');
  };

  const handleResetProjectToOrg = () => {
    setTempProjectTheme(orgSettings.brandTheme);
    onUpdateProjectSettings({
      ...projectSettings,
      projectTheme: undefined
    });
    alert('Projeto restaurado para os padrões institucionais da Organização!');
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12 max-w-6xl mx-auto">
      
      {/* Title Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Settings className="w-6 h-6 text-emerald-600" />
              Central de Configurações e Governança
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Gerencie padrões visuais institucionais, estilos de gráficos, perfil de acesso e fórmulas de KPIs.
            </p>
          </div>

          {/* User Role Badge & Switcher */}
          <div className="flex items-center space-x-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
            <UserCheck className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-slate-700">Perfil:</span>
            <select
              value={currentUser.role}
              onChange={(e) => onUserRoleChange(e.target.value as UserRole)}
              className="bg-white border border-slate-300 text-xs font-bold text-slate-800 rounded px-2 py-1 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="admin">👑 Administrador</option>
              <option value="editor">✏️ Editor</option>
              <option value="viewer">👁️ Leitor (Viewer)</option>
            </select>
          </div>
        </div>

        {/* Settings Navigation Tabs */}
        <div className="flex border-b border-slate-200 space-x-4 text-xs font-bold mt-4">
          <button
            onClick={() => setActiveTab('project')}
            className={`pb-2.5 flex items-center space-x-2 border-b-2 transition-all ${
              activeTab === 'project' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            <span>1. Configurações do Projeto & Gráficos</span>
          </button>

          <button
            onClick={() => setActiveTab('org')}
            className={`pb-2.5 flex items-center space-x-2 border-b-2 transition-all ${
              activeTab === 'org' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>2. Padrões da Organização {!isAdmin && '(Somente Admin)'}</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`pb-2.5 flex items-center space-x-2 border-b-2 transition-all ${
              activeTab === 'users' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>3. Governança e Servidor</span>
          </button>
        </div>
      </div>

      {/* TAB 1: CONFIGURAÇÕES DO PROJETO & GRÁFICOS */}
      {activeTab === 'project' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Estilos do Projeto Atual</h2>
              <p className="text-xs text-slate-500">Estas configurações sobrepõem os padrões institucionais apenas neste deck.</p>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handleResetProjectToOrg}
                disabled={isReadOnly}
                className="bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 text-xs font-bold px-3 py-2 rounded-lg flex items-center space-x-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restaurar Padrão Institucional</span>
              </button>

              <button
                onClick={handleSaveProjectSettings}
                disabled={isReadOnly}
                className="bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center space-x-1 shadow-sm"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Salvar Projeto</span>
              </button>
            </div>
          </div>

          {/* Color & Font Pickers for Project */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="space-y-1">
              <label className="block font-bold text-slate-700">Cor Principal (Primária)</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  disabled={isReadOnly}
                  value={tempProjectTheme.primaryColor}
                  onChange={(e) => setTempProjectTheme({ ...tempProjectTheme, primaryColor: e.target.value })}
                  className="w-8 h-8 rounded cursor-pointer border border-slate-300"
                />
                <input
                  type="text"
                  disabled={isReadOnly}
                  value={tempProjectTheme.primaryColor}
                  onChange={(e) => setTempProjectTheme({ ...tempProjectTheme, primaryColor: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 font-mono text-xs rounded px-2 py-1.5"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-700">Cor de Destaque (Secundária)</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  disabled={isReadOnly}
                  value={tempProjectTheme.secondaryColor}
                  onChange={(e) => setTempProjectTheme({ ...tempProjectTheme, secondaryColor: e.target.value })}
                  className="w-8 h-8 rounded cursor-pointer border border-slate-300"
                />
                <input
                  type="text"
                  disabled={isReadOnly}
                  value={tempProjectTheme.secondaryColor}
                  onChange={(e) => setTempProjectTheme({ ...tempProjectTheme, secondaryColor: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 font-mono text-xs rounded px-2 py-1.5"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-700">Cor de Fundo do Slide</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  disabled={isReadOnly}
                  value={tempProjectTheme.backgroundColor}
                  onChange={(e) => setTempProjectTheme({ ...tempProjectTheme, backgroundColor: e.target.value })}
                  className="w-8 h-8 rounded cursor-pointer border border-slate-300"
                />
                <input
                  type="text"
                  disabled={isReadOnly}
                  value={tempProjectTheme.backgroundColor}
                  onChange={(e) => setTempProjectTheme({ ...tempProjectTheme, backgroundColor: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 font-mono text-xs rounded px-2 py-1.5"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-700">Fonte dos Títulos</label>
              <select
                disabled={isReadOnly}
                value={tempProjectTheme.headerFont}
                onChange={(e) => setTempProjectTheme({ ...tempProjectTheme, headerFont: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 font-medium"
              >
                <option value="Arial">Arial</option>
                <option value="Georgia">Georgia</option>
                <option value="Roboto">Roboto</option>
                <option value="Inter">Inter</option>
                <option value="Outfit">Outfit</option>
              </select>
            </div>
          </div>

          {/* Chart Styles Controls */}
          <div className="border-t pt-4 space-y-3">
            <h3 className="text-sm font-bold text-slate-800">Estilos de Gráficos e Séries</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1">
                <label className="block font-bold text-slate-700">Posição da Legenda</label>
                <select
                  disabled={isReadOnly}
                  value={tempChartStyles.legendPosition}
                  onChange={(e) => setTempChartStyles({ ...tempChartStyles, legendPosition: e.target.value as any })}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1.5"
                >
                  <option value="top">Topo</option>
                  <option value="bottom">Rodapé</option>
                  <option value="none">Ocultar</option>
                </select>
              </div>

              <div className="flex items-center space-x-2 pt-4">
                <input
                  type="checkbox"
                  disabled={isReadOnly}
                  checked={tempChartStyles.showDataLabels}
                  onChange={(e) => setTempChartStyles({ ...tempChartStyles, showDataLabels: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300"
                />
                <span className="font-bold text-slate-700">Exibir Rótulos nos Pontos</span>
              </div>

              <div className="flex items-center space-x-2 pt-4">
                <input
                  type="checkbox"
                  disabled={isReadOnly}
                  checked={tempChartStyles.showGridlines}
                  onChange={(e) => setTempChartStyles({ ...tempChartStyles, showGridlines: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300"
                />
                <span className="font-bold text-slate-700">Exibir Linhas de Grade</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PADRÕES DA ORGANIZAÇÃO & FÓRMULAS (ADMIN ONLY) */}
      {activeTab === 'org' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Palette className="w-5 h-5 text-emerald-600" />
                Padrões Institucionais da Organização
              </h2>
              <p className="text-xs text-slate-500">Defina a identidade da empresa e controle as fórmulas oficiais de negócio.</p>
            </div>

            {isAdmin ? (
              <button
                onClick={handleSaveOrgSettings}
                className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center space-x-1 shadow-sm"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Salvar Padrões Globais</span>
              </button>
            ) : (
              <div className="flex items-center space-x-1 text-xs text-rose-700 font-bold bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200">
                <Lock className="w-3.5 h-3.5" />
                <span>Apenas Administradores</span>
              </div>
            )}
          </div>

          {/* Org Theme Colors */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1">
              <label className="block font-bold text-slate-700">Cor Institucional Primária</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  disabled={!isAdmin}
                  value={tempBrandTheme.primaryColor}
                  onChange={(e) => setTempBrandTheme({ ...tempBrandTheme, primaryColor: e.target.value })}
                  className="w-8 h-8 rounded border border-slate-300"
                />
                <input
                  type="text"
                  disabled={!isAdmin}
                  value={tempBrandTheme.primaryColor}
                  onChange={(e) => setTempBrandTheme({ ...tempBrandTheme, primaryColor: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 font-mono text-xs rounded px-2 py-1.5"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-700">Cor Institucional Secundária</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  disabled={!isAdmin}
                  value={tempBrandTheme.secondaryColor}
                  onChange={(e) => setTempBrandTheme({ ...tempBrandTheme, secondaryColor: e.target.value })}
                  className="w-8 h-8 rounded border border-slate-300"
                />
                <input
                  type="text"
                  disabled={!isAdmin}
                  value={tempBrandTheme.secondaryColor}
                  onChange={(e) => setTempBrandTheme({ ...tempBrandTheme, secondaryColor: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 font-mono text-xs rounded px-2 py-1.5"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-700">Logotipo Institucional</label>
              <div className="flex items-center space-x-2 bg-slate-50 p-2 rounded-lg border border-slate-300">
                <Upload className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-[11px] text-slate-600 truncate">logotipo_empresa.png</span>
              </div>
            </div>
          </div>

          {/* ISOLATED SECTION: OFFICIAL KPI FORMULAS */}
          <div className="border-t pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <Calculator className="w-4 h-4 text-purple-600" />
                  Governança das Fórmulas Oficiais de KPIs
                </h3>
                <p className="text-[11px] text-slate-500">
                  Alterações visuais não afetam estas regras de cálculo.
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              {Object.values(KPI_REGISTRY).map(kpi => (
                <div key={kpi.id} className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 flex justify-between items-center">
                  <div className="space-y-0.5 max-w-md">
                    <span className="font-bold text-slate-900 block">{kpi.name}</span>
                    <span className="text-[11px] text-slate-600 font-mono">Fórmula: {kpi.formula}</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                    Oficial Ativa
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: GOVERNANÇA E SERVIDOR */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4 text-xs">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            Status da Conexão e Segurança do Servidor
          </h2>

          <div className="p-4 bg-slate-900 text-slate-200 rounded-xl space-y-2 border border-slate-800 font-mono text-[11px]">
            <div><strong>Sessão Ativa:</strong> {currentUser.name} ({currentUser.role.toUpperCase()})</div>
            <div><strong>Modo de Persistência:</strong> Local Browser DB + Abstração REST preparada para Servidor</div>
            <div><strong>Validação de Permissões:</strong> Aplicada via autorizador RBAC em tempo de execução</div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL FOR ORG DEFAULT SAVES */}
      {showOrgConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs animate-scale-up">
            <div className="flex items-center space-x-2 text-amber-600">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="font-bold text-slate-900 text-sm">Confirmação de Administrador</h3>
            </div>

            <p className="text-slate-600">
              Esta alteração afetará o **padrão compartilhado da organização** para todas as apresentações que dependem da marca institucional.
            </p>

            <div className="flex justify-end space-x-2 border-t pt-3">
              <button onClick={() => setShowOrgConfirmModal(false)} className="px-3 py-2 rounded-lg bg-slate-100 text-slate-700 font-bold">Cancelar</button>
              <button onClick={confirmSaveOrgSettings} className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold">Confirmar e Salvar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
