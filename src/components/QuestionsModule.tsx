import React, { useState } from 'react';
import { MessageSquareCode, Sparkles, Send, CheckCircle2, Table, Lightbulb, Bot, ShieldCheck } from 'lucide-react';
import { OperationalAnswer } from '../types/analytics';

interface QuestionsModuleProps {
  answers: OperationalAnswer[];
}

export const QuestionsModule: React.FC<QuestionsModuleProps> = ({ answers }) => {
  const [selectedAnswer, setSelectedAnswer] = useState<OperationalAnswer | null>(answers[0] || null);
  const [customQuestion, setCustomQuestion] = useState('');
  const [customResponse, setCustomResponse] = useState<OperationalAnswer | null>(null);

  const handleAskQuestion = (q: string) => {
    // Find matching generated answer or synthesize from data
    const matched = answers.find(a => a.question.toLowerCase().includes(q.toLowerCase()) || q.toLowerCase().includes(a.category));
    if (matched) {
      setSelectedAnswer(matched);
      setCustomResponse(null);
    } else if (answers.length > 0) {
      // Default to general operational synthesis
      setCustomResponse({
        id: 'custom_search',
        question: q,
        category: 'metas',
        answerText: `Consulta processada para "${q}". Os dados da operação mostram que os indicadores calculados estão disponíveis no resumo operacional abaixo.`,
        metricBadge: 'Calculado via Código',
        tableData: answers[0]?.tableData,
        recommendation: 'Para análises mais detalhadas, utilize as perguntas pré-formatadas ou consulte o Dashboard.'
      });
      setSelectedAnswer(null);
    }
  };

  const activeAnswer = customResponse || selectedAnswer || answers[0];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Module Title Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <MessageSquareCode className="w-6 h-6 text-emerald-600" />
              Perguntas & Interpretação Operacional
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Faça perguntas sobre os dados importados. As respostas são geradas via código com cálculos determinísticos.
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold px-3 py-1.5 rounded-full">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Cálculos 100% Determinísticos (Sem Alucinações)</span>
          </div>
        </div>

        {/* Quick Questions Chips */}
        <div className="mt-5 space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Perguntas Frequentes da Operação:</span>
          <div className="flex flex-wrap gap-2">
            {answers.map(ans => (
              <button
                key={ans.id}
                onClick={() => {
                  setSelectedAnswer(ans);
                  setCustomResponse(null);
                }}
                className={`text-xs font-medium px-3.5 py-2 rounded-xl border transition-all flex items-center space-x-1.5 ${
                  (activeAnswer?.id === ans.id)
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{ans.question}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Input */}
        <div className="mt-4 flex gap-2">
          <input
            type="text"
            placeholder="Digite uma pergunta sobre as lojas, faturamento ou metas..."
            value={customQuestion}
            onChange={(e) => setCustomQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && customQuestion && handleAskQuestion(customQuestion)}
            className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            onClick={() => customQuestion && handleAskQuestion(customQuestion)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs px-4 py-2.5 rounded-xl flex items-center space-x-1.5 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Consultar</span>
          </button>
        </div>
      </div>

      {/* Answer Detail Display */}
      {activeAnswer && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-start justify-between border-b border-slate-100 pb-4">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Pergunta Selecionada</span>
              <h3 className="text-lg font-bold text-slate-900">{activeAnswer.question}</h3>
            </div>
            {activeAnswer.metricBadge && (
              <span className="bg-emerald-100 text-emerald-800 text-xs font-extrabold px-3 py-1 rounded-full border border-emerald-200">
                {activeAnswer.metricBadge}
              </span>
            )}
          </div>

          {/* Synthesized Response */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-start space-x-3 text-slate-800 text-sm leading-relaxed">
            <Bot className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
            <div>
              <p>{activeAnswer.answerText}</p>
            </div>
          </div>

          {/* Drilldown Table Data (if present) */}
          {activeAnswer.tableData && activeAnswer.tableData.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Table className="w-4 h-4 text-slate-500" />
                Detalhamento dos Dados Relevantes
              </h4>
              <div className="custom-table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      {Object.keys(activeAnswer.tableData[0]).map(col => (
                        <th key={col}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {activeAnswer.tableData.map((row, idx) => (
                      <tr key={idx}>
                        {Object.values(row).map((val, cellIdx) => (
                          <td key={cellIdx}>{String(val)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Executive Recommendation */}
          {activeAnswer.recommendation && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start space-x-3 text-amber-900 text-xs">
              <Lightbulb className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold block text-amber-950 mb-0.5">Recomendação Operacional Sugerida</span>
                <p>{activeAnswer.recommendation}</p>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Modular LLM Connector Notice */}
      <div className="p-4 bg-slate-100 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bot className="w-4 h-4 text-slate-400" />
          <span>
            <strong>Estrutura Pronta para LLM:</strong> Módulo desacoplado configurado para acoplar integrações diretas de IA (OpenAI / Gemini API) em etapas futuras.
          </span>
        </div>
        <span className="bg-slate-200 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded">
          Versão 1.0 Local Engine
        </span>
      </div>

    </div>
  );
};
