import { 
  CategoryPerformance, 
  ColumnMapping, 
  FilterState, 
  KPICalculation, 
  OperationalAnswer, 
  ProductPerformance, 
  RawRow, 
  StorePerformance, 
  TimepointSales 
} from '../types/analytics';
import { formatBRCurrency, formatBRDate, formatBRNumber, parseBrazilianNumber, parseDateValue } from './dataParser';

export function filterRows(
  rows: RawRow[], 
  mapping: ColumnMapping, 
  filters: FilterState
): RawRow[] {
  return rows.filter(row => {
    // 1. Date filter
    if (mapping.dateCol && (filters.startDate || filters.endDate)) {
      const parsedDate = parseDateValue(row[mapping.dateCol]);
      if (parsedDate) {
        if (filters.startDate && parsedDate < filters.startDate) return false;
        if (filters.endDate && parsedDate > filters.endDate) return false;
      }
    }

    // 2. Store filter
    if (mapping.storeCol && filters.selectedStores.length > 0) {
      const storeVal = String(row[mapping.storeCol] || '').trim();
      if (!filters.selectedStores.includes(storeVal)) return false;
    }

    // 3. Category filter
    if (mapping.categoryCol && filters.selectedCategories.length > 0) {
      const catVal = String(row[mapping.categoryCol] || '').trim();
      if (!filters.selectedCategories.includes(catVal)) return false;
    }

    // 4. Search query
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      const match = Object.values(row).some(v => String(v || '').toLowerCase().includes(q));
      if (!match) return false;
    }

    return true;
  });
}

/**
 * Calculates Deduplicated Total Target
 * Prevents repeating same store target for multiple sale transactions
 */
export function calculateDeduplicatedTarget(
  rows: RawRow[], 
  mapping: ColumnMapping
): number {
  if (!mapping.targetCol) return 0;

  const { metaGranularity, storeCol, dateCol, targetCol } = mapping;

  if (metaGranularity === 'row_by_row' || (!storeCol && !dateCol)) {
    // Simply sum row targets
    let sum = 0;
    rows.forEach(r => {
      const val = parseBrazilianNumber(r[targetCol]);
      if (val !== null) sum += val;
    });
    return sum;
  }

  // Deduplicate by Store + Month or Store + Period
  const targetMap = new Map<string, number>();

  rows.forEach(r => {
    const targetVal = parseBrazilianNumber(r[targetCol]);
    if (targetVal === null) return;

    const storeKey = storeCol ? String(r[storeCol] || 'Loja Unica').trim() : 'Geral';
    let periodKey = '';

    if (metaGranularity === 'store_month' && dateCol) {
      const d = parseDateValue(r[dateCol]);
      periodKey = d ? d.substring(0, 7) : 'SemData'; // YYYY-MM
    } else {
      periodKey = 'PeriodoTotal';
    }

    const uniqueKey = `${storeKey}___${periodKey}`;
    // Store maximum or first target seen for this store & period combination
    if (!targetMap.has(uniqueKey) || targetVal > (targetMap.get(uniqueKey) || 0)) {
      targetMap.set(uniqueKey, targetVal);
    }
  });

  let totalTarget = 0;
  targetMap.forEach(val => {
    totalTarget += val;
  });

  return totalTarget;
}

/**
 * Main KPI Calculator
 */
export function calculateKPIs(
  filteredRows: RawRow[], 
  mapping: ColumnMapping
): KPICalculation {
  let totalSales = 0;
  let totalCost = 0;
  let totalQuantity = 0;

  const stores = new Set<string>();
  const categories = new Set<string>();
  const products = new Set<string>();
  const transactions = new Set<string>();

  let dates: string[] = [];

  filteredRows.forEach((r, idx) => {
    // Sales
    if (mapping.salesCol) {
      const s = parseBrazilianNumber(r[mapping.salesCol]);
      if (s !== null) totalSales += s;
    }

    // Costs
    if (mapping.costCol) {
      const c = parseBrazilianNumber(r[mapping.costCol]);
      if (c !== null) totalCost += c;
    }

    // Quantity
    if (mapping.quantityCol) {
      const q = parseBrazilianNumber(r[mapping.quantityCol]);
      if (q !== null) totalQuantity += q;
    }

    // Store
    if (mapping.storeCol && r[mapping.storeCol]) {
      stores.add(String(r[mapping.storeCol]).trim());
    }

    // Category
    if (mapping.categoryCol && r[mapping.categoryCol]) {
      categories.add(String(r[mapping.categoryCol]).trim());
    }

    // Product
    if (mapping.productCol && r[mapping.productCol]) {
      products.add(String(r[mapping.productCol]).trim());
    }

    // Transaction ID
    if (mapping.transactionCol && r[mapping.transactionCol]) {
      transactions.add(String(r[mapping.transactionCol]).trim());
    }

    // Date
    if (mapping.dateCol && r[mapping.dateCol]) {
      const d = parseDateValue(r[mapping.dateCol]);
      if (d) dates.push(d);
    }
  });

  // Deduplicated Target
  const totalTarget = calculateDeduplicatedTarget(filteredRows, mapping);

  // Target Achievement %
  const hasTargetData = mapping.targetCol !== null && totalTarget > 0;
  const targetAchievementPct = hasTargetData ? (totalSales / totalTarget) * 100 : null;

  // Transactions / Ticket Médio
  const totalTransactions = transactions.size > 0 ? transactions.size : filteredRows.length;
  const hasTicketData = (mapping.transactionCol !== null || mapping.quantityCol !== null || filteredRows.length > 0) && totalSales > 0;
  const ticketMedio = (hasTicketData && totalTransactions > 0) ? totalSales / totalTransactions : null;

  // Margin
  const hasMarginData = mapping.costCol !== null && totalCost > 0;
  const totalProfit = hasMarginData ? totalSales - totalCost : null;
  const grossMarginPct = (hasMarginData && totalSales > 0) ? ((totalSales - totalCost) / totalSales) * 100 : null;

  // Date Range string
  dates.sort();
  let dateRangeText = 'Todo o período';
  if (dates.length > 0) {
    const firstDate = formatBRDate(dates[0]);
    const lastDate = formatBRDate(dates[dates.length - 1]);
    dateRangeText = firstDate === lastDate ? firstDate : `${firstDate} a ${lastDate}`;
  }

  return {
    totalSales,
    totalTarget,
    targetAchievementPct,
    ticketMedio,
    totalTransactions,
    totalQuantity: totalQuantity || filteredRows.length,
    grossMarginPct,
    totalProfit,
    totalCost,
    storeCount: stores.size,
    productCount: products.size,
    categoryCount: categories.size,
    recordCount: filteredRows.length,
    dateRangeText,
    hasTargetData,
    hasTicketData,
    hasMarginData
  };
}

/**
 * Computes Store Ranking & Performance
 */
export function getStorePerformance(
  rows: RawRow[], 
  mapping: ColumnMapping
): StorePerformance[] {
  if (!mapping.storeCol) return [];

  const storeMap = new Map<string, { sales: number; transactions: Set<string>; rows: RawRow[] }>();

  rows.forEach(r => {
    const store = String(r[mapping.storeCol!] || 'Não informada').trim();
    if (!storeMap.has(store)) {
      storeMap.set(store, { sales: 0, transactions: new Set(), rows: [] });
    }
    const item = storeMap.get(store)!;
    item.rows.push(r);

    if (mapping.salesCol) {
      const s = parseBrazilianNumber(r[mapping.salesCol]);
      if (s !== null) item.sales += s;
    }

    if (mapping.transactionCol && r[mapping.transactionCol]) {
      item.transactions.add(String(r[mapping.transactionCol]));
    }
  });

  const list: StorePerformance[] = [];

  storeMap.forEach((val, store) => {
    const target = calculateDeduplicatedTarget(val.rows, mapping);
    const achievementPct = target > 0 ? (val.sales / target) * 100 : null;
    const txCount = val.transactions.size > 0 ? val.transactions.size : val.rows.length;
    const ticketMedio = txCount > 0 ? val.sales / txCount : null;

    list.push({
      store,
      totalSales: val.sales,
      target,
      achievementPct,
      transactionCount: txCount,
      ticketMedio
    });
  });

  // Sort by Total Sales descending
  return list.sort((a, b) => b.totalSales - a.totalSales);
}

/**
 * Computes Category Performance & Share
 */
export function getCategoryPerformance(
  rows: RawRow[], 
  mapping: ColumnMapping, 
  totalSales: number
): CategoryPerformance[] {
  if (!mapping.categoryCol) return [];

  const catMap = new Map<string, { sales: number; products: Set<string>; qty: number }>();

  rows.forEach(r => {
    const cat = String(r[mapping.categoryCol!] || 'Outros').trim();
    if (!catMap.has(cat)) {
      catMap.set(cat, { sales: 0, products: new Set(), qty: 0 });
    }
    const item = catMap.get(cat)!;

    if (mapping.salesCol) {
      const s = parseBrazilianNumber(r[mapping.salesCol]);
      if (s !== null) item.sales += s;
    }

    if (mapping.productCol && r[mapping.productCol]) {
      item.products.add(String(r[mapping.productCol]));
    }

    if (mapping.quantityCol) {
      const q = parseBrazilianNumber(r[mapping.quantityCol]);
      if (q !== null) item.qty += q;
    }
  });

  const list: CategoryPerformance[] = [];
  catMap.forEach((val, cat) => {
    list.push({
      category: cat,
      totalSales: val.sales,
      sharePct: totalSales > 0 ? (val.sales / totalSales) * 100 : 0,
      productCount: val.products.size,
      quantity: val.qty
    });
  });

  return list.sort((a, b) => b.totalSales - a.totalSales);
}

/**
 * Computes Top Products Ranking
 */
export function getProductPerformance(
  rows: RawRow[], 
  mapping: ColumnMapping
): ProductPerformance[] {
  if (!mapping.productCol) return [];

  const prodMap = new Map<string, { category: string; sales: number; qty: number }>();

  rows.forEach(r => {
    const prod = String(r[mapping.productCol!] || 'Produto sem nome').trim();
    const cat = mapping.categoryCol ? String(r[mapping.categoryCol] || 'Geral').trim() : 'Geral';

    if (!prodMap.has(prod)) {
      prodMap.set(prod, { category: cat, sales: 0, qty: 0 });
    }
    const item = prodMap.get(prod)!;

    if (mapping.salesCol) {
      const s = parseBrazilianNumber(r[mapping.salesCol]);
      if (s !== null) item.sales += s;
    }

    if (mapping.quantityCol) {
      const q = parseBrazilianNumber(r[mapping.quantityCol]);
      if (q !== null) item.qty += q;
    }
  });

  const list: ProductPerformance[] = [];
  prodMap.forEach((val, prod) => {
    list.push({
      product: prod,
      category: val.category,
      totalSales: val.sales,
      quantity: val.qty
    });
  });

  return list.sort((a, b) => b.totalSales - a.totalSales).slice(0, 10);
}

/**
 * Computes Timeline Chart Data
 */
export function getTimepointSales(
  rows: RawRow[], 
  mapping: ColumnMapping
): TimepointSales[] {
  if (!mapping.dateCol) return [];

  const timeMap = new Map<string, { sales: number; rows: RawRow[] }>();

  rows.forEach(r => {
    const d = parseDateValue(r[mapping.dateCol!]);
    if (!d) return;

    if (!timeMap.has(d)) {
      timeMap.set(d, { sales: 0, rows: [] });
    }
    const item = timeMap.get(d)!;
    item.rows.push(r);

    if (mapping.salesCol) {
      const s = parseBrazilianNumber(r[mapping.salesCol]);
      if (s !== null) item.sales += s;
    }
  });

  const sortedDates = Array.from(timeMap.keys()).sort();
  return sortedDates.map(dateStr => {
    const item = timeMap.get(dateStr)!;
    const target = calculateDeduplicatedTarget(item.rows, mapping);
    return {
      date: dateStr,
      displayDate: formatBRDate(dateStr),
      sales: item.sales,
      target: target > 0 ? target : undefined
    };
  });
}

/**
 * Generates Code-Calculated Executive Answers
 */
export function generateOperationalAnswers(
  kpis: KPICalculation,
  stores: StorePerformance[],
  categories: CategoryPerformance[],
  products: ProductPerformance[]
): OperationalAnswer[] {
  const answers: OperationalAnswer[] = [];

  // 1. Metas & Performance Geral
  if (kpis.hasTargetData && kpis.targetAchievementPct !== null) {
    const aboveCount = stores.filter(s => (s.achievementPct || 0) >= 100).length;
    const belowCount = stores.length - aboveCount;
    const isAboveTotal = kpis.targetAchievementPct >= 100;

    answers.push({
      id: 'metas_geral',
      question: 'A rede está atingindo a meta de vendas estabelecida?',
      category: 'metas',
      answerText: `A rede de lojas acumulou ${formatBRCurrency(kpis.totalSales)} contra uma meta projetada de ${formatBRCurrency(kpis.totalTarget)}, resultando em ${kpis.targetAchievementPct.toFixed(1)}% de atingimento global. ${
        isAboveTotal 
          ? 'Parabéns! A operação superou a meta geral do período.' 
          : `Existe um gap operacional de ${formatBRCurrency(kpis.totalTarget - kpis.totalSales)} para atingir os 100%.`
      }`,
      metricBadge: `${kpis.targetAchievementPct.toFixed(1)}% Atingimento`,
      tableData: stores.slice(0, 5).map(s => ({
        'Loja': s.store,
        'Vendas (R$)': formatBRCurrency(s.totalSales),
        'Meta (R$)': formatBRCurrency(s.target),
        'Atingimento': s.achievementPct ? `${s.achievementPct.toFixed(1)}%` : 'N/I'
      })),
      recommendation: stores.length > 0 
        ? `${aboveCount} loja(s) superaram 100% da meta. Priorizar alocação de estoque e incentivos nas ${belowCount} loja(s) abaixo da meta.`
        : undefined
    });
  }

  // 2. Ranking de Lojas
  if (stores.length > 0) {
    const topStore = stores[0];
    const lastStore = stores[stores.length - 1];

    answers.push({
      id: 'ranking_lojas',
      question: 'Quais são as lojas de maior e menor faturamento da operação?',
      category: 'lojas',
      answerText: `A unidade lider de faturamento é a ${topStore.store}, totalizando ${formatBRCurrency(topStore.totalSales)}${topStore.achievementPct ? ` (${topStore.achievementPct.toFixed(1)}% da meta)` : ''}. A menor contribuição no período foi da ${lastStore.store}, com ${formatBRCurrency(lastStore.totalSales)}.`,
      metricBadge: `Líder: ${topStore.store}`,
      tableData: stores.map(s => ({
        'Loja': s.store,
        'Vendas': formatBRCurrency(s.totalSales),
        'Ticket Médio': s.ticketMedio ? formatBRCurrency(s.ticketMedio) : '-',
        'Transações': s.transactionCount
      })),
      recommendation: `Disseminar as práticas de atendimento e sortimento da ${topStore.store} para alavancar os resultados da ${lastStore.store}.`
    });
  }

  // 3. Categorias e Produtos
  if (categories.length > 0) {
    const topCat = categories[0];
    answers.push({
      id: 'categorias_destaque',
      question: 'Qual a categoria de produtos mais expressiva nas vendas?',
      category: 'produtos',
      answerText: `A categoria de destaque é "${topCat.category}", gerando ${formatBRCurrency(topCat.totalSales)} e representando ${topCat.sharePct.toFixed(1)}% de todo o faturamento da rede.`,
      metricBadge: `${topCat.sharePct.toFixed(1)}% Share de Vendas`,
      tableData: categories.map(c => ({
        'Categoria': c.category,
        'Vendas (R$)': formatBRCurrency(c.totalSales),
        'Participação': `${c.sharePct.toFixed(1)}%`,
        'Qtd Produtos': c.productCount
      }))
    });
  }

  // 4. Ticket Médio
  if (kpis.hasTicketData && kpis.ticketMedio !== null) {
    answers.push({
      id: 'ticket_medio',
      question: 'Qual o valor do ticket médio das compras e como ele se comporta?',
      category: 'lojas',
      answerText: `O ticket médio consolidado da operação é de ${formatBRCurrency(kpis.ticketMedio)}, com base em ${formatBRNumber(kpis.totalTransactions)} transações registradas no período analisado.`,
      metricBadge: `${formatBRCurrency(kpis.ticketMedio)} Ticket Médio`
    });
  }

  // 5. Margem Bruta
  if (kpis.hasMarginData && kpis.grossMarginPct !== null) {
    answers.push({
      id: 'margem_bruta',
      question: 'Qual a rentabilidade e margem bruta da operação?',
      category: 'margem',
      answerText: `A margem bruta calculada é de ${kpis.grossMarginPct.toFixed(1)}%, gerando um lucro bruto de ${formatBRCurrency(kpis.totalProfit || 0)} sobre um custo total de ${formatBRCurrency(kpis.totalCost)}.`,
      metricBadge: `${kpis.grossMarginPct.toFixed(1)}% Margem Bruta`
    });
  }

  return answers;
}
