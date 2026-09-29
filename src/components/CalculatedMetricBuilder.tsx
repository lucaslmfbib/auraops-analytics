import React, { useState } from 'react';
import { 
  Calculator, 
  Plus, 
  Trash2, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Info,
  Sliders
} from 'lucide-react';
import { CustomCalculatedMetric, MetricAggregation, OperatorType, RawRow, SheetData } from '../types/analytics';
import { formatBRCurrency } from '../services/dataParser';

interface CalculatedMetricBuilderProps {
  sheetData: SheetData | null;
  existingMetrics?: CustomCalculatedMetric[];
  onSaveMetric: (metric: CustomCalculatedMetric) => void;
  onDeleteMetric?: (id: string) => void;
}

/**
 * Safely evaluates a calculated metric over rows without running dynamic code/eval.
 */
export function evaluateCalculatedMetric(
  metric: CustomCalculatedMetric,
  rows: RawRow[]
): { value: number | null; isCalculable: boolean; statusText: string } {
  if (!rows || rows.length === 0) {
    return { value: null, isCalculable: false, statusText: 'Nenhum registro carregado.' };
  }

  const computeAgg = (col: string, agg: MetricAggregation): number | null => {
    let sum = 0;
    let count = 0;
    const set = new Set<any>();

    rows.forEach(r => {
      const raw = r[col];
      const num = typeof raw === 'number' ? raw : parseFloat(String(raw || '0').replace(/[^0-9,-]/g, '').replace(',', '.'));
      const val = isNaN(num) ? 0 : num;

      sum += val;
      count += 1;
      set.add(raw);
    });

    if (agg === 'sum') return sum;
    if (agg === 'avg') return count > 0 ? sum / count : 0;
    if (agg === 'count') return count;
    if (agg === 'count_distinct') return set.size;
    return 0;
  };

  const numVal = computeAgg(metric.numeratorCol, metric.numeratorAggregation);
  const denVal = computeAgg(metric.denominatorCol, metric.denominatorAggregation);

  if (numVal === null || denVal === null) {
    return { value: null, isCalculable: false, statusText: 'Indisponível: colunas não encontradas.' };
  }

  let result: number | null = null;

  if (metric.operator === '/') {
    if (denVal === 0) {
      return { value: null, isCalculable: false, statusText: 'Indisponível: divisão por zero.' };
    }
    result = numVal / denVal;
  } else if (metric.operator === '*') {
    result = numVal * denVal;
  } else if (metric.operator === '-') {
    result = numVal - denVal;
  } else if (metric.operator === '+') {
    result = numVal + denVal;
  }

  if (result === null || isNaN(result) || !isFinite(result)) {
    return { value: null, isCalculable: false, statusText: 'Indisponível: resultado numérico inválido.' };
  }

  return { value: result, isCalculable: true, statusText: 'Calculado com sucesso.' };
}

export const CalculatedMetricBuilder: React.FC<CalculatedMetricBuilderProps> = ({
  sheetData,
  existingMetrics = [],
  onSaveMetric,
  onDeleteMetric
}) => {
  const headers = sheetData ? sheetData.headers : [];

  const [name, setName] = useState<string>('Ticket Médio por Transação');
  const [numeratorCol, setNumeratorCol] = useState<string>(headers[0] || '');
  const [numeratorAggregation, setNumeratorAggregation] = useState<MetricAggregation>('sum');
  const [operator, setOperator] = useState<OperatorType>('/');
  const [denominatorCol, setDenominatorCol] = useState<string>(headers[1] || headers[0] || '');
  const [denominatorAggregation, setDenominatorAggregation] = useState<MetricAggregation>('count_distinct');
  const [unit, setUnit] = useState<string>('R$');
  const [numberFormat, setNumberFormat] = useState<'currency' | 'number' | 'percent'>('currency');
  const [decimalPlaces, setDecimalPlaces] = useState<number>(2);
  const [showInDashboard, setShowInDashboard] = useState<boolean>(true);
  const [showInPresentation, setShowInPresentation] = useState<boolean>(true);

  const aggLabels: Record<MetricAggregation, string> = {
    sum: 'Soma',
    avg: 'Média',
    count: 'Contagem',
    count_distinct: 'Contagem Distinta'
  };

  const opLabels: Record<OperatorType, string> = {
    '/': '÷',
    '*': '×',
    '-': '−',
    '+': '+'
  };

  const plainFormulaText = `${name} = [${aggLabels[numeratorAggregation]} de "${numeratorCol || 'Métrica A'}"] ${opLabels[operator]} [${aggLabels[denominatorAggregation]} de "${denominatorCol || 'Métrica B'}"]`;

  // Compute live test preview
  const tempMetric: CustomCalculatedMetric = {
    id: 'temp',
    name,
    numeratorCol,
    numeratorAggregation,
    operator,
    denominatorCol,
    denominatorAggregation,
    unit,
    numberFormat,
    decimalPlaces,
    plainFormulaText,
    showInDashboard,
    showInPresentation
  };

  const liveResult = sheetData ? evaluateCalculatedMetric(tempMetric, sheetData.rows) : { value: null, isCalculable: false, statusText: 'Nenhuma planilha carregada.' };

  const handleSave = () => {
    if (!name.trim()) {
      alert('Informe um nome para o indicador calculado.');
      return;
    }
    if (!numeratorCol || !denominatorCol) {
      alert('Selecione as colunas do numerador e denominador.');
      return;
    }

    const newMetric: CustomCalculatedMetric = {
      id: `calc_metric_${Date.now()}`,
      name: name.trim(),
      numeratorCol,
      numeratorAggregation,
      operator,
      denominatorCol,
      denominatorAggregation,
      unit,
      numberFormat,
      decimalPlaces,
      plainFormulaText,
      showInDashboard,
      showInPresentation
    };

    onSaveMetric(newMetric);
    alert(`Indicador "${newMetric.name}" criado com sucesso!`);
  };

  const formatValueDisplay = (val: number | null) => {
    if (val === null) return 'Indisponível';
    if (numberFormat === 'currency') return formatBRCurrency(val);
    if (numberFormat === 'percent') return `${val.toFixed(decimalPlaces)}%`;
    return `${val.toFixed(decimalPlaces)} ${unit}`;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
      
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800 font-bold">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Construtor Guiado de Métricas & KPIs Calculados</h2>
            <p className="text-xs text-slate-500">
              Crie fórmulas personalizadas com numerador, denominador e formato de saída em linguagem clara.
            </p>
          </div>
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        
        {/* Metric Name */}
        <div className="space-y-1 col-span-full">
          <label className="block font-bold text-slate-800">
            Nome do Indicador Calculado <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Ex: Ticket Médio por Cupom, Margem Bruta Operacional"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-bold text-slate-900 text-xs focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Numerator Box */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
          <span className="font-bold text-slate-800 block uppercase tracking-wider text-[11px]">1 — Numerador (Valor A)</span>
          
          <div className="space-y-1">
            <label className="block font-semibold text-slate-700">Coluna da Base</label>
            <select
              value={numeratorCol}
              onChange={(e) => setNumeratorCol(e.target.value)}
              className="w-full bg-white border border-slate-300 text-slate-800 text-xs rounded-lg px-2.5 py-1.5 font-medium"
            >
              {headers.map(h => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block font-semibold text-slate-700">Agregação</label>
            <select
              value={numeratorAggregation}
              onChange={(e) => setNumeratorAggregation(e.target.value as MetricAggregation)}
              className="w-full bg-white border border-slate-300 text-slate-800 text-xs rounded-lg px-2.5 py-1.5"
            >
              <option value="sum">Soma de Valores</option>
              <option value="avg">Média (Não Ponderada)</option>
              <option value="count">Contagem de Registros</option>
              <option value="count_distinct">Contagem Distinta (Valores Únicos)</option>
            </select>
          </div>
        </div>

        {/* Operator & Denominator Box */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800 block uppercase tracking-wider text-[11px]">2 — Operação & Denominador (Valor B)</span>
            
            {/* Operator selector */}
            <div className="flex items-center space-x-1 bg-white border border-slate-300 rounded-lg p-0.5">
              {(['/', '*', '-', '+'] as OperatorType[]).map(op => (
                <button
                  key={op}
                  type="button"
                  onClick={() => setOperator(op)}
                  className={`w-6 h-6 rounded font-bold flex items-center justify-center text-xs transition-colors ${
                    operator === op ? 'bg-emerald-600 text-white' : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  {opLabels[op]}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="block font-semibold text-slate-700">Coluna da Base</label>
            <select
              value={denominatorCol}
              onChange={(e) => setDenominatorCol(e.target.value)}
              className="w-full bg-white border border-slate-300 text-slate-800 text-xs rounded-lg px-2.5 py-1.5 font-medium"
            >
              {headers.map(h => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block font-semibold text-slate-700">Agregação</label>
            <select
              value={denominatorAggregation}
              onChange={(e) => setDenominatorAggregation(e.target.value as MetricAggregation)}
              className="w-full bg-white border border-slate-300 text-slate-800 text-xs rounded-lg px-2.5 py-1.5"
            >
              <option value="sum">Soma de Valores</option>
              <option value="avg">Média (Não Ponderada)</option>
              <option value="count">Contagem de Registros</option>
              <option value="count_distinct">Contagem Distinta (Valores Únicos)</option>
            </select>
          </div>
        </div>

        {/* Output formatting */}
        <div className="grid grid-cols-3 gap-3 col-span-full pt-1">
          <div className="space-y-1">
            <label className="block font-bold text-slate-800">Formato Numérico</label>
            <select
              value={numberFormat}
              onChange={(e) => setNumberFormat(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium"
            >
              <option value="currency">Moeda (R$)</option>
              <option value="number">Número Relativo</option>
              <option value="percent">Percentual (%)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block font-bold text-slate-800">Unidade de Exibição</label>
            <input
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="R$, %, Unid., Cupons"
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-bold text-slate-800">Casas Decimais</label>
            <select
              value={decimalPlaces}
              onChange={(e) => setDecimalPlaces(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium"
            >
              <option value={0}>0 (Sem decimais)</option>
              <option value={1}>1 casa decimal</option>
              <option value={2}>2 casas decimais</option>
            </select>
          </div>
        </div>

      </div>

      {/* Formula in Plain Language & Live Result Preview */}
      <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-bold text-emerald-950 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            Fórmula em Linguagem Clara
          </span>
          <span className="text-[11px] text-emerald-800 font-medium">Prévia em tempo real</span>
        </div>

        <code className="block p-2.5 bg-white border border-emerald-300 rounded-lg font-mono text-slate-900 text-xs font-bold shadow-sm">
          {plainFormulaText}
        </code>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center space-x-2">
            {liveResult.isCalculable ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            )}
            <span className="text-slate-700">{liveResult.statusText}</span>
          </div>

          {liveResult.isCalculable && (
            <div className="text-right">
              <span className="text-[10px] text-slate-500 block">Resultado calculado:</span>
              <span className="text-base font-extrabold text-emerald-700 font-mono">
                {formatValueDisplay(liveResult.value)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Destination Checkboxes & Save Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-2 gap-3 border-t border-slate-100 text-xs">
        <div className="flex items-center space-x-4 font-semibold text-slate-800">
          <label className="flex items-center space-x-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showInDashboard}
              onChange={(e) => setShowInDashboard(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded border-slate-300"
            />
            <span>Mostrar no Dashboard</span>
          </label>

          <label className="flex items-center space-x-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showInPresentation}
              onChange={(e) => setShowInPresentation(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded border-slate-300"
            />
            <span>Incluir na Apresentação</span>
          </label>
        </div>

        <button
          onClick={handleSave}
          className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-5 py-2.5 rounded-xl shadow-sm flex items-center space-x-2 text-xs transition-all w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          <span>Criar indicador calculado</span>
        </button>
      </div>

      {/* List of existing calculated metrics */}
      {existingMetrics.length > 0 && (
        <div className="border-t border-slate-200 pt-4 space-y-3">
          <h3 className="font-bold text-xs text-slate-900">Métricas Calculadas Personalizadas ({existingMetrics.length})</h3>
          <div className="space-y-2">
            {existingMetrics.map(m => (
              <div key={m.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900 block">{m.name}</span>
                  <code className="text-[11px] text-slate-600 font-mono">{m.plainFormulaText}</code>
                </div>
                {onDeleteMetric && (
                  <button
                    onClick={() => onDeleteMetric(m.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
