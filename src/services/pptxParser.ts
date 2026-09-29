import JSZip from 'jszip';
import { PPTXTheme } from '../types/analytics';

/**
 * Parses uploaded .pptx PowerPoint template file using JSZip
 * to extract theme palette, fonts, and slide ratio.
 */
export async function parsePPTXTemplate(file: File): Promise<PPTXTheme> {
  const zip = new JSZip();
  const zipContent = await zip.loadAsync(file);

  let primaryColor = '#064e3b';
  let secondaryColor = '#10b981';
  let backgroundColor = '#0f172a';
  let textColor = '#ffffff';
  let cardColor = '#1e293b';
  let headerFont = 'Arial';
  let bodyFont = 'Arial';
  let aspectRatio: '16:9' | '4:3' = '16:9';

  const adaptationNotes: string[] = [];

  try {
    // 1. Check Presentation XML for slide aspect ratio
    const presFile = zipContent.file('ppt/presentation.xml');
    if (presFile) {
      const xmlText = await presFile.async('text');
      if (xmlText.includes('cx="9144000"') && xmlText.includes('cy="6858000"')) {
        aspectRatio = '4:3';
        adaptationNotes.push('Proporção detectada: 4:3 (Padrão)');
      } else {
        aspectRatio = '16:9';
        adaptationNotes.push('Proporção detectada: 16:9 (Widescreen)');
      }
    }

    // 2. Check Theme XML for color theme
    const themeFile = zipContent.file('ppt/theme/theme1.xml');
    if (themeFile) {
      const xmlText = await themeFile.async('text');
      
      // Hex color pattern in theme XML <a:srgbClr val="XXXXXX"/>
      const colorMatches = Array.from(xmlText.matchAll(/srgbClr val="([0-9A-Fa-f]{6})"/g));
      if (colorMatches.length >= 2) {
        primaryColor = `#${colorMatches[0][1]}`;
        secondaryColor = `#${colorMatches[1][1]}`;
        adaptationNotes.push(`Paleta de Cores Extraída: Primária (${primaryColor}), Secundária (${secondaryColor})`);
      }

      // Font pattern in theme XML
      const fontMatches = Array.from(xmlText.matchAll(/latin typeface="([^"]+)"/g));
      if (fontMatches.length >= 1) {
        headerFont = fontMatches[0][1];
        bodyFont = fontMatches[1] ? fontMatches[1][1] : headerFont;
        adaptationNotes.push(`Tipografia Extraída: ${headerFont}`);
      }
    }
  } catch (err) {
    adaptationNotes.push('Não foi possível ler todos os nós XML. Aplicada paleta padrão corporativa.');
  }

  adaptationNotes.push('Estrutura de slides adaptada para o esquema de dados nativo do AuraOps.');

  return {
    id: `custom_${Date.now()}`,
    name: `Modelo Personalizado (${file.name})`,
    isExternal: true,
    primaryColor,
    secondaryColor,
    backgroundColor,
    textColor,
    cardColor,
    headerFont,
    bodyFont,
    aspectRatio,
    adaptationNotes
  };
}
