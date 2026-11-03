import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type { LensField } from "../../lib/optic-3d/field";
import { buildLensGeometry } from "../../lib/optic-3d/lensMesh";
import { paintThickness } from "../../lib/optic-3d/heatmap";

/**
 * The lens body.
 *
 * One mesh, one refractive material. The mesh is a single solid rather than
 * three shells, so the material bends what is behind it as one piece of glass.
 *
 * The body morphs rather than being replaced. Both faces are parameterised on
 * the same grid, so a new prescription produces the same vertex count in the
 * same order; the morph eases the old vertices into the new ones and the lens
 * visibly becomes the lens in the new prescription instead of blinking into it.
 *
 * Normals are recomputed once, at the end of the move, not every frame: the
 * surface of a spectacle lens changes by fractions of a millimetre across a
 * prescription change, so shading it from the normals it left with is
 * indistinguishable — and recomputing 25 000 normals per frame is how a smooth
 * morph becomes a stutter.
 */

export interface LensBodyProps {
  field: LensField;
  /** The lens index, which is the material's own index of refraction. */
  index: number;
  /** How long the morph runs for, in seconds. Zero snaps, which is what a freeze asks for. */
  duration?: number;
  visible?: boolean;
  /** Paint the body with its own thickness instead of drawing it as glass. */
  heat?: boolean;
  /** Cutting planes, for a section view. Empty when the body is whole. */
  clipping?: THREE.Plane[];
  /** The thickness range the map is painted against, shared with its legend. */
  domain?: { min: number; max: number };
}

const eased = (t: number) => 1 - Math.pow(1 - t, 3);

export function LensBody({
  field,
  index,
  duration = 0.28,
  visible = true,
  heat = false,
  clipping,
  domain,
}: LensBodyProps) {
  const mesh = useRef<THREE.Mesh>(null);

  const geometry = useMemo(() => {
    const body = buildLensGeometry(field);
    // The map is computed once per body: it is a property of that body's
    // shape, so it is rebuilt exactly when the shape is.
    paintThickness(body, field, domain);
    return body;
  }, [field, domain]);

  /** Where the body is drawn now, and why. */
  const from = useRef<Float32Array | null>(null);
  const to = useRef<Float32Array>(new Float32Array(0));
  const progress = useRef(1);

  const target = useMemo(
    () => new Float32Array(geometry.getAttribute("position").array as Float32Array),
    [geometry],
  );

  useEffect(() => {
    const current = mesh.current;
    if (!current) return;
    const attribute = current.geometry.getAttribute("position") as THREE.BufferAttribute;
    const live = new Float32Array(attribute.array as Float32Array);

    to.current = target;

    if (live.length === target.length && duration > 0 && !from.current) {
      from.current = live;
      progress.current = 0;
    } else {
      from.current = null;
      progress.current = 1;
      attribute.copyArray(target);
      attribute.needsUpdate = true;
      current.geometry.computeVertexNormals();
    }
  }, [target, duration]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((_, delta) => {
    const current = mesh.current;
    const origin = from.current;
    if (!current || !origin) return;

    const attribute = current.geometry.getAttribute("position") as THREE.BufferAttribute;
    progress.current = Math.min(1, progress.current + delta / Math.max(duration, 1e-3));
    const t = eased(progress.current);
    const array = attribute.array as Float32Array;
    const destination = to.current;

    for (let i = 0; i < array.length; i += 1) {
      array[i] = origin[i] + (destination[i] - origin[i]) * t;
    }
    attribute.needsUpdate = true;

    if (progress.current >= 1) {
      from.current = null;
      current.geometry.computeVertexNormals();
    }
  });

  const glass = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color("#f2fbfa"),
        metalness: 0,
        roughness: 0.03,
        transmission: 1,
        // The physical thickness the material attenuates over, in the lens's
        // own millimetres: a 1.00 mm centre tints less than a 4.49 mm edge,
        // which is why a minus lens is darker at its rim.
        thickness: Math.max(0.6, field.backApexZ - field.frontApexZ),
        ior: index,
        clearcoat: 0.08,
        clearcoatRoughness: 0.12,
        attenuationColor: new THREE.Color("#8fcfc6"),
        attenuationDistance: 45,
        specularIntensity: 1,
        side: THREE.DoubleSide,
        transparent: true,
        clippingPlanes: clipping,
        clipShadows: true,
      }),
    [index, field, clipping],
  );

  useEffect(() => () => glass.dispose(), [glass]);

  /**
   * The map's own material.
   *
   * Solid, vertex-coloured, and lit from the same environment as the glass, so
   * the shape still reads as a body rather than as a chart. The thickness is
   * the colour; the shading is what makes it a lens.
   */
  const chart = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        vertexColors: true,
        metalness: 0,
        roughness: 0.62,
        side: THREE.DoubleSide,
        clippingPlanes: clipping,
        clipShadows: true,
      }),
    [clipping],
  );

  useEffect(() => () => chart.dispose(), [chart]);

  return (
    <mesh
      ref={mesh}
      geometry={geometry}
      material={heat ? chart : glass}
      visible={visible}
      castShadow
      receiveShadow
      frustumCulled={false}
    />
  );
}