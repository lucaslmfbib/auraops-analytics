export type ColumnRole = 
  | 'date'
  | 'store'
  | 'category'
  | 'product'
  | 'sales'
  | 'target'
  | 'cost'
  | 'transaction_id'
  | 'quantity'
  | 'ignore';

export type ColumnType = 'date' | 'number' | 'currency' | 'string' | 'unknown';

export interface ColumnMeta {
  name: string;
  guessedRole: ColumnRole;
  inferredType: ColumnType;
  sampleValues: any[];
  nullCount: number;
  invalidCount: number;
}

export type MetaGranularity = 'store_month' | 'store_period' | 'row_by_row';

export interface ColumnMapping {
  dateCol: string | null;
  storeCol: string | null;
  categoryCol: string | null;
  productCol: string | null;
  salesCol: string | null;
  targetCol: string | null;
  costCol: string | null;
  transactionCol: string | null;
  quantityCol: string | null;
  metaGranularity: MetaGranularity;
}

export interface QualityAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  title: string;
  description: string;
  count: number;
  details?: string[];
}

export interface RawRow {
  [key: string]: any;
}

export interface SheetData {
  sheetName: string;
  rows: RawRow[];
  headers: string[];
  columnsMeta: ColumnMeta[];
  qualityAlerts: QualityAlert[];
  duplicateRowCount: number;
}

export interface FilterState {
  startDate: string;
  endDate: string;
  selectedStores: string[];
  selectedCategories: string[];
  searchQuery: string;
}

export interface KPICalculation {
  totalSales: number;
  totalTarget: number;
  targetAchievementPct: number | null;
  ticketMedio: number | null;
  totalTransactions: number;
  totalQuantity: number;
  grossMarginPct: number | null;
  totalProfit: number | null;
  totalCost: number;
  storeCount: number;
  productCount: number;
  categoryCount: number;
  recordCount: number;
  dateRangeText: string;
  hasTargetData: boolean;
  hasTicketData: boolean;
  hasMarginData: boolean;
}

export interface StorePerformance {
  store: string;
  totalSales: number;
  target: number;
  achievementPct: number | null;
  transactionCount: number;
  ticketMedio: number | null;
}

export interface CategoryPerformance {
  category: string;
  totalSales: number;
  sharePct: number;
  productCount: number;
  quantity: number;
}

export interface ProductPerformance {
  product: string;
  category: string;
  totalSales: number;
  quantity: number;
}

export interface TimepointSales {
  date: string;
  displayDate: string;
  sales: number;
  target?: number;
}

export interface OperationalAnswer {
  id: string;
  question: string;
  category: 'metas' | 'lojas' | 'produtos' | 'margem';
  answerText: string;
  metricBadge?: string;
  tableData?: Array<{ [key: string]: string | number }>;
  recommendation?: string;
}
