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
// Customization, Widgets & PPTX Types
// --------------------------------------------------

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

export type ChartType = 'area' | 'bar' | 'horizontalBar' | 'pie' | 'table';

export interface DashboardWidgetConfig {
  id: string;
  title: string;
  type: 'kpi' | 'chart';
  kpiId?: KPIId;
  chartType?: ChartType;
  dimensionRole?: ColumnRole;
  metricRole?: ColumnRole;
  visibleInDashboard: boolean;
  visibleInPresentation: boolean;
}

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
  adaptationNotes?: string[];
}

export interface SlideConfig {
  id: string;
  title: string;
  layoutType: 'title' | 'kpis' | 'chart_and_insights' | 'ranking_table' | 'recommendations';
  selectedKpiIds: KPIId[];
  selectedWidgetIds: string[];
  meetingObjective?: string;
  customNotes?: string;
  visible: boolean;
}

export interface PresentationSnapshot {
  generatedAt: string;
  activeDatasetName: string;
  filterState: FilterState;
  kpis: KPICalculation;
  theme: PPTXTheme;
  slides: SlideConfig[];
}
