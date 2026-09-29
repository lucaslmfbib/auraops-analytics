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
 * symmetrically exporting user-configured slides and active theme.
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
    // Fallback default slide
    const slide = pptx.addSlide();
    slide.background = { color: bgColorHex };
    slide.addText('AuraOps Analytics', {
      x: 0.8, y: 2.0, w: 8.5, h: 0.8,
      fontFace: headerFont, fontSize: 32, bold: true, color: secondaryHex
    });
  }

  // Iterate symmetrically over slides
  for (let index = 0; index < slidesToExport.length; index++) {
    const slideConfig = slidesToExport[index];
    const pptSlide = pptx.addSlide();
    pptSlide.background = { color: bgColorHex };

    // Top decorative bar
    pptSlide.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 0,
      w: '100%',
      h: 0.12,
      fill: { color: secondaryHex }
    });

    switch (slideConfig.layoutId) {
      case 'cover': {
        // Main Title
        pptSlide.addText(slideConfig.title || 'AuraOps Analytics', {
          x: 0.8,
          y: 1.6,
          w: 8.5,
          h: 0.8,
          fontFace: headerFont,
          fontSize: 34,
          bold: true,
          color: secondaryHex
        });

        pptSlide.addText(slideConfig.description || 'Relatório Executivo de Inteligência Operacional', {
          x: 0.8,
          y: 2.4,
          w: 8.5,
          h: 0.5,
          fontFace: bodyFont,
          fontSize: 18,
          color: textHex
        });

        // Metadata Card Box
        pptSlide.addShape(pptx.ShapeType.roundRect, {
          x: 0.8,
          y: 3.4,
          w: 8.4,
          h: 2.2,
          fill: { color: cardHex },
          line: { color: secondaryHex, width: 1 }
        });

        pptSlide.addText([
          { text: `Base Analisada: `, options: { bold: true, color: '94A3B8' } },
          { text: `${snapshot.activeDatasetName}\n`, options: { color: textHex } },
          { text: `Período: `, options: { bold: true, color: '94A3B8' } },
          { text: `${snapshot.kpis.dateRangeText}\n`, options: { color: textHex } },
          { text: `Tema Ativo: `, options: { bold: true, color: '94A3B8' } },
          { text: `${theme.name} ${theme.isExternal ? '(Importado)' : '(Padrão)'}\n`, options: { color: textHex } },
          { text: `Data de Geração: `, options: { bold: true, color: '94A3B8' } },
          { text: `${generationDate}\n`, options: { color: textHex } },
          { text: `Desenvolvido por: `, options: { bold: true, color: '94A3B8' } },
          { text: `Lucas Martins`, options: { bold: true, color: secondaryHex } }
        ], {
          x: 1.1,
          y: 3.6,
          w: 7.8,
          h: 1.8,
          fontFace: bodyFont,
          fontSize: 12
        });

        if (slideConfig.meetingContext) {
          pptSlide.addText(`Contexto da Reunião: ${slideConfig.meetingContext}`, {
            x: 0.8, y: 5.8, w: 8.4, h: 0.4,
            fontSize: 10, italic: true, color: 'CBD5E1', fontFace: bodyFont
          });
        }
        break;
      }

      case 'executive_kpis': {
        pptSlide.addText(slideConfig.title || 'Indicadores Chave de Desempenho (KPIs)', {
          x: 0.8, y: 0.5, w: 8.5, h: 0.5,
          fontFace: headerFont, fontSize: 24, bold: true, color: secondaryHex
        });

        // KPI 1 Box (Vendas)
        pptSlide.addShape(pptx.ShapeType.roundRect, {
          x: 0.8, y: 1.4, w: 4.0, h: 2.2,
          fill: { color: cardHex },
          line: { color: secondaryHex, width: 2 }
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

        // KPI 2 Box (Meta)
        pptSlide.addShape(pptx.ShapeType.roundRect, {
          x: 5.2, y: 1.4, w: 4.0, h: 2.2,
          fill: { color: cardHex },
          line: { color: '8B5CF6', width: 2 }
        });
        pptSlide.addText('META CONSOLIDADA DA REDE', {
          x: 5.4, y: 1.6, w: 3.6, h: 0.3, fontSize: 11, bold: true, color: '94A3B8', fontFace: bodyFont
        });
        pptSlide.addText(
          snapshot.kpis.hasTargetData ? formatBRCurrency(snapshot.kpis.totalTarget) : 'N/I', 
          { x: 5.4, y: 2.1, w: 3.6, h: 0.6, fontSize: 24, bold: true, color: 'C084FC', fontFace: headerFont }
        );
        pptSlide.addText(
          snapshot.kpis.targetAchievementPct !== null 
            ? `Atingimento: ${snapshot.kpis.targetAchievementPct.toFixed(1)}%` 
            : 'Meta não informada', 
          { x: 5.4, y: 3.0, w: 3.6, h: 0.3, fontSize: 10, color: 'CBD5E1', fontFace: bodyFont }
        );

        // KPI 3 Box (Ticket Médio)
        pptSlide.addShape(pptx.ShapeType.roundRect, {
          x: 0.8, y: 4.0, w: 4.0, h: 2.2,
          fill: { color: cardHex },
          line: { color: '3B82F6', width: 2 }
        });
        pptSlide.addText('TICKET MÉDIO POR TRANSAÇÃO', {
          x: 1.0, y: 4.2, w: 3.6, h: 0.3, fontSize: 11, bold: true, color: '94A3B8', fontFace: bodyFont
        });
        pptSlide.addText(
          snapshot.kpis.ticketMedio ? formatBRCurrency(snapshot.kpis.ticketMedio) : 'N/I', 
          { x: 1.0, y: 4.7, w: 3.6, h: 0.6, fontSize: 24, bold: true, color: '60A5FA', fontFace: headerFont }
        );
        pptSlide.addText(`Base: ${snapshot.kpis.totalTransactions} cupons/pedidos`, {
          x: 1.0, y: 5.6, w: 3.6, h: 0.3, fontSize: 10, color: 'CBD5E1', fontFace: bodyFont
        });

        // KPI 4 Box (Margem Bruta)
        pptSlide.addShape(pptx.ShapeType.roundRect, {
          x: 5.2, y: 4.0, w: 4.0, h: 2.2,
          fill: { color: cardHex },
          line: { color: 'EC4899', width: 2 }
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
          { x: 5.4, y: 5.6, w: 3.6, h: 0.3, fontSize: 10, color: 'CBD5E1', fontFace: bodyFont }
        );
        break;
      }

      case 'ranking_table': {
        pptSlide.addText(slideConfig.title || 'Ranking e Desempenho por Loja', {
          x: 0.8, y: 0.5, w: 8.5, h: 0.5,
          fontFace: headerFont, fontSize: 24, bold: true, color: secondaryHex
        });

        if (stores.length > 0) {
          const tableHeaders = [
            { text: 'Loja / Unidade', options: { bold: true, fill: { color: primaryHex }, color: 'FFFFFF' } },
            { text: 'Vendas (R$)', options: { bold: true, fill: { color: primaryHex }, color: 'FFFFFF' } },
            { text: 'Meta (R$)', options: { bold: true, fill: { color: primaryHex }, color: 'FFFFFF' } },
            { text: 'Atingimento', options: { bold: true, fill: { color: primaryHex }, color: 'FFFFFF' } },
            { text: 'Ticket Médio', options: { bold: true, fill: { color: primaryHex }, color: 'FFFFFF' } }
          ];

          const tableRows = stores.slice(0, 7).map((s, idx) => [
            { text: s.store, options: { fill: { color: idx % 2 === 0 ? cardHex : bgColorHex }, color: textHex } },
            { text: formatBRCurrency(s.totalSales), options: { fill: { color: idx % 2 === 0 ? cardHex : bgColorHex }, color: secondaryHex, bold: true } },
            { text: s.target > 0 ? formatBRCurrency(s.target) : '-', options: { fill: { color: idx % 2 === 0 ? cardHex : bgColorHex }, color: 'CBD5E1' } },
            { text: s.achievementPct ? `${s.achievementPct.toFixed(1)}%` : '-', options: { fill: { color: idx % 2 === 0 ? cardHex : bgColorHex }, color: s.achievementPct && s.achievementPct >= 100 ? secondaryHex : 'F87171' } },
            { text: s.ticketMedio ? formatBRCurrency(s.ticketMedio) : '-', options: { fill: { color: idx % 2 === 0 ? cardHex : bgColorHex }, color: 'CBD5E1' } }
          ]);

          pptSlide.addTable([tableHeaders, ...tableRows], {
            x: 0.8,
            y: 1.3,
            w: 8.4,
            fontFace: bodyFont,
            fontSize: 11,
            border: { pt: 0.5, color: '334155' }
          });
        } else {
          pptSlide.addText('Nenhuma informação de loja disponível.', {
            x: 0.8, y: 2.0, w: 8.4, h: 0.5, fontSize: 14, color: '94A3B8'
          });
        }
        break;
      }

      case 'chart_and_insights': {
        pptSlide.addText(slideConfig.title || 'Análise de Gráficos e Distribuição', {
          x: 0.8, y: 0.5, w: 8.5, h: 0.5,
          fontFace: headerFont, fontSize: 24, bold: true, color: secondaryHex
        });

        // Left box: Category Breakdown Table
        pptSlide.addShape(pptx.ShapeType.roundRect, {
          x: 0.8, y: 1.3, w: 4.1, h: 4.8,
          fill: { color: cardHex },
          line: { color: secondaryHex, width: 1 }
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

        // Right box: Insights and Custom Notes
        pptSlide.addShape(pptx.ShapeType.roundRect, {
          x: 5.1, y: 1.3, w: 4.1, h: 4.8,
          fill: { color: cardHex },
          line: { color: '3B82F6', width: 1 }
        });

        pptSlide.addText('Observações e Destaques', {
          x: 5.3, y: 1.5, w: 3.7, h: 0.3,
          fontSize: 13, bold: true, color: '60A5FA', fontFace: headerFont
        });

        const customNotes = slideConfig.customText || 
          `• Categoria líder representa ${(categories[0]?.sharePct || 0).toFixed(1)}% do faturamento.\n• Total de unidades ativas analisadas: ${snapshot.kpis.storeCount}.\n• Período de apuração: ${snapshot.kpis.dateRangeText}.`;

        pptSlide.addText(customNotes, {
          x: 5.3, y: 2.0, w: 3.7, h: 3.8,
          fontSize: 11, color: textHex, fontFace: bodyFont
        });
        break;
      }

      case 'recommendations': {
        pptSlide.addText(slideConfig.title || 'Recomendações Operacionais e Próximos Passos', {
          x: 0.8, y: 0.5, w: 8.5, h: 0.5,
          fontFace: headerFont, fontSize: 24, bold: true, color: secondaryHex
        });

        const recText = slideConfig.customText || 
          '1. Acompanhar diariamente lojas com atritamento de meta.\n2. Alocar sortimento prioritário nas categorias líderes.\n3. Capacitar equipes de vendas em produtos de maior ticket médio.';

        pptSlide.addShape(pptx.ShapeType.roundRect, {
          x: 0.8, y: 1.4, w: 8.4, h: 4.8,
          fill: { color: cardHex },
          line: { color: secondaryHex, width: 1 }
        });

        pptSlide.addText(recText, {
          x: 1.1, y: 1.7, w: 7.8, h: 4.2,
          fontSize: 12, color: textHex, fontFace: bodyFont
        });
        break;
      }

      case 'custom_content':
      default: {
        pptSlide.addText(slideConfig.title || 'Conteúdo Personalizado', {
          x: 0.8, y: 0.5, w: 8.5, h: 0.5,
          fontFace: headerFont, fontSize: 24, bold: true, color: secondaryHex
        });

        pptSlide.addShape(pptx.ShapeType.roundRect, {
          x: 0.8, y: 1.4, w: 8.4, h: 4.8,
          fill: { color: cardHex },
          line: { color: secondaryHex, width: 1 }
        });

        pptSlide.addText(slideConfig.customText || slideConfig.description || 'Slide personalizado pela equipe.', {
          x: 1.1, y: 1.7, w: 7.8, h: 4.2,
          fontSize: 12, color: textHex, fontFace: bodyFont
        });
        break;
      }
    }

    // Footer Credit on every slide
    pptSlide.addText(`Gerado por Lucas Martins via AuraOps Analytics • Slide ${index + 1} de ${slidesToExport.length} • ${generationDate}`, {
      x: 0.8, y: 6.8, w: 8.4, h: 0.3,
      fontSize: 9, color: '64748B', fontFace: bodyFont
    });
  }

  // Download PPTX File
  const safeName = snapshot.activeDatasetName ? snapshot.activeDatasetName.replace(/[^a-zA-Z0-9]/g, '_') : 'AuraOps';
  const fileName = `AuraOps_Apresentacao_${safeName}.pptx`;
  await pptx.writeFile({ fileName });
}
