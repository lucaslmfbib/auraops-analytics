import pptxgen from 'pptxgenjs';
import { 
  CategoryPerformance, 
  KPICalculation, 
  PresentationSnapshot, 
  PPTXTheme, 
  StorePerformance 
} from '../types/analytics';
import { formatBRCurrency, formatBRDate } from './dataParser';

/**
 * Generates a real, valid, fully-editable PowerPoint (.pptx) file
 * using pptxgenjs library.
 */
export async function generatePPTXFile(
  snapshot: PresentationSnapshot,
  stores: StorePerformance[],
  categories: CategoryPerformance[]
): Promise<void> {
  const pptx = new pptxgen();

  const theme: PPTXTheme = snapshot.theme || {
    id: 'default',
    name: 'Verde Varejo Executivo',
    isExternal: false,
    primaryColor: '#064e3b',
    secondaryColor: '#10b981',
    backgroundColor: '#0f172a',
    textColor: '#ffffff',
    cardColor: '#1e293b',
    headerFont: 'Arial',
    bodyFont: 'Arial',
    aspectRatio: '16:9'
  };

  // Set layout ratio
  pptx.layout = theme.aspectRatio === '4:3' ? 'LAYOUT_4x3' : 'LAYOUT_16x9';

  // Format date
  const generationDate = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // ----------------------------------------------------
  // SLIDE 1: Capa da Apresentação
  // ----------------------------------------------------
  const slide1 = pptx.addSlide();
  slide1.background = { color: theme.backgroundColor.replace('#', '') };

  // Decorative Bar
  slide1.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: '100%',
    h: 0.15,
    fill: { color: theme.secondaryColor.replace('#', '') }
  });

  // Main Title
  slide1.addText('AuraOps Analytics', {
    x: 0.8,
    y: 1.8,
    w: 8.5,
    h: 0.8,
    fontFace: theme.headerFont,
    fontSize: 36,
    bold: true,
    color: theme.secondaryColor.replace('#', '')
  });

  slide1.addText('Relatório Executivo de Inteligência Operacional', {
    x: 0.8,
    y: 2.6,
    w: 8.5,
    h: 0.5,
    fontFace: theme.bodyFont,
    fontSize: 20,
    color: 'FFFFFF'
  });

  // Metadata Card Box
  slide1.addShape(pptx.ShapeType.roundRect, {
    x: 0.8,
    y: 3.6,
    w: 8.4,
    h: 2.0,
    fill: { color: theme.cardColor.replace('#', '') },
    line: { color: theme.secondaryColor.replace('#', ''), width: 1 }
  });

  slide1.addText([
    { text: `Base Analisada: `, options: { bold: true, color: '94A3B8' } },
    { text: `${snapshot.activeDatasetName}\n`, options: { color: 'FFFFFF' } },
    { text: `Período do Snapshot: `, options: { bold: true, color: '94A3B8' } },
    { text: `${snapshot.kpis.dateRangeText}\n`, options: { color: 'FFFFFF' } },
    { text: `Data de Geração: `, options: { bold: true, color: '94A3B8' } },
    { text: `${generationDate}\n`, options: { color: 'FFFFFF' } },
    { text: `Desenvolvido por: `, options: { bold: true, color: '94A3B8' } },
    { text: `Lucas Martins`, options: { bold: true, color: '10B981' } }
  ], {
    x: 1.1,
    y: 3.8,
    w: 7.8,
    h: 1.6,
    fontFace: theme.bodyFont,
    fontSize: 13
  });

  // ----------------------------------------------------
  // SLIDE 2: Indicadores Principais (KPI Cards)
  // ----------------------------------------------------
  const slide2 = pptx.addSlide();
  slide2.background = { color: theme.backgroundColor.replace('#', '') };

  // Header Title
  slide2.addText('Indicadores Chave de Desempenho (KPIs)', {
    x: 0.8,
    y: 0.5,
    w: 8.5,
    h: 0.5,
    fontFace: theme.headerFont,
    fontSize: 24,
    bold: true,
    color: theme.secondaryColor.replace('#', '')
  });

  // KPI 1 Card (Vendas)
  slide2.addShape(pptx.ShapeType.roundRect, {
    x: 0.8, y: 1.4, w: 4.0, h: 2.2,
    fill: { color: theme.cardColor.replace('#', '') },
    line: { color: '10B981', width: 2 }
  });
  slide2.addText('VENDAS TOTAIS (FATURAMENTO)', {
    x: 1.0, y: 1.6, w: 3.6, h: 0.3,
    fontSize: 11, bold: true, color: '94A3B8'
  });
  slide2.addText(formatBRCurrency(snapshot.kpis.totalSales), {
    x: 1.0, y: 2.1, w: 3.6, h: 0.6,
    fontSize: 24, bold: true, color: '10B981'
  });
  slide2.addText(`${snapshot.kpis.recordCount} registros computados`, {
    x: 1.0, y: 3.0, w: 3.6, h: 0.3,
    fontSize: 10, color: 'CBD5E1'
  });

  // KPI 2 Card (Meta)
  slide2.addShape(pptx.ShapeType.roundRect, {
    x: 5.2, y: 1.4, w: 4.0, h: 2.2,
    fill: { color: theme.cardColor.replace('#', '') },
    line: { color: '8B5CF6', width: 2 }
  });
  slide2.addText('META CONSOLIDADA DA REDE', {
    x: 5.4, y: 1.6, w: 3.6, h: 0.3,
    fontSize: 11, bold: true, color: '94A3B8'
  });
  slide2.addText(
    snapshot.kpis.hasTargetData ? formatBRCurrency(snapshot.kpis.totalTarget) : 'N/I', 
    { x: 5.4, y: 2.1, w: 3.6, h: 0.6, fontSize: 24, bold: true, color: 'C084FC' }
  );
  slide2.addText(
    snapshot.kpis.targetAchievementPct !== null 
      ? `Atingimento: ${snapshot.kpis.targetAchievementPct.toFixed(1)}%` 
      : 'Meta não informada', 
    { x: 5.4, y: 3.0, w: 3.6, h: 0.3, fontSize: 10, color: 'CBD5E1' }
  );

  // KPI 3 Card (Ticket Médio)
  slide2.addShape(pptx.ShapeType.roundRect, {
    x: 0.8, y: 4.0, w: 4.0, h: 2.2,
    fill: { color: theme.cardColor.replace('#', '') },
    line: { color: '3B82F6', width: 2 }
  });
  slide2.addText('TICKET MÉDIO POR TRANSAÇÃO', {
    x: 1.0, y: 4.2, w: 3.6, h: 0.3,
    fontSize: 11, bold: true, color: '94A3B8'
  });
  slide2.addText(
    snapshot.kpis.ticketMedio ? formatBRCurrency(snapshot.kpis.ticketMedio) : 'N/I', 
    { x: 1.0, y: 4.7, w: 3.6, h: 0.6, fontSize: 24, bold: true, color: '60A5FA' }
  );
  slide2.addText(`Base: ${snapshot.kpis.totalTransactions} cupons/pedidos`, {
    x: 1.0, y: 5.6, w: 3.6, h: 0.3,
    fontSize: 10, color: 'CBD5E1'
  });

  // KPI 4 Card (Margem Bruta)
  slide2.addShape(pptx.ShapeType.roundRect, {
    x: 5.2, y: 4.0, w: 4.0, h: 2.2,
    fill: { color: theme.cardColor.replace('#', '') },
    line: { color: 'EC4899', width: 2 }
  });
  slide2.addText('MARGEM BRUTA OPERACIONAL', {
    x: 5.4, y: 4.2, w: 3.6, h: 0.3,
    fontSize: 11, bold: true, color: '94A3B8'
  });
  slide2.addText(
    snapshot.kpis.grossMarginPct ? `${snapshot.kpis.grossMarginPct.toFixed(1)}%` : 'N/I', 
    { x: 5.4, y: 4.7, w: 3.6, h: 0.6, fontSize: 24, bold: true, color: 'F472B6' }
  );
  slide2.addText(
    snapshot.kpis.totalProfit ? `Lucro: ${formatBRCurrency(snapshot.kpis.totalProfit)}` : 'Requer coluna de custos', 
    { x: 5.4, y: 5.6, w: 3.6, h: 0.3, fontSize: 10, color: 'CBD5E1' }
  );

  // ----------------------------------------------------
  // SLIDE 3: Tabela Nativa do PPTX (Ranking de Lojas)
  // ----------------------------------------------------
  if (stores.length > 0) {
    const slide3 = pptx.addSlide();
    slide3.background = { color: theme.backgroundColor.replace('#', '') };

    slide3.addText('Ranking e Desempenho por Loja', {
      x: 0.8, y: 0.5, w: 8.5, h: 0.5,
      fontFace: theme.headerFont, fontSize: 24, bold: true, color: theme.secondaryColor.replace('#', '')
    });

    const tableHeaders = [
      { text: 'Loja / Unidade', options: { bold: true, fill: '064E3B', color: 'FFFFFF' } },
      { text: 'Vendas (R$)', options: { bold: true, fill: '064E3B', color: 'FFFFFF' } },
      { text: 'Meta (R$)', options: { bold: true, fill: '064E3B', color: 'FFFFFF' } },
      { text: 'Atingimento', options: { bold: true, fill: '064E3B', color: 'FFFFFF' } },
      { text: 'Ticket Médio', options: { bold: true, fill: '064E3B', color: 'FFFFFF' } }
    ];

    const tableRows = stores.slice(0, 8).map((s, idx) => [
      { text: s.store, options: { fill: idx % 2 === 0 ? '1E293B' : '0F172A', color: 'FFFFFF' } },
      { text: formatBRCurrency(s.totalSales), options: { fill: idx % 2 === 0 ? '1E293B' : '0F172A', color: '34D399', bold: true } },
      { text: s.target > 0 ? formatBRCurrency(s.target) : '-', options: { fill: idx % 2 === 0 ? '1E293B' : '0F172A', color: 'CBD5E1' } },
      { text: s.achievementPct ? `${s.achievementPct.toFixed(1)}%` : '-', options: { fill: idx % 2 === 0 ? '1E293B' : '0F172A', color: s.achievementPct && s.achievementPct >= 100 ? '34D399' : 'F87171' } },
      { text: s.ticketMedio ? formatBRCurrency(s.ticketMedio) : '-', options: { fill: idx % 2 === 0 ? '1E293B' : '0F172A', color: 'CBD5E1' } }
    ]);

    slide3.addTable([tableHeaders, ...tableRows], {
      x: 0.8,
      y: 1.3,
      w: 8.4,
      fontFace: theme.bodyFont,
      fontSize: 11,
      border: { pt: 0.5, color: '334155' }
    });
  }

  // ----------------------------------------------------
  // SLIDE 4: Recomendações Operacionais
  // ----------------------------------------------------
  const slide4 = pptx.addSlide();
  slide4.background = { color: theme.backgroundColor.replace('#', '') };

  slide4.addText('Recomendações Operacionais e Próximos Passos', {
    x: 0.8, y: 0.5, w: 8.5, h: 0.5,
    fontFace: theme.headerFont, fontSize: 24, bold: true, color: theme.secondaryColor.replace('#', '')
  });

  slide4.addShape(pptx.ShapeType.roundRect, {
    x: 0.8, y: 1.4, w: 8.4, h: 1.4,
    fill: { color: theme.cardColor.replace('#', '') },
    line: { color: '10B981', width: 1 }
  });
  slide4.addText('1. Acompanhamento Diário de Lojas Críticas', {
    x: 1.1, y: 1.6, w: 7.8, h: 0.3, fontSize: 14, bold: true, color: '10B981'
  });
  slide4.addText('Monitorar unidades com atingimento inferior a 90% da meta com ações promocionais focadas em itens de alto ticket.', {
    x: 1.1, y: 2.0, w: 7.8, h: 0.6, fontSize: 11, color: 'CBD5E1'
  });

  slide4.addShape(pptx.ShapeType.roundRect, {
    x: 0.8, y: 3.1, w: 8.4, h: 1.4,
    fill: { color: theme.cardColor.replace('#', '') },
    line: { color: '3B82F6', width: 1 }
  });
  slide4.addText('2. Abastecimento Estratégico de Estoque', {
    x: 1.1, y: 3.3, w: 7.8, h: 0.3, fontSize: 14, bold: true, color: '60A5FA'
  });
  slide4.addText('Garantir estoque contínuo das categorias líderes para evitar rupturas durante horários de pico.', {
    x: 1.1, y: 3.7, w: 7.8, h: 0.6, fontSize: 11, color: 'CBD5E1'
  });

  // Footer Credit
  slide4.addText(`Gerado por Lucas Martins via AuraOps Analytics • ${generationDate}`, {
    x: 0.8, y: 6.8, w: 8.4, h: 0.3,
    fontSize: 9, color: '64748B'
  });

  // Download PPTX File
  const fileName = `AuraOps_Apresentacao_${snapshot.activeDatasetName.replace(/[^a-zA-Z0-9]/g, '_')}.pptx`;
  await pptx.writeFile({ fileName });
}
