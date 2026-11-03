import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { useSearch, useNavigate } from "@tanstack/react-router";
import type { SimulatorSearchParams } from "../../types/search-params";
import { useOpticalContext } from "../../contexts/OpticalContext";
import { translations } from "../../lib/translations";
import type { AppTranslations } from "../../lib/translations/types";
import { buildLensField, findThickestMeridian } from "../../lib/optic-3d/field";
import { useThreeCapability } from "./useThreeCapability";
import { useTweenState, setMotionFrozen } from "./useTween";
import { useSheetColors } from "./useSheetColors";
import { LensScene, type ViewPreset } from "./LensScene";
import { RailFigures, type RailKey } from "./RailFigures";
import { Button } from "../ui/button";
import { Toggle } from "../ui/toggle";
import { HeatLegend } from "./HeatLegend";
import { PrescriptionBar } from "./PrescriptionBar";
import { thicknessRange } from "../../lib/optic-3d/heatmap";

/**
 * The 3D surface: the lens body, on its own screen.
 *
 * The surface is deliberately thin. It owns the camera state, the toggles and
 * the Present composition; everything that produces a number is read from the
 * session's own `CalculationResult`, and everything that draws a surface is
 * built from the same `SectionGeometry` the sheet's two elevations are built
 * from. That is the whole contract: this screen may explain the lens, it may
 * never disagree about it.
 */
export function ThreeSurface() {
  const search = useSearch({ strict: false }) as unknown as SimulatorSearchParams;
  const navigate = useNavigate();
  const t = translations[search.lang];
  const capability = useThreeCapability();
  const colors = useSheetColors();

  const { lens, frame, patient, frameType, bevelPercent, result } = useOpticalContext();

  const [preset, setPreset] = useState<ViewPreset>("oblique");
  // Pressing the preset you are already on brings the camera home, which is the
  // only way back after orbiting away from it.
  const [returnHome, setReturnHome] = useState(0);
  const [present, setPresent] = useState(false);
  const [claimStep, setClaimStep] = useState(0);
  const [frozen, setFrozenState] = useState(false);
  const [rail, setRail] = useState<RailKey | null>(null);
  const [heat, setHeat] = useState(false);
  const tween = useTweenState();
  const [systemReduced, setSystemReduced] = useState(false);

  // The system's own preference is not a suggestion: a reader who has asked
  // for no motion gets a camera that cuts, not one that travels.
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setSystemReduced(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  /**
   * The body, or the reason there is none.
   *
   * A lens the engine refuses is not a device problem: the prescription cannot
   * be surfaced in this frame, and the sheet says why. Collapsing that into the
   * capability notice would tell the optician their screen is inadequate when
   * what is wrong is the job on it.
   */
  const built = useMemo(() => {
    try {
      return { field: buildLensField({ result, lens, frame, patient }), reason: null as string | null };
    } catch (error) {
      return {
        field: null,
        reason: error instanceof Error ? error.message : String(error),
      };
    }
  }, [result, lens, frame, patient]);

  const field = built.field;

  /**
   * The range the thickness map is painted against, and the range its legend
   * prints. One value, used twice.
   */
  const domain = useMemo(() => thicknessRange(result), [result]);

  const governing = useMemo(
    () => (field ? findThickestMeridian(field, 720) : null),
    [field],
  );

  // The freeze switch must outlive the component, or a route change would
  // leave the next surface frozen with no control to thaw it.
  useEffect(() => () => setMotionFrozen(false), []);

  const back = () =>
    navigate({
      to: "/visualizer",
      search: { ...search, activeTab: "visualizer", view: "side" },
    } as never);

  if (capability === "pending") {
    return (
      <div className="flex h-full items-center justify-center bg-sheet-ground">
        <p className="text-[14px] text-sheet-muted">{t.view3dLoading}</p>
      </div>
    );
  }

  if (capability === "unsupported") {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-5 bg-sheet-ground px-8 text-center">
        <h1 className="max-w-[34ch] text-[22px] font-medium leading-tight tracking-[-0.02em] text-sheet-ink">
          {t.view3dUnavailableTitle}
        </h1>
        <p className="max-w-[52ch] text-[15px] leading-relaxed text-sheet-muted">
          {t.view3dUnavailableBody}
        </p>
        <Button variant="default" onClick={back} className="mt-1 rounded-sm">
          {t.view3dUnavailableOpen}
        </Button>
      </div>
    );
  }

  // The engine refused this lens. The body cannot be drawn because there is no
  // body to draw, and the reason is the engine's own, in its own words.
  if (!field) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-5 bg-sheet-ground px-8 text-center">
        <h1 className="max-w-[38ch] text-[22px] font-medium leading-tight tracking-[-0.02em] text-sheet-ink">
          {t.view3dNoBodyTitle}
        </h1>
        <p className="max-w-[56ch] text-[15px] leading-relaxed text-sheet-muted">
          {built.reason ?? t.view3dNoBodyBody}
        </p>
        <Button variant="default" onClick={back} className="mt-1 rounded-sm">
          {t.view3dBack}
        </Button>
      </div>
    );
  }

  const motion = !frozen && !systemReduced && !tween.reduced;

  const presets: { key: ViewPreset; label: string }[] = [
    { key: "oblique", label: t.view3dOblique },
    { key: "governing", label: t.view3dGoverning },
    { key: "profile", label: t.view3dProfile },
    { key: "plan", label: t.view3dPlan },
    { key: "front", label: t.view3dFront },
  ];

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden bg-sheet-ground">
      <h1 className="sr-only">{t.view3dTitle}</h1>

      <header
        className={`flex min-h-12 shrink-0 items-center gap-2 border-b border-sheet-stage px-3 py-1 sm:px-4 ${
          present ? "hidden" : ""
        }`}
      >
        <Button
          variant="ghost"
          onClick={back}
          className="h-9 shrink-0 rounded-sm px-2 text-[13px] font-medium text-sheet-muted hover:bg-sheet-panel hover:text-sheet-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheet-accent"
        >
          {t.view3dBack}
        </Button>

        <div className="ml-1 flex min-w-0 items-center gap-0 rounded-none bg-sheet-panel p-1">
          {presets.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                setPreset(item.key);
                setReturnHome((n) => n + 1);
              }}
              aria-pressed={preset === item.key}
              className={`h-8 whitespace-nowrap px-3 text-[13px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheet-accent ${
                preset === item.key
                  ? "bg-sheet-ground text-sheet-ink"
                  : "text-sheet-muted hover:text-sheet-ink"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-1">
          <ToggleRow
            label={t.view3dHeat}
            pressed={heat}
            onPressedChange={setHeat}
          />
          <ToggleRow
            label={frozen ? t.view3dThaw : t.view3dFreeze}
            pressed={frozen}
            onPressedChange={(next) => {
              setFrozenState(next);
              setMotionFrozen(next);
            }}
          />
          <Button
            variant={present ? "default" : "ghost"}
            onClick={() => {
              setPresent((value) => !value);
              setClaimStep(0);
            }}
            className="h-9 rounded-sm px-3 text-[13px] font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheet-accent"
          >
            {present ? t.view3dPresentExit : t.view3dPresent}
          </Button>
        </div>
      </header>

      <div className="relative flex min-h-0 flex-1">
        <div className="relative min-w-0 flex-1">
          {/*
            The drawing is a picture of a measurement, so it is labelled as one
            and the figures beside it are its text equivalent: every value it
            shows is on the rail and in the transcript below, at full contrast,
            for a reader who cannot see the body.
          */}
          <p className="sr-only" id="three-drawing-description">
            {t.view3dDrawingAlt}
          </p>
          <Canvas
            shadows
            dpr={[1, Math.min(2, typeof window !== "undefined" ? window.devicePixelRatio : 1)]}
            camera={{ position: [60, -40, 70], fov: 38, near: 1, far: 1200 }}
            gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
            aria-label={t.view3dDrawingAlt}
            role="img"
            onCreated={({ gl }) => {
              // The section views cut the body; a plane has to be allowed to.
              gl.localClippingEnabled = true;
              gl.toneMapping = THREE.ACESFilmicToneMapping;
              gl.toneMappingExposure = 1.05;
              gl.shadowMap.type = THREE.PCFShadowMap;
            }}
          >
            <Suspense fallback={null}>
              <LensScene
                field={field}
                frame={frame}
                patient={patient}
                frameType={frameType}
                bevelPercent={bevelPercent}
                index={lens.index}
                preset={present ? "governing" : preset}
                returnHome={returnHome}
                motion={motion}
                colors={colors}
                heat={heat}
                target={present ? null : rail}
                blankDiameter={result.minBlank ?? 0}
                domain={domain}
              />
            </Suspense>
          </Canvas>

          {/* The prescription the body was built from. Without it the body
              is a shape: a thicker edge with no reason on screen for being
              thicker. It recedes in Present mode, which states claims. */}
          {!present && <PrescriptionBar lens={lens} frame={frame} t={t} />}

          {/* The one line the model always states. It is a caption on the
              drawing, not a disclaimer under it, so it moves with the board and
              never scrolls away. Present mode moves it up out of the way of
              the controls, and keeps it: a claim shown to a patient is still a
              claim about a flat frame plane. */}
          <p
            className={`pointer-events-none absolute max-w-[46ch] text-[12px] leading-relaxed text-sheet-muted ${
              present ? "bottom-24 right-10 w-[34ch] text-right" : "bottom-3 left-4"
            }`}
          >
            {t.view3dModelNote}
          </p>

          {heat && !present && field && (
            <HeatLegend min={domain.min} max={domain.max} t={t} />
          )}

          {present && (
            <PresentOverlay
              t={t}
              step={claimStep}
              onNext={() => setClaimStep((s) => Math.min(2, s + 1))}
              onBack={() => setClaimStep((s) => Math.max(0, s - 1))}
              onExit={() => setPresent(false)}
              result={result}
              frame={frame}
            />
          )}
        </div>

        {!present && (
          <RailFigures
            result={result}
            bevelPercent={bevelPercent}
            frameDepth={frame.depth}
            t={t}
            active={rail}
            onHover={setRail}
            governingAngle={governing?.theta}
          />
        )}
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  pressed,
  onPressedChange,
}: {
  label: string;
  pressed: boolean;
  onPressedChange: (pressed: boolean) => void;
}) {
  return (
    <Toggle
      pressed={pressed}
      onPressedChange={onPressedChange}
      className="h-9 rounded-sm px-3 text-[13px] font-medium text-sheet-muted data-[state=on]:bg-sheet-panel data-[state=on]:text-sheet-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheet-accent"
      aria-label={label}
    >
      {label}
    </Toggle>
  );
}

/**
 * The Present composition: three claims, advanced by the optician.
 *
 * Nothing advances on its own. A patient reading the screen while the optician
 * talks is the one situation where an animation that keeps going is a
 * discourtesy, so every step is a deliberate press — and the optician's own
 * chrome is gone while it is up, because a toolbar behind a claim is a
 * toolbar the patient can see.
 *
 * The claims sit in their own column, clear of the body: a sentence laid across
 * the object it describes is unreadable and reads as an accident.
 */
function PresentOverlay({
  t,
  step,
  onNext,
  onBack,
  onExit,
  result,
  frame,
}: {
  t: AppTranslations;
  step: number;
  onNext: () => void;
  onBack: () => void;
  onExit: () => void;
  result: { et: number; anteriorProtrusion: number; posteriorProtrusion: number; ct: number };
  frame: { depth: number };
}) {
  const claims = [t.view3dPresentClaim1, t.view3dPresentClaim2, t.view3dPresentClaim3];
  const figures = [
    `${result.et.toFixed(2)} mm`,
    `${Math.max(result.anteriorProtrusion, result.posteriorProtrusion).toFixed(2)} mm`,
    `${frame.depth.toFixed(1)} mm`,
  ];
  const notes = [null, null, t.view3dPresentClaim3Note];

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight" || event.key === " ") {
        event.preventDefault();
        onNext();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        onBack();
      } else if (event.key === "Escape") {
        event.preventDefault();
        onExit();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onNext, onBack, onExit]);

  return (
    <div className="pointer-events-none absolute inset-0 flex items-end justify-between gap-8 p-10">
      <div className="max-w-[38ch]">
        <p className="text-[13px] uppercase tracking-[0.16em] text-sheet-muted">
          {step + 1} / {claims.length}
        </p>
        <p className="mt-4 text-[30px] font-medium leading-[1.15] tracking-[-0.02em] text-sheet-ink">
          {claims[step]}
        </p>
        <p
          className="mt-5 text-[52px] font-medium leading-none tracking-[-0.03em] text-sheet-ink"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {figures[step]}
        </p>
        {notes[step] && (
          <p className="mt-3 max-w-[34ch] text-[13px] leading-relaxed text-sheet-muted">
            {notes[step]}
          </p>
        )}
      </div>

      <div className="pointer-events-auto flex items-center gap-2 self-end border border-sheet-stage bg-sheet-ground p-1">
        <Button
          variant="ghost"
          onClick={onBack}
          disabled={step === 0}
          className="h-9 rounded-sm px-4 text-[13px] font-medium text-sheet-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheet-accent disabled:text-sheet-muted/70"
        >
          {t.view3dBackStep}
        </Button>
        <Button
          variant="default"
          onClick={step === 2 ? onExit : onNext}
          className="h-9 rounded-sm px-4 text-[13px] font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheet-accent"
        >
          {step === 2 ? t.view3dPresentExit : t.view3dNext}
        </Button>
      </div>
    </div>
  );
}