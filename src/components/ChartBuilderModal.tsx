import React, { useState } from 'react';
import { X, BarChart3, PieChart, LineChart, AreaChart, Table, Check, Sparkles } from 'lucide-react';
import { ChartType, CustomChartConfig, MetricAggregation, SheetData } from '../types/analytics';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  LineChart as ReLineChart, 
  Line, 
  AreaChart as ReAreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Cell 
} from 'recharts';
import { formatBRCurrency } from '../services/dataParser';

interface ChartBuilderModalProps {
  sheetData: SheetData | null;
  onSaveChart: (chartConfig: CustomChartConfig) => void;
  onClose: () => void;
}

const BRAND_COLORS = ['#059669', '#10b981', '#34d399', '#0284c7', '#6366f1', '#8b5cf6', '#ec4899'];

export const ChartBuilderModal: React.FC<ChartBuilderModalProps> = ({
  sheetData,
  onSaveChart,
  onClose
}) => {
  const headers = sheetData ? sheetData.headers : [];
  
  const [title, setTitle] = useState<string>('Faturamento por Loja');
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [dimensionHeader, setDimensionHeader] = useState<string>(headers[0] || 'Store');
  const [metricHeader, setMetricHeader] = useState<string>(headers[1] || 'Sales');
  const [aggregation, setAggregation] = useState<MetricAggregation>('sum');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc' | 'alpha'>('desc');
  const [limitTopN, setLimitTopN] = useState<number>(7);
  const [showInDashboard, setShowInDashboard] = useState<boolean>(true);
  const [showInPresentation, setShowInPresentation] = useState<boolean>(true);

  // Compute live preview series from sheetData rows
  const previewData = React.useMemo(() => {
    if (!sheetData || !dimensionHeader) return [];

    const map = new Map<string, { total: number; count: number; set: Set<any> }>();

    sheetData.rows.forEach(r => {
      const dimVal = String(r[dimensionHeader] ?? 'Outros').trim();
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

    const list: Array<{ label: string; value: number }> = [];

    map.forEach((val, label) => {
      let finalVal = val.total;
      if (aggregation === 'avg') finalVal = val.count > 0 ? val.total / val.count : 0;
      if (aggregation === 'count') finalVal = val.count;
      if (aggregation === 'count_distinct') finalVal = val.set.size;

      list.push({ label, value: finalVal });
    });

    // Sorting
    if (sortOrder === 'desc') list.sort((a, b) => b.value - a.value);
    if (sortOrder === 'asc') list.sort((a, b) => a.value - b.value);
    if (sortOrder === 'alpha') list.sort((a, b) => a.label.localeCompare(b.label));

    return limitTopN > 0 ? list.slice(0, limitTopN) : list;
  }, [sheetData, dimensionHeader, metricHeader, aggregation, sortOrder, limitTopN]);

  const handleSave = () => {
    if (!title) return;
    onSaveChart({
      id: `chart_${Date.now()}`,
      title,
      chartType,
      dimensionHeader,
      metricHeader,
      aggregation,
      sortOrder,
      limitTopN,
      showInDashboard,
      showInPresentation
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full p-6 space-y-5 animate-fade-in my-8">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Adicionar Gráfico Customizado</h2>
              <p className="text-xs text-slate-500">Configure a dimensão, métrica e agregação desejadas.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Config Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          
          {/* Title */}
          <div className="space-y-1 col-span-full">
            <label className="block font-bold text-slate-800">Título do Gráfico <span className="text-rose-500">*</span></label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Faturamento Médio por Categoria"
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Chart Type */}
          <div className="space-y-1">
            <label className="block font-bold text-slate-800">Tipo de Visualização</label>
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value as ChartType)}
              className="w-full bg-slate-50 border border-slate-300 text-slate-800 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="bar">Barras Verticais</option>
              <option value="horizontalBar">Barras Horizontais</option>
              <option value="line">Linhas</option>
              <option value="area">Área</option>
              <option value="pie">Pizza / Share %</option>
              <option value="table">Tabela Resumo</option>
            </select>
          </div>

          {/* Aggregation */}
          <div className="space-y-1">
            <label className="block font-bold text-slate-800">Tipo de Agregação</label>
            <select
              value={aggregation}
              onChange={(e) => setAggregation(e.target.value as MetricAggregation)}
              className="w-full bg-slate-50 border border-slate-300 text-slate-800 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="sum">Soma (Faturamento / Total)</option>
              <option value="avg">Média Ponderada</option>
              <option value="count">Contagem de Registros</option>
              <option value="count_distinct">Contagem Distinta (IDs únicos)</option>
            </select>
          </div>

          {/* Dimension Header */}
          <div className="space-y-1">
            <label className="block font-bold text-slate-800">Dimensão (Eixo X / Agrupador)</label>
            <select
              value={dimensionHeader}
              onChange={(e) => setDimensionHeader(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 text-slate-800 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500"
            >
              {headers.map(h => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>

          {/* Metric Header */}
          <div className="space-y-1">
            <label className="block font-bold text-slate-800">Métrica (Eixo Y / Valor)</label>
            <select
              value={metricHeader}
              onChange={(e) => setMetricHeader(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 text-slate-800 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500"
            >
              {headers.map(h => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>

          {/* Sorting */}
          <div className="space-y-1">
            <label className="block font-bold text-slate-800">Ordenação dos Dados</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-300 text-slate-800 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="desc">Maior para Menor (Decrescente)</option>
              <option value="asc">Menor para Maior (Crescente)</option>
              <option value="alpha">Alfabética</option>
            </select>
          </div>

          {/* Limit Top N */}
          <div className="space-y-1">
            <label className="block font-bold text-slate-800">Limite de Categorias</label>
            <select
              value={limitTopN}
              onChange={(e) => setLimitTopN(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-300 text-slate-800 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500"
            >
              <option value={5}>Top 5</option>
              <option value={7}>Top 7</option>
              <option value={10}>Top 10</option>
              <option value={0}>Todas as Categorias</option>
            </select>
          </div>

        </div>

        {/* Live Preview Canvas */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            Pré-visualização em Tempo Real
          </span>

          <div className="h-48 w-full bg-white rounded-lg border border-slate-200 p-2">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'line' ? (
                <ReLineChart data={previewData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="label" fontSize={9} />
                  <YAxis fontSize={9} />
                  <Tooltip formatter={(v: any) => [Number(v).toLocaleString('pt-BR'), metricHeader]} />
                  <Line type="monotone" dataKey="value" stroke="#059669" strokeWidth={2} />
                </ReLineChart>
              ) : chartType === 'area' ? (
                <ReAreaChart data={previewData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="label" fontSize={9} />
                  <YAxis fontSize={9} />
                  <Tooltip formatter={(v: any) => [Number(v).toLocaleString('pt-BR'), metricHeader]} />
                  <Area type="monotone" dataKey="value" stroke="#059669" fill="#059669" fillOpacity={0.2} />
                </ReAreaChart>
              ) : chartType === 'horizontalBar' ? (
                <BarChart data={previewData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" fontSize={9} />
                  <YAxis type="category" dataKey="label" fontSize={9} width={80} />
                  <Tooltip formatter={(v: any) => [Number(v).toLocaleString('pt-BR'), metricHeader]} />
                  <Bar dataKey="value" fill="#059669" radius={[0, 4, 4, 0]} />
                </BarChart>
              ) : (
                <BarChart data={previewData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="label" fontSize={9} />
                  <YAxis fontSize={9} />
                  <Tooltip formatter={(v: any) => [Number(v).toLocaleString('pt-BR'), metricHeader]} />
                  <Bar dataKey="value" fill="#059669" radius={[4, 4, 0, 0]}>
                    {previewData.map((_, idx) => (
                      <Cell key={idx} fill={BRAND_COLORS[idx % BRAND_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Checkboxes */}
        <div className="flex items-center space-x-6 text-xs text-slate-800 font-semibold bg-slate-50 p-3 rounded-lg border border-slate-200">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showInDashboard}
              onChange={(e) => setShowInDashboard(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
            />
            <span>Exibir no dashboard</span>
          </label>

          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showInPresentation}
              onChange={(e) => setShowInPresentation(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
            />
            <span>Incluir na apresentação</span>
          </label>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end space-x-3 border-t border-slate-100 pt-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-md transition-all flex items-center space-x-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Salvar Gráfico Customizado</span>
          </button>
        </div>

      </div>
    </div>
  );
};
