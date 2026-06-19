export type Language = 'id' | 'en';

export type ActiveTab = 'visualizer' | 'summary' | 'parameters';

export type View = 'side' | 'top' | 'front';

export type SimulatorSearchParams = {
  lang: Language;
  activeTab: ActiveTab;
  view: View;
};

export function validateLang(raw: unknown): Language {
  return ['id', 'en'].includes(raw as string) ? (raw as Language) : 'id';
}

export function validateActiveTab(raw: unknown): ActiveTab {
  return ['visualizer', 'summary', 'parameters'].includes(raw as string)
    ? (raw as ActiveTab)
    : 'visualizer';
}

export function validateView(raw: unknown): View {
  return ['side', 'top', 'front'].includes(raw as string)
    ? (raw as View)
    : 'side';
}
