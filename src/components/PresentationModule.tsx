import React, { useState } from 'react';
import { Presentation, Printer, ChevronLeft, ChevronRight, Award, Target, CheckCircle2, Download, UploadCloud, Sparkles, Sliders, FileText, Info } from 'lucide-react';
import { CategoryPerformance, KPICalculation, KPIId, KPISelectionState, PPTXTheme, PresentationSnapshot, StorePerformance } from '../types/analytics';
import { formatBRCurrency } from '../services/dataParser';
import { generatePPTXFile } from '../services/pptxExporter';
import { parsePPTXTemplate } from '../services/pptxParser';

interface PresentationModuleProps {
  kpis: KPICalculation;
  stores: StorePerformance[];
  categories: CategoryPerformance[];
  dateRangeText: string;
  activeDatasetName: string;
  kpiSelections: Record<KPIId, KPISelectionState>;
}

const BUILTIN_THEMES: PPTXTheme[] = [
  {
    id: 'verde_executivo',
    name: 'Verde Varejo Executivo (Padrão)',
    isExternal: false,
    primaryColor: '#064e3b',
    secondaryColor: '#10b981',
    backgroundColor: '#0f172a',
    textColor: '#ffffff',
    cardColor: '#1e293b',
    headerFont: 'Arial',
    bodyFont: 'Arial',
    aspectRatio: '16:9'
  },
  {
    id: 'escuro_elegante',
    name: 'Escuro Elegante (Diretoria)',
    isExternal: false,
    primaryColor: '#1e1b4b',
    secondaryColor: '#6366f1',
    backgroundColor: '#09090b',
    textColor: '#ffffff',
    cardColor: '#18181b',
    headerFont: 'Georgia',
    bodyFont: 'Arial',
    aspectRatio: '16:9'
  },
  {
    id: 'claro_minimalista',
    name: 'Claro Minimalista',
    isExternal: false,
    primaryColor: '#0f172a',
    secondaryColor: '#047857',
    backgroundColor: '#ffffff',
    textColor: '#0f172a',
    cardColor: '#f8fafc',
    headerFont: 'Arial',
    bodyFont: 'Arial',
    aspectRatio: '16:9'
  }
];

export const PresentationModule: React.FC<PresentationModuleProps> = ({
  kpis,
  stores,
  categories,
  dateRangeText,
  activeDatasetName,
  kpiSelections
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedTheme, setSelectedTheme] = useState<PPTXTheme>(BUILTIN_THEMES[0]);
  const [presentationType, setPresentationType] = useState<'executivo' | 'detalhado'>('executivo');
  const [meetingObjective, setMeetingObjective] = useState<string>('Apresentação de resultados mensais de vendas para a gerência de operações.');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [customThemeNotes, setCustomThemeNotes] = useState<string[]>([]);

  const topStore = stores[0];
  const lowestStore = stores[stores.length - 1];
  const topCategory = categories[0];

  const totalSlides = presentationType === 'executivo' ? 4 : 5;

  const handleFileUploadPPTX = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const parsed = await parsePPTXTemplate(e.target.files[0]);
        setSelectedTheme(parsed);
        if (parsed.adaptationNotes) setCustomThemeNotes(parsed.adaptationNotes);
      } catch (err) {
        alert('Não foi possível ler o tema do arquivo PPTX. O modelo corporativo padrão foi mantido.');
      }
    }
  };

  const handleExportPPTX = async () => {
    setIsExporting(true);
    try {
      const snapshot: PresentationSnapshot = {
        generatedAt: new Date().toISOString(),
        activeDatasetName,
        filterState: { startDate: '', endDate: '', selectedStores: [], selectedCategories: [], searchQuery: '' },
        kpis,
        theme: selectedTheme,
        slides: []
      };

      await generatePPTXFile(snapshot, stores, categories);
    } catch (err) {
      alert('Erro ao gerar o arquivo PowerPoint (.pptx). Tente novamente.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12 max-w-6xl mx-auto">
      
      {/* Top Bar / Actions */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4 no-print">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Presentation className="w-6 h-6 text-emerald-600" />
              Montagem da Apresentação Executiva
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Configure o tema, orientações da reunião e exporte um arquivo PowerPoint (.pptx) real e editável.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {/* Download PPTX Button */}
            <button
              onClick={handleExportPPTX}
              disabled={isExporting}
              className="bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center space-x-2 transition-all shadow-md"
            >
              <Download className="w-4 h-4 text-emerald-300" />
              <span>{isExporting ? 'Gerando PPTX...' : 'Baixar PowerPoint (.pptx)'}</span>
            </button>
          </div>
        </div>

        {/* Configuration Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          
          {/* Theme Selector */}
          <div className="space-y-1">
            <label className="block font-bold text-slate-700">Modelo da Apresentação</label>
            <select
              value={selectedTheme.id}
              onChange={(e) => {
                const found = BUILTIN_THEMES.find(t => t.id === e.target.value);
                if (found) {
                  setSelectedTheme(found);
                  setCustomThemeNotes([]);
                }
              }}
              className="w-full bg-slate-50 border border-slate-300 text-slate-800 rounded-lg px-3 py-2 font-medium focus:ring-2 focus:ring-emerald-500"
            >
              {BUILTIN_THEMES.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
              {selectedTheme.isExternal && (
                <option value={selectedTheme.id}>{selectedTheme.name}</option>
              )}
            </select>
          </div>

          {/* Upload External PPTX Template */}
          <div className="space-y-1">
            <label className="block font-bold text-slate-700">Enviar Modelo (.pptx)</label>
            <label className="cursor-pointer bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-lg px-3 py-2 flex items-center space-x-2 font-medium">
              <UploadCloud className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="truncate">
                {selectedTheme.isExternal ? selectedTheme.name : 'Importar arquivo PPTX'}
              </span>
              <input
                type="file"
                accept=".pptx"
                onChange={handleFileUploadPPTX}
                className="hidden"
              />
            </label>
          </div>

          {/* Presentation Detail Level */}
          <div className="space-y-1">
            <label className="block font-bold text-slate-700">Nível de Detalhamento</label>
            <select
              value={presentationType}
              onChange={(e) => setPresentationType(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-300 text-slate-800 rounded-lg px-3 py-2 font-medium focus:ring-2 focus:ring-emerald-500"
            >
              <option value="executivo">Resumo Executivo (4 Slides)</option>
              <option value="detalhado">Apresentação Detalhada (5 Slides)</option>
            </select>
          </div>

        </div>

        {/* Meeting Objective Input */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-700">Objetivo da Reunião e Orientações do Público</label>
          <input
            type="text"
            value={meetingObjective}
            onChange={(e) => setMeetingObjective(e.target.value)}
            placeholder="Ex: Apresentar resultados de vendas e focar em estratégias para recuperar lojas críticas."
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Custom Template Report Notes (if external PPTX imported) */}
        {customThemeNotes.length > 0 && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs space-y-1 text-amber-900">
            <span className="font-bold block flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-amber-600" />
              Relatório de Adaptação do Modelo PPTX Importado:
            </span>
            <ul className="list-disc list-inside text-[11px] space-y-0.5 opacity-90">
              {customThemeNotes.map((note, idx) => (
                <li key={idx}>{note}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Slide Navigation Controls */}
      <div className="flex items-center justify-between text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200 shadow-sm no-print">
        <span className="font-bold">Pré-visualização do Slide</span>
        <div className="flex items-center space-x-2">
          <button
            disabled={currentSlide === 0}
            onClick={() => setCurrentSlide(s => s - 1)}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-semibold text-slate-800">
            Slide {currentSlide + 1} de {totalSlides}
          </span>
          <button
            disabled={currentSlide === totalSlides - 1}
            onClick={() => setCurrentSlide(s => s + 1)}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Slide Visual Container */}
      <div 
        className="rounded-2xl p-6 sm:p-10 shadow-2xl border min-h-[440px] flex flex-col justify-between relative overflow-hidden transition-all"
        style={{
          backgroundColor: selectedTheme.backgroundColor,
          color: selectedTheme.textColor,
          borderColor: selectedTheme.secondaryColor
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3 relative z-10" style={{ borderColor: `${selectedTheme.secondaryColor}40` }}>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: selectedTheme.secondaryColor }}></span>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: selectedTheme.secondaryColor }}>
              AuraOps Executive Presentation
            </span>
          </div>
          <span className="text-xs opacity-75">Período: {dateRangeText}</span>
        </div>

        {/* SLIDE CONTENT AREA */}
        <div className="py-6 relative z-10">

          {/* SLIDE 0: Capa */}
          {currentSlide === 0 && (
            <div className="space-y-4 animate-fade-in">
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: selectedTheme.secondaryColor }}>
                Slide 1 de {totalSlides} • Capa
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold" style={{ fontFamily: selectedTheme.headerFont }}>
                Relatório de Desempenho Operacional
              </h2>
              <p className="text-sm opacity-90 max-w-2xl">{meetingObjective}</p>

              <div className="p-4 rounded-xl border mt-4 text-xs space-y-1.5 max-w-xl" style={{ backgroundColor: selectedTheme.cardColor, borderColor: `${selectedTheme.secondaryColor}40` }}>
                <div><strong>Base Analisada:</strong> {activeDatasetName}</div>
                <div><strong>Período:</strong> {dateRangeText}</div>
                <div><strong>Criado por:</strong> <span style={{ color: selectedTheme.secondaryColor, fontWeight: 'bold' }}>Lucas Martins</span></div>
              </div>
            </div>
          )}

          {/* SLIDE 1: Visão Geral de KPIs */}
          {currentSlide === 1 && (
            <div className="space-y-4 animate-fade-in">
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: selectedTheme.secondaryColor }}>
                Slide 2 de {totalSlides} • Indicadores Principais
              </span>
              <h3 className="text-2xl font-bold" style={{ fontFamily: selectedTheme.headerFont }}>
                Resumo Consolidado de Metas e Faturamento
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-xl border space-y-1" style={{ backgroundColor: selectedTheme.cardColor, borderColor: `${selectedTheme.secondaryColor}40` }}>
                  <span className="text-xs font-bold opacity-75">FATURAMENTO TOTAL</span>
                  <div className="text-2xl font-extrabold" style={{ color: selectedTheme.secondaryColor }}>
                    {formatBRCurrency(kpis.totalSales)}
                  </div>
                  <span className="text-[11px] opacity-75">{kpis.recordCount} registros</span>
                </div>

                <div className="p-4 rounded-xl border space-y-1" style={{ backgroundColor: selectedTheme.cardColor, borderColor: `${selectedTheme.secondaryColor}40` }}>
                  <span className="text-xs font-bold opacity-75">META CONSOLIDADA</span>
                  <div className="text-2xl font-extrabold text-purple-400">
                    {kpis.hasTargetData ? formatBRCurrency(kpis.totalTarget) : 'N/I'}
                  </div>
                  <span className="text-[11px] opacity-75">Deduplicada por loja/período</span>
                </div>

                <div className="p-4 rounded-xl border space-y-1" style={{ backgroundColor: selectedTheme.cardColor, borderColor: `${selectedTheme.secondaryColor}40` }}>
                  <span className="text-xs font-bold opacity-75">ATINGIMENTO GLOBAL</span>
                  <div className="text-2xl font-extrabold text-amber-400">
                    {kpis.targetAchievementPct ? `${kpis.targetAchievementPct.toFixed(1)}%` : 'N/I'}
                  </div>
                  <span className="text-[11px] opacity-75">
                    {kpis.targetAchievementPct && kpis.targetAchievementPct >= 100 ? 'Meta Alcançada' : 'Abaixo da Meta'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 2: Lojas Destaque */}
          {currentSlide === 2 && (
            <div className="space-y-4 animate-fade-in">
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: selectedTheme.secondaryColor }}>
                Slide 3 de {totalSlides} • Ranking por Loja
              </span>
              <h3 className="text-2xl font-bold" style={{ fontFamily: selectedTheme.headerFont }}>
                Comparativo de Faturamento das Unidades
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {topStore && (
                  <div className="p-4 rounded-xl border space-y-1" style={{ backgroundColor: selectedTheme.cardColor, borderColor: `${selectedTheme.secondaryColor}60` }}>
                    <span className="text-xs font-bold uppercase" style={{ color: selectedTheme.secondaryColor }}>Unidade Líder</span>
                    <div className="text-xl font-bold">{topStore.store}</div>
                    <div className="text-sm">Vendas: <strong style={{ color: selectedTheme.secondaryColor }}>{formatBRCurrency(topStore.totalSales)}</strong></div>
                  </div>
                )}

                {lowestStore && (
                  <div className="p-4 rounded-xl border space-y-1" style={{ backgroundColor: selectedTheme.cardColor, borderColor: '#F8717140' }}>
                    <span className="text-xs font-bold uppercase text-rose-400">Foco Operacional</span>
                    <div className="text-xl font-bold">{lowestStore.store}</div>
                    <div className="text-sm">Vendas: <strong className="text-rose-400">{formatBRCurrency(lowestStore.totalSales)}</strong></div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SLIDE 3: Categorias */}
          {currentSlide === 3 && (
            <div className="space-y-4 animate-fade-in">
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: selectedTheme.secondaryColor }}>
                Slide 4 de {totalSlides} • Mix de Produtos
              </span>
              <h3 className="text-2xl font-bold" style={{ fontFamily: selectedTheme.headerFont }}>
                Linhas de Produtos em Destaque
              </h3>

              {topCategory ? (
                <div className="p-5 rounded-xl border space-y-3" style={{ backgroundColor: selectedTheme.cardColor, borderColor: `${selectedTheme.secondaryColor}40` }}>
                  <div className="text-lg font-bold" style={{ color: selectedTheme.secondaryColor }}>
                    Categoria Líder: {topCategory.category}
                  </div>
                  <p className="text-sm opacity-90">
                    A linha de {topCategory.category} gerou {formatBRCurrency(topCategory.totalSales)} no período, representando {topCategory.sharePct.toFixed(1)}% do faturamento da rede.
                  </p>
                </div>
              ) : (
                <div className="text-xs opacity-75">Sem dados de categoria disponíveis.</div>
              )}
            </div>
          )}

          {/* SLIDE 4: Recomendações */}
          {currentSlide === 4 && (
            <div className="space-y-4 animate-fade-in">
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: selectedTheme.secondaryColor }}>
                Slide 5 de {totalSlides} • Recomendações
              </span>
              <h3 className="text-2xl font-bold" style={{ fontFamily: selectedTheme.headerFont }}>
                Direcionamento Estratégico
              </h3>

              <div className="space-y-2 pt-2">
                <div className="p-3.5 rounded-xl border flex items-start space-x-3 text-xs" style={{ backgroundColor: selectedTheme.cardColor, borderColor: `${selectedTheme.secondaryColor}40` }}>
                  <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: selectedTheme.secondaryColor }} />
                  <span>Acompanhar metas diárias das lojas abaixo de 90% com incentivos em itens de alto ticket.</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t pt-3 text-xs opacity-75 relative z-10" style={{ borderColor: `${selectedTheme.secondaryColor}40` }}>
          <span>Criado por <strong>Lucas Martins</strong> • AuraOps Analytics</span>
          <span>Slide {currentSlide + 1} de {totalSlides}</span>
        </div>
      </div>

    </div>
  );
};
