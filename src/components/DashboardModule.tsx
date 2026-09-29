import React, { useState, useRef } from 'react';
import { 
  TrendingUp, 
  Target, 
  ShoppingBag, 
  Percent, 
  Store, 
  Award, 
  AlertCircle,
  BarChart3,
  Sliders,
  Plus,
  Copy,
  Download,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  Info,
  ChevronUp,
  ChevronDown,
  Trash2,
  CopyPlus,
  CheckSquare,
  Square,
  Sparkles
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  BarChart, 
  Bar, 
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { 
  CategoryPerformance, 
  ColumnMapping, 
  CustomChartConfig,
  KPICalculation, 
  ProductPerformance, 
  SheetData, 
  StorePerformance, 
  TimepointSales 
} from '../types/analytics';
import { formatBRCurrency, formatBRNumber } from '../services/dataParser';
import { copyChartToClipboard, downloadChartAsPNG } from '../services/chartImageExporter';
import { DynamicChartRenderer, formatAxisTickValue } from './DynamicChartRenderer';

interface DashboardModuleProps {
  kpis: KPICalculation;
  stores: StorePerformance[];
  categories: CategoryPerformance[];
  products: ProductPerformance[];
  timeline: TimepointSales[];
  dateRangeText: string;
  sheetData: SheetData | null;
  mapping: ColumnMapping;
  customCharts?: CustomChartConfig[];
  onOpenChartConfigurator?: (chart?: CustomChartConfig) => void;
  onOpenAnalysisCatalog?: () => void;
  onDuplicateChart?: (chart: CustomChartConfig) => void;
  onDeleteChart?: (id: string) => void;
  onReorderChart?: (id: string, direction: 'up' | 'down') => void;
  onTogglePresentationChart?: (id: string) => void;
}

const BRAND_COLORS = ['#011E38', '#264FEC', '#FFBC82', '#059669', '#6366f1', '#8b5cf6', '#ec4899'];

export const DashboardModule: React.FC<DashboardModuleProps> = ({
  kpis,
  stores,
  categories,
  products,
  timeline,
  dateRangeText,
  sheetData,
  mapping,
  customCharts = [],
  onOpenChartConfigurator,
  onOpenAnalysisCatalog,
  onDuplicateChart,
  onDeleteChart,
  onReorderChart,
  onTogglePresentationChart
}) => {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'warning' | 'error' } | null>(null);

  const timelineCardRef = useRef<HTMLDivElement>(null);
  const storeCardRef = useRef<HTMLDivElement>(null);
  const categoryCardRef = useRef<HTMLDivElement>(null);
  const customChartRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const triggerToast = (message: string, type: 'success' | 'warning' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4500);
  };

  const handleCopyChart = async (ref: React.RefObject<HTMLDivElement | null> | HTMLDivElement | null, title: string, unitText: string = 'R$') => {
    const targetElem = ref && 'current' in ref ? ref.current : ref;
    if (!targetElem) return;
    const res = await copyChartToClipboard(targetElem, title, {
      periodText: dateRangeText,
      unitText,
      activeFiltersText: 'Filtros padrão do dashboard'
    });

    if (res.success) {
      triggerToast('Gráfico copiado para a área de transferência com sucesso!', 'success');
    } else {
      triggerToast(res.message, 'warning');
      if (res.blob && targetElem) {
        await downloadChartAsPNG(targetElem, title, {
          periodText: dateRangeText,
          unitText,
          activeFiltersText: 'Filtros padrão do dashboard'
        });
      }
    }
  };

  const handleDownloadChart = async (ref: React.RefObject<HTMLDivElement | null> | HTMLDivElement | null, title: string, unitText: string = 'R$') => {
    const targetElem = ref && 'current' in ref ? ref.current : ref;
    if (!targetElem) return;
    try {
      await downloadChartAsPNG(targetElem, title, {
        periodText: dateRangeText,
        unitText,
        activeFiltersText: 'Filtros padrão do dashboard'
      });
      triggerToast('Download do PNG efetuado com sucesso!', 'success');
    } catch (err: any) {
      triggerToast(`Erro ao exportar PNG: ${err?.message || 'Falha.'}`, 'error');
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in pb-12 relative max-w-7xl mx-auto">

      {/* Floating Toast Notification */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 p-4 rounded-xl shadow-2xl border flex items-center space-x-3 text-xs max-w-md animate-fade-in ${
          toast.type === 'success'
            ? 'bg-emerald-900 text-emerald-100 border-emerald-700'
            : toast.type === 'warning'
            ? 'bg-amber-900 text-amber-100 border-amber-700'
            : 'bg-rose-900 text-rose-100 border-rose-700'
        }`}>
          {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
          {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />}
          {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
          <span className="font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Action Header: Adicionar Análise */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-slate-900 text-white rounded-2xl shadow-lg border border-slate-800">
        <div>
          <h2 className="text-base sm:text-lg font-bold flex items-center gap-2 text-white">
            <BarChart3 className="w-5 h-5 text-emerald-400 shrink-0" />
            Painel Executivo de Analytics
          </h2>
          <p className="text-xs text-slate-300">
            {customCharts.length} análises ativas | Período: {dateRangeText}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {onOpenAnalysisCatalog && (
            <button
              onClick={onOpenAnalysisCatalog}
              className="px-4 py-2 text-xs font-bold text-slate-900 bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-md transition-all flex items-center space-x-2"
            >
              <Plus className="w-4 h-4 text-slate-950" />
              <span>Adicionar Análise</span>
            </button>
          )}

          {onOpenChartConfigurator && (
            <button
              onClick={() => onOpenChartConfigurator()}
              className="px-3.5 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all flex items-center space-x-1.5"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Criar Gráfico Livre</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* KPI 1: Vendas Totais */}
        <div className="executive-card p-4 sm:p-5 border-l-4 border-l-emerald-600">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Vendas Totais</span>
            <div className="p-1.5 sm:p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <span className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {formatBRCurrency(kpis.totalSales)}
            </span>
            <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
              <span>{kpis.recordCount} registros na base</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Atingimento de Metas */}
        <div className="executive-card p-4 sm:p-5 border-l-4 border-l-purple-600">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Meta & Atingimento</span>
            <div className="p-1.5 sm:p-2 rounded-lg bg-purple-50 text-purple-600">
              <Target className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            {kpis.hasTargetData ? (
              <>
                <span className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  {kpis.targetAchievementPct !== null ? `${kpis.targetAchievementPct.toFixed(1)}%` : 'N/A'}
                </span>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Meta mensal: <strong>{formatBRCurrency(kpis.totalTarget)}</strong>
                </div>
              </>
            ) : (
              <span className="text-xs text-slate-400 italic">Sem coluna de meta</span>
            )}
          </div>
        </div>

        {/* KPI 3: Ticket Médio */}
        <div className="executive-card p-4 sm:p-5 border-l-4 border-l-blue-600">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Ticket Médio</span>
            <div className="p-1.5 sm:p-2 rounded-lg bg-blue-50 text-blue-600">
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            {kpis.hasTicketData ? (
              <>
                <span className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  {kpis.ticketMedio !== null ? formatBRCurrency(kpis.ticketMedio) : 'N/A'}
                </span>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {mapping.transactionCol ? `${kpis.totalTransactions} cupons distintos` : `${kpis.totalTransactions} linhas de venda`}
                </div>
              </>
            ) : (
              <span className="text-xs text-slate-400 italic">Sem dados de ticket</span>
            )}
          </div>
        </div>

        {/* KPI 4: Margem Consolidada */}
        <div className="executive-card p-4 sm:p-5 border-l-4 border-l-amber-600">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Margem Consolidada</span>
            <div className="p-1.5 sm:p-2 rounded-lg bg-amber-50 text-amber-600">
              <Percent className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            {kpis.hasMarginData ? (
              <>
                <span className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  {kpis.grossMarginPct !== null ? `${kpis.grossMarginPct.toFixed(1)}%` : 'N/A'}
                </span>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Lucro Bruto: <strong>{formatBRCurrency(kpis.totalProfit || 0)}</strong>
                </div>
              </>
            ) : (
              <span className="text-xs text-slate-400 italic">Sem coluna de custo</span>
            )}
          </div>
        </div>

      </div>

      {/* Main Standard Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        
        {/* Timeline Sales Evolution Chart */}
        <div ref={timelineCardRef} className="executive-card p-4 sm:p-6 lg:col-span-2 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-2.5 gap-2">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600 shrink-0" />
                Vendas por dia (Evolução Temporal)
              </h3>
              <p className="text-[11px] text-slate-500">Tendência de faturamento ({dateRangeText})</p>
            </div>
            
            {/* Chart Action Buttons */}
            <div className="flex items-center space-x-1 sm:space-x-1.5 flex-wrap gap-y-1">
              <button
                onClick={() => handleCopyChart(timelineCardRef, 'Vendas por dia (Evolução Temporal)')}
                className="px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:text-emerald-800 bg-slate-100 hover:bg-emerald-50 border border-slate-200 rounded-lg flex items-center space-x-1 transition-all"
                title="Copiar imagem do gráfico"
              >
                <Copy className="w-3.5 h-3.5 text-emerald-600" />
                <span>Copiar gráfico</span>
              </button>

              <button
                onClick={() => handleDownloadChart(timelineCardRef, 'Vendas por dia (Evolução Temporal)')}
                className="px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:text-emerald-800 bg-slate-100 hover:bg-emerald-50 border border-slate-200 rounded-lg flex items-center space-x-1 transition-all"
                title="Baixar PNG"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span>Baixar PNG</span>
              </button>

              {onOpenChartConfigurator && (
                <button
                  onClick={() => onOpenChartConfigurator()}
                  className="px-2.5 py-1 text-[11px] font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg flex items-center space-x-1 transition-all shadow-xs"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Editar</span>
                </button>
              )}
            </div>
          </div>

          {timeline.length > 0 ? (
            <div className="h-60 sm:h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeline} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="displayDate" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickFormatter={formatAxisTickValue} tickLine={false} />
                  <Tooltip 
                    formatter={(value: any) => [formatBRCurrency(Number(value)), 'Vendas']}
                    labelFormatter={(label) => `Data: ${label}`}
                  />
                  <Line type="linear" dataKey="sales" name="Vendas (R$)" stroke="#059669" strokeWidth={2.5} dot={{ r: 4, fill: '#059669' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-56 flex flex-col items-center justify-center text-slate-400 text-xs text-center p-4">
              <AlertCircle className="w-7 h-7 mb-2 stroke-1 text-slate-400" />
              <span>Sem coluna de data mapeada para gerar gráfico de evolução.</span>
            </div>
          )}
        </div>

        {/* Store Ranking Bar Chart */}
        <div ref={storeCardRef} className="executive-card p-4 sm:p-6 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-2.5 gap-2">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <Store className="w-4 h-4 text-emerald-600 shrink-0" />
                Ranking de Lojas
              </h3>
              <p className="text-[11px] text-slate-500">Faturamento total por unidade</p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-1 sm:space-x-1.5 flex-wrap gap-y-1">
              <button
                onClick={() => handleCopyChart(storeCardRef, 'Ranking de Lojas')}
                className="px-2 py-1 text-[10px] font-bold text-slate-700 hover:text-emerald-800 bg-slate-100 hover:bg-emerald-50 border border-slate-200 rounded-lg flex items-center space-x-1 transition-all"
              >
                <Copy className="w-3 h-3 text-emerald-600" />
                <span>Copiar</span>
              </button>

              <button
                onClick={() => handleDownloadChart(storeCardRef, 'Ranking de Lojas')}
                className="px-2 py-1 text-[10px] font-bold text-slate-700 hover:text-emerald-800 bg-slate-100 hover:bg-emerald-50 border border-slate-200 rounded-lg flex items-center space-x-1 transition-all"
              >
                <Download className="w-3 h-3 text-emerald-600" />
                <span>PNG</span>
              </button>
            </div>
          </div>

          {stores.length > 0 ? (
            <div className="h-60 sm:h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stores.slice(0, 7)} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" stroke="#64748b" fontSize={9} tickFormatter={formatAxisTickValue} />
                  <YAxis type="category" dataKey="store" stroke="#334155" fontSize={10} width={95} tick={{ fontSize: 9 }} />
                  <Tooltip formatter={(value: any) => [formatBRCurrency(Number(value)), 'Vendas']} />
                  <Bar dataKey="totalSales" radius={[0, 4, 4, 0]}>
                    {stores.slice(0, 7).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={BRAND_COLORS[index % BRAND_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-56 flex flex-col items-center justify-center text-slate-400 text-xs text-center p-4">
              <AlertCircle className="w-7 h-7 mb-2 stroke-1 text-slate-400" />
              <span>Nenhuma coluna de loja mapeada.</span>
            </div>
          )}
        </div>

      </div>

      {/* Target Achievement per Store Cards */}
      {stores.length > 0 && kpis.hasTargetData && (
        <div className="executive-card p-4 sm:p-6 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-purple-600 shrink-0" />
                Desempenho de Metas por Loja
              </h3>
              <p className="text-[11px] text-slate-500">Atingimento da meta mensal por filial (deduplicada por loja/período)</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
            {stores.map(store => {
              const ach = store.achievementPct || 0;
              const isOk = ach >= 100;
              const isWarning = ach >= 80 && ach < 100;

              return (
                <div key={store.store} className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-xs sm:text-sm text-slate-800 truncate">{store.store}</span>
                    <span className={`text-[10px] sm:text-xs font-extrabold px-2 py-0.5 rounded-full shrink-0 ${
                      isOk 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : isWarning 
                        ? 'bg-amber-100 text-amber-800' 
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {ach.toFixed(1)}%
                    </span>
                  </div>

                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        isOk ? 'bg-emerald-500' : isWarning ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.min(ach, 100)}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between text-[11px] text-slate-600 pt-0.5 flex-wrap gap-1">
                    <span>Realizado: <strong>{formatBRCurrency(store.totalSales)}</strong></span>
                    <span>Meta: <strong>{formatBRCurrency(store.target)}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DYNAMIC CUSTOM CHARTS LIST */}
      {customCharts.length > 0 && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <span>Análises Personalizadas Adicionadas</span>
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              {customCharts.length} gráfico(s) customizado(s)
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {customCharts.map((chart, idx) => (
              <div
                key={chart.id}
                ref={(el) => { customChartRefs.current[chart.id] = el; }}
                className="executive-card p-4 sm:p-6 space-y-3 border border-slate-200 hover:border-slate-300 transition-all shadow-xs"
              >
                {/* Header Toolbar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-2.5 gap-2">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm sm:text-base font-bold text-slate-900">{chart.title}</h4>
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                        {chart.chartType}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Métrica: {chart.metricHeader} | Dimensão: {chart.dimensionHeader}
                    </p>
                  </div>

                  {/* Actions Toolbar */}
                  <div className="flex items-center space-x-1 flex-wrap gap-y-1">
                    
                    {/* Copy Image */}
                    <button
                      onClick={() => handleCopyChart(customChartRefs.current[chart.id], chart.title)}
                      className="px-2 py-1 text-[10px] font-bold text-slate-700 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200 rounded-lg flex items-center space-x-1"
                      title="Copiar gráfico para a área de transferência"
                    >
                      <Copy className="w-3 h-3 text-emerald-600" />
                      <span>Copiar</span>
                    </button>

                    {/* Download PNG */}
                    <button
                      onClick={() => handleDownloadChart(customChartRefs.current[chart.id], chart.title)}
                      className="px-2 py-1 text-[10px] font-bold text-slate-700 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200 rounded-lg flex items-center space-x-1"
                      title="Baixar imagem PNG"
                    >
                      <Download className="w-3 h-3 text-emerald-600" />
                      <span>PNG</span>
                    </button>

                    {/* Edit */}
                    {onOpenChartConfigurator && (
                      <button
                        onClick={() => onOpenChartConfigurator(chart)}
                        className="px-2 py-1 text-[10px] font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg flex items-center space-x-1"
                        title="Editar gráfico"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Editar</span>
                      </button>
                    )}

                    {/* Duplicate */}
                    {onDuplicateChart && (
                      <button
                        onClick={() => onDuplicateChart(chart)}
                        className="p-1 text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg"
                        title="Duplicar este gráfico"
                      >
                        <CopyPlus className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Reorder Up / Down */}
                    {onReorderChart && (
                      <div className="flex items-center space-x-0.5 bg-slate-100 border border-slate-200 rounded-lg p-0.5">
                        <button
                          disabled={idx === 0}
                          onClick={() => onReorderChart(chart.id, 'up')}
                          className="p-0.5 text-slate-600 hover:text-slate-900 disabled:opacity-30"
                          title="Mover para cima"
                        >
                          <ChevronUp className="w-3 h-3" />
                        </button>
                        <button
                          disabled={idx === customCharts.length - 1}
                          onClick={() => onReorderChart(chart.id, 'down')}
                          className="p-0.5 text-slate-600 hover:text-slate-900 disabled:opacity-30"
                          title="Mover para baixo"
                        >
                          <ChevronDown className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    {/* Delete */}
                    {onDeleteChart && (
                      <button
                        onClick={() => {
                          if (confirm(`Deseja remover o gráfico "${chart.title}" do dashboard? Os dados da planilha não serão excluídos.`)) {
                            onDeleteChart(chart.id);
                          }
                        }}
                        className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg"
                        title="Remover gráfico"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Chart Content Container */}
                <DynamicChartRenderer
                  config={chart}
                  sheetData={sheetData}
                  mapping={mapping}
                  height={280}
                />

                {/* Footer Bar: Presentation Checkbox Toggle */}
                {onTogglePresentationChart && (
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <label className="flex items-center space-x-2 cursor-pointer text-slate-700 hover:text-slate-900 select-none">
                      <input
                        type="checkbox"
                        checked={chart.showInPresentation ?? true}
                        onChange={() => onTogglePresentationChart(chart.id)}
                        className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                      />
                      <span className="font-semibold text-[11px]">Incluir esta análise na apresentação gerada</span>
                    </label>

                    <span className="text-[10px] text-slate-400 font-mono">ID: {chart.id}</span>
                  </div>
                )}

              </div>
            ))}
          </div>
        </div>
      )}

      {/* Calculation Scope Footer */}
      <div className="p-3.5 sm:p-4 bg-slate-900 text-slate-300 rounded-xl text-[11px] sm:text-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-2.5 shadow-inner">
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong>Base de Cálculo:</strong> {kpis.recordCount} registros | Período: {dateRangeText} | Lojas: {kpis.storeCount}
          </span>
        </div>
        <span className="text-[10px] text-slate-400">
          Cálculos localmente processados via JS determinístico (pt-BR).
        </span>
      </div>

    </div>
  );
};
