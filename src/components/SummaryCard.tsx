import React from 'react';
import { CalculationResult, FrameParameters, LensParameters } from '../lib/optical';
import { translations, Language } from '../lib/i18n';
import { ArrowUpRight, ArrowDownRight, AlertTriangle, CheckCircle2, Info, ChevronDown, MoveHorizontal, Compass, Diameter, Scale } from 'lucide-react';

interface SummaryCardProps {
  result: CalculationResult;
  compareResult?: CalculationResult;
  lang: Language;
  frame?: FrameParameters;
  lens?: LensParameters;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ result, compareResult, lang, frame, lens }) => {
  const t = translations[lang];
  const [showGuide, setShowGuide] = React.useState(false);

  const notes = {
    id: {
      title: 'Panduan Referensi Klinis & Kosmetis',
      etLabel: 'Ketebalan Tepi (ET)',
      etDesc: 'Ketebalan lensa di pinggiran. Idealnya ≤ 4.0 mm agar pas rapi dalam bingkai. Nilai > 6.0 mm akan memproyeksikan keluar bingkai dan meningkatkan berat secara signifikan.',
      protLabel: 'Tonjolan Lensa (Ant / Post)',
      protDesc: 'Sejauh mana lensa menonjol melebihi bingkai depan/belakang. Toleransi ≤ 0.5 mm dianggap rata (flush). > 2.0 mm berisiko mengenai bulu mata saat berkedip.',
      ctLabel: 'Ketebalan Tengah (CT)',
      ctDesc: 'Ketebalan pusat lensa. Lensa minus dioptimalkan otomatis pada batas aman (biasanya 1.0 - 1.5 mm) untuk mempertahankan kekuatan mekanis minimum.',
      weightLabel: 'Estimasi Berat Lensa',
      weightDesc: 'Berat estimasi per lensa tunggal setelah diasah agar pas ke dalam bingkai. Dihitung berdasarkan volume akhir lensa dan massa jenis monomer bahan.'
    },
    en: {
      title: 'Clinical & Cosmetic Reference Guide',
      etLabel: 'Edge Thickness (ET)',
      etDesc: 'Lens thickness at the outer boundary. Ideally ≤ 4.0 mm for a clean fit within frame bevels. Values > 6.0 mm spill outward and increase weight.',
      protLabel: 'Lens Protrusion (Ant / Post)',
      protDesc: 'How much the lens projects beyond the frame front or back. Tolerance ≤ 0.5 mm is flush. Protrusion > 2.0 mm may touch lashes during blinking.',
      ctLabel: 'Center Thickness (CT)',
      ctDesc: 'Thickness at optical center. Minus lenses are optimized to safe lower limits (usually 1.0 - 1.5 mm) to retain structural strength.',
      weightLabel: 'Estimated Lens Weight',
      weightDesc: 'Estimated weight of a single edged lens. Values < 10g are highly comfortable for continuous wear. Computed based on final lens volume and material density.'
    }
  };

  const currentNotes = notes[lang] || notes.en;

  const getDeltaElement = (key: 'et' | 'ct' | 'anteriorProtrusion' | 'posteriorProtrusion' | 'weight') => {
    if (!compareResult) return null;
    const currVal = result[key];
    const prevVal = compareResult[key];
    if (currVal === undefined || prevVal === undefined) return null;
    
    const diff = currVal - prevVal;
    if (Math.abs(diff) < 0.05) return null;

    const isPositive = diff > 0;
    const isWorse = diff > 0; // For lens thickness & protrusions, more is worse/thicker.
    
    const colorClass = isWorse 
      ? 'text-rose-600 bg-rose-50 border-rose-100/50' 
      : 'text-emerald-600 bg-emerald-50 border-emerald-100/50';
      
    const Icon = isWorse ? ArrowUpRight : ArrowDownRight;
    const formatted = `${isPositive ? '+' : ''}${diff.toFixed(2)}`;

    return (
      <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold font-mono border ${colorClass} leading-none shadow-sm`}>
        <Icon size={10} className="stroke-[3]" />
        {formatted}
      </span>
    );
  };

  const StatItem = ({ 
    label, 
    value, 
    unit, 
    status, 
    statusColor, 
    icon: Icon, 
    iconColor = "text-slate-400 font-bold",
    resultKey
  }: any) => {
    const deltaNode = resultKey ? getDeltaElement(resultKey) : null;
    
    return (
      <div className="bg-white p-4 flex flex-col justify-between hover:bg-slate-50/40 transition-colors">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            {Icon && <Icon size={13} className={iconColor} strokeWidth={2.5} />}
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</p>
          </div>
          
          <div className="flex items-baseline gap-2 flex-wrap">
            <p className="text-xl md:text-2xl font-mono font-bold text-slate-800 leading-none">
              {value.toFixed(2)}
              <span className="text-[10px] ml-1 font-sans font-medium text-slate-400 lowercase">{unit}</span>
            </p>
            {deltaNode}
          </div>
        </div>

        <div className="mt-3">
          <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider ${statusColor} leading-none`}>
            {status}
          </span>
        </div>
      </div>
    );
  };

  const getETStatus = (et: number) => {
    if (et > 6) return { label: t.thick, color: 'bg-rose-50 text-rose-700 border border-rose-100', icon: AlertTriangle, iconColor: 'text-rose-500' };
    if (et > 4) return { label: t.medium, color: 'bg-amber-50 text-amber-700 border border-amber-100', icon: ArrowUpRight, iconColor: 'text-amber-500' };
    return { label: t.thin, color: 'bg-emerald-50 text-emerald-700 border border-emerald-100', icon: CheckCircle2, iconColor: 'text-emerald-500' };
  };

  const getProtrusionStatus = (val: number) => {
    if (val > 2) return { label: t.moderate, color: 'bg-rose-50 text-rose-700 border border-rose-100', icon: AlertTriangle, iconColor: 'text-rose-500' };
    if (val > 0.5) return { label: t.noticeable, color: 'bg-amber-50 text-amber-700 border border-amber-100', icon: ArrowUpRight, iconColor: 'text-amber-500' };
    return { label: t.flush, color: 'bg-emerald-50 text-emerald-700 border border-emerald-100', icon: CheckCircle2, iconColor: 'text-emerald-500' };
  };

  const getWeightStatus = (w: number) => {
    if (w > 15) return { label: lang === 'id' ? 'Berat' : 'Heavy', color: 'bg-rose-50 text-rose-700 border border-rose-100' };
    if (w > 10) return { label: lang === 'id' ? 'Sedang' : 'Moderate', color: 'bg-amber-50 text-amber-700 border border-amber-100' };
    if (w > 5) return { label: lang === 'id' ? 'Ringan' : 'Light', color: 'bg-emerald-50 text-emerald-700 border border-emerald-100' };
    return { label: lang === 'id' ? 'Sangat Ringan' : 'Ultralight', color: 'bg-blue-50 text-blue-700 border border-blue-100' };
  };

  const etStatus = getETStatus(result.et);
  const antStatus = getProtrusionStatus(result.anteriorProtrusion);
  const postStatus = getProtrusionStatus(result.posteriorProtrusion);
  const weightStatus = getWeightStatus(result.weight);

  const isAnteriorUnsafe = result.anteriorProtrusion > 1.5;
  const isPosteriorUnsafe = result.posteriorProtrusion > 2.0;
  const isUnsafe = isAnteriorUnsafe || isPosteriorUnsafe;

  const totalPower = lens ? (lens.sph + (lens.cyl < 0 ? 0 : lens.cyl)) : 0;
  const isHighPower = lens ? (Math.abs(lens.sph) >= 4.0 || Math.abs(totalPower) >= 4.0) : false;
  const isHighDecentration = result.decentration > 3.0 && isHighPower;
  const inducedPrism = lens ? (Math.abs(totalPower) * (result.decentration / 10)) : 0;

  return (
    <div className="space-y-3">
      {/* Compatibility or Decentration Warnings */}
      {isUnsafe && (
        <div className="bg-red-50/90 border border-red-200/50 p-4 rounded-2xl text-[11.5px] text-red-800 flex items-start gap-3 shadow-md border-l-4 border-l-red-500 leading-relaxed">
          <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={16} />
          <div className="space-y-1">
            <p className="font-black text-rose-800 tracking-wide uppercase text-[10.5px]">
              {lang === 'id' ? '❌ Kompatibilitas Lensa Rendah' : '❌ Low Frame-Lens Compatibility'}
            </p>
            <div className="text-slate-600 font-medium space-y-1 mt-1">
              {isAnteriorUnsafe && (
                <p>
                  {lang === 'id' 
                    ? `• Lensa menonjol ke depan sebesar ${result.anteriorProtrusion.toFixed(1)}mm (melebihi batas aman 1.5mm). Risiko baret/pecah tinggi.`
                    : `• Anterior protrusion is ${result.anteriorProtrusion.toFixed(1)}mm (exceeding 1.5mm limit). Highly prone to outer surface scratches.`
                  }
                </p>
              )}
              {isPosteriorUnsafe && (
                <p>
                  {lang === 'id' 
                    ? `• Lensa menonjol ke belakang sebesar ${result.posteriorProtrusion.toFixed(1)}mm (melebihi batas aman 2.0mm). Risiko tinggi menyentuh pipi/mata dan membuat tidak nyaman.`
                    : `• Posterior protrusion is ${result.posteriorProtrusion.toFixed(1)}mm (exceeding 2.0mm limit). High risk of lash/skin contact and discomfort.`
                  }
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {isHighDecentration && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-[11px] text-amber-800 flex items-start gap-3 shadow-sm border-l-4 border-l-amber-500 leading-relaxed">
          <AlertTriangle className="text-amber-500 shrink-0 mt-1" size={15} />
          <div>
            <p className="font-black uppercase tracking-wide text-amber-900 text-[10.5px]">
              {lang === 'id' ? '⚠️ Peringatan Desentrasi Tinggi' : '⚠️ High Decentration Warning'}
            </p>
            <p className="mt-1 text-slate-600 font-medium font-sans">
              {lang === 'id' 
                ? `Desentrasi sebesar ${result.decentration.toFixed(1)}mm pada kekuatan lensa tinggi menimbulkan efek prisma sebesar ~${inducedPrism.toFixed(1)} Δ secara tidak sengaja. Hal ini dapat memicu ketegangan mata atau pusing. Gunakan frame yang melingkar atau lebar frame (A-Size) lebih kecil.`
                : `A decentration of ${result.decentration.toFixed(1)}mm on a high prescription induces an unintended prismatic effect of ~${inducedPrism.toFixed(1)} Δ. This can cause eye strain or visual fatigue. Consider a smaller frame width (A-Size) or DBL.`
              }
            </p>
          </div>
        </div>
      )}

      <div className="bg-slate-200/60 border border-slate-200 rounded-2xl grid grid-cols-2 lg:grid-cols-5 gap-px overflow-hidden shadow-sm">
        <StatItem 
          label={t.edgeThick} 
          value={result.et} unit="mm"
          status={etStatus.label} statusColor={etStatus.color}
          icon={etStatus.icon} iconColor={etStatus.iconColor}
          resultKey="et"
        />
        <StatItem 
          label={t.center} 
          value={result.ct} unit="mm"
          status={t.optimized} statusColor="bg-blue-50 text-blue-700 border border-blue-100/50"
          icon={CheckCircle2} iconColor="text-blue-500"
          resultKey="ct"
        />
        <StatItem 
          label={t.anteriorProt} 
          value={result.anteriorProtrusion} unit="mm"
          status={antStatus.label} statusColor={antStatus.color}
          icon={antStatus.icon} iconColor={antStatus.iconColor}
          resultKey="anteriorProtrusion"
        />
        <StatItem 
          label={t.posteriorProt} 
          value={result.posteriorProtrusion} unit="mm"
          status={postStatus.label} statusColor={postStatus.color}
          icon={postStatus.icon} iconColor={postStatus.iconColor}
          resultKey="posteriorProtrusion"
        />
        <StatItem 
          label={t.lensWeight} 
          value={result.weight} unit="g"
          status={weightStatus.label} statusColor={weightStatus.color}
          icon={Scale} iconColor="text-indigo-500"
          resultKey="weight"
        />
      </div>

      {/* Secondary Clinical Specs Row (highly visible on mobile & desktop without truncation) */}
      {frame && (
        <div className="bg-white border border-slate-200/90 rounded-2xl grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 overflow-hidden shadow-sm">
          <div className="flex items-center justify-between sm:justify-start gap-3 p-3 px-4 hover:bg-slate-50/40 transition-colors">
            <div className="flex items-center gap-2">
              <MoveHorizontal size={14} className="text-slate-400 group-hover:text-blue-500" />
              <span className="font-bold text-slate-500 text-[9px] uppercase tracking-wider">{t.framePd}</span>
            </div>
            <span className="font-mono font-bold text-slate-800 text-sm ml-auto sm:ml-2">
              {(frame.a + frame.dbl).toFixed(1)}
              <span className="text-[10px] font-normal text-slate-400 ml-0.5">mm</span>
            </span>
          </div>

          <div className="flex items-center justify-between sm:justify-start gap-3 p-3 px-4 hover:bg-slate-50/40 transition-colors">
            <div className="flex items-center gap-2">
              <Compass size={14} className="text-slate-400" />
              <span className="font-bold text-slate-500 text-[9px] uppercase tracking-wider">{t.decentration}</span>
            </div>
            <span className="font-mono font-bold text-slate-800 text-sm ml-auto sm:ml-2">
              {result.decentration.toFixed(2)}
              <span className="text-[10px] font-normal text-slate-400 ml-0.5">mm</span>
            </span>
          </div>

          <div className="flex items-center justify-between sm:justify-start gap-3 p-3 px-4 hover:bg-slate-50/40 transition-colors">
            <div className="flex items-center gap-2">
              <Diameter size={14} className="text-slate-400" />
              <span className="font-bold text-slate-500 text-[9px] uppercase tracking-wider">{t.minBlank}</span>
            </div>
            <span className="font-mono font-bold text-slate-800 text-sm ml-auto sm:ml-2">
              {(result.y * 2 + 2).toFixed(0)}
              <span className="text-[10px] font-normal text-slate-400 ml-0.5">mm</span>
            </span>
          </div>
        </div>
      )}

      {/* Accordion Clinical Guideline Info Footer */}
      <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
        <button
          onClick={() => setShowGuide(!showGuide)}
          className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-50/80 hover:bg-slate-100/80 text-slate-600 hover:text-slate-800 transition-all font-medium text-xs select-none cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Info size={14} className="text-blue-500" />
            <span>{currentNotes.title}</span>
          </div>
          <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${showGuide ? 'rotate-180' : ''}`} />
        </button>

        {showGuide && (
          <div className="p-4 border-t border-slate-100 bg-white grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-xs text-slate-600 leading-normal">
            <div className="space-y-1 bg-slate-50/40 p-3 rounded-lg border border-slate-100">
              <h5 className="font-bold text-slate-800 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                {currentNotes.etLabel}
              </h5>
              <p className="text-slate-500 pl-3 leading-relaxed mt-1 text-[11px]">{currentNotes.etDesc}</p>
            </div>
            
            <div className="space-y-1 bg-slate-50/40 p-3 rounded-lg border border-slate-100">
              <h5 className="font-bold text-slate-800 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                {currentNotes.ctLabel}
              </h5>
              <p className="text-slate-500 pl-3 leading-relaxed mt-1 text-[11px]">{currentNotes.ctDesc}</p>
            </div>
            
            <div className="space-y-1 bg-slate-50/40 p-3 rounded-lg border border-slate-100">
              <h5 className="font-bold text-slate-800 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                {currentNotes.protLabel}
              </h5>
              <p className="text-slate-500 pl-3 leading-relaxed mt-1 text-[11px]">{currentNotes.protDesc}</p>
            </div>

            <div className="space-y-1 bg-slate-50/40 p-3 rounded-lg border border-slate-100">
              <h5 className="font-bold text-slate-800 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-500"></span>
                {currentNotes.weightLabel}
              </h5>
              <p className="text-slate-500 pl-3 leading-relaxed mt-1 text-[11px]">{currentNotes.weightDesc}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
