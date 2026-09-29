import { PPTXTheme, ProjectSettings, SlideItemConfig } from '../types/analytics';

export const DEFAULT_ORG_THEME: PPTXTheme = {
  id: 'org_brand_default',
  name: 'Verde Varejo Institucional (Padrão da Organização)',
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

/**
 * Resolves effective visual theme following strict 3-tier precedence:
 * Slide Override > Project Settings Theme > Org Brand Default
 */
export function resolveEffectiveTheme(
  orgTheme: PPTXTheme = DEFAULT_ORG_THEME,
  projectTheme?: PPTXTheme,
  slideOverride?: Partial<PPTXTheme>
): PPTXTheme {
  const base = projectTheme ? { ...orgTheme, ...projectTheme } : { ...orgTheme };

  if (!slideOverride) {
    return base;
  }

  return {
    ...base,
    primaryColor: slideOverride.primaryColor || base.primaryColor,
    secondaryColor: slideOverride.secondaryColor || base.secondaryColor,
    backgroundColor: slideOverride.backgroundColor || base.backgroundColor,
    textColor: slideOverride.textColor || base.textColor,
    cardColor: slideOverride.cardColor || base.cardColor,
    headerFont: slideOverride.headerFont || base.headerFont,
    bodyFont: slideOverride.bodyFont || base.bodyFont
  };
}

/**
 * Resets a slide's visual overrides back to project/org default
 */
export function resetSlideVisualOverride(slide: SlideItemConfig): SlideItemConfig {
  const { visualOverride, ...rest } = slide;
  return rest;
}

/**
 * Resets a project's custom theme back to org brand default
 */
export function resetProjectThemeOverride(project: ProjectSettings): ProjectSettings {
  const { projectTheme, ...rest } = project;
  return rest;
}

/**
 * Converts a project's custom theme into a new reusable Org template
 */
export function saveAsNewOrgTemplate(currentTheme: PPTXTheme, newName: string): PPTXTheme {
  return {
    ...currentTheme,
    id: `custom_template_${Date.now()}`,
    name: newName,
    isExternal: true
  };
}
