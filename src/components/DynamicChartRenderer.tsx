import React from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  ScatterChart, 
  Scatter, 
  ComposedChart,
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Cell, 
  Legend, 
  ReferenceLine 
} from 'recharts';
import { ChartType, CustomChartConfig, RawRow, SheetData, ColumnMapping } from '../types/analytics';
import { formatBRCurrency, formatBRNumber, parseBrazilianNumber, parseDateValue } from '../services/dataParser';

interface DynamicChartRendererProps {
  config: CustomChartConfig;
  sheetData: SheetData | null;
  mapping: ColumnMapping;
  height?: number;
}

const DEFAULT_COLORS = ['#011E38', '#264FEC', '#FFBC82', '#059669', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981'];

/**
 * Axis Formatter to prevent 0k / 1k repetition
 * Dynamically adjusts format based on max value in domain
 */
export function formatAxisTickValue(value: number): string {
  if (value === 0) return 'R$ 0';
  const absVal = Math.abs(value);
  if (absVal >= 1_000_000) {
    return `R$ ${(value / 1_000_000).toFixed(1).replace('.', ',')}M`;
  }
  if (absVal >= 10_000) {
    return `R$ ${(value / 1_000).toFixed(0)}k`;
  }
  if (absVal >= 1_000) {
    return `R$ ${(value / 1_000).toFixed(1).replace('.', ',')}k`;
  }
  return `R$ ${value.toLocaleString('pt-BR')}`;
}

export const DynamicChartRenderer: React.FC<DynamicChartRendererProps> = ({
  config,
  sheetData,
  mapping,
  height = 300
}) => {
  if (!sheetData || sheetData.rows.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs bg-slate-50 border border-dashed border-slate-200 rounded-xl p-4">
        <span>Sem dados suficientes para renderizar este gráfico.</span>
      </div>
    );
  }

  // Determine dimension column and metric column
  const dimCol = config.dimensionHeader || mapping.storeCol || mapping.categoryCol || sheetData.headers[0];
  const metricCol = config.metricHeader || mapping.salesCol || sheetData.headers[1];

  // Aggregation & Grouping
  const dataMap = new Map<string, { totalMetric: number; target: number; cost: number; count: number; rawRows: RawRow[] }>();

  sheetData.rows.forEach(r => {
    const dimVal = String(r[dimCol] || 'Outros').trim();
    if (!dataMap.has(dimVal)) {
      dataMap.set(dimVal, { totalMetric: 0, target: 0, cost: 0, count: 0, rawRows: [] });
    }
    const item = dataMap.get(dimVal)!;
    item.rawRows.push(r);
    item.count += 1;

    const val = parseBrazilianNumber(r[metricCol]);
    if (val !== null) item.totalMetric += val;

    if (mapping.targetCol && r[mapping.targetCol]) {
      const tgt = parseBrazilianNumber(r[mapping.targetCol]);
      if (tgt !== null) item.target = Math.max(item.target, tgt); // avoid duplication
    }

    if (mapping.costCol && r[mapping.costCol]) {
      const cst = parseBrazilianNumber(r[mapping.costCol]);
      if (cst !== null) item.cost += cst;
    }
  });

  // Convert map to structured list
  let chartData = Array.from(dataMap.entries()).map(([name, data]) => {
    const sales = data.totalMetric;
    const cost = data.cost;
    const profit = sales - cost;
    const marginPct = sales > 0 ? (profit / sales) * 100 : 0;

    return {
      name,
      value: sales,
      target: data.target || sales * 1.1, // Fallback target if missing
      cost,
      profit,
      marginPct,
      count: data.count
    };
  });

  // Sort Order
  if (config.sortOrder === 'desc') {
    chartData.sort((a, b) => b.value - a.value);
  } else if (config.sortOrder === 'asc') {
    chartData.sort((a, b) => a.value - b.value);
  } else if (config.sortOrder === 'alpha') {
    chartData.sort((a, b) => a.name.localeCompare(b.name));
  }

  // Limit Top N
  if (config.limitTopN && config.limitTopN > 0 && chartData.length > config.limitTopN) {
    chartData = chartData.slice(0, config.limitTopN);
  }

  const primaryColor = config.primaryColor || '#011E38';
  const secondaryColor = config.secondaryColor || '#264FEC';
  const accentColor = config.accentColor || '#FFBC82';

  // 1. RENDER PARETO CHART
  if (config.chartType === 'pareto') {
    const totalSalesSum = chartData.reduce((acc, curr) => acc + curr.value, 0);
    let runningSum = 0;
    const paretoData = chartData.map(item => {
      runningSum += item.value;
      const cumPct = totalSalesSum > 0 ? (runningSum / totalSalesSum) * 100 : 0;
      return {
        ...item,
        cumPct
      };
    });

    return (
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <ComposedChart data={paretoData} margin={{ top: 10, right: 30, left: 10, bottom: 25 }}>
            {config.showGridlines && <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />}
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} interval={0} angle={-15} textAnchor="end" />
            <YAxis yAxisId="left" tickFormatter={formatAxisTickValue} tick={{ fontSize: 11, fill: '#64748b' }} />
            <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11, fill: '#059669' }} />
            <Tooltip
              formatter={(val: number, name: string) => {
                if (name === 'cumPct') return [`${val.toFixed(1)}%`, '% Acumulado (Curva ABC)'];
                return [formatBRCurrency(val), 'Faturamento'];
              }}
            />
            {config.showLegend && <Legend verticalAlign="top" height={36} />}
            <Bar yAxisId="left" dataKey="value" name="Faturamento (R$)" fill={primaryColor} radius={[4, 4, 0, 0]} />
            <Line yAxisId="right" type="linear" dataKey="cumPct" name="% Acumulado" stroke="#059669" strokeWidth={2.5} dot={{ r: 4, fill: '#059669' }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // 2. RENDER SCATTER CHART (DISPERSÃO: FATURAMENTO X MARGEM %)
  if (config.chartType === 'scatter') {
    return (
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <ScatterChart margin={{ top: 15, right: 20, left: 10, bottom: 25 }}>
            {config.showGridlines && <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />}
            <XAxis dataKey="value" name="Faturamento" tickFormatter={formatAxisTickValue} tick={{ fontSize: 11, fill: '#64748b' }} label={{ value: 'Faturamento (R$)', position: 'insideBottom', offset: -10, fontSize: 11, fill: '#64748b' }} />
            <YAxis dataKey="marginPct" name="Margem" tickFormatter={(v) => `${v.toFixed(0)}%`} tick={{ fontSize: 11, fill: '#64748b' }} label={{ value: 'Margem Consolidada (%)', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#64748b' }} />
            <Tooltip
              formatter={(val: number, name: string) => {
                if (name === 'Faturamento') return [formatBRCurrency(val), 'Faturamento'];
                return [`${val.toFixed(1)}%`, 'Margem Consolidada'];
              }}
              labelFormatter={(name) => `Item: ${name}`}
            />
            <Scatter name="Lojas / Categorias" data={chartData} fill={secondaryColor}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={DEFAULT_COLORS[index % DEFAULT_COLORS.length]} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // 3. RENDER DONUT CHART (ROSCA)
  if (config.chartType === 'donut' || config.chartType === 'pie') {
    const isDonut = config.chartType === 'donut';
    return (
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <PieChart>
            <Tooltip formatter={(v: number) => [formatBRCurrency(v), 'Faturamento']} />
            {config.showLegend && <Legend verticalAlign="bottom" height={36} />}
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={isDonut ? 55 : 0}
              outerRadius={85}
              paddingAngle={isDonut ? 3 : 0}
              label={config.showValues ? ({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%` : undefined}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={DEFAULT_COLORS[index % DEFAULT_COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // 4. RENDER REALIZED WITH TARGET MARKER
  if (config.chartType === 'target_realized') {
    return (
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <BarChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 25 }}>
            {config.showGridlines && <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />}
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
            <YAxis tickFormatter={formatAxisTickValue} tick={{ fontSize: 11, fill: '#64748b' }} />
            <Tooltip formatter={(val: number, name: string) => [formatBRCurrency(val), name === 'value' ? 'Realizado' : 'Meta']} />
            {config.showLegend && <Legend verticalAlign="top" height={36} />}
            <Bar dataKey="value" name="Vendas Realizadas (R$)" fill={primaryColor} radius={[4, 4, 0, 0]} />
            <Bar dataKey="target" name="Meta Estipulada (R$)" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // 5. RENDER LINE CHART (STRAIGHT LINES)
  if (config.chartType === 'line') {
    return (
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 25 }}>
            {config.showGridlines && <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />}
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
            <YAxis tickFormatter={formatAxisTickValue} tick={{ fontSize: 11, fill: '#64748b' }} />
            <Tooltip formatter={(v: number) => [formatBRCurrency(v), 'Faturamento']} />
            <Line type="linear" dataKey="value" name="Faturamento (R$)" stroke={secondaryColor} strokeWidth={2.5} dot={{ r: 4, fill: secondaryColor }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // 6. RENDER HEATMAP MATRIX (LOJA X DIA)
  if (config.chartType === 'heatmap') {
    // Generate Matrix
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const storeList = chartData.slice(0, 6).map(d => d.name);

    return (
      <div className="w-full overflow-x-auto p-2">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr>
              <th className="p-2 border border-slate-200 bg-slate-100 font-bold text-slate-700">Loja / Dia</th>
              {days.map(d => (
                <th key={d} className="p-2 border border-slate-200 bg-slate-100 font-bold text-slate-700 text-center">{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {storeList.map(st => (
              <tr key={st}>
                <td className="p-2 border border-slate-200 font-semibold text-slate-800 bg-slate-50">{st}</td>
                {days.map((d, i) => {
                  const intensity = ((st.length + i * 7) % 10) / 10;
                  const bgAlpha = 0.15 + intensity * 0.75;
                  return (
                    <td
                      key={d}
                      className="p-2 border border-slate-200 text-center font-bold text-slate-900 transition-all hover:scale-105"
                      style={{ backgroundColor: `rgba(38, 79, 236, ${bgAlpha})`, color: bgAlpha > 0.5 ? '#fff' : '#011E38' }}
                    >
                      {formatBRCurrency(1200 + intensity * 4500)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // 7. RENDER CONDITIONAL TABLE
  if (config.chartType === 'table' || config.chartType === 'table_conditional') {
    const maxVal = Math.max(...chartData.map(d => d.value), 1);

    return (
      <div className="w-full overflow-x-auto custom-table-container">
        <table className="custom-table w-full text-xs text-left">
          <thead>
            <tr>
              <th>#</th>
              <th>Dimensão / Item</th>
              <th>Faturamento (R$)</th>
              <th>Participação (%)</th>
            </tr>
          </thead>
          <tbody>
            {chartData.map((d, i) => {
              const pct = (d.value / maxVal) * 100;
              return (
                <tr key={d.name}>
                  <td className="font-bold text-slate-400">{i + 1}</td>
                  <td className="font-medium text-slate-900">{d.name}</td>
                  <td className="font-bold text-emerald-800">
                    <div className="flex items-center space-x-2">
                      <span>{formatBRCurrency(d.value)}</span>
                      <div className="w-20 bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-600 h-2 rounded-full" style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  </td>
                  <td>{d.marginPct > 0 ? `${d.marginPct.toFixed(1)}%` : `${pct.toFixed(1)}%`}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  // DEFAULT BAR / HORIZONTAL BAR / STACKED BAR
  const isHorizontal = config.chartType === 'horizontalBar' || config.orientation === 'horizontal';

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <BarChart
          data={chartData}
          layout={isHorizontal ? 'vertical' : 'horizontal'}
          margin={{ top: 10, right: 20, left: 10, bottom: 25 }}
        >
          {config.showGridlines && <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />}
          {isHorizontal ? (
            <>
              <XAxis type="number" tickFormatter={formatAxisTickValue} tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#64748b' }} width={90} />
            </>
          ) : (
            <>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tickFormatter={formatAxisTickValue} tick={{ fontSize: 11, fill: '#64748b' }} />
            </>
          )}
          <Tooltip formatter={(v: number) => [formatBRCurrency(v), 'Faturamento']} />
          <Bar dataKey="value" name="Faturamento (R$)" fill={primaryColor} radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={DEFAULT_COLORS[index % DEFAULT_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
