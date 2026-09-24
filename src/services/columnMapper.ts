import { ColumnMapping, ColumnMeta } from '../types/analytics';

export function createDefaultMapping(columnsMeta: ColumnMeta[]): ColumnMapping {
  const mapping: ColumnMapping = {
    dateCol: null,
    storeCol: null,
    categoryCol: null,
    productCol: null,
    salesCol: null,
    targetCol: null,
    costCol: null,
    transactionCol: null,
    quantityCol: null,
    metaGranularity: 'store_month',
  };

  columnsMeta.forEach(col => {
    switch (col.guessedRole) {
      case 'date':
        if (!mapping.dateCol) mapping.dateCol = col.name;
        break;
      case 'store':
        if (!mapping.storeCol) mapping.storeCol = col.name;
        break;
      case 'category':
        if (!mapping.categoryCol) mapping.categoryCol = col.name;
        break;
      case 'product':
        if (!mapping.productCol) mapping.productCol = col.name;
        break;
      case 'sales':
        if (!mapping.salesCol) mapping.salesCol = col.name;
        break;
      case 'target':
        if (!mapping.targetCol) mapping.targetCol = col.name;
        break;
      case 'cost':
        if (!mapping.costCol) mapping.costCol = col.name;
        break;
      case 'transaction_id':
        if (!mapping.transactionCol) mapping.transactionCol = col.name;
        break;
      case 'quantity':
        if (!mapping.quantityCol) mapping.quantityCol = col.name;
        break;
    }
  });

  return mapping;
}

export function validateMapping(mapping: ColumnMapping): { isValid: boolean; warnings: string[] } {
  const warnings: string[] = [];

  if (!mapping.salesCol) {
    warnings.push('Nenhuma coluna de Vendas/Faturamento foi selecionada. Selecione uma coluna para calcular o faturamento total.');
  }

  if (!mapping.dateCol) {
    warnings.push('Nenhuma coluna de Data selecionada. Os gráficos de evolução temporal utilizarão a ordem padrão dos registros.');
  }

  if (!mapping.storeCol) {
    warnings.push('Nenhuma coluna de Loja/Filial selecionada. O ranking por loja não poderá ser gerado.');
  }

  if (!mapping.targetCol) {
    warnings.push('Nenhuma coluna de Meta informada. O percentual de atingimento de metas não será exibido.');
  }

  return {
    isValid: mapping.salesCol !== null,
    warnings
  };
}
