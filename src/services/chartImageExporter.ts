/**
 * High-Resolution Chart Image Exporter & Clipboard Copy Service
 * AuraOps Analytics - Pure HTML Canvas / SVG Rasterizer
 */

export interface ChartImageMetadata {
  periodText?: string;
  unitText?: string;
  activeFiltersText?: string;
  primaryColor?: string;
  cardBgColor?: string;
  fontFamily?: string;
}

/**
 * Rasterizes a chart container element (with SVG & metadata) into a high-res PNG Blob.
 */
export async function rasterizeChartToCanvas(
  containerEl: HTMLElement,
  title: string,
  metadata: ChartImageMetadata = {}
): Promise<Blob> {
  const cardBg = metadata.cardBgColor || '#F5F1EB';
  const textColor = metadata.primaryColor || '#011E38';
  const font = metadata.fontFamily || 'IBM Plex Sans, sans-serif';

  // Find SVG element inside container
  const svgEl = containerEl.querySelector('svg');
  if (!svgEl) {
    throw new Error('Elemento SVG do gráfico não encontrado para captura.');
  }

  // Clone SVG and set explicit size attributes
  const clonedSvg = svgEl.cloneNode(true) as SVGElement;
  const rect = svgEl.getBoundingClientRect();
  const width = Math.max(rect.width || 600, 500);
  const height = Math.max(rect.height || 300, 260);

  clonedSvg.setAttribute('width', `${width}`);
  clonedSvg.setAttribute('height', `${height}`);
  clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

  const svgString = new XMLSerializer().serializeToString(clonedSvg);
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const svgUrl = URL.createObjectURL(svgBlob);

  // High Resolution Scale (2.5x for slide quality)
  const scale = 2.5;
  const padding = 24 * scale;
  const headerHeight = 60 * scale;
  const footerHeight = 45 * scale;
  const canvasWidth = width * scale + padding * 2;
  const canvasHeight = height * scale + headerHeight + footerHeight + padding * 2;

  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Não foi possível inicializar o contexto 2D do Canvas.');
  }

  // 1. Draw Background
  ctx.fillStyle = cardBg;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Draw Card Border
  ctx.strokeStyle = '#264FEC30';
  ctx.lineWidth = 2 * scale;
  ctx.strokeRect(padding / 2, padding / 2, canvasWidth - padding, canvasHeight - padding);

  // 2. Draw Header (Title & Subtitle)
  ctx.fillStyle = textColor;
  ctx.font = `bold ${16 * scale}px ${font}`;
  ctx.textBaseline = 'top';
  ctx.fillText(title, padding, padding);

  // Subtitle / Metadata
  const subText = [
    metadata.unitText ? `Unidade: ${metadata.unitText}` : '',
    metadata.periodText ? `Período: ${metadata.periodText}` : ''
  ].filter(Boolean).join(' • ');

  if (subText) {
    ctx.fillStyle = '#64748B';
    ctx.font = `${10 * scale}px ${font}`;
    ctx.fillText(subText, padding, padding + 22 * scale);
  }

  // 3. Draw Chart Image
  const img = new Image();
  img.crossOrigin = 'anonymous';

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = (err) => reject(err);
    img.src = svgUrl;
  });

  const chartY = padding + headerHeight;
  ctx.drawImage(img, padding, chartY, width * scale, height * scale);
  URL.revokeObjectURL(svgUrl);

  // 4. Draw Footer Metadata (Active Filters & Credit)
  const footerY = canvasHeight - padding - 20 * scale;

  ctx.strokeStyle = '#CBD5E1';
  ctx.lineWidth = 1 * scale;
  ctx.beginPath();
  ctx.moveTo(padding, footerY - 8 * scale);
  ctx.lineTo(canvasWidth - padding, footerY - 8 * scale);
  ctx.stroke();

  ctx.fillStyle = '#475569';
  ctx.font = `${9.5 * scale}px ${font}`;
  ctx.textBaseline = 'bottom';

  const filterText = metadata.activeFiltersText ? `Filtros: ${metadata.activeFiltersText}` : 'Filtros: Todos os dados da base';
  ctx.fillText(filterText, padding, canvasHeight - padding);

  const brandText = 'AuraOps Analytics • Boticário Retail';
  const brandWidth = ctx.measureText(brandText).width;
  ctx.fillText(brandText, canvasWidth - padding - brandWidth, canvasHeight - padding);

  // Return PNG Blob
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Falha ao converter o canvas em arquivo PNG.'));
      }
    }, 'image/png', 1.0);
  });
}

/**
 * Attempts to copy the chart image directly to the system clipboard.
 */
export async function copyChartToClipboard(
  containerEl: HTMLElement,
  title: string,
  metadata: ChartImageMetadata = {}
): Promise<{ success: boolean; message: string; blob?: Blob }> {
  try {
    const blob = await rasterizeChartToCanvas(containerEl, title, metadata);

    // Check Clipboard API support for images
    if (typeof navigator !== 'undefined' && navigator.clipboard && typeof window.ClipboardItem !== 'undefined') {
      try {
        const item = new window.ClipboardItem({ 'image/png': blob });
        await navigator.clipboard.write([item]);
        return {
          success: true,
          message: 'Gráfico copiado para a área de transferência com sucesso! Cole na sua apresentação.',
          blob
        };
      } catch (clipboardErr) {
        // Browser rejected image clipboard writing (e.g. security restriction or HTTP)
        return {
          success: false,
          message: 'O navegador restringiu a cópia direta de imagens. O arquivo PNG será baixado automaticamente.',
          blob
        };
      }
    } else {
      return {
        success: false,
        message: 'Área de transferência de imagem não suportada neste navegador. O arquivo PNG será baixado automaticamente.',
        blob
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: `Não foi possível gerar a imagem do gráfico: ${err?.message || 'Erro desconhecido.'}`
    };
  }
}

/**
 * Downloads the chart image as a PNG file.
 */
export async function downloadChartAsPNG(
  containerEl: HTMLElement,
  title: string,
  metadata: ChartImageMetadata = {}
): Promise<void> {
  const blob = await rasterizeChartToCanvas(containerEl, title, metadata);
  const safeName = title.replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `AuraOps_Grafico_${safeName}.png`;

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
