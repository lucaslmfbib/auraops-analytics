import React, { useState, useMemo } from 'react';
import { 
  X, 
  BarChart3, 
  PieChart, 
  LineChart, 
  AreaChart, 
  Table, 
  Check, 
  Sparkles, 
  Palette, 
  Sliders, 
  Database, 
  RotateCcw, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp,
  ScatterChart,
  LayoutGrid
} from 'lucide-react';
import { ChartType, CustomChartConfig, MetricAggregation, SheetData } from '../types/analytics';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  LineChart as ReLineChart, 
  Line, 
  AreaChart as ReAreaChart, 
  Area, 
  PieChart as RePieChart,
  Pie,
  ScatterChart as ReScatterChart,
  Scatter,
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Cell, 
  Legend 
} from 'recharts';
import { formatBRCurrency } from '../services/dataParser';
import { KPI_REGISTRY } from '../services/kpiRegistry';

interface ChartBuilderModalProps {
  sheetData: SheetData | null;
  existingChart?: CustomChartConfig | null;
  onSaveChart: (chartConfig: CustomChartConfig, scopeAction?: 'current' | 'style_all' | 'dashboard' | 'slide' | 'both') => void;
  onClose: () => void;
}

const BOTICARIO_PALETTE = {
  primary: '#011E38',   // Dark Blue
  cardBg: '#F5F1EB',    // Off-White
  secondary: '#264FEC', // Accent Blue
  accent: '#FFBC82',    // Salmon Accent
  colors: ['#011E38', '#264FEC', '#FFBC82', '#059669', '#8B5CF6', '#EC4899', '#F59E0B']
};

export const ChartBuilderModal: React.FC<ChartBuilderModalProps> = ({
  sheetData,
  existingChart,
  onSaveChart,
  onClose
}) => {
  const headers = sheetData ? sheetData.headers : [];
  
  const [activeTab, setActiveTab] = useState<'data' | 'chart' | 'appearance'>('data');
  const [showAdvancedSection, setShowAdvancedSection] = useState<boolean>(false);

  // ABA DADOS State
  const [title, setTitle] = useState<string>(existingChart?.title || 'Faturamento por Categoria');
  const [dimensionHeader, setDimensionHeader] = useState<string>(existingChart?.dimensionHeader || headers[0] || 'Loja');
  const [metricHeader, setMetricHeader] = useState<string>(existingChart?.metricHeader || headers[1] || 'Vendas');
  const [aggregation, setAggregation] = useState<MetricAggregation>(existingChart?.aggregation || 'sum');
  const [compareWithTarget, setCompareWithTarget] = useState<boolean>(existingChart?.compareWithTarget || false);
  const [compareWithPrevious, setCompareWithPrevious] = useState<boolean>(existingChart?.compareWithPrevious || false);

  // ABA GRÁFICO State
  const [chartType, setChartType] = useState<ChartType>(existingChart?.chartType || 'bar');
  const [orientation, setOrientation] = useState<'vertical' | 'horizontal'>(existingChart?.orientation || 'vertical');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc' | 'alpha' | 'chrono'>(existingChart?.sortOrder || 'desc');
  const [limitTopN, setLimitTopN] = useState<number>(existingChart?.limitTopN ?? 7);
  const [showValues, setShowValues] = useState<boolean>(existingChart?.showValues ?? true);
  const [showAxes, setShowAxes] = useState<boolean>(existingChart?.showAxes ?? true);
  const [showGridlines, setShowGridlines] = useState<boolean>(existingChart?.showGridlines ?? true);
  const [showLegend, setShowLegend] = useState<boolean>(existingChart?.showLegend ?? true);
  const [isAutoSuggested, setIsAutoSuggested] = useState<boolean>(existingChart?.isAutomatic || false);
  const [autoJustification, setAutoJustification] = useState<string>(existingChart?.autoJustification || '');

  // ABA APARÊNCIA State (Boticário Identity Defaults)
  const [primaryColor, setPrimaryColor] = useState<string>(existingChart?.primaryColor || '#011E38');
  const [secondaryColor, setSecondaryColor] = useState<string>(existingChart?.secondaryColor || '#264FEC');
  const [accentColor, setAccentColor] = useState<string>(existingChart?.accentColor || '#FFBC82');
  const [cardBgColor, setCardBgColor] = useState<string>(existingChart?.cardBgColor || '#F5F1EB');
  const [fontFamily, setFontFamily] = useState<string>(existingChart?.fontFamily || 'IBM Plex Sans');
  const [strokeWidth, setStrokeWidth] = useState<number>(existingChart?.strokeWidth || 2);
  const [markerSize, setMarkerSize] = useState<number>(existingChart?.markerSize || 5);
  const [categoryColorsMap, setCategoryColorsMap] = useState<Record<string, string>>(existingChart?.categoryColorsMap || {});

  // Scope checkboxes
  const [showInDashboard, setShowInDashboard] = useState<boolean>(existingChart?.showInDashboard ?? true);
  const [showInPresentation, setShowInPresentation] = useState<boolean>(existingChart?.showInPresentation ?? true);

  // Compute live dataset from sheetData
  const previewData = useMemo(() => {
    if (!sheetData || !dimensionHeader) return [];

    const map = new Map<string, { total: number; count: number; set: Set<any> }>();

    sheetData.rows.forEach(r => {
      const dimVal = String(r[dimensionHeader] ?? 'Outros').trim() || 'Outros';
      const rawMetVal = r[metricHeader];
      const numVal = typeof rawMetVal === 'number' ? rawMetVal : parseFloat(String(rawMetVal || '0').replace(/[^0-9,-]/g, '').replace(',', '.'));
      const val = isNaN(numVal) ? 0 : numVal;

      if (!map.has(dimVal)) {
        map.set(dimVal, { total: 0, count: 0, set: new Set() });
      }
      const item = map.get(dimVal)!;
      item.total += val;
      item.count += 1;
      item.set.add(rawMetVal);
    });

    const list: Array<{ label: string; value: number; color?: string }> = [];

    map.forEach((val, label) => {
      let finalVal = val.total;
      if (aggregation === 'avg') finalVal = val.count > 0 ? val.total / val.count : 0;
      if (aggregation === 'count') finalVal = val.count;
      if (aggregation === 'count_distinct') finalVal = val.set.size;

      // Color binding lock
      const boundColor = categoryColorsMap[label] || BOTICARIO_PALETTE.colors[list.length % BOTICARIO_PALETTE.colors.length];

      list.push({ 
        label, 
        value: Math.round(finalVal * 100) / 100,
        color: boundColor 
      });
    });

    // Sorting
    if (sortOrder === 'desc') list.sort((a, b) => b.value - a.value);
    if (sortOrder === 'asc') list.sort((a, b) => a.value - b.value);
    if (sortOrder === 'alpha') list.sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'));

    return limitTopN > 0 ? list.slice(0, limitTopN) : list;
  }, [sheetData, dimensionHeader, metricHeader, aggregation, sortOrder, limitTopN, categoryColorsMap]);

  // Handle Automatic Suggestion
  const handleAutoSuggest = () => {
    setIsAutoSuggested(true);
    if (previewData.length > 6) {
      setChartType('horizontalBar');
      setAutoJustification('Sugerido Gráfico de Barras Horizontais para acomodar mais de 6 categorias sem poluir o eixo.');
    } else {
      setChartType('bar');
      setAutoJustification('Sugerido Gráfico de Colunas para comparação direta entre categorias.');
    }
  };

  const handleResetToBoticario = () => {
    setPrimaryColor('#011E38');
    setSecondaryColor('#264FEC');
    setAccentColor('#FFBC82');
    setCardBgColor('#F5F1EB');
    setFontFamily('IBM Plex Sans');
    setStrokeWidth(2);
    setMarkerSize(5);
    setCategoryColorsMap({});
  };

  const handleSave = (scopeAction: 'current' | 'style_all' | 'dashboard' | 'slide' | 'both' = 'current') => {
    if (!title) return;

    const chartConfig: CustomChartConfig = {
      id: existingChart?.id || `chart_${Date.now()}`,
      title,
      chartType,
      dimensionHeader,
      metricHeader,
      aggregation,
      sortOrder,
      limitTopN,
      showInDashboard,
      showInPresentation,
      compareWithTarget,
      compareWithPrevious,
      orientation,
      showValues,
      showAxes,
      showGridlines,
      showLegend,
      isAutomatic: isAutoSuggested,
      autoJustification,
      paletteId: 'boticario',
      primaryColor,
      secondaryColor,
      accentColor,
      cardBgColor,
      fontFamily,
      strokeWidth,
      markerSize,
      categoryColorsMap
    };

    onSaveChart(chartConfig, scopeAction);
    onClose();
  };

  // Contrast check helper
  const isLowContrast = cardBgColor === '#F5F1EB' && primaryColor === '#F5F1EB';

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full p-6 space-y-5 animate-fade-in my-8">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-slate-900 text-amber-300 shadow-md">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>Configurador de Gráfico & Métricas</span>
                <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono border">
                  Perfil Boticário
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Personalize os dados, a forma visual e a aparência corporativa do seu gráfico.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 TABS NAV BAR */}
        <div className="flex border-b border-slate-200 space-x-6 text-xs font-bold">
          <button
            onClick={() => setActiveTab('data')}
            className={`pb-2.5 flex items-center space-x-1.5 border-b-2 transition-all ${
              activeTab === 'data' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>1. Dados & Agregação</span>
          </button>

          <button
            onClick={() => setActiveTab('chart')}
            className={`pb-2.5 flex items-center space-x-1.5 border-b-2 transition-all ${
              activeTab === 'chart' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>2. Visualização & Tipo</span>
          </button>

          <button
            onClick={() => setActiveTab('appearance')}
            className={`pb-2.5 flex items-center space-x-1.5 border-b-2 transition-all ${
              activeTab === 'appearance' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>3. Aparência & Boticário</span>
          </button>
        </div>

        {/* TAB 1: DADOS */}
        {activeTab === 'data' && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="space-y-1 col-span-full">
                <label className="block font-bold text-slate-800">Título do Gráfico</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-800">Métrica / KPI a Analisar</label>
                <select
                  value={metricHeader}
                  onChange={(e) => setMetricHeader(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium"
                >
                  {headers.map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-800">Dimensão de Comparação</label>
                <select
                  value={dimensionHeader}
                  onChange={(e) => setDimensionHeader(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium"
                >
                  {headers.map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-800">Agregação Operacional</label>
                <select
                  value={aggregation}
                  onChange={(e) => setAggregation(e.target.value as MetricAggregation)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium"
                >
                  <option value="sum">Soma (Faturamento / Volume Total)</option>
                  <option value="avg">Média (Não ponderada)</option>
                  <option value="count">Contagem de Registros</option>
                  <option value="count_distinct">Contagem Distinta (IDs únicos)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-800">Comparação com Metas</label>
                <label className="flex items-center space-x-2 bg-slate-50 p-2.5 rounded-lg border border-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={compareWithTarget}
                    onChange={(e) => setCompareWithTarget(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span>Exibir meta cadastrada para comparação</span>
                </label>
              </div>

            </div>

            {/* Calculability Info Box */}
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-900 space-y-1">
              <span className="font-bold block">Status do Indicador:</span>
              <p>Métrica <strong>"{metricHeader}"</strong> agrupada por <strong>"{dimensionHeader}"</strong> usando <strong>{aggregation.toUpperCase()}</strong>.</p>
              <p className="text-[10px] text-emerald-700">Regra de cálculo preservada: não efetua soma de percentuais nem duplica metas repetidas.</p>
            </div>
          </div>
        )}

        {/* TAB 2: GRÁFICO */}
        {activeTab === 'chart' && (
          <div className="space-y-4 text-xs">
            
            {/* Auto Suggestion Banner */}
            <div className="flex items-center justify-between p-3 bg-slate-900 text-white rounded-xl">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="font-bold">Sugestão Automática por IA:</span>
              </div>
              <button
                onClick={handleAutoSuggest}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] px-3 py-1.5 rounded-lg transition-colors"
              >
                🤖 Aplicar Sugestão Automática
              </button>
            </div>

            {isAutoSuggested && autoJustification && (
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-900 font-medium">
                {autoJustification}
              </div>
            )}

            {/* Chart Type Selector with 6 Visual Options */}
            <div>
              <label className="block font-bold text-slate-800 mb-2">Tipo de Gráfico (Selecione o modelo visual)</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                
                {/* 1. Barras Horizontais */}
                <button
                  type="button"
                  onClick={() => setChartType('horizontalBar')}
                  className={`p-3 rounded-xl border text-left flex items-start space-x-2.5 transition-all ${
                    chartType === 'horizontalBar' 
                      ? 'border-emerald-600 bg-emerald-50/80 text-emerald-900 font-bold ring-1 ring-emerald-500 shadow-sm' 
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 shrink-0">
                    <BarChart3 className="w-4 h-4 rotate-90" />
                  </div>
                  <div>
                    <span className="block font-bold text-xs">Barras horizontais</span>
                    <span className="text-[10px] text-slate-500 leading-tight block mt-0.5">Comparar e ordenar categorias</span>
                  </div>
                </button>

                {/* 2. Colunas */}
                <button
                  type="button"
                  onClick={() => setChartType('bar')}
                  className={`p-3 rounded-xl border text-left flex items-start space-x-2.5 transition-all ${
                    chartType === 'bar' 
                      ? 'border-emerald-600 bg-emerald-50/80 text-emerald-900 font-bold ring-1 ring-emerald-500 shadow-sm' 
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 shrink-0">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block font-bold text-xs">Colunas</span>
                    <span className="text-[10px] text-slate-500 leading-tight block mt-0.5">Comparar categorias ou períodos</span>
                  </div>
                </button>

                {/* 3. Linhas */}
                <button
                  type="button"
                  onClick={() => setChartType('line')}
                  className={`p-3 rounded-xl border text-left flex items-start space-x-2.5 transition-all ${
                    chartType === 'line' 
                      ? 'border-emerald-600 bg-emerald-50/80 text-emerald-900 font-bold ring-1 ring-emerald-500 shadow-sm' 
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 shrink-0">
                    <LineChart className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block font-bold text-xs">Linhas</span>
                    <span className="text-[10px] text-slate-500 leading-tight block mt-0.5">Evolução ao longo do tempo</span>
                  </div>
                </button>

                {/* 4. Rosca */}
                <button
                  type="button"
                  onClick={() => setChartType('pie')}
                  className={`p-3 rounded-xl border text-left flex items-start space-x-2.5 transition-all ${
                    chartType === 'pie' 
                      ? 'border-emerald-600 bg-emerald-50/80 text-emerald-900 font-bold ring-1 ring-emerald-500 shadow-sm' 
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 shrink-0">
                    <PieChart className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block font-bold text-xs">Rosca</span>
                    <span className="text-[10px] text-slate-500 leading-tight block mt-0.5">Participação das partes no total</span>
                  </div>
                </button>

                {/* 5. Colunas empilhadas 100% */}
                <button
                  type="button"
                  onClick={() => setChartType('stacked100')}
                  className={`p-3 rounded-xl border text-left flex items-start space-x-2.5 transition-all ${
                    chartType === 'stacked100' 
                      ? 'border-emerald-600 bg-emerald-50/80 text-emerald-900 font-bold ring-1 ring-emerald-500 shadow-sm' 
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 shrink-0">
                    <LayoutGrid className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block font-bold text-xs">Colunas 100%</span>
                    <span className="text-[10px] text-slate-500 leading-tight block mt-0.5">Composição percentual</span>
                  </div>
                </button>

                {/* 6. Tabela */}
                <button
                  type="button"
                  onClick={() => setChartType('table')}
                  className={`p-3 rounded-xl border text-left flex items-start space-x-2.5 transition-all ${
                    chartType === 'table' 
                      ? 'border-emerald-600 bg-emerald-50/80 text-emerald-900 font-bold ring-1 ring-emerald-500 shadow-sm' 
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 shrink-0">
                    <Table className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block font-bold text-xs">Tabela</span>
                    <span className="text-[10px] text-slate-500 leading-tight block mt-0.5">Comparar valores detalhados</span>
                  </div>
                </button>

              </div>
            </div>

            {/* Validation Alerts */}
            {chartType === 'pie' && previewData.some(d => d.value < 0) && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-[11px] flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Validação do Gráfico de Rosca: Requer apenas valores não negativos e total positivo.</span>
              </div>
            )}

            {chartType === 'stacked100' && (
              <div className="p-2.5 bg-sky-50 border border-sky-200 rounded-lg text-sky-800 text-[11px] flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-sky-600 shrink-0" />
                <span>Composição em 100%: Exibe a distribuição percentual das partes de um mesmo total.</span>
              </div>
            )}

            {/* Chart Configuration Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="block font-bold text-slate-800">Ordenação</label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5"
                >
                  <option value="desc">Maior para Menor</option>
                  <option value="asc">Menor para Maior</option>
                  <option value="alpha">Alfabética</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-800">Limite Top N</label>
                <select
                  value={limitTopN}
                  onChange={(e) => setLimitTopN(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5"
                >
                  <option value={5}>Top 5 Categorias</option>
                  <option value={7}>Top 7 Categorias</option>
                  <option value={10}>Top 10 Categorias</option>
                  <option value={0}>Todas as Categorias</option>
                </select>
              </div>

              <div className="space-y-2 pt-4">
                <label className="flex items-center space-x-2 font-bold text-slate-800 cursor-pointer">
                  <input type="checkbox" checked={showValues} onChange={(e) => setShowValues(e.target.checked)} className="w-4 h-4 text-emerald-600 rounded" />
                  <span>Exibir Rótulos nos Pontos</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: APARÊNCIA & BOTICÁRIO */}
        {activeTab === 'appearance' && (
          <div className="space-y-4 text-xs">
            
            <div className="flex items-center justify-between p-3 bg-slate-100 rounded-xl">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-[#011E38]"></span>
                <span className="font-bold text-slate-800">Perfil Visual Institucional: Boticário</span>
              </div>
              <button
                onClick={handleResetToBoticario}
                className="text-[11px] font-bold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 px-3 py-1 rounded-lg flex items-center space-x-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restaurar Padrão Boticário</span>
              </button>
            </div>

            {/* Visual Color Pickers */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="block font-bold text-slate-700">Azul Escuro (Base)</label>
                <div className="flex items-center space-x-2">
                  <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-8 h-8 rounded border" />
                  <input type="text" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-full bg-slate-50 border rounded px-2 py-1 font-mono text-[11px]" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-700">Azul Acento</label>
                <div className="flex items-center space-x-2">
                  <input type="color" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} className="w-8 h-8 rounded border" />
                  <input type="text" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} className="w-full bg-slate-50 border rounded px-2 py-1 font-mono text-[11px]" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-700">Salmão Destaque</label>
                <div className="flex items-center space-x-2">
                  <input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="w-8 h-8 rounded border" />
                  <input type="text" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="w-full bg-slate-50 border rounded px-2 py-1 font-mono text-[11px]" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-700">Off-white Fundo</label>
                <div className="flex items-center space-x-2">
                  <input type="color" value={cardBgColor} onChange={(e) => setCardBgColor(e.target.value)} className="w-8 h-8 rounded border" />
                  <input type="text" value={cardBgColor} onChange={(e) => setCardBgColor(e.target.value)} className="w-full bg-slate-50 border rounded px-2 py-1 font-mono text-[11px]" />
                </div>
              </div>
            </div>

            {/* Category Color Lock Map */}
            <div className="border-t pt-3 space-y-2">
              <span className="font-bold text-slate-800 block">Vínculo de Cor por Categoria:</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {previewData.slice(0, 6).map((item, idx) => (
                  <div key={item.label} className="p-2 rounded border bg-slate-50 flex items-center justify-between">
                    <span className="truncate max-w-[100px] text-[11px]">{item.label}</span>
                    <input
                      type="color"
                      value={categoryColorsMap[item.label] || item.color}
                      onChange={(e) => {
                        setCategoryColorsMap({
                          ...categoryColorsMap,
                          [item.label]: e.target.value
                        });
                      }}
                      className="w-6 h-6 rounded cursor-pointer border"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Low Contrast Warning */}
            {isLowContrast && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-900 text-[11px] flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Aviso de Baixo Contraste: A cor do gráfico é muito similar à cor do fundo do cartão.</span>
              </div>
            )}
          </div>
        )}

        {/* LIVE CANVAS PREVIEW */}
        <div className="p-4 rounded-xl space-y-2 border transition-all" style={{ backgroundColor: cardBgColor, borderColor: `${secondaryColor}40` }}>
          <div className="flex items-center justify-between text-xs font-bold" style={{ color: primaryColor }}>
            <span>{title}</span>
            <span className="text-[10px] opacity-75 font-mono">{fontFamily}</span>
          </div>

          <div className="h-52 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'line' ? (
                <ReLineChart data={previewData}>
                  {showGridlines && <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />}
                  <XAxis dataKey="label" fontSize={9} />
                  <YAxis fontSize={9} />
                  <Tooltip formatter={(v: any) => [formatBRCurrency(Number(v)), metricHeader]} />
                  <Line type="monotone" dataKey="value" stroke={secondaryColor} strokeWidth={strokeWidth} dot={{ r: markerSize }} />
                </ReLineChart>
              ) : chartType === 'horizontalBar' ? (
                <BarChart data={previewData} layout="vertical">
                  {showGridlines && <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />}
                  <XAxis type="number" fontSize={9} />
                  <YAxis type="category" dataKey="label" fontSize={9} width={90} />
                  <Tooltip formatter={(v: any) => [formatBRCurrency(Number(v)), metricHeader]} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {previewData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color || primaryColor} />
                    ))}
                  </Bar>
                </BarChart>
              ) : chartType === 'pie' ? (
                <RePieChart>
                  <Pie
                    data={previewData}
                    dataKey="value"
                    nameKey="label"
                    innerRadius={40}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {previewData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color || BOTICARIO_PALETTE.colors[idx % BOTICARIO_PALETTE.colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: any) => [formatBRCurrency(Number(v)), metricHeader]} />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                </RePieChart>
              ) : chartType === 'table' ? (
                <div className="overflow-auto max-h-48 text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b bg-slate-100/50 text-slate-800">
                        <th className="p-1.5 font-bold">{dimensionHeader}</th>
                        <th className="p-1.5 font-bold text-right">{metricHeader}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.map((row, idx) => (
                        <tr key={idx} className="border-b border-slate-100">
                          <td className="p-1.5 flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: row.color }} />
                            <span>{row.label}</span>
                          </td>
                          <td className="p-1.5 text-right font-mono font-bold" style={{ color: primaryColor }}>
                            {formatBRCurrency(row.value)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <BarChart data={previewData}>
                  {showGridlines && <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />}
                  <XAxis dataKey="label" fontSize={9} />
                  <YAxis fontSize={9} />
                  <Tooltip formatter={(v: any) => [formatBRCurrency(Number(v)), metricHeader]} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {previewData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color || primaryColor} />
                    ))}
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* SCOPE ACTIONS BAR */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 pt-3 gap-3 text-xs">
          <div className="flex items-center space-x-3 text-slate-700 font-semibold">
            <label className="flex items-center space-x-1.5 cursor-pointer">
              <input type="checkbox" checked={showInDashboard} onChange={(e) => setShowInDashboard(e.target.checked)} className="w-4 h-4 text-emerald-600 rounded" />
              <span>Dashboard</span>
            </label>
            <label className="flex items-center space-x-1.5 cursor-pointer">
              <input type="checkbox" checked={showInPresentation} onChange={(e) => setShowInPresentation(e.target.checked)} className="w-4 h-4 text-emerald-600 rounded" />
              <span>Slide</span>
            </label>
          </div>

          <div className="flex items-center space-x-2 flex-wrap gap-y-2">
            <button onClick={onClose} className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
            <button onClick={() => handleSave('current')} className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-sm">
              Aplicar ao Gráfico
            </button>
            <button onClick={() => handleSave('style_all')} className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-sm">
              Aplicar Estilo a Todos os Gráficos
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
