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
  Info, 
  Sparkles, 
  Palette, 
  FileText, 
  AlertTriangle, 
  Check, 
  Scissors, 
  GitBranch, 
  CheckSquare, 
  BarChart2, 
  HelpCircle 
} from 'lucide-react';
import { 
  ActionPlanItem, 
  AISuggestion, 
  CategoryPerformance, 
  CustomChartConfig, 
  FlowchartEdge, 
  FlowchartNode, 
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
import { generateAISuggestionsForSlide } from '../services/analyticsEngine';
import { KPI_REGISTRY, checkKPICalculability } from '../services/kpiRegistry';

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
    layoutId: 'capa',
    selectedKpis: ['total_sales', 'total_target', 'ticket_medio', 'gross_margin'],
    selectedChartIds: [],
    meetingContext: 'Apresentação de metas e faturamento consolidado da rede.',
    visible: true
  },
  {
    id: 'slide_2',
    title: 'Resumo Executivo da Operação',
    description: 'Destaques e alertas consolidados sobre o desempenho comercial',
    layoutId: 'resumo_executivo',
    selectedKpis: [],
    selectedChartIds: [],
    customText: '• Faturamento global da rede superou as expectativas do período.\n• Monitorar atritamento de metas nas unidades secundárias.\n• Alocação contínua de estoque nas linhas líderes.',
    visible: true
  },
  {
    id: 'slide_3',
    title: 'Indicadores Chave de Desempenho (KPIs)',
    description: 'Resumo de vendas, meta deduplicada, ticket médio e margem',
    layoutId: 'kpis',
    selectedKpis: ['total_sales', 'total_target', 'ticket_medio', 'gross_margin'],
    selectedChartIds: [],
    visible: true
  },
  {
    id: 'slide_4',
    title: 'Gráfico e Análise de Distribuição',
    description: 'Participação das linhas de produtos no faturamento global',
    layoutId: 'grafico_analise',
    selectedKpis: [],
    selectedChartIds: [],
    customText: 'A categoria líder representa a maior fatia do faturamento acumulado.',
    visible: true
  },
  {
    id: 'slide_5',
    title: 'Fluxograma de Processo Operacional',
    description: 'Etapas e pontos de decisão da operação comercial',
    layoutId: 'fluxograma',
    selectedKpis: [],
    selectedChartIds: [],
    flowchartNodes: [
      { id: 'n1', label: '1. Entrada de Pedido / Venda', type: 'step' },
      { id: 'n2', label: '2. Validação de Estoque?', type: 'decision' },
      { id: 'n3', label: '3. Faturamento & Expedição', type: 'step' }
    ],
    flowchartEdges: [
      { id: 'e1', source: 'n1', target: 'n2' },
      { id: 'e2', source: 'n2', target: 'n3', label: 'Sim' }
    ],
    visible: true
  },
  {
    id: 'slide_6',
    title: 'Plano de Ação e Acompanhamento',
    description: 'Ações estruturadas para alavancar os resultados',
    layoutId: 'plano_acao',
    selectedKpis: [],
    selectedChartIds: [],
    actionPlanItems: [
      { id: 'a1', action: 'Monitorar metas diárias das lojas críticas', owner: 'Lucas Martins', deadline: 'Semanal', kpiId: 'Meta Atingimento' },
      { id: 'a2', action: 'Reforçar estoque das categorias líderes', owner: '', deadline: '', kpiId: 'Vendas Totais' }
    ],
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
  const [activePillarTab, setActivePillarTab] = useState<'visual' | 'structure' | 'content'>('structure');
  const [slides, setSlides] = useState<SlideItemConfig[]>(INITIAL_SLIDES);
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const [selectedTheme, setSelectedTheme] = useState<PPTXTheme>(BUILTIN_THEMES[0]);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [customThemeNotes, setCustomThemeNotes] = useState<string[]>([]);

  // AI Modal State
  const [showAIModal, setShowAIModal] = useState<boolean>(false);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [selectedAISuggestions, setSelectedAISuggestions] = useState<string[]>([]);

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

  const addSlide = (layoutId: SlideLayoutId = 'resumo_executivo') => {
    const newSlide: SlideItemConfig = {
      id: `slide_${Date.now()}`,
      title: 'Novo Slide',
      description: 'Descrição do novo slide',
      layoutId,
      selectedKpis: ['total_sales', 'total_target'],
      selectedChartIds: [],
      customText: 'Insira observações ou tópicos estratégicos.',
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

  const handleSplitSlide = () => {
    const target = activeSlide;
    const textLines = (target.customText || '').split('\n');
    const half = Math.ceil(textLines.length / 2);

    const part1 = textLines.slice(0, half).join('\n');
    const part2 = textLines.slice(half).join('\n');

    const updatedSlide1: SlideItemConfig = { ...target, customText: part1 };
    const newSlide2: SlideItemConfig = {
      ...target,
      id: `slide_${Date.now()}`,
      title: `${target.title} (Parte 2)`,
      customText: part2
    };

    const next = [...slides];
    next[activeSlideIndex] = updatedSlide1;
    next.splice(activeSlideIndex + 1, 0, newSlide2);

    setSlides(next);
  };

  const handleOpenAISuggestions = () => {
    const suggestions = generateAISuggestionsForSlide(kpis, stores, categories);
    setAiSuggestions(suggestions);
    setSelectedAISuggestions(suggestions.map(s => s.id));
    setShowAIModal(true);
  };

  const handleApplyAISuggestions = () => {
    const selectedTexts = aiSuggestions
      .filter(s => selectedAISuggestions.includes(s.id))
      .map(s => s.text);

    if (selectedTexts.length > 0) {
      const existing = activeSlide.customText ? `${activeSlide.customText}\n\n` : '';
      updateActiveSlide({ customText: `${existing}${selectedTexts.join('\n')}` });
    }
    setShowAIModal(false);
  };

  // Check Overflow
  const textLength = (activeSlide.customText || '').length;
  const isOverflowing = textLength > 400 || (activeSlide.selectedKpis && activeSlide.selectedKpis.length > 4);

  const topStore = stores[0];
  const lowestStore = stores[stores.length - 1];
  const topCategory = categories[0];

  return (
    <div className="space-y-6 animate-fade-in pb-12 max-w-7xl mx-auto">
      
      {/* Top Action Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4 no-print">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Presentation className="w-6 h-6 text-emerald-600" />
              Montagem de Apresentações Executivas
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Configure identidade visual, estrutura de slides e conteúdos fundamentados em dados reais.
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

        {/* 3 Pillar Tabs Nav */}
        <div className="flex border-b border-slate-200 space-x-4 text-xs font-bold">
          <button
            onClick={() => setActivePillarTab('structure')}
            className={`pb-2.5 flex items-center space-x-2 border-b-2 transition-all ${
              activePillarTab === 'structure'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>1. Galeria & Estrutura</span>
          </button>

          <button
            onClick={() => setActivePillarTab('visual')}
            className={`pb-2.5 flex items-center space-x-2 border-b-2 transition-all ${
              activePillarTab === 'visual'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>2. Identidade Visual</span>
          </button>

          <button
            onClick={() => setActivePillarTab('content')}
            className={`pb-2.5 flex items-center space-x-2 border-b-2 transition-all ${
              activePillarTab === 'content'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>3. Conteúdo do Slide ({activeSlideIndex + 1})</span>
          </button>
        </div>

        {/* PILAR 1: IDENTIDADE VISUAL */}
        {activePillarTab === 'visual' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-2">
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
                className="w-full bg-slate-50 border border-slate-300 text-slate-800 rounded-lg px-3 py-2 font-medium"
              >
                {BUILTIN_THEMES.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
                {selectedTheme.isExternal && (
                  <option value={selectedTheme.id}>{selectedTheme.name} (Importado)</option>
                )}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-700">Importar Modelo Corporativo (.pptx)</label>
              <label className="cursor-pointer bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-lg px-3 py-2 flex items-center space-x-2 font-medium">
                <UploadCloud className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="truncate">
                  {selectedTheme.isExternal ? selectedTheme.name : 'Carregar arquivo .pptx'}
                </span>
                <input type="file" accept=".pptx" onChange={handleFileUploadPPTX} className="hidden" />
              </label>
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-700">Cores Ativas</label>
              <div className="flex items-center space-x-2 bg-slate-50 p-2 rounded-lg border border-slate-300">
                <span className="w-5 h-5 rounded-full border border-slate-300" style={{ backgroundColor: selectedTheme.backgroundColor }} title="Fundo"></span>
                <span className="w-5 h-5 rounded-full border border-slate-300" style={{ backgroundColor: selectedTheme.cardColor }} title="Card"></span>
                <span className="w-5 h-5 rounded-full border border-slate-300" style={{ backgroundColor: selectedTheme.secondaryColor }} title="Destaque"></span>
                <span className="text-[11px] font-mono text-slate-600">{selectedTheme.name}</span>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* 3-COLUMN EDITOR LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* COLUMN 1: LEFT SIDEBAR - SLIDE LIST & REORDERING (3 cols) */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-600" />
              Slides no Deck ({slides.length})
            </span>
            <button
              onClick={() => addSlide('resumo_executivo')}
              className="p-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Slide</span>
            </button>
          </div>

          {/* GALLERY CHOOSER SLIDE ADDER */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-slate-600">Adicionar Modelo da Galeria:</label>
            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              <button onClick={() => addSlide('capa')} className="p-1.5 bg-slate-50 hover:bg-emerald-50 border border-slate-200 rounded text-left font-medium">📌 Capa</button>
              <button onClick={() => addSlide('resumo_executivo')} className="p-1.5 bg-slate-50 hover:bg-emerald-50 border border-slate-200 rounded text-left font-medium">📋 Resumo</button>
              <button onClick={() => addSlide('kpis')} className="p-1.5 bg-slate-50 hover:bg-emerald-50 border border-slate-200 rounded text-left font-medium">📊 KPIs</button>
              <button onClick={() => addSlide('grafico_analise')} className="p-1.5 bg-slate-50 hover:bg-emerald-50 border border-slate-200 rounded text-left font-medium">📈 Gráfico</button>
              <button onClick={() => addSlide('fluxograma')} className="p-1.5 bg-slate-50 hover:bg-emerald-50 border border-slate-200 rounded text-left font-medium">🔄 Fluxo</button>
              <button onClick={() => addSlide('plano_acao')} className="p-1.5 bg-slate-50 hover:bg-emerald-50 border border-slate-200 rounded text-left font-medium">✅ Ação</button>
            </div>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {slides.map((s, idx) => (
              <div
                key={s.id}
                onClick={() => {
                  setActiveSlideIndex(idx);
                  setActivePillarTab('content');
                }}
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
                    <button onClick={() => moveSlide(idx, 'up')} disabled={idx === 0} className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"><ArrowUp className="w-3 h-3" /></button>
                    <button onClick={() => moveSlide(idx, 'down')} disabled={idx === slides.length - 1} className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"><ArrowDown className="w-3 h-3" /></button>
                    <button onClick={() => duplicateSlide(idx)} className="p-1 text-slate-400 hover:text-emerald-600"><Copy className="w-3 h-3" /></button>
                    <button onClick={() => deleteSlide(idx)} className="p-1 text-slate-400 hover:text-rose-600"><Trash2 className="w-3 h-3" /></button>
                  </div>
                </div>

                <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded font-mono block w-max">
                  {s.layoutId}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* COLUMN 2: CENTER - LIVE VISUAL PREVIEW CANVAS (6 cols) */}
        <div className="lg:col-span-6 space-y-3">
          
          {/* Overflow Warning Bar */}
          {isOverflowing && (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs flex items-center justify-between text-amber-900 shadow-sm animate-pulse">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Conteúdo ultrapassa a área ideal do slide.</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleSplitSlide}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-2.5 py-1 rounded text-[11px] flex items-center space-x-1"
                >
                  <Scissors className="w-3 h-3" />
                  <span>Dividir em 2 Slides</span>
                </button>
              </div>
            </div>
          )}

          <div
            className="rounded-2xl p-6 sm:p-8 shadow-xl border min-h-[460px] flex flex-col justify-between relative overflow-hidden transition-all"
            style={{
              backgroundColor: selectedTheme.backgroundColor,
              color: selectedTheme.textColor,
              borderColor: selectedTheme.secondaryColor
            }}
          >
            {/* Slide Top Header */}
            <div className="flex items-center justify-between border-b pb-3 relative z-10" style={{ borderColor: `${selectedTheme.secondaryColor}40` }}>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: selectedTheme.secondaryColor }}></span>
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: selectedTheme.secondaryColor }}>
                  AuraOps Analytics
                </span>
              </div>
              <span className="text-xs opacity-75">{dateRangeText}</span>
            </div>

            {/* Slide Body Render */}
            <div className="py-6 relative z-10 space-y-4">
              <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: selectedTheme.secondaryColor }}>
                Slide {activeSlideIndex + 1} de {slides.length} • Modelo: {activeSlide.layoutId}
              </span>
              
              <h2 className="text-2xl font-extrabold" style={{ fontFamily: selectedTheme.headerFont }}>
                {activeSlide.title || 'Sem título'}
              </h2>
              
              {activeSlide.description && (
                <p className="text-xs opacity-80">{activeSlide.description}</p>
              )}

              {/* RENDER MODEL: CAPA */}
              {(activeSlide.layoutId === 'capa' || activeSlide.layoutId === 'cover') && (
                <div className="p-4 rounded-xl border text-xs space-y-1.5 max-w-md mt-4" style={{ backgroundColor: selectedTheme.cardColor, borderColor: `${selectedTheme.secondaryColor}40` }}>
                  <div><strong>Base:</strong> {activeDatasetName}</div>
                  <div><strong>Período:</strong> {dateRangeText}</div>
                  <div><strong>Contexto:</strong> {activeSlide.meetingContext || 'Reunião Executiva'}</div>
                  <div><strong>Criado por:</strong> <span style={{ color: selectedTheme.secondaryColor, fontWeight: 'bold' }}>Lucas Martins</span></div>
                </div>
              )}

              {/* RENDER MODEL: RESUMO EXECUTIVO */}
              {activeSlide.layoutId === 'resumo_executivo' && (
                <div className="p-4 rounded-xl border text-xs whitespace-pre-line leading-relaxed" style={{ backgroundColor: selectedTheme.cardColor, borderColor: `${selectedTheme.secondaryColor}40` }}>
                  {activeSlide.customText || 'Preencha o resumo executivo no painel à direita.'}
                </div>
              )}

              {/* RENDER MODEL: KPIS */}
              {(activeSlide.layoutId === 'kpis' || activeSlide.layoutId === 'executive_kpis') && (
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

              {/* RENDER MODEL: GRÁFICO COM ANÁLISE */}
              {(activeSlide.layoutId === 'grafico_analise' || activeSlide.layoutId === 'chart_and_insights') && (
                <div className="grid grid-cols-2 gap-3 text-xs pt-2">
                  <div className="p-3 rounded-lg border space-y-2" style={{ backgroundColor: selectedTheme.cardColor, borderColor: `${selectedTheme.secondaryColor}30` }}>
                    <div className="font-bold" style={{ color: selectedTheme.secondaryColor }}>Distribuição de Vendas</div>
                    {categories.slice(0, 4).map((c, idx) => (
                      <div key={idx} className="flex justify-between text-[11px]">
                        <span>{c.category}</span>
                        <strong>{c.sharePct.toFixed(1)}%</strong>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 rounded-lg border" style={{ backgroundColor: selectedTheme.cardColor, borderColor: `${selectedTheme.secondaryColor}30` }}>
                    <div className="font-bold mb-1" style={{ color: selectedTheme.secondaryColor }}>Análise Narrativa</div>
                    <div className="text-[11px] opacity-90">{activeSlide.customText || 'Insira a análise do gráfico.'}</div>
                  </div>
                </div>
              )}

              {/* RENDER MODEL: FLUXOGRAMA */}
              {activeSlide.layoutId === 'fluxograma' && (
                <div className="flex items-center justify-around pt-4 gap-2">
                  {(activeSlide.flowchartNodes || [
                    { id: 'n1', label: '1. Pedido', type: 'step' },
                    { id: 'n2', label: '2. Validação?', type: 'decision' },
                    { id: 'n3', label: '3. Expedição', type: 'step' }
                  ]).map((node, idx) => (
                    <div
                      key={node.id}
                      className={`p-3 text-center border text-xs font-bold ${
                        node.type === 'decision' ? 'rotate-45 w-20 h-20 flex items-center justify-center border-amber-400 text-amber-300' : 'rounded-lg w-28 border-emerald-400'
                      }`}
                      style={{ backgroundColor: selectedTheme.cardColor }}
                    >
                      <span className={node.type === 'decision' ? '-rotate-45 block text-[10px]' : ''}>
                        {node.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* RENDER MODEL: PLANO DE AÇÃO */}
              {(activeSlide.layoutId === 'plano_acao' || activeSlide.layoutId === 'recommendations') && (
                <div className="space-y-2 text-xs pt-1">
                  {(activeSlide.actionPlanItems || [
                    { id: 'a1', action: 'Monitorar metas das lojas críticas', owner: 'Lucas Martins', deadline: 'Semanal' },
                    { id: 'a2', action: 'Garantir estoque de produtos líderes', owner: '', deadline: '' }
                  ]).map((item, idx) => (
                    <div key={idx} className="p-2.5 rounded border flex justify-between items-center" style={{ backgroundColor: selectedTheme.cardColor, borderColor: `${selectedTheme.secondaryColor}30` }}>
                      <div>
                        <span className="font-bold block">{item.action}</span>
                        <span className="text-[10px] opacity-75">Responsável: {item.owner || '—'}</span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {item.deadline || '—'}
                      </span>
                    </div>
                  ))}
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

        {/* COLUMN 3: RIGHT SIDEBAR - DYNAMIC INSPECTOR (3 cols) */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-emerald-600" />
              Inspector: Slide {activeSlideIndex + 1}
            </span>
            
            <button
              onClick={handleOpenAISuggestions}
              className="p-1 rounded bg-purple-50 hover:bg-purple-100 text-purple-700 text-[11px] font-bold flex items-center space-x-1"
              title="Sugerir conteúdo fundamentado em dados com IA"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>Sugerir IA</span>
            </button>
          </div>

          <div className="space-y-3 text-xs">
            {/* Title */}
            <div className="space-y-1">
              <label className="block font-bold text-slate-700">Título do Slide</label>
              <input
                type="text"
                value={activeSlide.title}
                onChange={(e) => updateActiveSlide({ title: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800"
              />
            </div>

            {/* Subtitle */}
            <div className="space-y-1">
              <label className="block font-bold text-slate-700">Subtítulo / Descrição</label>
              <input
                type="text"
                value={activeSlide.description || ''}
                onChange={(e) => updateActiveSlide({ description: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800"
              />
            </div>

            {/* Layout Selector */}
            <div className="space-y-1">
              <label className="block font-bold text-slate-700">Modelo do Slide (Galeria)</label>
              <select
                value={activeSlide.layoutId}
                onChange={(e) => updateActiveSlide({ layoutId: e.target.value as SlideLayoutId })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium"
              >
                <option value="capa">📌 Capa da Apresentação</option>
                <option value="resumo_executivo">📋 Resumo Executivo</option>
                <option value="kpis">📊 Indicadores / KPIs (4 Cards)</option>
                <option value="grafico_analise">📈 Gráfico com Análise</option>
                <option value="fluxograma">🔄 Fluxograma Operacional</option>
                <option value="plano_acao">✅ Plano de Ação</option>
              </select>
            </div>

            {/* DYNAMIC FIELDS PER LAYOUT */}
            {activeSlide.layoutId === 'capa' && (
              <div className="space-y-1">
                <label className="block font-bold text-slate-700">Contexto da Reunião</label>
                <input
                  type="text"
                  value={activeSlide.meetingContext || ''}
                  onChange={(e) => updateActiveSlide({ meetingContext: e.target.value })}
                  placeholder="Ex: Alinhamento de metas mensais..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
                />
              </div>
            )}

            {(activeSlide.layoutId === 'resumo_executivo' || activeSlide.layoutId === 'grafico_analise') && (
              <div className="space-y-1">
                <label className="block font-bold text-slate-700">Texto / Análise Narrativa</label>
                <textarea
                  rows={5}
                  value={activeSlide.customText || ''}
                  onChange={(e) => updateActiveSlide({ customText: e.target.value })}
                  placeholder="Digite observações..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs resize-none"
                />
              </div>
            )}

            {activeSlide.layoutId === 'kpis' && (
              <div className="space-y-2 pt-1 border-t border-slate-200">
                <span className="font-bold text-slate-800 block">Indicadores no Slide:</span>
                <p className="text-[10px] text-slate-500">Exibindo fórmulas e requisitos das colunas cadastradas.</p>
                {Object.values(KPI_REGISTRY).slice(0, 4).map(kpi => (
                  <div key={kpi.id} className="p-2 rounded bg-slate-50 border border-slate-200 space-y-0.5 text-[11px]">
                    <div className="font-bold text-slate-900">{kpi.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono">Fórmula: {kpi.formula}</div>
                  </div>
                ))}
              </div>
            )}

            {activeSlide.layoutId === 'plano_acao' && (
              <div className="space-y-2 pt-1 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">Ações do Plano:</span>
                  <button
                    onClick={() => {
                      const current = activeSlide.actionPlanItems || [];
                      updateActiveSlide({
                        actionPlanItems: [...current, { id: `a_${Date.now()}`, action: 'Nova Ação Operacional', owner: '', deadline: '' }]
                      });
                    }}
                    className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded"
                  >
                    + Ação
                  </button>
                </div>

                {(activeSlide.actionPlanItems || []).map((item, idx) => (
                  <div key={item.id} className="p-2 rounded bg-slate-50 border border-slate-200 space-y-1.5">
                    <input
                      type="text"
                      value={item.action}
                      onChange={(e) => {
                        const next = [...(activeSlide.actionPlanItems || [])];
                        next[idx].action = e.target.value;
                        updateActiveSlide({ actionPlanItems: next });
                      }}
                      placeholder="Descrição da ação..."
                      className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-[11px]"
                    />
                    <div className="grid grid-cols-2 gap-1">
                      <input
                        type="text"
                        value={item.owner || ''}
                        onChange={(e) => {
                          const next = [...(activeSlide.actionPlanItems || [])];
                          next[idx].owner = e.target.value;
                          updateActiveSlide({ actionPlanItems: next });
                        }}
                        placeholder="Responsável (vazio = —)"
                        className="bg-white border border-slate-300 rounded px-1.5 py-0.5 text-[10px]"
                      />
                      <input
                        type="text"
                        value={item.deadline || ''}
                        onChange={(e) => {
                          const next = [...(activeSlide.actionPlanItems || [])];
                          next[idx].deadline = e.target.value;
                          updateActiveSlide({ actionPlanItems: next });
                        }}
                        placeholder="Prazo (vazio = —)"
                        className="bg-white border border-slate-300 rounded px-1.5 py-0.5 text-[10px]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>

      </div>

      {/* AI SUGGESTION MODAL */}
      {showAIModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 text-xs animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-slate-900 text-sm">Sugestões de Conteúdo com IA</h3>
              </div>
              <button onClick={() => setShowAIModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <p className="text-slate-500">
              As sugestões abaixo foram geradas <strong>exclusivamente a partir dos dados calculados</strong> da sua planilha:
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {aiSuggestions.map(s => (
                <label key={s.id} className="flex items-start space-x-2.5 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedAISuggestions.includes(s.id)}
                    onChange={() => {
                      if (selectedAISuggestions.includes(s.id)) {
                        setSelectedAISuggestions(selectedAISuggestions.filter(id => id !== s.id));
                      } else {
                        setSelectedAISuggestions([...selectedAISuggestions, s.id]);
                      }
                    }}
                    className="w-4 h-4 text-purple-600 rounded border-slate-300 mt-0.5"
                  />
                  <div>
                    <span className="font-semibold text-slate-800">{s.text}</span>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex justify-end space-x-2 border-t pt-3">
              <button onClick={() => setShowAIModal(false)} className="px-3 py-2 rounded-lg bg-slate-100 text-slate-700 font-bold">Cancelar</button>
              <button onClick={handleApplyAISuggestions} className="px-4 py-2 rounded-lg bg-purple-700 hover:bg-purple-800 text-white font-bold">Inserir no Slide</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
