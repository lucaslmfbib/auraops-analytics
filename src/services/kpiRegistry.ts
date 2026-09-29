import { ColumnMapping, ColumnRole, KPIDefinition, KPIId } from '../types/analytics';

export const KPI_REGISTRY: Record<KPIId, KPIDefinition> = {
  total_sales: {
    id: 'total_sales',
    name: 'Vendas Totais (Faturamento)',
    category: 'Vendas',
    formula: 'SUM(Vendas)',
    unit: 'R$',
    requiredRoles: ['sales'],
    description: 'Soma total do faturamento bruto gerado no período.'
  },
  total_target: {
    id: 'total_target',
    name: 'Meta de Vendas Consolidada',
    category: 'Metas',
    formula: 'SUM_DISTINCT(Meta por Loja/Período)',
    unit: 'R$',
    requiredRoles: ['target'],
    description: 'Meta de vendas da operação deduplicada por unidade de loja e período para evitar inflação.'
  },
  target_achievement: {
    id: 'target_achievement',
    name: 'Atingimento de Meta',
    category: 'Metas',
    formula: '(Vendas Totais / Meta Consolidada) * 100',
    unit: '%',
    requiredRoles: ['sales', 'target'],
    description: 'Percentual de cumprimento da meta projetada para a rede.'
  },
  ticket_medio: {
    id: 'ticket_medio',
    name: 'Ticket Médio por Transação',
    category: 'Vendas',
    formula: 'Vendas Totais / Contagem de Cupons/Pedidos',
    unit: 'R$',
    requiredRoles: ['sales', 'transaction_id'],
    description: 'Valor médio gasto em cada cupom fiscal ou pedido de venda registrado.'
  },
  gross_margin: {
    id: 'gross_margin',
    name: 'Margem Bruta',
    category: 'Rentabilidade',
    formula: '((Vendas Totais - Custo Total) / Vendas Totais) * 100',
    unit: '%',
    requiredRoles: ['sales', 'cost'],
    description: 'Percentual de receita remanescente após a dedução do custo das mercadorias vendidas (CMV).'
  },
  total_profit: {
    id: 'total_profit',
    name: 'Lucro Bruto Consolidado',
    category: 'Rentabilidade',
    formula: 'Vendas Totais - Custo Total',
    unit: 'R$',
    requiredRoles: ['sales', 'cost'],
    description: 'Ganho financeiro bruto em reais gerado pelas vendas sobre os custos.'
  },
  total_quantity: {
    id: 'total_quantity',
    name: 'Volume de Peças Vendidas',
    category: 'Volume',
    formula: 'SUM(Quantidade)',
    unit: 'Unidades',
    requiredRoles: ['quantity'],
    description: 'Total de itens ou produtos comercializados no período.'
  },
  transaction_count: {
    id: 'transaction_count',
    name: 'Total de Transações / Cupons',
    category: 'Volume',
    formula: 'COUNT_DISTINCT(ID Transação)',
    unit: 'Cupons',
    requiredRoles: ['transaction_id'],
    description: 'Quantidade total de operações de caixa efetuadas.'
  },
  active_stores: {
    id: 'active_stores',
    name: 'Unidades de Lojas Ativas',
    category: 'Vendas',
    formula: 'COUNT_DISTINCT(Loja)',
    unit: 'Lojas',
    requiredRoles: ['store'],
    description: 'Número de pontos de venda com registros no período.'
  }
};

export function checkKPICalculability(
  kpiId: KPIId, 
  mapping: ColumnMapping
): { isCalculable: boolean; missingRoles: ColumnRole[]; explanation: string } {
  const kpi = KPI_REGISTRY[kpiId];
  if (!kpi) return { isCalculable: false, missingRoles: [], explanation: 'Indicador não catalogado.' };

  const missingRoles: ColumnRole[] = [];

  kpi.requiredRoles.forEach(role => {
    switch (role) {
      case 'sales':
        if (!mapping.salesCol) missingRoles.push('sales');
        break;
      case 'target':
        if (!mapping.targetCol) missingRoles.push('target');
        break;
      case 'cost':
        if (!mapping.costCol) missingRoles.push('cost');
        break;
      case 'transaction_id':
        if (!mapping.transactionCol && !mapping.quantityCol) missingRoles.push('transaction_id');
        break;
      case 'quantity':
        if (!mapping.quantityCol) missingRoles.push('quantity');
        break;
      case 'store':
        if (!mapping.storeCol) missingRoles.push('store');
        break;
    }
  });

  if (missingRoles.length === 0) {
    return { isCalculable: true, missingRoles: [], explanation: 'Disponível para cálculo.' };
  }

  const roleNamesPtBR: Record<ColumnRole, string> = {
    sales: 'Vendas/Faturamento',
    target: 'Meta de Vendas',
    cost: 'Custo/CMV',
    transaction_id: 'ID Transação ou Cupons',
    quantity: 'Quantidade/Volume',
    store: 'Loja/Filial',
    date: 'Data',
    category: 'Categoria',
    product: 'Produto',
    ignore: 'Nenhum'
  };

  const missingLabels = missingRoles.map(r => `"${roleNamesPtBR[r]}"`).join(', ');
  const explanation = `Requer o mapeamento da(s) coluna(s): ${missingLabels}.`;

  return { isCalculable: false, missingRoles, explanation };
}
