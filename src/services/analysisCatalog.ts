import { AnalysisQuestionItem, ColumnMapping } from '../types/analytics';

export const ANALYSIS_QUESTIONS_CATALOG: AnalysisQuestionItem[] = [
  {
    id: 'evolution_sales',
    question: 'Como as vendas evoluíram?',
    category: 'Evolução',
    description: 'Acompanhe a tendência cronológica de faturamento (por dia, semana ou mês) com linha direta sem interpolação artificial.',
    requiredFields: [
      { key: 'dateCol', label: 'Data das Vendas', required: true },
      { key: 'salesCol', label: 'Valor de Vendas (R$)', required: true }
    ],
    defaultChartType: 'line',
    defaultTitle: 'Vendas por Dia (Evolução Temporal)',
    defaultDimension: 'date',
    defaultMetric: 'sales'
  },
  {
    id: 'top_stores',
    question: 'Quais lojas mais venderam?',
    category: 'Lojas',
    description: 'Ranking comparativo de faturamento total entre todas as filiais e lojas da rede.',
    requiredFields: [
      { key: 'storeCol', label: 'Identificador de Loja', required: true },
      { key: 'salesCol', label: 'Valor de Vendas (R$)', required: true }
    ],
    defaultChartType: 'horizontalBar',
    defaultTitle: 'Ranking de Vendas por Loja',
    defaultDimension: 'store',
    defaultMetric: 'sales'
  },
  {
    id: 'store_targets',
    question: 'Quais lojas atingiram a meta?',
    category: 'Lojas',
    description: 'Comparativo de vendas realizadas contra a meta estipulada para o período, com marcadores visuais de atingimento.',
    requiredFields: [
      { key: 'storeCol', label: 'Identificador de Loja', required: true },
      { key: 'salesCol', label: 'Valor de Vendas (R$)', required: true },
      { key: 'targetCol', label: 'Meta de Vendas (R$)', required: true }
    ],
    defaultChartType: 'target_realized',
    defaultTitle: 'Atingimento de Meta Mensal por Loja',
    defaultDimension: 'store',
    defaultMetric: 'target'
  },
  {
    id: 'top_products_categories',
    question: 'Quais produtos ou categorias mais venderam?',
    category: 'Produtos',
    description: 'Visão detalhada do faturamento gerado pelas linhas de produtos ou agrupamentos de categorias.',
    requiredFields: [
      { key: 'categoryCol', label: 'Categoria ou Produto', required: true },
      { key: 'salesCol', label: 'Valor de Vendas (R$)', required: true }
    ],
    defaultChartType: 'bar',
    defaultTitle: 'Faturamento por Categoria',
    defaultDimension: 'category',
    defaultMetric: 'sales'
  },
  {
    id: 'category_share',
    question: 'Qual é a participação de cada categoria?',
    category: 'Distribuição',
    description: 'Proporção percentual da receita total dividida entre as famílias e categorias de produtos.',
    requiredFields: [
      { key: 'categoryCol', label: 'Categoria de Produto', required: true },
      { key: 'salesCol', label: 'Valor de Vendas (R$)', required: true }
    ],
    defaultChartType: 'donut',
    defaultTitle: 'Participação Percentual por Categoria',
    defaultDimension: 'category',
    defaultMetric: 'sales'
  },
  {
    id: 'ticket_medio_store',
    question: 'Qual é o ticket médio por loja?',
    category: 'Lojas',
    description: 'Valor médio por transação de venda em cada loja (utiliza cupons/pedidos distintos quando disponível).',
    requiredFields: [
      { key: 'storeCol', label: 'Identificador de Loja', required: true },
      { key: 'salesCol', label: 'Valor de Vendas (R$)', required: true }
    ],
    defaultChartType: 'bar',
    defaultTitle: 'Ticket Médio por Loja',
    defaultDimension: 'store',
    defaultMetric: 'ticket'
  },
  {
    id: 'margin_by_dimension',
    question: 'Quais lojas ou categorias têm maior margem?',
    category: 'Margem',
    description: 'Análise de rentabilidade bruta e percentual de margem de lucro por filial ou linha de produto.',
    requiredFields: [
      { key: 'storeCol', label: 'Loja ou Categoria', required: true },
      { key: 'salesCol', label: 'Valor de Vendas (R$)', required: true },
      { key: 'costCol', label: 'Custo Total / Margem', required: true }
    ],
    defaultChartType: 'bar_grouped',
    defaultTitle: 'Lucro Bruto e Margem Consolidada (%) por Loja',
    defaultDimension: 'store',
    defaultMetric: 'margin'
  },
  {
    id: 'revenue_vs_margin',
    question: 'Como faturamento e margem se relacionam?',
    category: 'Margem',
    description: 'Gráfico de dispersão cruzando volume de receita (Eixo X) com percentual de margem (Eixo Y).',
    requiredFields: [
      { key: 'storeCol', label: 'Loja ou Categoria', required: true },
      { key: 'salesCol', label: 'Valor de Vendas (R$)', required: true },
      { key: 'costCol', label: 'Custo Total / Margem', required: true }
    ],
    defaultChartType: 'scatter',
    defaultTitle: 'Dispersão: Faturamento (R$) vs Margem Consolidada (%)',
    defaultDimension: 'store',
    defaultMetric: 'margin'
  },
  {
    id: 'pareto_sales',
    question: 'Quais produtos concentram as vendas?',
    category: 'Produtos',
    description: 'Análise de Pareto (Curva ABC): ordena faturamento decrescente e exibe curva de % acumulado no 2º eixo.',
    requiredFields: [
      { key: 'categoryCol', label: 'Produto ou Categoria', required: true },
      { key: 'salesCol', label: 'Valor de Vendas (R$)', required: true }
    ],
    defaultChartType: 'pareto',
    defaultTitle: 'Curva Pareto (ABC) de Concentração de Vendas',
    defaultDimension: 'category',
    defaultMetric: 'sales'
  },
  {
    id: 'heatmap_sales',
    question: 'Em quais dias e lojas as vendas se concentram?',
    category: 'Distribuição',
    description: 'Matriz visual de mapa de calor em formato Loja × Dia da Semana com gradiente de intensidade de vendas.',
    requiredFields: [
      { key: 'dateCol', label: 'Data das Vendas', required: true },
      { key: 'storeCol', label: 'Identificador de Loja', required: true },
      { key: 'salesCol', label: 'Valor de Vendas (R$)', required: true }
    ],
    defaultChartType: 'heatmap',
    defaultTitle: 'Mapa de Calor de Vendas (Loja × Dia da Semana)',
    defaultDimension: 'store',
    defaultMetric: 'sales'
  }
];

export function checkAnalysisCompatibility(
  question: AnalysisQuestionItem,
  mapping: ColumnMapping
): { isCompatible: boolean; missingFields: string[] } {
  const missingFields: string[] = [];

  question.requiredFields.forEach(req => {
    if (req.key === 'categoryCol' && !mapping.categoryCol && !mapping.productCol) {
      missingFields.push('Categoria ou Produto');
      return;
    }
    if (req.key === 'storeCol' && req.label.includes('Loja ou Categoria')) {
      if (!mapping.storeCol && !mapping.categoryCol) {
        missingFields.push('Loja ou Categoria');
        return;
      }
    }
    if (req.key !== 'categoryCol' && !mapping[req.key]) {
      missingFields.push(req.label);
    }
  });

  return {
    isCompatible: missingFields.length === 0,
    missingFields
  };
}
