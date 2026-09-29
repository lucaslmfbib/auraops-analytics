import React, { useState } from 'react';
import { 
  UploadCloud, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  Search, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight,
  Sliders,
  Database
} from 'lucide-react';
import { ColumnMapping, KPIId, KPISelectionState, MetaGranularity, SheetData } from '../types/analytics';
import { KPI_REGISTRY, checkKPICalculability } from '../services/kpiRegistry';

interface ImportModuleProps {
  sheetNames: string[];
  currentSheetName: string;
  onSelectSheet: (sheetName: string) => void;
  sheetData: SheetData | null;
  mapping: ColumnMapping;
  onUpdateMapping: (newMapping: ColumnMapping) => void;
  onFileUpload: (file: File) => void;
  onLoadDemo: () => void;
  onConfirmAndNavigate: () => void;
  isDemoMode: boolean;
  currentFileName?: string;
  kpiSelections?: Record<KPIId, KPISelectionState>;
  onUpdateKpiSelections?: (newSelections: Record<KPIId, KPISelectionState>) => void;
}

export const ImportModule: React.FC<ImportModuleProps> = ({
  sheetNames,
  currentSheetName,
  onSelectSheet,
  sheetData,
  mapping,
  onUpdateMapping,
  onFileUpload,
  onLoadDemo,
  onConfirmAndNavigate,
  isDemoMode,
  currentFileName,
  kpiSelections,
  onUpdateKpiSelections
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [previewPage, setPreviewPage] = useState(1);
  const [showOptionalFields, setShowOptionalFields] = useState(false);
  const [expandedKpiDetails, setExpandedKpiDetails] = useState<Record<string, boolean>>({});
  const rowsPerPage = 8;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
    }
  };

  // Filter preview rows
  const filteredRows = sheetData ? sheetData.rows.filter(row => {
    if (!searchTerm) return true;
    return Object.values(row).some(val => 
      String(val || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }) : [];

  const totalPages = Math.ceil(filteredRows.length / rowsPerPage);
  const paginatedRows = filteredRows.slice((previewPage - 1) * rowsPerPage, previewPage * rowsPerPage);

  return (
    <div className="space-y-6 animate-fade-in pb-12 max-w-6xl mx-auto">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Importar dados</h1>
        <p className="text-sm text-slate-600 mt-1">
          Envie sua planilha para analisar os resultados da operação.
        </p>
      </div>

      {/* 3-Step Stepper Progress Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-medium text-slate-600">
          
          <div className="flex items-center space-x-3 p-2 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200">
            <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shrink-0">1</span>
            <div>
              <span className="font-bold block">1. Enviar planilha</span>
              <span className="text-[11px] text-emerald-700">Upload de Excel ou CSV</span>
            </div>
          </div>

          <div className={`flex items-center space-x-3 p-2 rounded-lg border ${
            sheetData ? 'bg-emerald-50 text-emerald-900 border-emerald-200' : 'bg-slate-50 text-slate-500 border-slate-200'
          }`}>
            <span className={`w-6 h-6 rounded-full font-bold flex items-center justify-center text-xs shrink-0 ${
              sheetData ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-600'
            }`}>2</span>
            <div>
              <span className="font-bold block">2. Conferir dados e colunas</span>
              <span className="text-[11px] opacity-80">Mapeamento e validação</span>
            </div>
          </div>

          <div 
            onClick={() => {
              if (sheetData && mapping.salesCol) onConfirmAndNavigate();
            }}
            className={`flex items-center space-x-3 p-2 rounded-lg border transition-all ${
              sheetData && mapping.salesCol 
                ? 'bg-emerald-50 text-emerald-900 border-emerald-300 cursor-pointer hover:bg-emerald-100 shadow-sm' 
                : 'bg-slate-50 text-slate-400 border-slate-200'
            }`}
          >
            <span className={`w-6 h-6 rounded-full font-bold flex items-center justify-center text-xs shrink-0 ${
              sheetData && mapping.salesCol ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-600'
            }`}>3</span>
            <div>
              <span className="font-bold block flex items-center gap-1">
                <span>3. Abrir dashboard</span>
                {sheetData && mapping.salesCol && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
              </span>
              <span className="text-[11px] opacity-80">
                {sheetData && mapping.salesCol ? 'Pronto para visualizar (Clique)' : 'Requer coluna de vendas'}
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* STEP 1: Upload Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <UploadCloud className="w-5 h-5 text-emerald-600" />
          1 — Enviar planilha
        </h2>

        {/* Drag and Drop Zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
            dragActive 
              ? 'border-emerald-500 bg-emerald-50/50' 
              : 'border-slate-300 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-400'
          }`}
        >
          <input
            type="file"
            id="file-upload-input"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            
            <div className="space-y-1">
              <label
                htmlFor="file-upload-input"
                className="cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2.5 rounded-lg inline-flex items-center space-x-2 transition-colors shadow-sm"
              >
                <span>Selecionar planilha</span>
              </label>
              <p className="text-xs text-slate-500 mt-2">ou arraste e solte o arquivo aqui</p>
            </div>

            <p className="text-[11px] text-slate-400">
              Formatos suportados: <strong>Excel (.xlsx, .xls)</strong> e arquivos de texto <strong>(.csv)</strong>
            </p>
          </div>
        </div>

        {/* Secondary Action: Demo Data */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs">
          <span className="text-slate-500">Prefere explorar o sistema antes de enviar um arquivo?</span>
          <button
            onClick={onLoadDemo}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Usar dados de exemplo</span>
          </button>
        </div>
      </div>

      {/* STEP 2: Conference & Mapping (When data loaded) */}
      {sheetData && (
        <>
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
            
            {/* Step Header & File Info */}
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-4 gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Database className="w-5 h-5 text-emerald-600" />
                  2 — Conferir dados e colunas
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Base ativa: <strong>{isDemoMode ? 'Dados de exemplo demonstrativos' : (currentFileName || 'Arquivo enviado')}</strong> ({sheetData.rows.length} registros).
                </p>
              </div>

              {/* Sheet Selection (If multi-sheet) */}
              {sheetNames.length > 1 && (
                <div className="flex items-center space-x-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
                  <span className="text-xs font-bold text-slate-600">Aba selecionada:</span>
                  <select
                    value={currentSheetName}
                    onChange={(e) => onSelectSheet(e.target.value)}
                    className="bg-white border border-slate-300 text-slate-800 text-xs rounded px-2.5 py-1 font-semibold focus:ring-emerald-500"
                  >
                    {sheetNames.map(sheet => (
                      <option key={sheet} value={sheet}>{sheet}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Compact Quality Audit Report */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Conferência da Qualidade dos Dados
                </span>
                <span className="text-[11px] text-slate-500">
                  {sheetData.qualityAlerts.length === 0 ? 'Verificações concluídas sem alertas' : `${sheetData.qualityAlerts.length} observações`}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                {sheetData.qualityAlerts.map(alert => (
                  <div
                    key={alert.id}
                    className={`p-2.5 rounded-lg border flex items-start space-x-2 ${
                      alert.type === 'error' 
                        ? 'bg-rose-50 border-rose-200 text-rose-800'
                        : alert.type === 'warning'
                        ? 'bg-amber-50 border-amber-200 text-amber-800'
                        : 'bg-sky-50 border-sky-200 text-sky-800'
                    }`}
                  >
                    <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-semibold block">{alert.title}</span>
                      <p className="text-[11px] opacity-90">{alert.description}</p>
                    </div>
                  </div>
                ))}

                {sheetData.qualityAlerts.length === 0 && (
                  <div className="col-span-full p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Nenhuma inconsistência grave foi identificada nas colunas analisadas.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Target Setting Question */}
            <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-2">
              <label className="block text-xs font-bold text-emerald-950 uppercase tracking-wider">
                Como a meta está registrada? <span className="text-rose-600">*</span>
              </label>
              <select
                value={mapping.metaGranularity}
                onChange={(e) => onUpdateMapping({ ...mapping, metaGranularity: e.target.value as MetaGranularity })}
                className="w-full bg-white border border-emerald-300 text-slate-800 text-xs font-medium rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="store_month">Registrada uma vez por loja e mês (Deduplica metas para evitar soma repetida)</option>
                <option value="store_period">Registrada uma vez por loja para todo o período</option>
                <option value="row_by_row">Repetida em cada linha de venda (Soma direta de todas as linhas)</option>
              </select>
              <p className="text-[11px] text-emerald-800">
                Evita que a meta da loja seja multiplicada indevidamente ao somar várias transações.
              </p>
            </div>

            {/* Column Mapping Form (2 columns on desktop, 1 on mobile) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-slate-500" />
                  Mapeamento dos Campos Principais
                </span>
                <span className="text-[11px] text-slate-400">Rótulos posicionados acima dos campos</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Sales Column */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800">
                    Vendas / Faturamento (R$) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={mapping.salesCol || ''}
                    onChange={(e) => onUpdateMapping({ ...mapping, salesCol: e.target.value || null })}
                    className="w-full bg-white border border-slate-300 text-slate-800 text-xs rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 font-medium"
                  >
                    <option value="">-- Selecionar coluna --</option>
                    {sheetData.headers.map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>

                {/* Store Column */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800">
                    Loja / Filial / PDV
                  </label>
                  <select
                    value={mapping.storeCol || ''}
                    onChange={(e) => onUpdateMapping({ ...mapping, storeCol: e.target.value || null })}
                    className="w-full bg-white border border-slate-300 text-slate-800 text-xs rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">-- Selecionar coluna --</option>
                    {sheetData.headers.map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>

                {/* Target Column */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800">
                    Meta de Vendas (R$)
                  </label>
                  <select
                    value={mapping.targetCol || ''}
                    onChange={(e) => onUpdateMapping({ ...mapping, targetCol: e.target.value || null })}
                    className="w-full bg-white border border-slate-300 text-slate-800 text-xs rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">-- Selecionar coluna --</option>
                    {sheetData.headers.map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>

                {/* Date Column */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800">
                    Data da Transação / Período
                  </label>
                  <select
                    value={mapping.dateCol || ''}
                    onChange={(e) => onUpdateMapping({ ...mapping, dateCol: e.target.value || null })}
                    className="w-full bg-white border border-slate-300 text-slate-800 text-xs rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">-- Selecionar coluna --</option>
                    {sheetData.headers.map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>

                {/* Category Column */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800">
                    Categoria / Linha de Produtos
                  </label>
                  <select
                    value={mapping.categoryCol || ''}
                    onChange={(e) => onUpdateMapping({ ...mapping, categoryCol: e.target.value || null })}
                    className="w-full bg-white border border-slate-300 text-slate-800 text-xs rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">-- Selecionar coluna --</option>
                    {sheetData.headers.map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>

                {/* Product Column */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800">
                    Produto / SKU / Descrição
                  </label>
                  <select
                    value={mapping.productCol || ''}
                    onChange={(e) => onUpdateMapping({ ...mapping, productCol: e.target.value || null })}
                    className="w-full bg-white border border-slate-300 text-slate-800 text-xs rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">-- Selecionar coluna --</option>
                    {sheetData.headers.map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>

              </div>
            </div>

            {/* SEÇÃO 3: Seleção de Indicadores ("Quais indicadores você quer mostrar?") */}
            <div className="border-t border-slate-200 pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-emerald-600" />
                    Quais indicadores você quer mostrar?
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Escolha onde exibir cada indicador calculado a partir da sua planilha.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {Object.values(KPI_REGISTRY).map(kpi => {
                  const { isCalculable, explanation } = checkKPICalculability(kpi.id, mapping);
                  const currentSelection = (kpiSelections && kpiSelections[kpi.id]) || { showInDashboard: true, showInPresentation: true };
                  const isExpanded = !!expandedKpiDetails[kpi.id];

                  const toggleDashboard = () => {
                    if (!onUpdateKpiSelections || !kpiSelections) return;
                    onUpdateKpiSelections({
                      ...kpiSelections,
                      [kpi.id]: {
                        ...currentSelection,
                        showInDashboard: !currentSelection.showInDashboard
                      }
                    });
                  };

                  const togglePresentation = () => {
                    if (!onUpdateKpiSelections || !kpiSelections) return;
                    onUpdateKpiSelections({
                      ...kpiSelections,
                      [kpi.id]: {
                        ...currentSelection,
                        showInPresentation: !currentSelection.showInPresentation
                      }
                    });
                  };

                  return (
                    <div
                      key={kpi.id}
                      className={`p-3.5 rounded-xl border transition-all ${
                        !isCalculable
                          ? 'bg-slate-50/70 border-slate-200 opacity-80'
                          : currentSelection.showInDashboard || currentSelection.showInPresentation
                          ? 'bg-white border-emerald-300 shadow-sm'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                            <span className="font-bold text-xs text-slate-900">{kpi.name}</span>
                            <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded border border-slate-200">
                              {kpi.category}
                            </span>
                            <span className="bg-emerald-50 text-emerald-800 text-[10px] font-mono px-2 py-0.5 rounded border border-emerald-200">
                              Unidade: {kpi.unit}
                            </span>
                          </div>

                          {!isCalculable ? (
                            <div className="flex items-center space-x-1.5 text-[11px] text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 mt-1">
                              <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                              <span>{explanation}</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-1 text-[11px] text-emerald-700 font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>Pronto para cálculo com as colunas atuais</span>
                            </div>
                          )}
                        </div>

                        {/* Controls */}
                        <div className="flex items-center space-x-3 bg-slate-50 p-2.5 rounded-lg border border-slate-200 shrink-0 self-start md:self-auto">
                          <label className={`flex items-center space-x-1.5 text-xs font-semibold cursor-pointer ${
                            !isCalculable ? 'opacity-40 cursor-not-allowed' : 'text-slate-800'
                          }`}>
                            <input
                              type="checkbox"
                              disabled={!isCalculable}
                              checked={currentSelection.showInDashboard && isCalculable}
                              onChange={toggleDashboard}
                              className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                            />
                            <span>Dashboard</span>
                          </label>

                          <div className="w-px h-5 bg-slate-300"></div>

                          <label className={`flex items-center space-x-1.5 text-xs font-semibold cursor-pointer ${
                            !isCalculable ? 'opacity-40 cursor-not-allowed' : 'text-slate-800'
                          }`}>
                            <input
                              type="checkbox"
                              disabled={!isCalculable}
                              checked={currentSelection.showInPresentation && isCalculable}
                              onChange={togglePresentation}
                              className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                            />
                            <span>Apresentação</span>
                          </label>

                          <button
                            type="button"
                            onClick={() => setExpandedKpiDetails(prev => ({ ...prev, [kpi.id]: !prev[kpi.id] }))}
                            className="text-[11px] font-bold text-slate-500 hover:text-slate-700 underline pl-1"
                          >
                            {isExpanded ? 'Ocultar detalhes' : 'Detalhes do indicador'}
                          </button>
                        </div>
                      </div>

                      {/* Expandable KPI details */}
                      {isExpanded && (
                        <div className="mt-3 p-3 bg-slate-100/70 border border-slate-200 rounded-lg text-xs space-y-1.5 text-slate-700 animate-fade-in">
                          <p><strong>Descrição:</strong> {kpi.description}</p>
                          <p><strong>Fórmula oficial:</strong> <code className="bg-white px-1.5 py-0.5 rounded border text-[11px] font-mono text-slate-900">{kpi.formula}</code></p>
                          <p><strong>Campos exigidos na planilha:</strong> {kpi.requiredRoles.join(', ')}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Expandable Optional Fields Accordion ("Aparência avançada") */}
            <div className="border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={() => setShowOptionalFields(!showOptionalFields)}
                className="flex items-center justify-between w-full text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 p-3 rounded-lg border border-slate-200 transition-colors"
              >
                <span>Aparência avançada & Mapeamento complementar (Custo, Ticket, Quantidades)</span>
                {showOptionalFields ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showOptionalFields && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 p-3 bg-slate-50/50 rounded-b-lg border-x border-b border-slate-200">
                  
                  {/* Cost Column */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Custo / CMV (R$) [Para Margem]
                    </label>
                    <select
                      value={mapping.costCol || ''}
                      onChange={(e) => onUpdateMapping({ ...mapping, costCol: e.target.value || null })}
                      className="w-full bg-white border border-slate-300 text-slate-800 text-xs rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">-- Não Mapeado --</option>
                      {sheetData.headers.map(h => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>

                  {/* Transaction ID Column */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      ID Transação / Cupom [Ticket Médio]
                    </label>
                    <select
                      value={mapping.transactionCol || ''}
                      onChange={(e) => onUpdateMapping({ ...mapping, transactionCol: e.target.value || null })}
                      className="w-full bg-white border border-slate-300 text-slate-800 text-xs rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">-- Não Mapeado --</option>
                      {sheetData.headers.map(h => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>

                  {/* Quantity Column */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Quantidade / Volume (Unid.)
                    </label>
                    <select
                      value={mapping.quantityCol || ''}
                      onChange={(e) => onUpdateMapping({ ...mapping, quantityCol: e.target.value || null })}
                      className="w-full bg-white border border-slate-300 text-slate-800 text-xs rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">-- Não Mapeado --</option>
                      {sheetData.headers.map(h => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>

                </div>
              )}
            </div>

            {/* Data Table Preview with Horizontal Scroll Container */}
            <div className="space-y-3 border-t border-slate-200 pt-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Pré-visualização da Tabela</h3>
                  <p className="text-[11px] text-slate-500">Exibindo primeiras linhas lidas ({sheetData.rows.length} registros no total).</p>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar na prévia..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setPreviewPage(1);
                    }}
                    className="pl-8 pr-3 py-1 border border-slate-300 rounded-lg text-xs w-48 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Contained horizontal scroll table */}
              <div className="custom-table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      {sheetData.headers.map(h => (
                        <th key={h}>
                          <div className="flex items-center space-x-1">
                            <span>{h}</span>
                            {mapping.salesCol === h && <span className="bg-emerald-100 text-emerald-800 text-[9px] font-extrabold px-1.5 py-0.2 rounded">Vendas</span>}
                            {mapping.storeCol === h && <span className="bg-blue-100 text-blue-800 text-[9px] font-extrabold px-1.5 py-0.2 rounded">Loja</span>}
                            {mapping.targetCol === h && <span className="bg-purple-100 text-purple-800 text-[9px] font-extrabold px-1.5 py-0.2 rounded">Meta</span>}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedRows.map((row, i) => (
                      <tr key={i}>
                        {sheetData.headers.map(h => (
                          <td key={h}>{String(row[h] ?? '-')}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>Página {previewPage} de {totalPages}</span>
                  <div className="flex space-x-1">
                    <button
                      disabled={previewPage === 1}
                      onClick={() => setPreviewPage(p => p - 1)}
                      className="px-2.5 py-1 bg-slate-100 border border-slate-300 rounded disabled:opacity-40"
                    >
                      Anterior
                    </button>
                    <button
                      disabled={previewPage === totalPages}
                      onClick={() => setPreviewPage(p => p + 1)}
                      className="px-2.5 py-1 bg-slate-100 border border-slate-300 rounded disabled:opacity-40"
                    >
                      Próxima
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* STEP 3: Navigation Confirmation Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
            {!mapping.salesCol ? (
              <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-sm">O que falta para abrir o dashboard?</span>
                  <p className="mt-1">
                    É necessário selecionar a coluna referente a <strong>Vendas / Faturamento (R$)</strong> no formulário do passo 2.
                    Campos adicionais como Metas, Custos e Lojas são <strong>opcionais</strong> e não bloqueiam a navegação.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-start space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-sm block">Estrutura de dados válida!</span>
                    <p>Faturamento mapeado para a coluna <strong>"{mapping.salesCol}"</strong>. Clique abaixo para abrir o dashboard.</p>
                  </div>
                </div>

                <button
                  onClick={onConfirmAndNavigate}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-6 py-3 rounded-xl shadow-md flex items-center space-x-2 text-sm transition-all shrink-0 w-full sm:w-auto justify-center"
                >
                  <span>Confirmar e abrir dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {!mapping.salesCol && (
              <div className="flex justify-end">
                <button
                  disabled
                  className="bg-slate-300 text-slate-500 font-bold px-6 py-3 rounded-xl flex items-center space-x-2 text-sm cursor-not-allowed opacity-80"
                >
                  <span>Confirmar e abrir dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </>
      )}

    </div>
  );
};
