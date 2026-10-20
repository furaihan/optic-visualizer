import { measureRows, worstRow, type LimitId } from './limits';
import type { CalculationResult, LensParameters } from './optic-engine/types';
import type { AppTranslations } from './translations/types';

const NAME_KEY: Record<LimitId, keyof AppTranslations> = {
  et: 'findingEt',
  ct: 'findingCt',
  anterior: 'findingAnterior',
  posterior: 'findingPosterior',
  weight: 'findingWeight',
  prism: 'findingPrism',
  blank: 'findingBlank',
};

/**
 * The one finding the sheet leads with.
 *
 * The screen's question is whether the lens fits the frame, and the answer is
 * the first measurement outside its limit. When nothing is out, the sheet says
 * so. It is a fact about the data, not a description of the interface.
 */
export function findingSentence(
  result: CalculationResult,
  lens: LensParameters | undefined,
  t: AppTranslations
): string {
  const rows = measureRows(result, lens);
  const worst = worstRow(rows);
  if (!worst) return t.findingWithin;

  const name = t[NAME_KEY[worst.id]] as string;
  const value = `${worst.value.toFixed(worst.decimals)} ${worst.unit}`;
  const limit = `${worst.limit.toFixed(worst.decimals)} ${worst.unit}`;
  const over = `${worst.over.toFixed(worst.decimals)} ${worst.unit}`;
  const template = worst.direction === 'max' ? t.findingOver : t.findingUnder;

  return template
    .replace('{name}', name)
    .replace('{value}', value)
    .replace('{over}', over)
    .replace('{under}', over)
    .replace('{limit}', limit);
}
