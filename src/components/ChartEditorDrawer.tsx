import React, { useState, useMemo } from 'react';
import { 
  X, 
  BarChart3, 
  PieChart, 
  LineChart, 
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
  LayoutGrid,
  Copy,
  Calendar
} from 'lucide-react';
import { ChartType, CustomChartConfig, MetricAggregation, SheetData } from '../types/analytics';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  LineChart as ReLineChart, 
  Line, 
  PieChart as RePieChart,
  Pie,
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Cell, 
  Legend 
} from 'recharts';
import { formatBRCurrency } from '../services/dataParser';

interface ChartEditorDrawerProps {
  sheetData: SheetData | null;
  chartConfig: CustomChartConfig;
  onSaveChart: (updatedChart: CustomChartConfig, duplicate?: boolean) => void;
  onClose: () => void;
}

const BOTICARIO_PALETTE = {
  primary: '#011E38',   // Dark Blue Text / Base
  cardBg: '#F5F1EB',    // Off-White Card Background
  secondary: '#264FEC', // Accent Blue
  accent: '#FFBC82',    // Salmon Accent
  colors: ['#011E38', '#264FEC', '#FFBC82', '#059669', '#8B5CF6', '#EC4899', '#F59E0B']
};

export const ChartEditorDrawer: React.FC<ChartEditorDrawerProps> = ({
  sheetData,
  chartConfig,
  onSaveChart,
  onClose
}) => {
  const headers = sheetData ? sheetData.headers : [];

  // Short 5 Core Fields State
  const [title, setTitle] = useState<string>(chartConfig.title || 'Faturamento por Categoria');
  const [metricHeader, setMetricHeader] = useState<string>(chartConfig.metricHeader || headers[1] || 'Vendas');
  const [dimensionHeader, setDimensionHeader] = useState<string>(chartConfig.dimensionHeader || headers[0] || 'Loja');
  const [timeGrouping, setTimeGrouping] = useState<'day' | 'week' | 'month' | 'quarter'>(chartConfig.timeGrouping || 'month');
  const [chartType, setChartType] = useState<ChartType>(chartConfig.chartType || 'horizontalBar');

  // Advanced Collapsible Options State
  const [showAdvancedOptions, setShowAdvancedOptions] = useState<boolean>(false);
  const [aggregation, setAggregation] = useState<MetricAggregation>(chartConfig.aggregation || 'sum');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc' | 'alpha' | 'chrono'>(chartConfig.sortOrder || 'desc');
  const [limitTopN, setLimitTopN] = useState<number>(chartConfig.limitTopN ?? 7);
  const [compareWithTarget, setCompareWithTarget] = useState<boolean>(chartConfig.compareWithTarget || false);
  const [compareWithPrevious, setCompareWithPrevious] = useState<boolean>(chartConfig.compareWithPrevious || false);
  const [showValues, setShowValues] = useState<boolean>(chartConfig.showValues ?? true);
  const [showLegend, setShowLegend] = useState<boolean>(chartConfig.showLegend ?? true);
  const [showAxes, setShowAxes] = useState<boolean>(chartConfig.showAxes ?? true);
  const [showGridlines, setShowGridlines] = useState<boolean>(chartConfig.showGridlines ?? true);
  const [numberFormat, setNumberFormat] = useState<'currency' | 'number' | 'percent'>(chartConfig.numberFormat || 'currency');
  const [decimalPlaces, setDecimalPlaces] = useState<number>(chartConfig.decimalPlaces ?? 2);

  // Appearance Colors (Boticário Defaults)
  const [primaryColor, setPrimaryColor] = useState<string>(chartConfig.primaryColor || '#011E38');
  const [secondaryColor, setSecondaryColor] = useState<string>(chartConfig.secondaryColor || '#264FEC');
  const [accentColor, setAccentColor] = useState<string>(chartConfig.accentColor || '#FFBC82');
  const [cardBgColor, setCardBgColor] = useState<string>(chartConfig.cardBgColor || '#F5F1EB');
  const [fontFamily, setFontFamily] = useState<string>(chartConfig.fontFamily || 'IBM Plex Sans');
  const [categoryColorsMap, setCategoryColorsMap] = useState<Record<string, string>>(chartConfig.categoryColorsMap || {});

  // Destination Checkboxes
  const [showInDashboard, setShowInDashboard] = useState<boolean>(chartConfig.showInDashboard ?? true);
  const [showInPresentation, setShowInPresentation] = useState<boolean>(chartConfig.showInPresentation ?? true);

  // Compute live dataset from sheetData
  const previewData = useMemo(() => {
    if (!sheetData || !dimensionHeader) return [];

    const map = new Map<string, { total: number; count: number; set: Set<any> }>();

    sheetData.rows.forEach(r => {
      let dimVal = String(r[dimensionHeader] ?? 'Outros').trim() || 'Outros';

      // Handle time grouping if date column
      if (timeGrouping && (dimensionHeader.toLowerCase().includes('data') || dimensionHeader.toLowerCase().includes('date'))) {
        const rawDate = String(r[dimensionHeader] || '');
        if (rawDate) {
          const parsedDate = new Date(rawDate);
          if (!isNaN(parsedDate.getTime())) {
            if (timeGrouping === 'month') {
              dimVal = `${parsedDate.getFullYear()}-${String(parsedDate.getMonth() + 1).padStart(2, '0')}`;
            } else if (timeGrouping === 'quarter') {
              const q = Math.ceil((parsedDate.getMonth() + 1) / 3);
              dimVal = `${parsedDate.getFullYear()}-Q${q}`;
            } else if (timeGrouping === 'week') {
              dimVal = `Semana ${Math.ceil(parsedDate.getDate() / 7)} (${String(parsedDate.getMonth() + 1).padStart(2, '0')}/${parsedDate.getFullYear()})`;
            }
          }
        }
      }

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
    if (sortOrder === 'chrono') list.sort((a, b) => a.label.localeCompare(b.label));

    return limitTopN > 0 ? list.slice(0, limitTopN) : list;
  }, [sheetData, dimensionHeader, metricHeader, aggregation, sortOrder, limitTopN, categoryColorsMap, timeGrouping]);

  const omittedCount = useMemo(() => {
    if (!sheetData || limitTopN === 0) return 0;
    const totalSet = new Set(sheetData.rows.map(r => String(r[dimensionHeader] || '')));
    return Math.max(0, totalSet.size - limitTopN);
  }, [sheetData, dimensionHeader, limitTopN]);

  const handleResetToBoticario = () => {
    setPrimaryColor('#011E38');
    setSecondaryColor('#264FEC');
    setAccentColor('#FFBC82');
    setCardBgColor('#F5F1EB');
    setFontFamily('IBM Plex Sans');
    setCategoryColorsMap({});
  };

  const handleApply = (duplicate: boolean = false) => {
    if (!title.trim()) return;

    const updated: CustomChartConfig = {
      ...chartConfig,
      id: duplicate ? `chart_${Date.now()}` : chartConfig.id,
      title: title.trim(),
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
      timeGrouping,
      showValues,
      showAxes,
      showGridlines,
      showLegend,
      numberFormat,
      decimalPlaces,
      primaryColor,
      secondaryColor,
      accentColor,
      cardBgColor,
      fontFamily,
      categoryColorsMap
    };

    onSaveChart(updated, duplicate);
    onClose();
  };

  const formatValDisplay = (val: number) => {
    if (numberFormat === 'currency') return formatBRCurrency(val);
    if (numberFormat === 'percent') return `${val.toFixed(decimalPlaces)}%`;
    return val.toFixed(decimalPlaces);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex justify-end transition-all animate-fade-in">
      <div className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col overflow-hidden border-l border-slate-200">
        
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-emerald-600 text-white font-bold">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Editar Gráfico & Parâmetros Visuais</h2>
              <p className="text-xs text-slate-400">Configure métricas, agrupamento, tipo visual e aparência institucionais.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Form */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          
          {/* 5 SHORT MAIN FIELDS SECTION */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Database className="w-4 h-4 text-emerald-600" />
              Configuração Principal do Gráfico
            </h3>

            {/* 1. Title */}
            <div className="space-y-1">
              <label className="block font-bold text-slate-800">1. Título do Gráfico</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-bold text-slate-900 text-xs focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* 2. Metric */}
            <div className="space-y-1">
              <label className="block font-bold text-slate-800">2. Métrica a Analisar (Qual valor calcular)</label>
              <select
                value={metricHeader}
                onChange={(e) => setMetricHeader(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-medium text-slate-900 text-xs"
              >
                {headers.map(h => (
                  <option key={h} value={h}>Métrica: {h}</option>
                ))}
              </select>
            </div>

            {/* 3. Grouping */}
            <div className="space-y-1">
              <label className="block font-bold text-slate-800">3. Agrupar por (Dimensão de comparação)</label>
              <select
                value={dimensionHeader}
                onChange={(e) => setDimensionHeader(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-medium text-slate-900 text-xs"
              >
                {headers.map(h => (
                  <option key={h} value={h}>Agrupar por: {h}</option>
                ))}
              </select>
            </div>

            {/* Date grouping option if date column */}
            {(dimensionHeader.toLowerCase().includes('data') || dimensionHeader.toLowerCase().includes('date')) && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <label className="block font-bold text-slate-800 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  Agrupamento de Período Temporal
                </label>
                <select
                  value={timeGrouping}
                  onChange={(e) => setTimeGrouping(e.target.value as any)}
                  className="w-full bg-white border border-slate-300 text-slate-800 text-xs rounded-lg px-2.5 py-1.5 font-medium"
                >
                  <option value="day">Por Dia (Visão diária)</option>
                  <option value="week">Por Semana (Semanas do ano)</option>
                  <option value="month">Por Mês (Visão mensal consolidada)</option>
                  <option value="quarter">Por Trimestre (Q1, Q2, Q3, Q4)</option>
                </select>
                <span className="text-[10px] text-slate-500 block">Mantém estritamente a ordem cronológica dos dados.</span>
              </div>
            )}

            {/* 4. Chart Type Visual Grid */}
            <div className="space-y-2 pt-1">
              <label className="block font-bold text-slate-800">4. Tipo de Gráfico (Modelo Visual)</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                
                <button
                  type="button"
                  onClick={() => setChartType('horizontalBar')}
                  className={`p-2.5 rounded-xl border text-left flex items-center space-x-2 transition-all ${
                    chartType === 'horizontalBar' 
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold ring-1 ring-emerald-500' 
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 rotate-90 text-emerald-600 shrink-0" />
                  <span className="text-xs">Barras Horizontais</span>
                </button>

                <button
                  type="button"
                  onClick={() => setChartType('bar')}
                  className={`p-2.5 rounded-xl border text-left flex items-center space-x-2 transition-all ${
                    chartType === 'bar' 
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold ring-1 ring-emerald-500' 
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-xs">Colunas Verticais</span>
                </button>

                <button
                  type="button"
                  onClick={() => setChartType('line')}
                  className={`p-2.5 rounded-xl border text-left flex items-center space-x-2 transition-all ${
                    chartType === 'line' 
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold ring-1 ring-emerald-500' 
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <LineChart className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-xs">Linhas Temporais</span>
                </button>

                <button
                  type="button"
                  onClick={() => setChartType('donut')}
                  className={`p-2.5 rounded-xl border text-left flex items-center space-x-2 transition-all ${
                    chartType === 'donut' || chartType === 'pie' 
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold ring-1 ring-emerald-500' 
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <PieChart className="w-4 h-4 text-rose-600 shrink-0" />
                  <span className="text-xs">Rosca / Pizza</span>
                </button>

                <button
                  type="button"
                  onClick={() => setChartType('pareto')}
                  className={`p-2.5 rounded-xl border text-left flex items-center space-x-2 transition-all ${
                    chartType === 'pareto' 
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold ring-1 ring-emerald-500' 
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
                  <span className="text-xs">Pareto (Curva ABC)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setChartType('scatter')}
                  className={`p-2.5 rounded-xl border text-left flex items-center space-x-2 transition-all ${
                    chartType === 'scatter' 
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold ring-1 ring-emerald-500' 
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="text-xs">Dispersão (X × Y)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setChartType('target_realized')}
                  className={`p-2.5 rounded-xl border text-left flex items-center space-x-2 transition-all ${
                    chartType === 'target_realized' 
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold ring-1 ring-emerald-500' 
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span className="text-xs">Realizado vs Meta</span>
                </button>

                <button
                  type="button"
                  onClick={() => setChartType('heatmap')}
                  className={`p-2.5 rounded-xl border text-left flex items-center space-x-2 transition-all ${
                    chartType === 'heatmap' 
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold ring-1 ring-emerald-500' 
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-xs">Mapa de Calor</span>
                </button>

                <button
                  type="button"
                  onClick={() => setChartType('table_conditional')}
                  className={`p-2.5 rounded-xl border text-left flex items-center space-x-2 transition-all ${
                    chartType === 'table_conditional' || chartType === 'table' 
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold ring-1 ring-emerald-500' 
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <Table className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="text-xs">Tabela Condicional</span>
                </button>

              </div>
            </div>
          </div>

          {/* COLLAPSIBLE ADVANCED OPTIONS ("Mais Opções") */}
          <div className="border-t border-slate-200 pt-4 space-y-4">
            <button
              type="button"
              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
              className="flex items-center justify-between w-full text-xs font-bold text-slate-800 bg-slate-50 hover:bg-slate-100 p-3 rounded-xl border border-slate-200 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-slate-600" />
                <span>Mais Opções Avançadas (Agregação, Top N, Formatação, Cores)</span>
              </div>
              {showAdvancedOptions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showAdvancedOptions && (
              <div className="space-y-4 p-4 bg-slate-50/70 border border-slate-200 rounded-xl animate-fade-in">
                
                {/* Aggregation & Sorting */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700">Agregação de Dados</label>
                    <select
                      value={aggregation}
                      onChange={(e) => setAggregation(e.target.value as MetricAggregation)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5"
                    >
                      <option value="sum">Soma (Faturamento / Volume Total)</option>
                      <option value="avg">Média (Não Ponderada)</option>
                      <option value="count">Contagem de Registros</option>
                      <option value="count_distinct">Contagem Distinta (IDs Únicos)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700">Ordenação dos Dados</label>
                    <select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value as any)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5"
                    >
                      <option value="desc">Maior para Menor (Decrescente)</option>
                      <option value="asc">Menor para Maior (Crescente)</option>
                      <option value="alpha">Ordem Alfabética</option>
                      <option value="chrono">Ordem Cronológica (Datas)</option>
                    </select>
                  </div>
                </div>

                {/* Top N & Format */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700">Limite Top N</label>
                    <select
                      value={limitTopN}
                      onChange={(e) => setLimitTopN(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5"
                    >
                      <option value={5}>Top 5 Categorias</option>
                      <option value={7}>Top 7 Categorias</option>
                      <option value={10}>Top 10 Categorias</option>
                      <option value={0}>Todas as Categorias</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700">Formato Numérico</label>
                    <select
                      value={numberFormat}
                      onChange={(e) => setNumberFormat(e.target.value as any)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5"
                    >
                      <option value="currency">Moeda (R$)</option>
                      <option value="number">Número Relativo</option>
                      <option value="percent">Percentual (%)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700">Casas Decimais</label>
                    <select
                      value={decimalPlaces}
                      onChange={(e) => setDecimalPlaces(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5"
                    >
                      <option value={0}>0 (Sem decimais)</option>
                      <option value={1}>1 casa decimal</option>
                      <option value={2}>2 casas decimais</option>
                    </select>
                  </div>
                </div>

                {omittedCount > 0 && (
                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-[11px] font-medium flex items-center justify-between">
                    <span>⚠️ Omitindo {omittedCount} categorias menores para preservar a legibilidade.</span>
                  </div>
                )}

                {/* Display Checkboxes */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 font-semibold text-slate-800">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" checked={showValues} onChange={(e) => setShowValues(e.target.checked)} className="w-4 h-4 text-emerald-600 rounded" />
                    <span>Exibir Rótulos nos Pontos</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" checked={showLegend} onChange={(e) => setShowLegend(e.target.checked)} className="w-4 h-4 text-emerald-600 rounded" />
                    <span>Exibir Legenda</span>
                  </label>
                </div>

                {/* Boticário Visual Customization */}
                <div className="border-t border-slate-200 pt-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Palette className="w-4 h-4 text-emerald-600" />
                      Cores e Identidade Visual (Padrão Boticário)
                    </span>
                    <button
                      type="button"
                      onClick={handleResetToBoticario}
                      className="text-[11px] font-bold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 px-2.5 py-1 rounded-lg flex items-center space-x-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Restaurar Padrão</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-700">Texto Base</label>
                      <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-full h-7 rounded border cursor-pointer" />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-700">Azul Acento</label>
                      <input type="color" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} className="w-full h-7 rounded border cursor-pointer" />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-700">Salmão Destaque</label>
                      <input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="w-full h-7 rounded border cursor-pointer" />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-700">Fundo Card</label>
                      <input type="color" value={cardBgColor} onChange={(e) => setCardBgColor(e.target.value)} className="w-full h-7 rounded border cursor-pointer" />
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* LIVE CANVAS PREVIEW CARD */}
          <div className="p-4 rounded-xl space-y-2 border transition-all" style={{ backgroundColor: cardBgColor, borderColor: `${secondaryColor}40` }}>
            <div className="flex items-center justify-between font-bold" style={{ color: primaryColor }}>
              <span>{title}</span>
              <span className="text-[10px] opacity-75 font-mono">{fontFamily}</span>
            </div>

            <div className="h-48 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'line' ? (
                  <ReLineChart data={previewData}>
                    {showGridlines && <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />}
                    <XAxis dataKey="label" fontSize={9} />
                    <YAxis fontSize={9} />
                    <Tooltip formatter={(v: any) => [formatValDisplay(Number(v)), metricHeader]} />
                    <Line type="monotone" dataKey="value" stroke={secondaryColor} strokeWidth={2} dot={{ r: 4 }} />
                  </ReLineChart>
                ) : chartType === 'horizontalBar' ? (
                  <BarChart data={previewData} layout="vertical">
                    {showGridlines && <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />}
                    <XAxis type="number" fontSize={9} />
                    <YAxis type="category" dataKey="label" fontSize={9} width={90} />
                    <Tooltip formatter={(v: any) => [formatValDisplay(Number(v)), metricHeader]} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {previewData.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color || primaryColor} />
                      ))}
                    </Bar>
                  </BarChart>
                ) : chartType === 'pie' ? (
                  <RePieChart>
                    <Pie data={previewData} dataKey="value" nameKey="label" innerRadius={35} outerRadius={65} paddingAngle={3}>
                      {previewData.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color || BOTICARIO_PALETTE.colors[idx % BOTICARIO_PALETTE.colors.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: any) => [formatValDisplay(Number(v)), metricHeader]} />
                    {showLegend && <Legend wrapperStyle={{ fontSize: '9px' }} />}
                  </RePieChart>
                ) : chartType === 'table' ? (
                  <div className="overflow-auto max-h-40 text-xs">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b bg-slate-100/50 text-slate-800">
                          <th className="p-1 font-bold">{dimensionHeader}</th>
                          <th className="p-1 font-bold text-right">{metricHeader}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {previewData.map((row, idx) => (
                          <tr key={idx} className="border-b border-slate-100">
                            <td className="p-1 flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: row.color }} />
                              <span>{row.label}</span>
                            </td>
                            <td className="p-1 text-right font-mono font-bold" style={{ color: primaryColor }}>
                              {formatValDisplay(row.value)}
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
                    <Tooltip formatter={(v: any) => [formatValDisplay(Number(v)), metricHeader]} />
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

        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-3 text-slate-700 font-semibold">
            <label className="flex items-center space-x-1.5 cursor-pointer">
              <input type="checkbox" checked={showInDashboard} onChange={(e) => setShowInDashboard(e.target.checked)} className="w-4 h-4 text-emerald-600 rounded" />
              <span>Dashboard</span>
            </label>
            <label className="flex items-center space-x-1.5 cursor-pointer">
              <input type="checkbox" checked={showInPresentation} onChange={(e) => setShowInPresentation(e.target.checked)} className="w-4 h-4 text-emerald-600 rounded" />
              <span>Apresentação</span>
            </label>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => handleApply(true)}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl flex items-center space-x-1.5 shadow-sm"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Duplicar</span>
            </button>

            <button
              onClick={() => handleApply(false)}
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md transition-all flex-1 sm:flex-initial"
            >
              <span>Aplicar alterações</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
