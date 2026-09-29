import pptxgen from 'pptxgenjs';
import { 
  CategoryPerformance, 
  PresentationSnapshot, 
  PPTXTheme, 
  SlideItemConfig, 
  StorePerformance 
} from '../types/analytics';
import { formatBRCurrency } from './dataParser';

/**
 * Generates a real, valid, fully-editable PowerPoint (.pptx) file
 * symmetrically exporting user-configured slides across all 6 gallery templates.
 */
export async function generatePPTXFile(
  snapshot: PresentationSnapshot,
  stores: StorePerformance[],
  categories: CategoryPerformance[]
): Promise<void> {
  const pptx = new pptxgen();

  const theme: PPTXTheme = snapshot.theme || {
    id: 'boticario_default',
    name: 'Boticário Institucional',
    isExternal: false,
    primaryColor: '#011E38',
    secondaryColor: '#264FEC',
    backgroundColor: '#011E38',
    textColor: '#F5F1EB',
    cardColor: '#0A2A4A',
    headerFont: 'IBM Plex Sans',
    bodyFont: 'IBM Plex Sans',
    aspectRatio: '16:9'
  };

  pptx.layout = theme.aspectRatio === '4:3' ? 'LAYOUT_4x3' : 'LAYOUT_16x9';

  const generationDate = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const bgColorHex = (theme.backgroundColor || '#0f172a').replace('#', '');
  const primaryHex = (theme.primaryColor || '#064e3b').replace('#', '');
  const secondaryHex = (theme.secondaryColor || '#10b981').replace('#', '');
  const cardHex = (theme.cardColor || '#1e293b').replace('#', '');
  const textHex = (theme.textColor || '#ffffff').replace('#', '');
  const headerFont = theme.headerFont || 'Arial';
  const bodyFont = theme.bodyFont || 'Arial';

  const slidesToExport = snapshot.slides && snapshot.slides.length > 0
    ? snapshot.slides.filter(s => s.visible !== false)
    : [];

  if (slidesToExport.length === 0) {
    const slide = pptx.addSlide();
    slide.background = { color: bgColorHex };
    slide.addText('AuraOps Analytics', {
      x: 0.8, y: 2.0, w: 8.5, h: 0.8,
      fontFace: headerFont, fontSize: 32, bold: true, color: secondaryHex
    });
  }

  for (let index = 0; index < slidesToExport.length; index++) {
    const slideConfig = slidesToExport[index];
    const pptSlide = pptx.addSlide();
    pptSlide.background = { color: bgColorHex };

    // Decorative Bar
    pptSlide.addShape(pptx.ShapeType.rect, {
      x: 0, y: 0, w: '100%', h: 0.12,
      fill: { color: secondaryHex }
    });

    const layout = slideConfig.layoutId;

    if (layout === 'capa' || layout === 'cover') {
      // 1. CAPA
      pptSlide.addText(slideConfig.title || 'Relatório de Inteligência Operacional', {
        x: 0.8, y: 1.5, w: 8.5, h: 0.8,
        fontFace: headerFont, fontSize: 32, bold: true, color: secondaryHex
      });

      pptSlide.addText(slideConfig.description || 'Apresentação de resultados mensais e direcionamento estratégico', {
        x: 0.8, y: 2.3, w: 8.5, h: 0.5,
        fontFace: bodyFont, fontSize: 18, color: textHex
      });

      pptSlide.addShape(pptx.ShapeType.roundRect, {
        x: 0.8, y: 3.3, w: 8.4, h: 2.4,
        fill: { color: cardHex },
        line: { color: secondaryHex, width: 1 }
      });

      pptSlide.addText([
        { text: `Base Analisada: `, options: { bold: true, color: '94A3B8' } },
        { text: `${snapshot.activeDatasetName}\n`, options: { color: textHex } },
        { text: `Período do Snapshot: `, options: { bold: true, color: '94A3B8' } },
        { text: `${snapshot.kpis.dateRangeText}\n`, options: { color: textHex } },
        { text: `Contexto: `, options: { bold: true, color: '94A3B8' } },
        { text: `${slideConfig.meetingContext || 'Reunião Executiva de Operações'}\n`, options: { color: textHex } },
        { text: `Data de Geração: `, options: { bold: true, color: '94A3B8' } },
        { text: `${generationDate}\n`, options: { color: textHex } },
        { text: `Desenvolvido por: `, options: { bold: true, color: '94A3B8' } },
        { text: `Lucas Martins`, options: { bold: true, color: secondaryHex } }
      ], {
        x: 1.1, y: 3.5, w: 7.8, h: 2.0,
        fontFace: bodyFont, fontSize: 12
      });

    } else if (layout === 'resumo_executivo') {
      // 2. RESUMO EXECUTIVO
      pptSlide.addText(slideConfig.title || 'Resumo Executivo da Operação', {
        x: 0.8, y: 0.5, w: 8.5, h: 0.5,
        fontFace: headerFont, fontSize: 24, bold: true, color: secondaryHex
      });

      const textLines = slideConfig.customText 
        ? slideConfig.customText 
        : `• Faturamento global atingiu ${formatBRCurrency(snapshot.kpis.totalSales)} no período.\n• ${snapshot.kpis.storeCount} unidades ativas computadas.\n• Acompanhamento constante das metas da rede.`;

      pptSlide.addShape(pptx.ShapeType.roundRect, {
        x: 0.8, y: 1.4, w: 8.4, h: 4.8,
        fill: { color: cardHex },
        line: { color: secondaryHex, width: 1 }
      });

      pptSlide.addText(textLines, {
        x: 1.1, y: 1.7, w: 7.8, h: 4.2,
        fontSize: 13, color: textHex, fontFace: bodyFont
      });

    } else if (layout === 'kpis' || layout === 'executive_kpis') {
      // 3. INDICADORES / KPIS
      pptSlide.addText(slideConfig.title || 'Indicadores Chave de Desempenho (KPIs)', {
        x: 0.8, y: 0.5, w: 8.5, h: 0.5,
        fontFace: headerFont, fontSize: 24, bold: true, color: secondaryHex
      });

      // KPI Card 1
      pptSlide.addShape(pptx.ShapeType.roundRect, {
        x: 0.8, y: 1.4, w: 4.0, h: 2.2,
        fill: { color: cardHex }, line: { color: secondaryHex, width: 2 }
      });
      pptSlide.addText('VENDAS TOTAIS (FATURAMENTO)', {
        x: 1.0, y: 1.6, w: 3.6, h: 0.3, fontSize: 11, bold: true, color: '94A3B8', fontFace: bodyFont
      });
      pptSlide.addText(formatBRCurrency(snapshot.kpis.totalSales), {
        x: 1.0, y: 2.1, w: 3.6, h: 0.6, fontSize: 24, bold: true, color: secondaryHex, fontFace: headerFont
      });
      pptSlide.addText(`${snapshot.kpis.recordCount} registros computados`, {
        x: 1.0, y: 3.0, w: 3.6, h: 0.3, fontSize: 10, color: 'CBD5E1', fontFace: bodyFont
      });

      // KPI Card 2
      pptSlide.addShape(pptx.ShapeType.roundRect, {
        x: 5.2, y: 1.4, w: 4.0, h: 2.2,
        fill: { color: cardHex }, line: { color: '8B5CF6', width: 2 }
      });
      pptSlide.addText('META CONSOLIDADA DA REDE', {
        x: 5.4, y: 1.6, w: 3.6, h: 0.3, fontSize: 11, bold: true, color: '94A3B8', fontFace: bodyFont
      });
      pptSlide.addText(
        snapshot.kpis.hasTargetData ? formatBRCurrency(snapshot.kpis.totalTarget) : 'N/I',
        { x: 5.4, y: 2.1, w: 3.6, h: 0.6, fontSize: 24, bold: true, color: 'C084FC', fontFace: headerFont }
      );
      pptSlide.addText(
        snapshot.kpis.targetAchievementPct !== null ? `Atingimento: ${snapshot.kpis.targetAchievementPct.toFixed(1)}%` : 'Meta não cadastrada',
        { x: 5.4, y: 3.0, w: 3.6, h: 0.3, fontSize: 10, color: 'CBD5E1', fontFace: bodyFont }
      );

      // KPI Card 3
      pptSlide.addShape(pptx.ShapeType.roundRect, {
        x: 0.8, y: 4.0, w: 4.0, h: 2.2,
        fill: { color: cardHex }, line: { color: '3B82F6', width: 2 }
      });
      pptSlide.addText('TICKET MÉDIO POR TRANSAÇÃO', {
        x: 1.0, y: 4.2, w: 3.6, h: 0.3, fontSize: 11, bold: true, color: '94A3B8', fontFace: bodyFont
      });
      pptSlide.addText(
        snapshot.kpis.ticketMedio ? formatBRCurrency(snapshot.kpis.ticketMedio) : 'N/I',
        { x: 1.0, y: 4.7, w: 3.6, h: 0.6, fontSize: 24, bold: true, color: '60A5FA', fontFace: headerFont }
      );
      pptSlide.addText(`Base: ${snapshot.kpis.totalTransactions} transações`, {
        x: 1.0, y: 5.6, w: 3.6, h: 0.3, fontSize: 10, color: 'CBD5E1', fontFace: bodyFont
      });

      // KPI Card 4
      pptSlide.addShape(pptx.ShapeType.roundRect, {
        x: 5.2, y: 4.0, w: 4.0, h: 2.2,
        fill: { color: cardHex }, line: { color: 'EC4899', width: 2 }
      });
      pptSlide.addText('MARGEM BRUTA OPERACIONAL', {
        x: 5.4, y: 4.2, w: 3.6, h: 0.3, fontSize: 11, bold: true, color: '94A3B8', fontFace: bodyFont
      });
      pptSlide.addText(
        snapshot.kpis.grossMarginPct ? `${snapshot.kpis.grossMarginPct.toFixed(1)}%` : 'N/I',
        { x: 5.4, y: 4.7, w: 3.6, h: 0.6, fontSize: 24, bold: true, color: 'F472B6', fontFace: headerFont }
      );
      pptSlide.addText(
        snapshot.kpis.totalProfit ? `Lucro: ${formatBRCurrency(snapshot.kpis.totalProfit)}` : 'Requer custos',
        { x: 5.4, y: 5.6, w: 3.6, h: 0.3, fontSize: 10, color: 'CBD5E1', fontFace: bodyFont
      });

    } else if (layout === 'grafico_analise' || layout === 'chart_and_insights') {
      // 4. GRÁFICO COM ANÁLISE
      pptSlide.addText(slideConfig.title || 'Gráfico e Análise de Distribuição', {
        x: 0.8, y: 0.5, w: 8.5, h: 0.5,
        fontFace: headerFont, fontSize: 24, bold: true, color: secondaryHex
      });

      // Table Box
      pptSlide.addShape(pptx.ShapeType.roundRect, {
        x: 0.8, y: 1.3, w: 4.1, h: 4.8,
        fill: { color: cardHex }, line: { color: secondaryHex, width: 1 }
      });

      pptSlide.addText('Distribuição por Categoria', {
        x: 1.0, y: 1.5, w: 3.7, h: 0.3,
        fontSize: 13, bold: true, color: secondaryHex, fontFace: headerFont
      });

      if (categories.length > 0) {
        const catHeaders = [
          { text: 'Categoria', options: { bold: true, fill: { color: primaryHex }, color: 'FFFFFF' } },
          { text: 'Vendas (R$)', options: { bold: true, fill: { color: primaryHex }, color: 'FFFFFF' } },
          { text: 'Share %', options: { bold: true, fill: { color: primaryHex }, color: 'FFFFFF' } }
        ];

        const catRows = categories.slice(0, 5).map((c, idx) => [
          { text: c.category, options: { fill: { color: idx % 2 === 0 ? cardHex : bgColorHex }, color: textHex } },
          { text: formatBRCurrency(c.totalSales), options: { fill: { color: idx % 2 === 0 ? cardHex : bgColorHex }, color: secondaryHex } },
          { text: `${c.sharePct.toFixed(1)}%`, options: { fill: { color: idx % 2 === 0 ? cardHex : bgColorHex }, color: 'CBD5E1' } }
        ]);

        pptSlide.addTable([catHeaders, ...catRows], {
          x: 1.0, y: 2.0, w: 3.7,
          fontFace: bodyFont, fontSize: 10,
          border: { pt: 0.5, color: '334155' }
        });
      }

      // Notes Box
      pptSlide.addShape(pptx.ShapeType.roundRect, {
        x: 5.1, y: 1.3, w: 4.1, h: 4.8,
        fill: { color: cardHex }, line: { color: '3B82F6', width: 1 }
      });

      pptSlide.addText('Análise Narrativa dos Dados', {
        x: 5.3, y: 1.5, w: 3.7, h: 0.3,
        fontSize: 13, bold: true, color: '60A5FA', fontFace: headerFont
      });

      pptSlide.addText(slideConfig.customText || 'Insira a análise técnica dos gráficos aqui.', {
        x: 5.3, y: 2.0, w: 3.7, h: 3.8,
        fontSize: 11, color: textHex, fontFace: bodyFont
      });

    } else if (layout === 'fluxograma') {
      // 5. FLUXOGRAMA OPERACIONAL
      pptSlide.addText(slideConfig.title || 'Fluxograma e Processo Operacional', {
        x: 0.8, y: 0.5, w: 8.5, h: 0.5,
        fontFace: headerFont, fontSize: 24, bold: true, color: secondaryHex
      });

      const nodes = slideConfig.flowchartNodes || [
        { id: 'n1', label: '1. Entrada de Pedidos', type: 'step' },
        { id: 'n2', label: '2. Validação de Estoque?', type: 'decision' },
        { id: 'n3', label: '3. Faturamento & Expedição', type: 'step' }
      ];

      nodes.forEach((node, nIdx) => {
        const xPos = 0.8 + nIdx * 2.8;
        const isDecision = node.type === 'decision';

        pptSlide.addShape(isDecision ? pptx.ShapeType.diamond : pptx.ShapeType.roundRect, {
          x: xPos, y: 2.5, w: 2.3, h: 1.8,
          fill: { color: cardHex },
          line: { color: isDecision ? 'F59E0B' : secondaryHex, width: 2 }
        });

        pptSlide.addText(node.label, {
          x: xPos + 0.1, y: 2.7, w: 2.1, h: 1.4,
          fontFace: bodyFont, fontSize: 11, bold: true,
          color: isDecision ? 'FBBF24' : textHex, align: 'center'
        });
      });

    } else if (layout === 'plano_acao' || layout === 'recommendations') {
      // 6. PLANO DE AÇÃO
      pptSlide.addText(slideConfig.title || 'Plano de Ação e Acompanhamento', {
        x: 0.8, y: 0.5, w: 8.5, h: 0.5,
        fontFace: headerFont, fontSize: 24, bold: true, color: secondaryHex
      });

      const items = slideConfig.actionPlanItems || [
        { id: 'a1', action: 'Monitorar metas diárias das lojas críticas', owner: '', deadline: '', kpiId: 'Meta Atingimento' },
        { id: 'a2', action: 'Reforçar estoque das categorias líderes', owner: 'Gerência de Logística', deadline: 'Próxima Segunda', kpiId: 'Vendas Totais' }
      ];

      const headers = [
        { text: 'Ação Operacional', options: { bold: true, fill: { color: primaryHex }, color: 'FFFFFF' } },
        { text: 'Responsável', options: { bold: true, fill: { color: primaryHex }, color: 'FFFFFF' } },
        { text: 'Prazo', options: { bold: true, fill: { color: primaryHex }, color: 'FFFFFF' } },
        { text: 'KPI de Acompanhamento', options: { bold: true, fill: { color: primaryHex }, color: 'FFFFFF' } }
      ];

      const rows = items.map((item, idx) => [
        { text: item.action, options: { fill: { color: idx % 2 === 0 ? cardHex : bgColorHex }, color: textHex } },
        { text: item.owner && item.owner.trim() ? item.owner : '—', options: { fill: { color: idx % 2 === 0 ? cardHex : bgColorHex }, color: item.owner ? '34D399' : '94A3B8' } },
        { text: item.deadline && item.deadline.trim() ? item.deadline : '—', options: { fill: { color: idx % 2 === 0 ? cardHex : bgColorHex }, color: item.deadline ? 'CBD5E1' : '94A3B8' } },
        { text: item.kpiId || '—', options: { fill: { color: idx % 2 === 0 ? cardHex : bgColorHex }, color: 'CBD5E1' } }
      ]);

      pptSlide.addTable([headers, ...rows], {
        x: 0.8, y: 1.3, w: 8.4,
        fontFace: bodyFont, fontSize: 11,
        border: { pt: 0.5, color: '334155' }
      });

    } else {
      // DEFAULT FALLBACK
      pptSlide.addText(slideConfig.title || 'Conteúdo Personalizado', {
        x: 0.8, y: 0.5, w: 8.5, h: 0.5,
        fontFace: headerFont, fontSize: 24, bold: true, color: secondaryHex
      });

      pptSlide.addShape(pptx.ShapeType.roundRect, {
        x: 0.8, y: 1.4, w: 8.4, h: 4.8,
        fill: { color: cardHex }, line: { color: secondaryHex, width: 1 }
      });

      pptSlide.addText(slideConfig.customText || 'Conteúdo livre.', {
        x: 1.1, y: 1.7, w: 7.8, h: 4.2,
        fontSize: 12, color: textHex, fontFace: bodyFont
      });
    }

    // Footer Credit on every slide
    pptSlide.addText(`Gerado por Lucas Martins via AuraOps Analytics • Slide ${index + 1} de ${slidesToExport.length} • ${generationDate}`, {
      x: 0.8, y: 6.8, w: 8.4, h: 0.3,
      fontSize: 9, color: '64748B', fontFace: bodyFont
    });
  }

  const safeName = snapshot.activeDatasetName ? snapshot.activeDatasetName.replace(/[^a-zA-Z0-9]/g, '_') : 'AuraOps';
  const fileName = `AuraOps_Apresentacao_${safeName}.pptx`;
  await pptx.writeFile({ fileName });
}
