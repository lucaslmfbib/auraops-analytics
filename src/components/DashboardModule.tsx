import React from 'react';
import { 
  TrendingUp, 
  Target, 
  ShoppingBag, 
  Percent, 
  Store, 
  Award, 
  AlertCircle,
  BarChart3
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
  Cell
} from 'recharts';
import { 
  CategoryPerformance, 
  KPICalculation, 
  ProductPerformance, 
  StorePerformance, 
  TimepointSales 
} from '../types/analytics';
import { formatBRCurrency, formatBRNumber } from '../services/dataParser';

interface DashboardModuleProps {
  kpis: KPICalculation;
  stores: StorePerformance[];
  categories: CategoryPerformance[];
  products: ProductPerformance[];
  timeline: TimepointSales[];
  dateRangeText: string;
}

const BRAND_COLORS = ['#059669', '#10b981', '#34d399', '#0284c7', '#6366f1', '#8b5cf6', '#ec4899'];

export const DashboardModule: React.FC<DashboardModuleProps> = ({
  kpis,
  stores,
  categories,
  products,
  timeline,
  dateRangeText
}) => {
  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in pb-12">

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
              <span>{kpis.recordCount} registros</span>
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
            {kpis.hasTargetData && kpis.targetAchievementPct !== null ? (
              <>
                <div className="flex items-baseline justify-between gap-1 flex-wrap">
                  <span className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                    {kpis.targetAchievementPct.toFixed(1)}%
                  </span>
                  <span className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full ${
                    kpis.targetAchievementPct >= 100 
                      ? 'bg-emerald-100 text-emerald-800'
                      : kpis.targetAchievementPct >= 85
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {kpis.targetAchievementPct >= 100 ? 'Meta Superada' : 'Abaixo da Meta'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Meta: {formatBRCurrency(kpis.totalTarget)}
                </div>
              </>
            ) : (
              <div className="py-0.5">
                <span className="text-xs sm:text-sm font-semibold text-slate-400 italic">Meta não mapeada</span>
                <p className="text-[10px] text-slate-400 mt-0.5">Mapeie a coluna de metas na aba Dados.</p>
              </div>
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
            {kpis.hasTicketData && kpis.ticketMedio !== null ? (
              <>
                <span className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  {formatBRCurrency(kpis.ticketMedio)}
                </span>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Base: {formatBRNumber(kpis.totalTransactions)} pedidos/cupons
                </div>
              </>
            ) : (
              <div className="py-0.5">
                <span className="text-xs sm:text-sm font-semibold text-slate-400 italic">Ticket Indisponível</span>
                <p className="text-[10px] text-slate-400 mt-0.5">Requer coluna de ID Transação.</p>
              </div>
            )}
          </div>
        </div>

        {/* KPI 4: Margem Bruta */}
        <div className="executive-card p-4 sm:p-5 border-l-4 border-l-indigo-600">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Margem Bruta</span>
            <div className="p-1.5 sm:p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <Percent className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            {kpis.hasMarginData && kpis.grossMarginPct !== null ? (
              <>
                <span className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  {kpis.grossMarginPct.toFixed(1)}%
                </span>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Lucro Bruto: {formatBRCurrency(kpis.totalProfit || 0)}
                </div>
              </>
            ) : (
              <div className="py-0.5">
                <span className="text-xs sm:text-sm font-semibold text-slate-400 italic">Margem Não Calculada</span>
                <p className="text-[10px] text-slate-400 mt-0.5">Requer coluna de Custos/CMV.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        
        {/* Timeline Sales Evolution Chart */}
        <div className="executive-card p-4 sm:p-6 lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600 shrink-0" />
                Evolução Temporal das Vendas
              </h3>
              <p className="text-[11px] text-slate-500">Faturamento acumulado ({dateRangeText})</p>
            </div>
          </div>

          {timeline.length > 0 ? (
            <div className="h-60 sm:h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeline} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#059669" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="displayDate" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`} tickLine={false} />
                  <Tooltip 
                    formatter={(value: any) => [formatBRCurrency(Number(value)), 'Vendas']}
                    labelFormatter={(label) => `Data: ${label}`}
                  />
                  <Area type="monotone" dataKey="sales" stroke="#059669" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSales)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-56 flex flex-col items-center justify-center text-slate-400 text-xs text-center p-4">
              <AlertCircle className="w-7 h-7 mb-2 stroke-1 text-slate-400" />
              <span>Sem coluna de data mapeada para gerar gráfico de linha do tempo.</span>
            </div>
          )}
        </div>

        {/* Store Ranking Bar Chart */}
        <div className="executive-card p-4 sm:p-6 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <Store className="w-4 h-4 text-emerald-600 shrink-0" />
                Ranking de Lojas
              </h3>
              <p className="text-[11px] text-slate-500">Faturamento total por unidade</p>
            </div>
          </div>

          {stores.length > 0 ? (
            <div className="h-60 sm:h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stores.slice(0, 7)} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" stroke="#64748b" fontSize={9} tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`} />
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
              <p className="text-[11px] text-slate-500">Comparativo individual entre meta cadastrada e realizado</p>
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

                  {/* Progress Bar */}
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

      {/* Category Breakdown & Top Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        
        {/* Category Share */}
        {categories.length > 0 && (
          <div className="executive-card p-4 sm:p-6 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">Participação por Categoria</h3>
                <p className="text-[11px] text-slate-500">Distribuição percentual do faturamento</p>
              </div>
            </div>

            <div className="space-y-2.5 pt-1">
              {categories.map((cat, idx) => (
                <div key={cat.category} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-700 gap-2">
                    <span className="truncate">{cat.category}</span>
                    <span className="shrink-0">{formatBRCurrency(cat.totalSales)} ({cat.sharePct.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className="h-2 rounded-full" 
                      style={{ 
                        width: `${cat.sharePct}%`,
                        backgroundColor: BRAND_COLORS[idx % BRAND_COLORS.length]
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top 10 Products Table */}
        {products.length > 0 && (
          <div className="executive-card p-4 sm:p-6 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">Top 10 Produtos Mais Vendidos</h3>
                <p className="text-[11px] text-slate-500">Ranking por faturamento no período</p>
              </div>
            </div>

            <div className="custom-table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Produto / Item</th>
                    <th>Categoria</th>
                    <th>Vendas (R$)</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p, i) => (
                    <tr key={p.product}>
                      <td className="font-bold text-slate-400">{i + 1}</td>
                      <td className="font-medium text-slate-900">{p.product}</td>
                      <td>
                        <span className="bg-slate-100 text-slate-600 text-[10px] font-medium px-2 py-0.5 rounded">
                          {p.category}
                        </span>
                      </td>
                      <td className="font-bold text-emerald-700">{formatBRCurrency(p.totalSales)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* Calculation Scope Footer */}
      <div className="p-3.5 sm:p-4 bg-slate-900 text-slate-300 rounded-xl text-[11px] sm:text-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-2.5 shadow-inner">
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong>Base de Cálculo:</strong> {kpis.recordCount} registros | Período: {dateRangeText} | Lojas: {kpis.storeCount}
          </span>
        </div>
        <span className="text-[10px] text-slate-400">
          Cálculos localmente processados via JS determinístico.
        </span>
      </div>

    </div>
  );
};
