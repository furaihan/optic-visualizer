import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Environment, Lightformer, OrbitControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import type { FrameType } from "../../lib/optic-engine/types";
import type { FrameParameters, PatientParameters } from "../../lib/optic-engine/types";
import type { LensField } from "../../lib/optic-3d/field";
import { findThickestMeridian } from "../../lib/optic-3d/field";
import { LensBody } from "./LensBody";
import { FrameBody } from "./FrameBody";

/**
 * Views the surface offers.
 *
 * Each is a camera position and a target, in the lens's own millimetres, so a
 * preset means the same thing for a small opening and a large one — the frame
 * is framed, not a fixed distance.
 */
export type ViewPreset = "oblique" | "governing" | "profile" | "plan" | "front" | "section";

export interface LensSceneProps {
  field: LensField;
  frame: FrameParameters;
  patient: PatientParameters;
  frameType: FrameType;
  bevelPercent: number;
  index: number;
  preset: ViewPreset;
  /** Whether the body may animate into the new state. */
  motion: boolean;
  colors: { frame: string; ground: string; stage: string; ink: string };
  heat: boolean;
}

/** What the surface is being asked to show, and how much room it needs. */
interface Extent {
  centre: THREE.Vector3;
  halfWidth: number;
  halfHeight: number;
}

/**
 * The pair's extent: the two openings and the bridge between them.
 *
 * This is the object in the room, so it is what the camera frames. Framing
 * only the ordered lens cuts its partner in half and makes a pair look like a
 * mistake.
 */
function pairExtent(field: LensField, frame: FrameParameters): Extent {
  const offset = frame.a + frame.dbl;
  const left = -field.opening.halfWidth - 3;
  const right = offset + field.opening.halfWidth + 3;
  return {
    centre: new THREE.Vector3((left + right) / 2, field.opening.ocY, field.groove),
    halfWidth: (right - left) / 2,
    halfHeight: field.opening.halfHeight + 4,
  };
}

/**
 * How far back the camera has to stand to hold an extent.
 *
 * Worked out from the camera's own field of view and aspect rather than from a
 * hand-tuned distance, so the framing holds at any window size and for any
 * frame the optician enters. The margin leaves room for the orbit.
 */
function fitDistance(extent: Extent, camera: THREE.PerspectiveCamera, margin = 1.22): number {
  const fov = (camera.fov * Math.PI) / 180;
  const aspect = Math.max(camera.aspect, 0.6);
  const forHeight = (extent.halfHeight * margin) / Math.tan(fov / 2);
  const forWidth = (extent.halfWidth * margin) / (Math.tan(fov / 2) * aspect);
  return Math.max(forHeight, forWidth, 40);
}


/**
 * What a view is about.
 *
 * The oblique, plan and front views are about the pair — that is what the
 * optician hands the patient, and what the frame looks like on a face. The
 * profile, section and governing views are about one lens, because a section
 * through a pair is a drawing of one lens with the bridge in the way.
 *
 * Declaring it here means the camera and what is drawn cannot disagree about
 * what the view is.
 */
export function viewScope(preset: ViewPreset): "pair" | "lens" {
  return preset === "oblique" || preset === "plan" || preset === "front" ? "pair" : "lens";
}

/**
 * Whether a view is a section, and therefore whether the body is cut.
 *
 * A section view that is not cut is not a section: the near rim stands between
 * the camera and the lens and paints the whole frame with itself. The sheet has
 * the same problem and solves it the same way — its side elevation draws the
 * rim cut through, so the lens section is what is being read.
 */
export function isSection(preset: ViewPreset): boolean {
  return preset === "profile" || preset === "section";
}

/** Where the camera stands for each preset, in millimetres from the opening's centre. */
function cameraFor(
  preset: ViewPreset,
  field: LensField,
  frame: FrameParameters,
  camera: THREE.PerspectiveCamera,
): { position: THREE.Vector3; target: THREE.Vector3 } {
  const pair = pairExtent(field, frame);
  const lensCentre = new THREE.Vector3(field.opening.ocX, field.opening.ocY, field.groove);
  const lensExtent: Extent = {
    centre: lensCentre,
    halfWidth: field.opening.halfWidth + 6,
    halfHeight: field.opening.halfHeight + 6,
  };

  const pairDistance = fitDistance(pair, camera);
  const lensDistance = fitDistance(lensExtent, camera);
  // The section is thin, so it is framed by the lens's height and by how deep
  // the body is along the axis — not by the width the face fills.
  const sectionExtent: Extent = {
    centre: lensCentre,
    halfWidth: field.opening.halfHeight + 4,
    halfHeight: field.opening.halfHeight + 4,
  };
  // A camera looking down a meridian stands where the frame is. It has to be
  // far enough back to clear the band around the opening, or the near rim is
  // all that fills the frame — which is what a section view must never be.
  const band = 2.5 + 2;
  const clearance = (field.opening.halfWidth + band + 10) / Math.tan(((camera.fov * Math.PI) / 180) / 2);
  const sectionDistance = Math.max(
    fitDistance(sectionExtent, camera),
    field.opening.halfWidth + band + 26,
    clearance * 0.62,
  );

  switch (preset) {
    case "profile":
      // The side elevation the sheet draws: the lens seen edge-on down the
      // horizontal meridian through the optical centre. The camera stands off
      // along +x and looks back down it, so the body fills the frame as a
      // section — a thin sliver at the centre and the rim's bevel at the ends,
      // which is exactly what the sheet's own profile is a drawing of.
      return {
        position: lensCentre.clone().add(new THREE.Vector3(sectionDistance, 0, 0)),
        target: lensCentre,
      };
    case "plan":
      return {
        position: pair.centre.clone().add(new THREE.Vector3(0, 0, pairDistance)),
        target: pair.centre,
      };
    case "front":
      return {
        position: pair.centre.clone().add(new THREE.Vector3(0, 0, -pairDistance)),
        target: pair.centre,
      };
    case "section":
      // From above, looking down the vertical meridian the lens hangs by.
      return {
        position: lensCentre.clone().add(new THREE.Vector3(0, lensDistance, 0)),
        target: lensCentre,
      };
    case "governing": {
      // Frame the thickest edge the field can find: the corner a flat drawing
      // cannot point at.
      const thickest = findThickestMeridian(field, 720);
      const angle = (thickest.theta * Math.PI) / 180;
      const radius = thickest.radius * 0.75;
      const point = new THREE.Vector3(
        field.opening.ocX + Math.cos(angle) * radius,
        field.opening.ocY + Math.sin(angle) * radius,
        field.groove,
      );
      const distance = lensDistance * 1.05;
      return {
        position: point
          .clone()
          .add(
            new THREE.Vector3(
              Math.cos(angle) * distance * 0.5,
              Math.sin(angle) * distance * 0.5,
              distance,
            ),
          ),
        target: point,
      };
    }
    case "oblique":
    default:
      // The opening frame: three-quarters on, so the bevel, the thick corner
      // and the protrusion are all readable before anything is touched.
      return {
        position: pair.centre
          .clone()
          .add(
            new THREE.Vector3(
              pairDistance * 0.5,
              pairDistance * 0.3,
              pairDistance * 0.82,
            ),
          ),
        target: pair.centre,
      };
  }
}

/**
 * The scene.
 *
 * A bench, not a studio: the ground is the sheet's own stage ink, the key light
 * is a single directional one from the upper left, and the only dramatic object
 * is the lens. There is no environment map of someone else's sky and no glow.
 */
export function LensScene({
  field,
  frame,
  patient,
  frameType,
  bevelPercent,
  index,
  preset,
  motion,
  colors,
  heat,
}: LensSceneProps) {
  const controls = useRef<any>(null);
  const { camera } = useThree();

  const framing = useMemo(
    () => cameraFor(preset, field, frame, camera as THREE.PerspectiveCamera),
    [preset, field, frame, camera],
  );

  /**
   * The camera travels to a preset, or cuts to it when motion is frozen.
   *
   * It always moves: a view that does not change when its control is pressed is
   * broken, whatever the motion setting. Only the travel is optional.
   */
  const travel = useRef<{
    from: THREE.Vector3;
    to: THREE.Vector3;
    fromTarget: THREE.Vector3;
    toTarget: THREE.Vector3;
    t: number;
    duration: number;
  } | null>(null);

  useEffect(() => {
    const target = controls.current?.target ?? new THREE.Vector3();
    if (!motion) {
      camera.position.copy(framing.position);
      camera.lookAt(framing.target);
      target.copy(framing.target);
      controls.current?.update();
      travel.current = null;
      return;
    }
    travel.current = {
      from: camera.position.clone(),
      to: framing.position.clone(),
      fromTarget: target.clone(),
      toTarget: framing.target.clone(),
      t: 0,
      duration: 0.55,
    };
  }, [framing, motion, camera]);

  useFrame((_, delta) => {
    const move = travel.current;
    if (!move) return;
    move.t = Math.min(1, move.t + delta / move.duration);
    // The same ease the sheet's own redraw uses: it arrives, then settles.
    const k = 1 - Math.pow(1 - move.t, 3);
    camera.position.lerpVectors(move.from, move.to, k);
    const target = controls.current?.target;
    if (target) {
      target.lerpVectors(move.fromTarget, move.toTarget, k);
      controls.current?.update();
    } else {
      camera.lookAt(move.toTarget);
    }
    if (move.t >= 1) travel.current = null;
  });

  /**
   * The cutting plane for a section view.
   *
   * It runs through the optical centre along the horizontal meridian, so the
   * half of the frame nearest the camera is removed and the lens's own section
   * is left standing in the opening. Nothing is faked: the geometry is the
   * geometry, with half of it not drawn.
   */
  const clipping = useMemo(() => {
    if (!isSection(preset)) return [] as THREE.Plane[];
    return [new THREE.Plane(new THREE.Vector3(-1, 0, 0), field.opening.ocX)];
  }, [preset, field.opening.ocX]);

  const ground = useMemo(
    () =>
      new THREE.Mesh(
        new THREE.PlaneGeometry(600, 600),
        new THREE.MeshStandardMaterial({ color: new THREE.Color(colors.stage), roughness: 1, metalness: 0 }),
      ),
    [colors.stage],
  );

  useEffect(() => () => {
    ground.geometry.dispose();
    (ground.material as THREE.Material).dispose();
  }, [ground]);

  return (
    <>
      <color attach="background" args={[colors.stage]} />

      {/* The environment above is the light. Direct lights are here only to
          cast the shadow that gives the body weight, and to keep the frame's
          own faces separated — not to illuminate the glass, which they blow
          out to opaque white the moment they are given any strength. */}
      <ambientLight intensity={0.18} />
      <hemisphereLight args={["#ffffff", colors.stage, 0.22]} />
      <directionalLight
        position={[-120, 160, 90]}
        intensity={0.9}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-60}
        shadow-camera-right={60}
        shadow-camera-top={60}
        shadow-camera-bottom={-60}
        shadow-camera-near={10}
        shadow-camera-far={400}
        shadow-bias={-0.0005}
      />
      {/* A second, softer light from behind so the back surface reads as depth
          rather than as a flat tint. */}
      <directionalLight position={[80, -40, -120]} intensity={0.35} />

      <group position={[0, 0, 0]}>
        <LensBody field={field} index={index} duration={motion ? 0.28 : 0} heat={heat} clipping={clipping} />
        <FrameBody
          field={field}
          frame={frame}
          patient={patient}
          frameType={frameType}
          bevelPercent={bevelPercent}
          color={colors.frame}
          secondOpening={viewScope(preset) === "pair"}
          clipping={clipping}
        />
      </group>

      {/* The bench the lens is laid on, not a wall behind it: the plane lies
          under the frame and takes the body's own shadow, which is what makes
          the protrusion a thing with weight rather than a floating shell. */}
      <primitive
        object={ground}
        position={[0, -field.opening.halfHeight - 34, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      />

      {/* The room the glass bends.
          Built here rather than loaded: a download would put a stranger's
          studio behind the lens, and the lens is the only thing on this screen
          that is allowed to be a subject. Two soft panels and a bright strip
          are enough for a bevel to catch, a back surface to darken against and
          the operator's eye to read the material as material. */}
      <Environment resolution={256} frames={1}>
        {/* A room with a dark side. Glass is only visible where what is behind
            it differs from what is beside it; a uniformly pale environment
            refracts to uniformly pale, which is fog. The dark shoulder here is
            what the bevel's refraction is read against. */}
        <color attach="background" args={["#20303a"]} />
        <Lightformer
          form="rect"
          intensity={5}
          color="#ffffff"
          position={[-45, 26, 55]}
          scale={[80, 46, 1]}
          rotation={[0, -0.5, 0]}
        />
        <Lightformer
          form="rect"
          intensity={2.2}
          color="#cfe3ee"
          position={[55, -18, 35]}
          scale={[46, 80, 1]}
          rotation={[0, 0.7, 0]}
        />
        <Lightformer
          form="circle"
          intensity={7}
          color="#ffffff"
          position={[10, 70, -30]}
          scale={[20, 20, 1]}
        />
        {/* One narrow strip, the way a window's edge lands on a lens. */}
        <Lightformer
          form="rect"
          intensity={9}
          color="#ffffff"
          position={[0, 0, 90]}
          scale={[9, 120, 1]}
        />
      </Environment>

      <OrbitControls
        ref={controls}
        makeDefault
        target={framing.target}
        enablePan={false}
        enableDamping={motion}
        dampingFactor={0.08}
        minDistance={20}
        maxDistance={260}
        minPolarAngle={0.12}
        maxPolarAngle={Math.PI - 0.12}
      />
    </>
  );
}