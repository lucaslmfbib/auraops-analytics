import React, { useState } from 'react';
import { Presentation, Printer, ChevronLeft, ChevronRight, Award, TrendingUp, Store, Target, Lightbulb, CheckCircle2 } from 'lucide-react';
import { CategoryPerformance, KPICalculation, StorePerformance } from '../types/analytics';
import { formatBRCurrency, formatBRNumber } from '../services/dataParser';

interface PresentationModuleProps {
  kpis: KPICalculation;
  stores: StorePerformance[];
  categories: CategoryPerformance[];
  dateRangeText: string;
}

export const PresentationModule: React.FC<PresentationModuleProps> = ({
  kpis,
  stores,
  categories,
  dateRangeText
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handlePrint = () => {
    window.print();
  };

  const topStore = stores[0];
  const lowestStore = stores[stores.length - 1];
  const topCategory = categories[0];

  const totalSlides = 4;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Top Controls Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Presentation className="w-5 h-5 text-emerald-600" />
            Apresentação Executiva de Resultados
          </h2>
          <p className="text-xs text-slate-500">Relatório de desempenho formatado em slides para reunião de diretoria.</p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Carousel Slide Nav */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg">
            <button
              disabled={currentSlide === 0}
              onClick={() => setCurrentSlide(s => s - 1)}
              className="p-1 rounded text-slate-600 hover:bg-white disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-semibold text-slate-700 px-2">
              Slide {currentSlide + 1} de {totalSlides}
            </span>
            <button
              disabled={currentSlide === totalSlides - 1}
              onClick={() => setCurrentSlide(s => s + 1)}
              className="p-1 rounded text-slate-600 hover:bg-white disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Export / Print PDF */}
          <button
            onClick={handlePrint}
            className="bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs px-4 py-2 rounded-lg flex items-center space-x-1.5 transition-colors shadow-sm"
          >
            <Printer className="w-3.5 h-3.5 text-emerald-400" />
            <span>Imprimir / Gerar PDF</span>
          </button>
        </div>
      </div>

      {/* Presentation Slide Container */}
      <div className="bg-slate-900 rounded-2xl p-6 md:p-10 shadow-2xl text-white border border-slate-800 min-h-[480px] flex flex-col justify-between relative overflow-hidden">
        
        {/* Subtle Decorative Background Accent */}
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Slide Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 relative z-10">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">AuraOps Executive Presentation</span>
          </div>
          <span className="text-xs text-slate-400 font-medium">Período: {dateRangeText}</span>
        </div>

        {/* SLIDE CONTENT AREA */}
        <div className="py-8 relative z-10">

          {/* SLIDE 0: Overview */}
          {currentSlide === 0 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Slide 1 de 4 • Resumo Executivo</span>
                <h3 className="text-2xl md:text-3xl font-extrabold text-white">Desempenho Geral da Rede de Lojas</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                <div className="bg-slate-800/80 p-5 rounded-xl border border-slate-700">
                  <span className="text-xs font-bold text-slate-400 uppercase">Faturamento Total</span>
                  <div className="text-2xl md:text-3xl font-extrabold text-emerald-400 mt-2">
                    {formatBRCurrency(kpis.totalSales)}
                  </div>
                  <span className="text-xs text-slate-400 mt-1 block">{kpis.recordCount} registros computados</span>
                </div>

                <div className="bg-slate-800/80 p-5 rounded-xl border border-slate-700">
                  <span className="text-xs font-bold text-slate-400 uppercase">Meta Projetada</span>
                  <div className="text-2xl md:text-3xl font-extrabold text-purple-400 mt-2">
                    {kpis.hasTargetData ? formatBRCurrency(kpis.totalTarget) : 'N/I'}
                  </div>
                  <span className="text-xs text-slate-400 mt-1 block">Meta por loja consolidada</span>
                </div>

                <div className="bg-slate-800/80 p-5 rounded-xl border border-slate-700">
                  <span className="text-xs font-bold text-slate-400 uppercase">Atingimento Global</span>
                  <div className="text-2xl md:text-3xl font-extrabold text-amber-400 mt-2">
                    {kpis.targetAchievementPct ? `${kpis.targetAchievementPct.toFixed(1)}%` : 'N/I'}
                  </div>
                  <span className="text-xs text-slate-400 mt-1 block">
                    {kpis.targetAchievementPct && kpis.targetAchievementPct >= 100 ? 'Meta Superada' : 'Abaixo da Meta'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 1: Stores Analysis */}
          {currentSlide === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Slide 2 de 4 • Unidades de Negócio</span>
                <h3 className="text-2xl md:text-3xl font-extrabold text-white">Análise Comparativa por Loja</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                {topStore && (
                  <div className="bg-emerald-950/40 border border-emerald-500/30 p-5 rounded-xl space-y-2">
                    <div className="flex items-center space-x-2 text-emerald-400">
                      <Award className="w-5 h-5" />
                      <span className="text-xs font-bold uppercase tracking-wider">Loja Destaque de Vendas</span>
                    </div>
                    <div className="text-xl font-extrabold text-white">{topStore.store}</div>
                    <p className="text-sm text-slate-300">
                      Vendas: <strong className="text-emerald-400">{formatBRCurrency(topStore.totalSales)}</strong>
                      {topStore.achievementPct && ` (${topStore.achievementPct.toFixed(1)}% da meta)`}
                    </p>
                  </div>
                )}

                {lowestStore && (
                  <div className="bg-rose-950/40 border border-rose-500/30 p-5 rounded-xl space-y-2">
                    <div className="flex items-center space-x-2 text-rose-400">
                      <Target className="w-5 h-5" />
                      <span className="text-xs font-bold uppercase tracking-wider">Unidade em Foco Operacional</span>
                    </div>
                    <div className="text-xl font-extrabold text-white">{lowestStore.store}</div>
                    <p className="text-sm text-slate-300">
                      Vendas: <strong className="text-rose-400">{formatBRCurrency(lowestStore.totalSales)}</strong>
                      {lowestStore.achievementPct && ` (${lowestStore.achievementPct.toFixed(1)}% da meta)`}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SLIDE 2: Category Breakdown */}
          {currentSlide === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Slide 3 de 4 • Mix de Produtos</span>
                <h3 className="text-2xl md:text-3xl font-extrabold text-white">Contribuição por Categoria</h3>
              </div>

              {topCategory ? (
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-emerald-400">Categoria Principal: {topCategory.category}</span>
                    <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full">
                      {topCategory.sharePct.toFixed(1)}% Share de Vendas
                    </span>
                  </div>
                  <p className="text-sm text-slate-300">
                    A linha de {topCategory.category} gerou {formatBRCurrency(topCategory.totalSales)} de receita consolidada na operação.
                  </p>
                </div>
              ) : (
                <div className="text-slate-400 text-sm">Sem dados de categoria disponíveis.</div>
              )}
            </div>
          )}

          {/* SLIDE 3: Recommendations */}
          {currentSlide === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Slide 4 de 4 • Próximos Passos</span>
                <h3 className="text-2xl md:text-3xl font-extrabold text-white">Direcionamento e Recomendações Operacionais</h3>
              </div>

              <div className="space-y-3 pt-2">
                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                  <p className="text-xs md:text-sm text-slate-200">
                    Acompanhar diariamente as lojas abaixo de 90% de meta com ações promocionais focadas em itens de alto ticket.
                  </p>
                </div>
                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                  <p className="text-xs md:text-sm text-slate-200">
                    Garantir abastecimento contínuo de estoque da categoria principal para evitar ruptura em horários de pico.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Slide Footer */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-4 text-xs text-slate-500 relative z-10">
          <span>Criado por <strong>Lucas Martins</strong> • AuraOps Analytics</span>
          <span>Slide {currentSlide + 1} de {totalSlides}</span>
        </div>

      </div>
    </div>
  );
};
