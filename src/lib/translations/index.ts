import { Language, AppTranslations } from './types';
import { translations_id } from './id';
import { translations_en } from './en';

export const translations: Record<Language, AppTranslations> = {
  id: translations_id,
  en: translations_en,
};

export const getTooltipByLabel = (label: string, lang: Language): string => {
  const t: AppTranslations = translations[lang];
  const normalized = label.trim().toLowerCase();

  // Check direct matches with current translation values
  if (normalized === (t.sphere || '').toLowerCase()) return t.tipSphere || '';
  if (normalized === (t.cylinder || '').toLowerCase()) return t.tipCylinder || '';
  if (normalized === (t.axis || '').toLowerCase()) return t.tipAxis || '';
  if (normalized === (t.refractiveIndex || '').toLowerCase()) return t.tipRefractiveIndex || '';
  if (normalized === (t.baseCurve || '').toLowerCase()) return t.tipBaseCurve || '';
  if (normalized === (t.aSize || '').toLowerCase()) return t.tipASize || '';
  if (normalized === (t.bSize || '').toLowerCase()) return t.tipBSize || '';
  if (normalized === 'dbl' || normalized === (t.dbl || '').toLowerCase()) return t.tipDbl || '';
  if (normalized === 'ed' || normalized === (t.ed || '').toLowerCase()) return t.tipEd || '';
  if (normalized === (t.fittingHeight || '').toLowerCase()) return t.tipFittingHeight || '';
  if (normalized === (t.pd || '').toLowerCase()) return t.tipPd || '';
  if (normalized === (t.frameDepth || '').toLowerCase()) return t.tipFrameDepth || '';
  if (normalized === (t.frameType || '').toLowerCase()) return t.tipFrameType || '';
  if (normalized === (t.bevelPos || '').toLowerCase()) return t.tipBevelPos || '';
  if (normalized === (t.compareMode || '').toLowerCase()) return t.tipCompareMode || '';

  // Fallback pattern matching
  if (normalized.includes('sferis') || normalized.includes('sphere') || normalized.includes('ukuran (sph)')) {
    return t.tipSphere || '';
  }
  if (normalized.includes('silinder') || normalized.includes('cylinder') || normalized.includes('cyl')) {
    return t.tipCylinder || '';
  }
  if (normalized.includes('axis')) {
    return t.tipAxis || '';
  }
  if (normalized.includes('index') || normalized.includes('bias') || normalized.includes('indeks')) {
    return t.tipRefractiveIndex || '';
  }
  if (normalized.includes('kelengkungan') || normalized.includes('curve') || normalized.includes('bc')) {
    return t.tipBaseCurve || '';
  }
  if (normalized.includes('a-size') || normalized.includes('ukuran a')) {
    return t.tipASize || '';
  }
  if (normalized.includes('b-size') || normalized.includes('ukuran b')) {
    return t.tipBSize || '';
  }
  if (normalized.includes('hidung') || normalized.includes('between') || normalized.includes('dbl')) {
    return t.tipDbl || '';
  }
  if (normalized.includes('diameter') || normalized.includes('ed')) {
    return t.tipEd || '';
  }
  if (normalized.includes('tinggi') || normalized.includes('height')) {
    return t.tipFittingHeight || '';
  }
  if (normalized.includes('pd') || normalized.includes('pupil') || normalized.includes('jarak pupil')) {
    return t.tipPd || '';
  }
  if (normalized.includes('kedalaman') || normalized.includes('depth') || normalized.includes('ketebalan bingkai')) {
    return t.tipFrameDepth || '';
  }
  if (normalized.includes('tipe') || normalized.includes('type') || normalized.includes('jenis bingkai')) {
    return t.tipFrameType || '';
  }
  if (normalized.includes('bevel') || normalized.includes('kemiringan') || normalized.includes('posisi bevel')) {
    return t.tipBevelPos || '';
  }
  if (normalized.includes('compare') || normalized.includes('banding')) {
    return t.tipCompareMode || '';
  }

  return '';
};

export type { Language, AppTranslations };
