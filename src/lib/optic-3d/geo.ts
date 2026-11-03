import * as THREE from "three";

/**
 * The small amount of geometry plumbing the meshers share.
 *
 * Kept apart from the two builders so the lens and the frame are assembled the
 * same way, and so a change to how a part is welded or merged is made once.
 */

/** Positions and uvs being accumulated, with the indices that join them. */
export interface Part {
  positions: number[];
  uvs: number[];
  indices: number[];
}

export function emptyPart(): Part {
  return { positions: [], uvs: [], indices: [] };
}

/** Adds a vertex and answers its index. */
export function push(
  part: Part,
  x: number,
  y: number,
  z: number,
  u: number,
  v: number,
): number {
  const index = part.positions.length / 3;
  part.positions.push(x, y, z);
  part.uvs.push(u, v);
  return index;
}

/** Turns an accumulated part into a geometry with normals and a bounding sphere. */
export function toGeometry(part: Part): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(part.positions, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(part.uvs, 2));
  geometry.setIndex(part.indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
}

/**
 * Joins parts into one geometry.
 *
 * One mesh per material is the whole point: the lens is one refractive solid
 * rather than three shells that refract each other, and the frame is one draw
 * call rather than a dozen. The inputs are disposed as they are consumed.
 */
export function mergeParts(parts: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  let offset = 0;

  for (const part of parts) {
    const position = part.getAttribute("position");
    const uv = part.getAttribute("uv");
    for (let i = 0; i < position.count; i += 1) {
      positions.push(position.getX(i), position.getY(i), position.getZ(i));
      uvs.push(uv ? uv.getX(i) : 0, uv ? uv.getY(i) : 0);
    }
    const index = part.getIndex();
    if (index) {
      for (let i = 0; i < index.count; i += 1) indices.push(index.getX(i) + offset);
    } else {
      for (let i = 0; i < position.count; i += 1) indices.push(i + offset);
    }
    offset += position.count;
    part.dispose();
  }

  const merged = new THREE.BufferGeometry();
  merged.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  merged.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  merged.setIndex(indices);
  merged.computeVertexNormals();
  merged.computeBoundingSphere();
  return merged;
}

/** A quad, wound from the four vertex indices. */
export function quad(target: number[], a: number, b: number, c: number, d: number): void {
  target.push(a, b, c, b, d, c);
}

/**
 * The distance from the boxing centre to the edge of the opening in a
 * direction, for a shape grown outward by `expand`.
 *
 * The opening is the A x B box cut back by the circle of diameter ED, so the
 * rim band around it is the same shape grown by the band's width: the box
 * grown by the width, cut back by the circle grown by the width. Anything else
 * would make the band wander, and the frame would stop being the frame the
 * opening was cut for.
 */
export function grownOpeningRadius(
  opening: { halfWidth: number; halfHeight: number; shapeRadius: number },
  thetaDeg: number,
  expand = 0,
): number {
  const dx = Math.cos((thetaDeg * Math.PI) / 180);
  const dy = Math.sin((thetaDeg * Math.PI) / 180);
  const halfWidth = opening.halfWidth + expand;
  const halfHeight = opening.halfHeight + expand;
  const circle = opening.shapeRadius > 0 ? opening.shapeRadius + expand : Infinity;

  const boxRadius = Math.min(
    Math.abs(dx) > 1e-9 ? halfWidth / Math.abs(dx) : Infinity,
    Math.abs(dy) > 1e-9 ? halfHeight / Math.abs(dy) : Infinity,
  );
  return Math.min(circle, boxRadius);
}
