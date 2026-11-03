import { useEffect, useMemo } from "react";
import * as THREE from "three";
import type { FrameType } from "../../lib/optic-engine/types";
import type { FrameParameters, PatientParameters } from "../../lib/optic-engine/types";
import type { LensField } from "../../lib/optic-3d/field";
import { buildFrameGeometry } from "../../lib/optic-3d/frameMesh";

/**
 * The frame, drawn as far as the model reaches.
 *
 * The band around the opening, the groove it holds the lens by, and the bridge
 * to the second opening. The second opening carries no lens: this surface is
 * about the one lens the order is for, and a second lens would double the glass
 * the optician is asked to look through.
 *
 * The frame is deliberately unreactive — matte, no clearcoat, no reflection of
 * the lens. The lens must stay the only object that bends light, or the
 * patient conversation turns into a conversation about the frame.
 */
export interface FrameBodyProps {
  field: LensField;
  frame: FrameParameters;
  patient: PatientParameters;
  frameType: FrameType;
  bevelPercent: number;
  color: string;
  secondOpening?: boolean;
  visible?: boolean;
  /** Cutting planes, for a section view. */
  clipping?: THREE.Plane[];
}

export function FrameBody({
  field,
  frame,
  patient,
  frameType,
  bevelPercent,
  color,
  secondOpening = true,
  visible = true,
  clipping,
}: FrameBodyProps) {
  const { body, second } = useMemo(
    () =>
      buildFrameGeometry(field, frame, patient, {
        frameType,
        bevelPercent,
        secondOpening,
      }),
    [field, frame, patient, frameType, bevelPercent, secondOpening],
  );

  useEffect(
    () => () => {
      body.dispose();
      second?.dispose();
    },
    [body, second],
  );

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(color),
        metalness: 0.05,
        roughness: 0.72,
        side: THREE.DoubleSide,
        clippingPlanes: clipping,
        clipShadows: true,
      }),
    [color, clipping],
  );

  useEffect(() => () => material.dispose(), [material]);

  return (
    <group visible={visible}>
      <mesh geometry={body} material={material} castShadow receiveShadow />
      {second && <mesh geometry={second} material={material} castShadow receiveShadow />}
    </group>
  );
}