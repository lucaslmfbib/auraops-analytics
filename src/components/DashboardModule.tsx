import React from 'react';
import { 
  TrendingUp, 
  Target, 
  ShoppingBag, 
  Percent, 
  Store, 
  Award, 
  AlertCircle,
  HelpCircle,
  CheckCircle,
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
  Cell,
  PieChart,
  Pie
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
    <div className="space-y-6 animate-fade-in pb-12">

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Vendas Totais */}
        <div className="executive-card p-5 border-l-4 border-l-emerald-600">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Vendas Totais</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {formatBRCurrency(kpis.totalSales)}
            </span>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <span>{kpis.recordCount} transações / registros</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Atingimento de Metas (Only if Target Mapped) */}
        <div className="executive-card p-5 border-l-4 border-l-purple-600">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Meta & Atingimento</span>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            {kpis.hasTargetData && kpis.targetAchievementPct !== null ? (
              <>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    {kpis.targetAchievementPct.toFixed(1)}%
                  </span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    kpis.targetAchievementPct >= 100 
                      ? 'bg-emerald-100 text-emerald-800'
                      : kpis.targetAchievementPct >= 85
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {kpis.targetAchievementPct >= 100 ? 'Meta Superada' : 'Abaixo da Meta'}
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Meta: {formatBRCurrency(kpis.totalTarget)}
                </div>
              </>
            ) : (
              <div className="py-1">
                <span className="text-sm font-semibold text-slate-400 italic">Meta não mapeada</span>
                <p className="text-[11px] text-slate-400 mt-0.5">Mapeie a coluna de metas na importação para habilitar.</p>
              </div>
            )}
          </div>
        </div>

        {/* KPI 3: Ticket Médio (Only if Transactions / Qty Mapped) */}
        <div className="executive-card p-5 border-l-4 border-l-blue-600">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ticket Médio</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            {kpis.hasTicketData && kpis.ticketMedio !== null ? (
              <>
                <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  {formatBRCurrency(kpis.ticketMedio)}
                </span>
                <div className="text-xs text-slate-500 mt-1">
                  Base: {formatBRNumber(kpis.totalTransactions)} cupons/pedidos
                </div>
              </>
            ) : (
              <div className="py-1">
                <span className="text-sm font-semibold text-slate-400 italic">Ticket Indisponível</span>
                <p className="text-[11px] text-slate-400 mt-0.5">Requer coluna de ID Transação ou cupons.</p>
              </div>
            )}
          </div>
        </div>

        {/* KPI 4: Margem Bruta (Only if Costs Mapped) */}
        <div className="executive-card p-5 border-l-4 border-l-indigo-600">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Margem Bruta</span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <Percent className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            {kpis.hasMarginData && kpis.grossMarginPct !== null ? (
              <>
                <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  {kpis.grossMarginPct.toFixed(1)}%
                </span>
                <div className="text-xs text-slate-500 mt-1">
                  Lucro Bruto: {formatBRCurrency(kpis.totalProfit || 0)}
                </div>
              </>
            ) : (
              <div className="py-1">
                <span className="text-sm font-semibold text-slate-400 italic">Margem Não Calculada</span>
                <p className="text-[11px] text-slate-400 mt-0.5">Requer informação de custos/CMV na planilha.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Timeline Sales Evolution Chart (2 columns width) */}
        <div className="executive-card p-6 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                Evolução Temporal das Vendas
              </h3>
              <p className="text-xs text-slate-500">Faturamento acumulado ao longo do período ({dateRangeText})</p>
            </div>
          </div>

          {timeline.length > 0 ? (
            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeline} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#059669" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="displayDate" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} tickFormatter={(val) => `R$ ${(val / 1000).toFixed(0)}k`} />
                  <Tooltip 
                    formatter={(value: any) => [formatBRCurrency(Number(value)), 'Vendas']}
                    labelFormatter={(label) => `Data: ${label}`}
                  />
                  <Area type="monotone" dataKey="sales" stroke="#059669" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs">
              <AlertCircle className="w-8 h-8 mb-2 stroke-1" />
              <span>Sem coluna de data mapeada para gerar linha do tempo.</span>
            </div>
          )}
        </div>

        {/* Store Ranking Bar Chart (1 column width) */}
        <div className="executive-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Store className="w-5 h-5 text-emerald-600" />
                Ranking de Lojas (Faturamento)
              </h3>
              <p className="text-xs text-slate-500">Total de vendas por unidade de loja</p>
            </div>
          </div>

          {stores.length > 0 ? (
            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stores.slice(0, 7)} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" stroke="#64748b" fontSize={10} tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="store" stroke="#334155" fontSize={11} width={110} tick={{ fontSize: 10 }} />
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
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs">
              <AlertCircle className="w-8 h-8 mb-2 stroke-1" />
              <span>Nenhuma coluna de loja mapeada.</span>
            </div>
          )}
        </div>

      </div>

      {/* Target Achievement per Store Cards Table */}
      {stores.length > 0 && kpis.hasTargetData && (
        <div className="executive-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-600" />
                Desempenho de Metas por Loja
              </h3>
              <p className="text-xs text-slate-500">Comparativo individual entre meta cadastrada e faturamento realizado</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {stores.map(store => {
              const ach = store.achievementPct || 0;
              const isOk = ach >= 100;
              const isWarning = ach >= 80 && ach < 100;

              return (
                <div key={store.store} className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-800 truncate">{store.store}</span>
                    <span className={`text-xs font-extrabold px-2 py-0.5 rounded-full ${
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

                  <div className="flex justify-between text-xs text-slate-600 pt-1">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Category Share */}
        {categories.length > 0 && (
          <div className="executive-card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Participação por Categoria</h3>
                <p className="text-xs text-slate-500">Distribuição percentual do faturamento por linha de produto</p>
              </div>
            </div>

            <div className="space-y-3">
              {categories.map((cat, idx) => (
                <div key={cat.category} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>{cat.category}</span>
                    <span>{formatBRCurrency(cat.totalSales)} ({cat.sharePct.toFixed(1)}%)</span>
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

        {/* Top 10 Products */}
        {products.length > 0 && (
          <div className="executive-card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Top 10 Produtos Mais Vendidos</h3>
                <p className="text-xs text-slate-500">Ranking por faturamento gerado no período</p>
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
                        <span className="bg-slate-100 text-slate-600 text-[11px] font-medium px-2 py-0.5 rounded">
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

      {/* Calculation Scope Footer / Transparency Badge */}
      <div className="p-4 bg-slate-900 text-slate-300 rounded-xl text-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-inner">
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong>Base de Cálculo:</strong> {kpis.recordCount} registros processados | Período: {dateRangeText} | Lojas ativas: {kpis.storeCount}
          </span>
        </div>
        <span className="text-[11px] text-slate-400">
          Cálculos executados localmente via Javascript determinístico (sem alucinações de IA).
        </span>
      </div>

    </div>
  );
};
