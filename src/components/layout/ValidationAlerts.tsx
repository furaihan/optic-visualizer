import { useOpticalContext } from '../../contexts/OpticalContext';
import { translations } from '../../lib/translations';
import type { Language } from '../../types/search-params';
import { AlertTriangleIcon } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';

export function ValidationAlerts({ lang }: { lang: Language }) {
  const t = translations[lang];
  const { validation } = useOpticalContext();

  if (validation.errors.length === 0) return null;

  return (
    <div className="px-4 md:px-6 py-2 shrink-0 animate-fade-in bg-amber-50/50 dark:bg-amber-950/10 border-b border-amber-200/60 dark:border-amber-900/40">
      <Alert variant="destructive" className="max-w-7xl mx-auto bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-200/60 dark:border-amber-900/40 gap-x-3 py-1.5 [&>svg]:text-amber-500">
        <AlertTriangleIcon size={14} className="mt-0.5" />
        <div className="flex flex-col min-w-0">
          <AlertTitle className="text-[10px] uppercase tracking-wider font-extrabold mb-0.5 text-amber-600 dark:text-amber-400">
            {t.clinicalVerification}
          </AlertTitle>
          <AlertDescription>
            <ul className="list-disc list-outside ml-3 text-xs font-medium leading-tight text-amber-800/80 dark:text-amber-200/80">
              {validation.errors.map((err, i) => (
                <li key={i} className="whitespace-normal break-words py-0.5">
                  {lang === 'id' ? err.messageId : err.messageEn}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </div>
      </Alert>
    </div>
  );
}
