import React, { useState } from 'react';
import { 
  Presentation, 
  Download, 
  UploadCloud, 
  Plus, 
  Trash2, 
  Copy, 
  ArrowUp, 
  ArrowDown, 
  Layers, 
  Sliders, 
  CheckCircle2, 
  Info, 
  FileText,
  LayoutGrid
} from 'lucide-react';
import { 
  CategoryPerformance, 
  CustomChartConfig, 
  KPICalculation, 
  KPIId, 
  KPISelectionState, 
  PPTXTheme, 
  PresentationSnapshot, 
  SlideItemConfig, 
  SlideLayoutId, 
  StorePerformance 
} from '../types/analytics';
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
  customCharts?: CustomChartConfig[];
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

const INITIAL_SLIDES: SlideItemConfig[] = [
  {
    id: 'slide_1',
    title: 'Relatório Executivo de Inteligência Operacional',
    description: 'Apresentação de resultados mensais e direcionamento estratégico',
    layoutId: 'cover',
    selectedKpis: ['total_sales', 'total_target', 'ticket_medio', 'gross_margin'],
    selectedChartIds: [],
    meetingContext: 'Apresentação de metas e faturamento consolidado da rede.',
    visible: true
  },
  {
    id: 'slide_2',
    title: 'Indicadores Chave de Desempenho (KPIs)',
    description: 'Resumo do faturamento, meta deduplicada, ticket médio e margem',
    layoutId: 'executive_kpis',
    selectedKpis: ['total_sales', 'total_target', 'ticket_medio', 'gross_margin'],
    selectedChartIds: [],
    visible: true
  },
  {
    id: 'slide_3',
    title: 'Ranking e Desempenho por Loja',
    description: 'Análise detalhada do atingimento de metas por unidade comercial',
    layoutId: 'ranking_table',
    selectedKpis: [],
    selectedChartIds: [],
    visible: true
  },
  {
    id: 'slide_4',
    title: 'Distribuição e Análise por Categoria',
    description: 'Participação das linhas de produtos no faturamento global',
    layoutId: 'chart_and_insights',
    selectedKpis: [],
    selectedChartIds: [],
    visible: true
  },
  {
    id: 'slide_5',
    title: 'Recomendações Operacionais e Próximos Passos',
    description: 'Ações prioritárias para alavancar os resultados da rede',
    layoutId: 'recommendations',
    selectedKpis: [],
    selectedChartIds: [],
    customText: '1. Acompanhar diariamente lojas com atingimento inferior a 90% da meta.\n2. Priorizar abastecimento das categorias com maior margem de contribuição.\n3. Capacitar equipes no atendimento focado em aumento do ticket médio.',
    visible: true
  }
];

export const PresentationModule: React.FC<PresentationModuleProps> = ({
  kpis,
  stores,
  categories,
  dateRangeText,
  activeDatasetName,
  customCharts = []
}) => {
  const [slides, setSlides] = useState<SlideItemConfig[]>(INITIAL_SLIDES);
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const [selectedTheme, setSelectedTheme] = useState<PPTXTheme>(BUILTIN_THEMES[0]);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [customThemeNotes, setCustomThemeNotes] = useState<string[]>([]);

  const activeSlide = slides[activeSlideIndex] || slides[0];

  const handleFileUploadPPTX = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const parsed = await parsePPTXTemplate(e.target.files[0]);
        setSelectedTheme(parsed);
        if (parsed.adaptationNotes) setCustomThemeNotes(parsed.adaptationNotes);
      } catch (err) {
        alert('Não foi possível processar o modelo PPTX. O modelo padrão foi mantido.');
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
        slides
      };

      await generatePPTXFile(snapshot, stores, categories);
    } catch (err) {
      alert('Erro ao gerar a apresentação em PowerPoint. Tente novamente.');
    } finally {
      setIsExporting(false);
    }
  };

  const addSlide = (layoutId: SlideLayoutId = 'custom_content') => {
    const newSlide: SlideItemConfig = {
      id: `slide_${Date.now()}`,
      title: 'Novo Slide Personalizado',
      description: 'Descrição do novo slide',
      layoutId,
      selectedKpis: [],
      selectedChartIds: [],
      customText: 'Insira aqui as observações ou pontos de discussão para este slide.',
      visible: true
    };
    setSlides([...slides, newSlide]);
    setActiveSlideIndex(slides.length);
  };

  const duplicateSlide = (index: number) => {
    const target = slides[index];
    const cloned: SlideItemConfig = {
      ...target,
      id: `slide_${Date.now()}`,
      title: `${target.title} (Cópia)`
    };
    const next = [...slides];
    next.splice(index + 1, 0, cloned);
    setSlides(next);
    setActiveSlideIndex(index + 1);
  };

  const deleteSlide = (index: number) => {
    if (slides.length <= 1) {
      alert('A apresentação precisa ter pelo menos 1 slide.');
      return;
    }
    const next = slides.filter((_, idx) => idx !== index);
    setSlides(next);
    setActiveSlideIndex(Math.min(activeSlideIndex, next.length - 1));
  };

  const moveSlide = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= slides.length) return;
    const next = [...slides];
    const temp = next[index];
    next[index] = next[targetIdx];
    next[targetIdx] = temp;
    setSlides(next);
    setActiveSlideIndex(targetIdx);
  };

  const updateActiveSlide = (fields: Partial<SlideItemConfig>) => {
    setSlides(prev => prev.map((s, idx) => idx === activeSlideIndex ? { ...s, ...fields } : s));
  };

  const topStore = stores[0];
  const lowestStore = stores[stores.length - 1];
  const topCategory = categories[0];

  return (
    <div className="space-y-6 animate-fade-in pb-12 max-w-7xl mx-auto">
      
      {/* Top Controls Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4 no-print">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Presentation className="w-6 h-6 text-emerald-600" />
              Editor e Personalizador de Slides Executivos
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Monte apresentações sob medida, altere modelos PPTX importados e exporte o arquivo real (.pptx).
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportPPTX}
              disabled={isExporting}
              className="bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white font-bold text-xs px-5 py-2.5 rounded-xl flex items-center space-x-2 transition-all shadow-md"
            >
              <Download className="w-4 h-4 text-emerald-300" />
              <span>{isExporting ? 'Exportando PPTX...' : 'Baixar PowerPoint (.pptx)'}</span>
            </button>
          </div>
        </div>

        {/* Configuration Toolbar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          
          {/* Theme Picker */}
          <div className="space-y-1">
            <label className="block font-bold text-slate-700">Modelo / Tema Ativo</label>
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
                <option value={selectedTheme.id}>{selectedTheme.name} (Importado)</option>
              )}
            </select>
          </div>

          {/* PPTX Template Upload */}
          <div className="space-y-1">
            <label className="block font-bold text-slate-700">Importar Modelo Corporativo (.pptx)</label>
            <label className="cursor-pointer bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-lg px-3 py-2 flex items-center space-x-2 font-medium">
              <UploadCloud className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="truncate">
                {selectedTheme.isExternal ? selectedTheme.name : 'Carregar arquivo .pptx'}
              </span>
              <input
                type="file"
                accept=".pptx"
                onChange={handleFileUploadPPTX}
                className="hidden"
              />
            </label>
          </div>

          {/* Quick Stats */}
          <div className="space-y-1">
            <label className="block font-bold text-slate-700">Status do Modelo</label>
            <div className="bg-slate-50 border border-slate-300 text-slate-700 rounded-lg px-3 py-2 flex items-center justify-between font-medium">
              <span>{slides.length} Slide(s) no Deck</span>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                {selectedTheme.isExternal ? 'PPTX Personalizado' : 'Tema Nativo'}
              </span>
            </div>
          </div>

        </div>

        {/* PPTX Adaptation Notes */}
        {customThemeNotes.length > 0 && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs space-y-1 text-amber-900">
            <span className="font-bold flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-amber-600" />
              Transparência da Importação do PPTX:
            </span>
            <ul className="list-disc list-inside text-[11px] space-y-0.5 opacity-90">
              {customThemeNotes.map((note, idx) => (
                <li key={idx}>{note}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* 3-COLUMN EDITOR LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* COLUMN 1: LEFT SIDEBAR - SLIDE THUMBNAILS & REORDERING (3 cols) */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-600" />
              Estrutura de Slides ({slides.length})
            </span>
            <button
              onClick={() => addSlide('custom_content')}
              className="p-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center space-x-1"
              title="Adicionar Novo Slide"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Slide</span>
            </button>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {slides.map((s, idx) => (
              <div
                key={s.id}
                onClick={() => setActiveSlideIndex(idx)}
                className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                  idx === activeSlideIndex
                    ? 'border-emerald-500 bg-emerald-50/50 shadow-sm ring-1 ring-emerald-400'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900 truncate max-w-[140px]">
                    {idx + 1}. {s.title}
                  </span>
                  <div className="flex items-center space-x-1" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => moveSlide(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                      title="Mover para cima"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => moveSlide(idx, 'down')}
                      disabled={idx === slides.length - 1}
                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                      title="Mover para baixo"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => duplicateSlide(idx)}
                      className="p-1 text-slate-400 hover:text-emerald-600"
                      title="Duplicar Slide"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => deleteSlide(idx)}
                      className="p-1 text-slate-400 hover:text-rose-600"
                      title="Excluir Slide"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded font-mono block w-max">
                  {s.layoutId}
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={() => addSlide('custom_content')}
            className="w-full py-2 border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-lg text-xs font-bold text-slate-600 hover:text-emerald-700 flex items-center justify-center space-x-1 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Slide</span>
          </button>
        </div>

        {/* COLUMN 2: CENTER - LIVE INTERACTIVE CANVAS PREVIEW (6 cols) */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 bg-white p-2.5 rounded-lg border border-slate-200">
            <span className="font-bold text-slate-700">Pré-visualização Ao Vivo (Slide {activeSlideIndex + 1})</span>
            <span className="font-mono text-[11px] text-slate-500">Proporção {selectedTheme.aspectRatio}</span>
          </div>

          <div
            className="rounded-2xl p-6 sm:p-8 shadow-xl border min-h-[460px] flex flex-col justify-between relative overflow-hidden transition-all"
            style={{
              backgroundColor: selectedTheme.backgroundColor,
              color: selectedTheme.textColor,
              borderColor: selectedTheme.secondaryColor
            }}
          >
            {/* Header decor */}
            <div className="flex items-center justify-between border-b pb-3 relative z-10" style={{ borderColor: `${selectedTheme.secondaryColor}40` }}>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: selectedTheme.secondaryColor }}></span>
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: selectedTheme.secondaryColor }}>
                  AuraOps Analytics
                </span>
              </div>
              <span className="text-xs opacity-75">{dateRangeText}</span>
            </div>

            {/* Slide Body */}
            <div className="py-6 relative z-10 space-y-4">
              <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: selectedTheme.secondaryColor }}>
                Slide {activeSlideIndex + 1} de {slides.length} • {activeSlide.layoutId}
              </span>
              
              <h2 className="text-2xl font-extrabold" style={{ fontFamily: selectedTheme.headerFont }}>
                {activeSlide.title || 'Sem título'}
              </h2>
              
              {activeSlide.description && (
                <p className="text-xs opacity-80">{activeSlide.description}</p>
              )}

              {/* Dynamic Content Preview based on layoutId */}
              {activeSlide.layoutId === 'cover' && (
                <div className="p-4 rounded-xl border text-xs space-y-1.5 max-w-md mt-4" style={{ backgroundColor: selectedTheme.cardColor, borderColor: `${selectedTheme.secondaryColor}40` }}>
                  <div><strong>Base:</strong> {activeDatasetName}</div>
                  <div><strong>Período:</strong> {dateRangeText}</div>
                  <div><strong>Contexto:</strong> {activeSlide.meetingContext || 'Reunião Executiva'}</div>
                  <div><strong>Desenvolvido por:</strong> <span style={{ color: selectedTheme.secondaryColor, fontWeight: 'bold' }}>Lucas Martins</span></div>
                </div>
              )}

              {activeSlide.layoutId === 'executive_kpis' && (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-lg border" style={{ backgroundColor: selectedTheme.cardColor, borderColor: `${selectedTheme.secondaryColor}40` }}>
                    <div className="text-[10px] opacity-75 font-bold">FATURAMENTO TOTAL</div>
                    <div className="text-lg font-bold" style={{ color: selectedTheme.secondaryColor }}>
                      {formatBRCurrency(kpis.totalSales)}
                    </div>
                  </div>

                  <div className="p-3 rounded-lg border" style={{ backgroundColor: selectedTheme.cardColor, borderColor: `${selectedTheme.secondaryColor}40` }}>
                    <div className="text-[10px] opacity-75 font-bold">META CONSOLIDADA</div>
                    <div className="text-lg font-bold text-purple-400">
                      {kpis.hasTargetData ? formatBRCurrency(kpis.totalTarget) : 'N/I'}
                    </div>
                  </div>

                  <div className="p-3 rounded-lg border" style={{ backgroundColor: selectedTheme.cardColor, borderColor: `${selectedTheme.secondaryColor}40` }}>
                    <div className="text-[10px] opacity-75 font-bold">TICKET MÉDIO</div>
                    <div className="text-lg font-bold text-blue-400">
                      {kpis.ticketMedio ? formatBRCurrency(kpis.ticketMedio) : 'N/I'}
                    </div>
                  </div>

                  <div className="p-3 rounded-lg border" style={{ backgroundColor: selectedTheme.cardColor, borderColor: `${selectedTheme.secondaryColor}40` }}>
                    <div className="text-[10px] opacity-75 font-bold">MARGEM BRUTA</div>
                    <div className="text-lg font-bold text-pink-400">
                      {kpis.grossMarginPct ? `${kpis.grossMarginPct.toFixed(1)}%` : 'N/I'}
                    </div>
                  </div>
                </div>
              )}

              {activeSlide.layoutId === 'ranking_table' && (
                <div className="space-y-2 text-xs pt-2">
                  <div className="font-bold" style={{ color: selectedTheme.secondaryColor }}>
                    Top Lojas da Operação
                  </div>
                  {stores.slice(0, 4).map((s, idx) => (
                    <div key={idx} className="flex justify-between p-2 rounded border" style={{ backgroundColor: selectedTheme.cardColor, borderColor: `${selectedTheme.secondaryColor}30` }}>
                      <span>{s.store}</span>
                      <strong style={{ color: selectedTheme.secondaryColor }}>{formatBRCurrency(s.totalSales)}</strong>
                    </div>
                  ))}
                </div>
              )}

              {activeSlide.layoutId === 'chart_and_insights' && (
                <div className="grid grid-cols-2 gap-3 text-xs pt-2">
                  <div className="p-3 rounded-lg border" style={{ backgroundColor: selectedTheme.cardColor, borderColor: `${selectedTheme.secondaryColor}30` }}>
                    <div className="font-bold mb-1" style={{ color: selectedTheme.secondaryColor }}>Categoria Líder</div>
                    <div>{topCategory ? `${topCategory.category} (${topCategory.sharePct.toFixed(1)}%)` : 'N/I'}</div>
                  </div>
                  <div className="p-3 rounded-lg border" style={{ backgroundColor: selectedTheme.cardColor, borderColor: `${selectedTheme.secondaryColor}30` }}>
                    <div className="font-bold mb-1" style={{ color: selectedTheme.secondaryColor }}>Observações</div>
                    <div className="text-[11px] opacity-90">{activeSlide.customText || 'Insira observações no painel à direita.'}</div>
                  </div>
                </div>
              )}

              {(activeSlide.layoutId === 'recommendations' || activeSlide.layoutId === 'custom_content') && (
                <div className="p-4 rounded-xl border text-xs whitespace-pre-line leading-relaxed" style={{ backgroundColor: selectedTheme.cardColor, borderColor: `${selectedTheme.secondaryColor}40` }}>
                  {activeSlide.customText || 'Conteúdo em texto livre preenchido no painel de inspeção.'}
                </div>
              )}

            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t pt-3 text-[11px] opacity-75 relative z-10" style={{ borderColor: `${selectedTheme.secondaryColor}40` }}>
              <span>Desenvolvido por <strong>Lucas Martins</strong></span>
              <span>Slide {activeSlideIndex + 1} de {slides.length}</span>
            </div>
          </div>
        </div>

        {/* COLUMN 3: RIGHT SIDEBAR - SLIDE INSPECTOR & CONFIGURATOR (3 cols) */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-2">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-emerald-600" />
              Inspector do Slide {activeSlideIndex + 1}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {/* Title */}
            <div className="space-y-1">
              <label className="block font-bold text-slate-700">Título do Slide</label>
              <input
                type="text"
                value={activeSlide.title}
                onChange={(e) => updateActiveSlide({ title: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Subtitle */}
            <div className="space-y-1">
              <label className="block font-bold text-slate-700">Subtítulo / Descrição</label>
              <input
                type="text"
                value={activeSlide.description || ''}
                onChange={(e) => updateActiveSlide({ description: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Layout Selector */}
            <div className="space-y-1">
              <label className="block font-bold text-slate-700">Layout do Slide</label>
              <select
                value={activeSlide.layoutId}
                onChange={(e) => updateActiveSlide({ layoutId: e.target.value as SlideLayoutId })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500"
              >
                <option value="cover">Capa da Apresentação</option>
                <option value="executive_kpis">KPIs Executivos (4 Cards)</option>
                <option value="ranking_table">Tabela de Ranking de Lojas</option>
                <option value="chart_and_insights">Gráficos & Destaques</option>
                <option value="recommendations">Recomendações Operacionais</option>
                <option value="custom_content">Conteúdo Personalizado Livre</option>
              </select>
            </div>

            {/* Context / Custom Text */}
            <div className="space-y-1">
              <label className="block font-bold text-slate-700">
                {activeSlide.layoutId === 'cover' ? 'Contexto da Reunião' : 'Texto Personalizado / Notas'}
              </label>
              <textarea
                rows={5}
                value={activeSlide.layoutId === 'cover' ? (activeSlide.meetingContext || '') : (activeSlide.customText || '')}
                onChange={(e) => {
                  if (activeSlide.layoutId === 'cover') {
                    updateActiveSlide({ meetingContext: e.target.value });
                  } else {
                    updateActiveSlide({ customText: e.target.value });
                  }
                }}
                placeholder="Digite os tópicos ou anotações executivas..."
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
