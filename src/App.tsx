import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ImportModule } from './components/ImportModule';
import { FilterBar } from './components/FilterBar';
import { DashboardModule } from './components/DashboardModule';
import { CustomizationPanel } from './components/CustomizationPanel';
import { QuestionsModule } from './components/QuestionsModule';
import { PresentationModule } from './components/PresentationModule';
import { SettingsModule } from './components/SettingsModule';
import { ChartBuilderModal } from './components/ChartBuilderModal';
import { ChartEditorDrawer } from './components/ChartEditorDrawer';
import { 
  ColumnMapping, 
  CustomCalculatedMetric,
  CustomChartConfig, 
  FilterState, 
  KPIId, 
  KPISelectionState, 
  OrgSettings, 
  ProjectSettings, 
  SheetData, 
  UserProfile, 
  UserRole 
} from './types/analytics';
import { parseFile, extractSheetData } from './services/dataParser';
import { createDefaultMapping } from './services/columnMapper';
import { 
  filterRows, 
  calculateKPIs, 
  getStorePerformance, 
  getCategoryPerformance, 
  getProductPerformance, 
  getTimepointSales, 
  generateOperationalAnswers 
} from './services/analyticsEngine';
import { getDemoSheetData } from './services/demoData';
import { getActiveUserSession, setActiveUserRole } from './services/authService';
import { DEFAULT_ORG_THEME, resolveEffectiveTheme } from './services/settingsCascadeEngine';
import * as XLSX from 'xlsx';

const DEFAULT_KPI_SELECTIONS: Record<KPIId, KPISelectionState> = {
  total_sales: { showInDashboard: true, showInPresentation: true },
  total_target: { showInDashboard: true, showInPresentation: true },
  target_achievement: { showInDashboard: true, showInPresentation: true },
  ticket_medio: { showInDashboard: true, showInPresentation: true },
  gross_margin: { showInDashboard: true, showInPresentation: true },
  total_profit: { showInDashboard: true, showInPresentation: true },
  total_quantity: { showInDashboard: true, showInPresentation: true },
  transaction_count: { showInDashboard: true, showInPresentation: true },
  active_stores: { showInDashboard: true, showInPresentation: true }
};

export function App() {
  const [activeTab, setActiveTab] = useState<'import' | 'dashboard' | 'customization' | 'questions' | 'presentation' | 'settings'>('import');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  
  // User Session & Role State
  const [currentUser, setCurrentUser] = useState<UserProfile>(getActiveUserSession());

  // Cascading Settings State
  const [orgSettings, setOrgSettings] = useState<OrgSettings>({
    id: 'org_auraops_default',
    name: 'AuraOps Retail Corporation',
    brandTheme: DEFAULT_ORG_THEME,
    officialKPIFormulas: []
  });

  const [projectSettings, setProjectSettings] = useState<ProjectSettings>({
    id: 'prj_cosmeticos_sep',
    name: 'Relatório Vendas Cosméticos',
    chartStyles: {
      seriesColors: ['#011E38', '#264FEC', '#FFBC82', '#059669', '#6366f1', '#8b5cf6', '#ec4899'],
      legendPosition: 'bottom',
      showDataLabels: true,
      showGridlines: true
    },
    selectedKpis: Object.keys(DEFAULT_KPI_SELECTIONS) as KPIId[]
  });

  // Custom Chart Configurator Modal State
  const [showChartModal, setShowChartModal] = useState<boolean>(false);
  const [editingChartConfig, setEditingChartConfig] = useState<CustomChartConfig | null>(null);
  const [customChartsList, setCustomChartsList] = useState<CustomChartConfig[]>([]);
  const [customCalculatedMetrics, setCustomCalculatedMetrics] = useState<CustomCalculatedMetric[]>([]);

  // File & Sheet state
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [currentSheetName, setCurrentSheetName] = useState<string>('');
  const [sheetData, setSheetData] = useState<SheetData | null>(null);
  const [currentFileName, setCurrentFileName] = useState<string>('');
  const [mapping, setMapping] = useState<ColumnMapping>({
    dateCol: null,
    storeCol: null,
    categoryCol: null,
    productCol: null,
    salesCol: null,
    targetCol: null,
    costCol: null,
    transactionCol: null,
    quantityCol: null,
    metaGranularity: 'store_month'
  });
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);

  // Customization Selections State
  const [kpiSelections, setKpiSelections] = useState<Record<KPIId, KPISelectionState>>(DEFAULT_KPI_SELECTIONS);

  // Filters State
  const [filters, setFilters] = useState<FilterState>({
    startDate: '',
    endDate: '',
    selectedStores: [],
    selectedCategories: [],
    searchQuery: ''
  });

  // Auto-load Demo Data on initial mount
  useEffect(() => {
    loadDemoData();
  }, []);

  const handleRoleChange = (role: UserRole) => {
    const updated = setActiveUserRole(role);
    setCurrentUser(updated);
  };

  const handleOpenChartConfigurator = (chart?: CustomChartConfig) => {
    setEditingChartConfig(chart || null);
    setShowChartModal(true);
  };

  const handleSaveChartFromModal = (chart: CustomChartConfig, scopeAction: string = 'current') => {
    if (scopeAction === 'style_all') {
      setCustomChartsList(prev => prev.map(c => ({
        ...c,
        primaryColor: chart.primaryColor,
        secondaryColor: chart.secondaryColor,
        accentColor: chart.accentColor,
        cardBgColor: chart.cardBgColor,
        fontFamily: chart.fontFamily
      })));
    } else {
      setCustomChartsList(prev => {
        const idx = prev.findIndex(c => c.id === chart.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = chart;
          return next;
        }
        return [...prev, chart];
      });
    }
  };

  const loadDemoData = () => {
    const { sheetData: demoData, mapping: demoMap } = getDemoSheetData();
    setSheetNames(['Vendas_Setembro_Demo']);
    setCurrentSheetName('Vendas_Setembro_Demo');
    setSheetData(demoData);
    setMapping(demoMap);
    setCurrentFileName('Planilha Exemplo Demonstrativa (Cosméticos)');
    setIsDemoMode(true);
    setFilters({
      startDate: '',
      endDate: '',
      selectedStores: [],
      selectedCategories: [],
      searchQuery: ''
    });
  };

  const handleFileUpload = async (file: File) => {
    try {
      const { workbook: parsedWb, sheetNames: names } = await parseFile(file);
      setWorkbook(parsedWb);
      setSheetNames(names);
      setCurrentFileName(file.name);
      
      const firstSheet = names[0];
      setCurrentSheetName(firstSheet);
      
      const extracted = extractSheetData(parsedWb, firstSheet);
      setSheetData(extracted);
      
      const defaultMap = createDefaultMapping(extracted.columnsMeta);
      setMapping(defaultMap);
      setIsDemoMode(false);
      
      setFilters({
        startDate: '',
        endDate: '',
        selectedStores: [],
        selectedCategories: [],
        searchQuery: ''
      });
      setActiveTab('import');
    } catch (err) {
      alert('Erro ao ler arquivo. Verifique se o formato é um Excel (.xlsx, .xls) ou CSV válido.');
    }
  };

  const handleSelectSheet = (sheetName: string) => {
    if (!workbook) return;
    setCurrentSheetName(sheetName);
    const extracted = extractSheetData(workbook, sheetName);
    setSheetData(extracted);
    const defaultMap = createDefaultMapping(extracted.columnsMeta);
    setMapping(defaultMap);
  };

  const handleReset = () => {
    setWorkbook(null);
    setSheetNames([]);
    setCurrentSheetName('');
    setCurrentFileName('');
    setSheetData(null);
    setMapping({
      dateCol: null,
      storeCol: null,
      categoryCol: null,
      productCol: null,
      salesCol: null,
      targetCol: null,
      costCol: null,
      transactionCol: null,
      quantityCol: null,
      metaGranularity: 'store_month'
    });
    setIsDemoMode(false);
    setActiveTab('import');
  };

  const handleCopyDashboardToPresentation = () => {
    const updated = { ...kpiSelections };
    Object.keys(updated).forEach(k => {
      const id = k as KPIId;
      updated[id] = {
        ...updated[id],
        showInPresentation: updated[id].showInDashboard
      };
    });
    setKpiSelections(updated);
    alert('Seleção do Dashboard copiada para as Apresentações com sucesso!');
  };

  // Filtered rows calculation
  const filteredRows = useMemo(() => {
    if (!sheetData) return [];
    return filterRows(sheetData.rows, mapping, filters);
  }, [sheetData, mapping, filters]);

  // Analytics Calculations
  const kpis = useMemo(() => {
    return calculateKPIs(filteredRows, mapping);
  }, [filteredRows, mapping]);

  const stores = useMemo(() => {
    return getStorePerformance(filteredRows, mapping);
  }, [filteredRows, mapping]);

  const categories = useMemo(() => {
    return getCategoryPerformance(filteredRows, mapping, kpis.totalSales);
  }, [filteredRows, mapping, kpis.totalSales]);

  const products = useMemo(() => {
    return getProductPerformance(filteredRows, mapping);
  }, [filteredRows, mapping]);

  const timeline = useMemo(() => {
    return getTimepointSales(filteredRows, mapping);
  }, [filteredRows, mapping]);

  const answers = useMemo(() => {
    return generateOperationalAnswers(kpis, stores, categories, products);
  }, [kpis, stores, categories, products]);

  // Available filters
  const availableStores = useMemo(() => {
    if (!sheetData || !mapping.storeCol) return [];
    const set = new Set<string>();
    sheetData.rows.forEach(r => {
      if (r[mapping.storeCol!]) set.add(String(r[mapping.storeCol!]).trim());
    });
    return Array.from(set).sort();
  }, [sheetData, mapping.storeCol]);

  const availableCategories = useMemo(() => {
    if (!sheetData || !mapping.categoryCol) return [];
    const set = new Set<string>();
    sheetData.rows.forEach(r => {
      if (r[mapping.categoryCol!]) set.add(String(r[mapping.categoryCol!]).trim());
    });
    return Array.from(set).sort();
  }, [sheetData, mapping.categoryCol]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans antialiased overflow-x-hidden">
      
      {/* Sidebar Navigation Drawer */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDemoMode={isDemoMode}
        onLoadDemo={loadDemoData}
        recordCount={sheetData ? sheetData.rows.length : 0}
        isOpenOnMobile={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content View */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        
        {/* Topbar Header */}
        <Header
          isDemoMode={isDemoMode}
          onLoadDemo={loadDemoData}
          onReset={handleReset}
          recordCount={sheetData ? sheetData.rows.length : 0}
          currentFileName={currentFileName}
          currentSheetName={currentSheetName}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
        />

        {/* Content Container */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
          
          {/* Global Filter Bar */}
          {activeTab !== 'import' && activeTab !== 'settings' && sheetData && (
            <FilterBar
              filters={filters}
              onFilterChange={setFilters}
              availableStores={availableStores}
              availableCategories={availableCategories}
              totalFilteredRecords={filteredRows.length}
              totalRecords={sheetData.rows.length}
              dateRangeText={kpis.dateRangeText}
            />
          )}

          {/* Tab 1: Dados (Importação) */}
          {activeTab === 'import' && (
            <ImportModule
              sheetNames={sheetNames}
              currentSheetName={currentSheetName}
              onSelectSheet={handleSelectSheet}
              sheetData={sheetData}
              mapping={mapping}
              onUpdateMapping={setMapping}
              onFileUpload={handleFileUpload}
              onLoadDemo={loadDemoData}
              onConfirmAndNavigate={() => setActiveTab('dashboard')}
              isDemoMode={isDemoMode}
              currentFileName={currentFileName}
              kpiSelections={kpiSelections}
              onUpdateKpiSelections={setKpiSelections}
            />
          )}

          {/* Tab 2: Dashboard */}
          {activeTab === 'dashboard' && (
            <DashboardModule
              kpis={kpis}
              stores={stores}
              categories={categories}
              products={products}
              timeline={timeline}
              dateRangeText={kpis.dateRangeText}
              customCharts={customChartsList}
              onOpenChartConfigurator={handleOpenChartConfigurator}
            />
          )}

          {/* Tab 3: Personalizar */}
          {activeTab === 'customization' && (
            <CustomizationPanel
              sheetData={sheetData}
              mapping={mapping}
              kpiSelections={kpiSelections}
              onUpdateSelections={setKpiSelections}
              onCopyDashboardToPresentation={handleCopyDashboardToPresentation}
              customCalculatedMetrics={customCalculatedMetrics}
              onSaveCalculatedMetric={(metric) => {
                setCustomCalculatedMetrics(prev => {
                  const idx = prev.findIndex(m => m.id === metric.id);
                  if (idx >= 0) {
                    const next = [...prev];
                    next[idx] = metric;
                    return next;
                  }
                  return [...prev, metric];
                });
              }}
              onDeleteCalculatedMetric={(id) => {
                setCustomCalculatedMetrics(prev => prev.filter(m => m.id !== id));
              }}
            />
          )}

          {/* Tab 4: Perguntas à IA */}
          {activeTab === 'questions' && (
            <QuestionsModule answers={answers} />
          )}

          {/* Tab 5: Apresentações */}
          {activeTab === 'presentation' && (
            <PresentationModule
              kpis={kpis}
              stores={stores}
              categories={categories}
              dateRangeText={kpis.dateRangeText}
              activeDatasetName={currentFileName || 'Vendas Cosméticos'}
              kpiSelections={kpiSelections}
              customCharts={customChartsList}
              onOpenChartConfigurator={handleOpenChartConfigurator}
            />
          )}

          {/* Tab 6: Configurações & Governança */}
          {activeTab === 'settings' && (
            <SettingsModule
              currentUser={currentUser}
              onUserRoleChange={handleRoleChange}
              orgSettings={orgSettings}
              onUpdateOrgSettings={setOrgSettings}
              projectSettings={projectSettings}
              onUpdateProjectSettings={setProjectSettings}
            />
          )}

        </main>

      </div>

      {/* CHART EDITOR DRAWER */}
      {showChartModal && (
        <ChartEditorDrawer
          sheetData={sheetData}
          chartConfig={editingChartConfig || {
            id: `chart_${Date.now()}`,
            title: 'Novo Gráfico Personalizado',
            metricHeader: sheetData?.headers[0] || 'Vendas',
            dimensionHeader: sheetData?.headers[1] || 'Loja',
            chartType: 'bar',
            aggregation: 'sum',
            sortOrder: 'desc',
            limitTopN: 0,
            showInDashboard: true,
            showInPresentation: true,
            primaryColor: '#011E38',
            secondaryColor: '#264FEC',
            accentColor: '#FFBC82',
            cardBgColor: '#F5F1EB',
            fontFamily: 'IBM Plex Sans',
            showLegend: true,
            showValues: true,
            showGridlines: true,
            numberFormat: 'currency',
            decimalPlaces: 2
          }}
          onSaveChart={(chart) => {
            handleSaveChartFromModal(chart);
            setShowChartModal(false);
          }}
          onClose={() => setShowChartModal(false)}
        />
      )}

    </div>
  );
}
