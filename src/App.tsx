import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ImportModule } from './components/ImportModule';
import { FilterBar } from './components/FilterBar';
import { DashboardModule } from './components/DashboardModule';
import { QuestionsModule } from './components/QuestionsModule';
import { PresentationModule } from './components/PresentationModule';
import { 
  ColumnMapping, 
  FilterState, 
  SheetData 
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
import * as XLSX from 'xlsx';

export function App() {
  const [activeTab, setActiveTab] = useState<'import' | 'dashboard' | 'questions' | 'presentation'>('import');
  
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
      
      // Reset filters
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

  // Unique store and category lists for filters
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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans antialiased">
      
      {/* Sidebar Navigation Menu */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDemoMode={isDemoMode}
        onLoadDemo={loadDemoData}
        recordCount={sheetData ? sheetData.rows.length : 0}
      />

      {/* Main Right Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        
        {/* Header Topbar */}
        <Header
          isDemoMode={isDemoMode}
          onLoadDemo={loadDemoData}
          onReset={handleReset}
          recordCount={sheetData ? sheetData.rows.length : 0}
          currentFileName={currentFileName}
          currentSheetName={currentSheetName}
        />

        {/* Content Container */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          
          {/* Global Filter Bar (Shown in Dashboard, Questions, and Presentation tabs) */}
          {activeTab !== 'import' && sheetData && (
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
            />
          )}

          {/* Tab 3: Perguntas à IA */}
          {activeTab === 'questions' && (
            <QuestionsModule answers={answers} />
          )}

          {/* Tab 4: Apresentações */}
          {activeTab === 'presentation' && (
            <PresentationModule
              kpis={kpis}
              stores={stores}
              categories={categories}
              dateRangeText={kpis.dateRangeText}
            />
          )}

        </main>

      </div>

    </div>
  );
}
