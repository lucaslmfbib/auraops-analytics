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

// --------------------------------------------------
// Custom Metrics & Custom Charts Models
// --------------------------------------------------

export type MetricAggregation = 'sum' | 'avg' | 'count' | 'count_distinct';

export interface CustomMetricConfig {
  id: string;
  name: string;
  columnHeader: string;
  aggregation: MetricAggregation;
  showInDashboard: boolean;
  showInPresentation: boolean;
}

export interface CustomCalculatedMetric {
  id: string;
  name: string;
  formulaExpr: string; // e.g., "(Sales - Cost) / Sales"
  columnA: string;
  columnB: string;
  operator: '-' | '/' | '*' | '+';
  unit: string;
}

export type ChartType = 'area' | 'bar' | 'horizontalBar' | 'line' | 'pie' | 'table';

export interface CustomChartConfig {
  id: string;
  title: string;
  chartType: ChartType;
  dimensionHeader: string;
  metricHeader: string;
  aggregation: MetricAggregation;
  sortOrder: 'desc' | 'asc' | 'alpha';
  limitTopN: number; // 0 for all, or 5, 10
  showInDashboard: boolean;
  showInPresentation: boolean;
}

export type KPIId = 
  | 'total_sales'
  | 'total_target'
  | 'target_achievement'
  | 'ticket_medio'
  | 'gross_margin'
  | 'total_profit'
  | 'total_quantity'
  | 'transaction_count'
  | 'active_stores';

export interface KPIDefinition {
  id: KPIId;
  name: string;
  category: 'Vendas' | 'Metas' | 'Rentabilidade' | 'Volume';
  formula: string;
  unit: string;
  requiredRoles: ColumnRole[];
  description: string;
}

export interface KPISelectionState {
  showInDashboard: boolean;
  showInPresentation: boolean;
}

// --------------------------------------------------
// PPTX Template & Flexible Slide Models
// --------------------------------------------------

export interface PPTXTheme {
  id: string;
  name: string;
  isExternal: boolean;
  primaryColor: string; // Hex e.g. #064e3b
  secondaryColor: string; // Hex e.g. #10b981
  backgroundColor: string; // Hex e.g. #0f172a
  textColor: string; // Hex e.g. #ffffff
  cardColor: string; // Hex e.g. #1e293b
  headerFont: string;
  bodyFont: string;
  aspectRatio: '16:9' | '4:3';
  extractedImages?: string[]; // base64 or data URLs of logos/backgrounds
  detectedLayouts?: string[];
  adaptationNotes?: string[];
}

export type SlideLayoutId = 
  | 'cover'
  | 'executive_kpis'
  | 'chart_and_insights'
  | 'ranking_table'
  | 'recommendations'
  | 'custom_content';

export interface SlideItemConfig {
  id: string; // slide id
  title: string;
  description: string;
  layoutId: SlideLayoutId;
  selectedKpis: KPIId[];
  selectedChartIds: string[];
  customText?: string;
  meetingContext?: string;
  visible: boolean;
}

export interface PresentationSnapshot {
  generatedAt: string;
  activeDatasetName: string;
  filterState: FilterState;
  kpis: KPICalculation;
  theme: PPTXTheme;
  slides: SlideItemConfig[];
}
