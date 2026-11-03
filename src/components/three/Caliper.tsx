import { useEffect, useMemo } from "react";
import * as THREE from "three";
import type { LensField } from "../../lib/optic-3d/field";
import { figureAnchors, type AnchorKey } from "../../lib/optic-3d/anchors";

/**
 * The caliper for the figure under the pointer.
 *
 * Hovering a row on the rail points at the place on the body that number was
 * measured: a span across the two vertices for centre thickness, across the
 * rim for edge thickness, out to the frame's face for a protrusion. The rail
 * says what the number is; this says where it lives.
 *
 * A leader is a measurement mark, so it takes the sheet's own prescription ink
 * and is drawn as a hairline — the same grammar the elevations use, not a
 * glowing 3D gizmo.
 */
export interface CaliperProps {
  field: LensField;
  /** The meridian the figure is read in. */
  theta: number;
  /** The blank diameter the engine reported, for the blank anchor. */
  blankDiameter: number;
  target: AnchorKey | null;
  color: string;
  /**
   * The same cutting planes the body takes. A marker that survived the cut
   * would point at a surface that is no longer drawn, which is worse than no
   * marker at all.
   */
  clipping?: THREE.Plane[];
}

export function Caliper({
  field,
  theta,
  blankDiameter,
  target,
  color,
  clipping,
}: CaliperProps) {
  const anchors = useMemo(
    () => figureAnchors(field, theta, blankDiameter),
    [field, theta, blankDiameter],
  );

  const anchor = target ? anchors[target] : null;

  const lineMaterial = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: new THREE.Color(color),
        transparent: true,
        opacity: 0.9,
        clippingPlanes: clipping,
        depthTest: false,
      }),
    [color, clipping],
  );

  const dotMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(color),
        clippingPlanes: clipping,
        depthTest: false,
      }),
    [color, clipping],
  );

  /**
   * The marker's size is set against the lens, not against the world.
   *
   * The scene is about sixty millimetres across, so a fixed radius is a speck
   * on one frame and a ball on another. Tying it to the opening keeps the mark
   * a mark.
   */
  const dot = useMemo(
    () => new THREE.SphereGeometry(Math.max(0.9, field.opening.halfHeight * 0.045), 14, 10),
    [field.opening.halfHeight],
  );

  /** The span: the two faces the figure is measured between. */
  const span = useMemo(() => {
    if (!anchor?.span) return null;
    const geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(anchor.span.from.x, anchor.span.from.y, anchor.span.from.z),
      new THREE.Vector3(anchor.span.to.x, anchor.span.to.y, anchor.span.to.z),
    ]);
    return new THREE.Line(geometry, lineMaterial);
  }, [anchor, lineMaterial]);

  // Every object this component makes is released when it is replaced or the
  // surface unmounts: a rail that leaks a geometry per hover would climb in
  // memory through a working day.
  useEffect(() => () => span?.geometry.dispose(), [span]);
  useEffect(() => () => dot.dispose(), [dot]);
  useEffect(() => () => lineMaterial.dispose(), [lineMaterial]);
  useEffect(() => () => dotMaterial.dispose(), [dotMaterial]);

  if (!anchor) return null;

  return (
    <group>
      {span && <primitive object={span} renderOrder={10} />}
      <mesh
        geometry={dot}
        material={dotMaterial}
        position={[anchor.at.x, anchor.at.y, anchor.at.z]}
        renderOrder={11}
      />
    </group>
  );
}
