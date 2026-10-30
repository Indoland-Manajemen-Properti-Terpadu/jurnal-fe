export type Vec3 = { x: number; y: number; z: number };

export const rotateX = (p: Vec3, angle: number): Vec3 => {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return { x: p.x, y: p.y * c - p.z * s, z: p.y * s + p.z * c };
};

export const rotateY = (p: Vec3, angle: number): Vec3 => {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return { x: p.x * c + p.z * s, y: p.y, z: -p.x * s + p.z * c };
};

export const rotateZ = (p: Vec3, angle: number): Vec3 => {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return { x: p.x * c - p.y * s, y: p.x * s + p.y * c, z: p.z };
};

// Octahedron vertices & edges for the central Equilibrium Core
export const CORE_VERTICES: Vec3[] = [
  { x: 0, y: 1, z: 0 },
  { x: 1, y: 0, z: 0 },
  { x: 0, y: 0, z: 1 },
  { x: -1, y: 0, z: 0 },
  { x: 0, y: 0, z: -1 },
  { x: 0, y: -1, z: 0 },
];

export const CORE_EDGES: [number, number][] = [
  [0, 1],
  [0, 2],
  [0, 3],
  [0, 4],
  [5, 1],
  [5, 2],
  [5, 3],
  [5, 4],
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 1],
];
