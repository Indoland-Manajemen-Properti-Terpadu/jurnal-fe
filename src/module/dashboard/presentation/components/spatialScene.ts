import { CORE_EDGES, CORE_VERTICES, rotateX, rotateY, rotateZ, type Vec3 } from './spatialMath';
import type { SpatialFinancialCanvasProps } from './SpatialFinancialCanvas';

export type SpatialOrbit = {
  id: string;
  label: string;
  value: string;
  radius: number;
  tiltX: number;
  tiltZ: number;
  speed: number;
  phase: number;
  color: string;
  glow: string;
  nodeSize: number;
};

export type SpatialStar = { pos: Vec3; size: number; alpha: number };

type OrbitInput = Pick<
  SpatialFinancialCanvasProps,
  | 'totalAssets'
  | 'totalLiabilities'
  | 'totalEquity'
  | 'formattedAssets'
  | 'formattedLiabilities'
  | 'formattedEquity'
  | 'formattedCash'
  | 'labels'
>;

export const createOrbits = ({
  totalAssets,
  totalLiabilities,
  totalEquity,
  formattedAssets,
  formattedLiabilities,
  formattedEquity,
  formattedCash,
  labels,
}: OrbitInput): SpatialOrbit[] => {
  const totalMagnitude = Math.max(
    1,
    Math.abs(totalAssets) + Math.abs(totalLiabilities) + Math.abs(totalEquity)
  );
  const assetWeight = Math.min(
    1.35,
    Math.max(0.75, (Math.abs(totalAssets) / totalMagnitude) * 2.2)
  );
  const liabWeight = Math.min(
    1.25,
    Math.max(0.65, (Math.abs(totalLiabilities) / totalMagnitude) * 2.5)
  );
  const equityWeight = Math.min(
    1.25,
    Math.max(0.65, (Math.abs(totalEquity) / totalMagnitude) * 2.5)
  );
  return [
    {
      id: 'assets',
      label: labels.assets,
      value: formattedAssets,
      radius: 112,
      tiltX: 0.22,
      tiltZ: -0.18,
      speed: 0.85,
      phase: 0.2,
      color: '#09B2FF',
      glow: 'rgba(9, 178, 255, 0.55)',
      nodeSize: 11 * assetWeight,
    },
    {
      id: 'equity',
      label: labels.equity,
      value: formattedEquity,
      radius: 88,
      tiltX: -0.38,
      tiltZ: 0.28,
      speed: 1.1,
      phase: 2.3,
      color: '#14b8a6',
      glow: 'rgba(20, 184, 166, 0.55)',
      nodeSize: 9.5 * equityWeight,
    },
    {
      id: 'liabilities',
      label: labels.liabilities,
      value: formattedLiabilities,
      radius: 68,
      tiltX: 0.48,
      tiltZ: 0.35,
      speed: -0.95,
      phase: 4.1,
      color: '#f59e0b',
      glow: 'rgba(245, 158, 11, 0.55)',
      nodeSize: 8.5 * liabWeight,
    },
    {
      id: 'cash',
      label: labels.cash,
      value: formattedCash,
      radius: 46,
      tiltX: -0.15,
      tiltZ: -0.42,
      speed: 1.45,
      phase: 1.1,
      color: '#60a5fa',
      glow: 'rgba(96, 165, 250, 0.55)',
      nodeSize: 7,
    },
  ];
};

export const createStars = (): SpatialStar[] =>
  Array.from({ length: 36 }, (_, idx) => {
    const theta = (idx * 2.39996) % (Math.PI * 2);
    const phi = Math.acos(1 - (2 * (idx + 0.5)) / 36);
    const r = 125 + (idx % 5) * 14;
    return {
      pos: {
        x: r * Math.sin(phi) * Math.cos(theta),
        y: r * Math.cos(phi) * 0.65,
        z: r * Math.sin(phi) * Math.sin(theta),
      },
      size: 1 + (idx % 3) * 0.6,
      alpha: 0.2 + (idx % 4) * 0.12,
    };
  });

type Camera = { rotX: number; rotY: number };

export type SpatialFrame = {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  camera: Camera;
  time: number;
  orbits: SpatialOrbit[];
  stars: SpatialStar[];
  isBalanced: boolean;
};

export const drawSpatialFrame = ({
  ctx,
  width,
  height,
  camera,
  time,
  orbits,
  stars,
  isBalanced,
}: SpatialFrame): void => {
  const cx = width / 2;
  const cy = height / 2 + 4;
  const fov = 340;
  const scaleFactor = Math.min(width, height) / 290;

  ctx.clearRect(0, 0, width, height);

  const project = (pt: Vec3) => {
    const scaled = {
      x: pt.x * scaleFactor,
      y: pt.y * scaleFactor,
      z: pt.z * scaleFactor,
    };
    const ry = rotateY(scaled, camera.rotY);
    const rx = rotateX(ry, camera.rotX);
    const perspective = fov / Math.max(80, fov + rx.z);
    return {
      x: cx + rx.x * perspective,
      y: cy + rx.y * perspective,
      z: rx.z,
      scale: perspective,
    };
  };

  // 1. Ambient Core Halo
  const coreGradient = ctx.createRadialGradient(cx, cy, 4, cx, cy, 130 * scaleFactor);
  if (isBalanced) {
    coreGradient.addColorStop(0, 'rgba(9, 178, 255, 0.36)');
    coreGradient.addColorStop(0.45, 'rgba(20, 184, 166, 0.14)');
    coreGradient.addColorStop(1, 'rgba(5, 48, 121, 0)');
  } else {
    coreGradient.addColorStop(0, 'rgba(245, 158, 11, 0.36)');
    coreGradient.addColorStop(0.5, 'rgba(239, 68, 68, 0.12)');
    coreGradient.addColorStop(1, 'rgba(5, 48, 121, 0)');
  }
  ctx.fillStyle = coreGradient;
  ctx.beginPath();
  ctx.arc(cx, cy, 130 * scaleFactor, 0, Math.PI * 2);
  ctx.fill();

  // 2. Background Spatial Stars
  stars.forEach((star) => {
    const p = project(star.pos);
    ctx.fillStyle = `rgba(186, 230, 253, ${star.alpha * p.scale})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, star.size * p.scale, 0, Math.PI * 2);
    ctx.fill();
  });

  // 3. Draw 3D Orbital Rings (segmented for depth perception)
  orbits.forEach((orb) => {
    const segments = 64;
    for (let i = 0; i < segments; i += 1) {
      const a1 = (i / segments) * Math.PI * 2;
      const a2 = ((i + 1) / segments) * Math.PI * 2;

      let p1: Vec3 = { x: Math.cos(a1) * orb.radius, y: 0, z: Math.sin(a1) * orb.radius };
      let p2: Vec3 = { x: Math.cos(a2) * orb.radius, y: 0, z: Math.sin(a2) * orb.radius };

      p1 = rotateZ(rotateX(p1, orb.tiltX), orb.tiltZ);
      p2 = rotateZ(rotateX(p2, orb.tiltX), orb.tiltZ);

      const proj1 = project(p1);
      const proj2 = project(p2);

      const depthAlpha = Math.max(0.08, Math.min(0.55, (proj1.scale - 0.65) * 1.1));
      ctx.strokeStyle = orb.color;
      ctx.globalAlpha = depthAlpha;
      ctx.lineWidth = 1.25 * proj1.scale;
      ctx.beginPath();
      ctx.moveTo(proj1.x, proj1.y);
      ctx.lineTo(proj2.x, proj2.y);
      ctx.stroke();
    }
  });
  ctx.globalAlpha = 1;

  // 4. Draw Central 3D Geodesic Core (Octahedron)
  const coreScale = 24 + Math.sin(time * 2.2) * 1.8;
  const transformedCore = CORE_VERTICES.map((v) => {
    const spun = rotateY(rotateX(v, time * 0.7), -time * 1.1);
    return project({
      x: spun.x * coreScale,
      y: spun.y * coreScale,
      z: spun.z * coreScale,
    });
  });

  CORE_EDGES.forEach(([i, j]) => {
    const v1 = transformedCore[i];
    const v2 = transformedCore[j];
    ctx.strokeStyle = isBalanced ? 'rgba(56, 189, 248, 0.75)' : 'rgba(251, 191, 36, 0.75)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(v1.x, v1.y);
    ctx.lineTo(v2.x, v2.y);
    ctx.stroke();
  });

  // Central Energy Nucleus
  const centerProj = project({ x: 0, y: 0, z: 0 });
  const nucleusGrad = ctx.createRadialGradient(
    centerProj.x,
    centerProj.y,
    1,
    centerProj.x,
    centerProj.y,
    16 * scaleFactor
  );
  nucleusGrad.addColorStop(0, '#ffffff');
  nucleusGrad.addColorStop(0.4, isBalanced ? '#38bdf8' : '#fbbf24');
  nucleusGrad.addColorStop(1, 'rgba(9, 178, 255, 0)');
  ctx.fillStyle = nucleusGrad;
  ctx.beginPath();
  ctx.arc(centerProj.x, centerProj.y, 16 * scaleFactor, 0, Math.PI * 2);
  ctx.fill();

  // 5. Calculate & Depth-Sort Orbiting 3D Financial Nodes
  const projectedNodes = orbits.map((orb) => {
    const angle = time * orb.speed + orb.phase;
    let pos: Vec3 = {
      x: Math.cos(angle) * orb.radius,
      y: 0,
      z: Math.sin(angle) * orb.radius,
    };
    pos = rotateZ(rotateX(pos, orb.tiltX), orb.tiltZ);
    const proj = project(pos);

    // Trail particle slightly behind
    const trailAngle = angle - 0.18 * Math.sign(orb.speed);
    let trailPos: Vec3 = {
      x: Math.cos(trailAngle) * orb.radius,
      y: 0,
      z: Math.sin(trailAngle) * orb.radius,
    };
    trailPos = rotateZ(rotateX(trailPos, orb.tiltX), orb.tiltZ);
    const trailProj = project(trailPos);

    return {
      ...orb,
      proj,
      trailProj,
    };
  });

  // Sort back-to-front (largest Z is farthest)
  projectedNodes.sort((a, b) => b.proj.z - a.proj.z);

  // Render nodes & 3D HUD callouts
  projectedNodes.forEach((node) => {
    const { proj, trailProj } = node;
    const r = Math.max(4, node.nodeSize * proj.scale * scaleFactor);

    // Energy line to center
    ctx.strokeStyle = node.color;
    ctx.globalAlpha = 0.22 * proj.scale;
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(centerProj.x, centerProj.y);
    ctx.lineTo(proj.x, proj.y);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;

    // Motion trail dot
    ctx.fillStyle = node.color;
    ctx.globalAlpha = 0.35 * proj.scale;
    ctx.beginPath();
    ctx.arc(trailProj.x, trailProj.y, r * 0.45, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Outer halo
    const halo = ctx.createRadialGradient(proj.x, proj.y, r * 0.2, proj.x, proj.y, r * 2.4);
    halo.addColorStop(0, node.glow);
    halo.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(proj.x, proj.y, r * 2.4, 0, Math.PI * 2);
    ctx.fill();

    // 3D Sphere body with specular highlight
    const sphereGrad = ctx.createRadialGradient(
      proj.x - r * 0.35,
      proj.y - r * 0.35,
      r * 0.1,
      proj.x,
      proj.y,
      r
    );
    sphereGrad.addColorStop(0, '#ffffff');
    sphereGrad.addColorStop(0.35, node.color);
    sphereGrad.addColorStop(1, '#041e42');
    ctx.fillStyle = sphereGrad;
    ctx.beginPath();
    ctx.arc(proj.x, proj.y, r, 0, Math.PI * 2);
    ctx.fill();

    // Crisp 3D Floating Label Pill for foreground/midground nodes
    if (proj.scale > 0.82) {
      const text = `${node.label}: ${node.value}`;
      ctx.font = '600 10.5px Figtree, -apple-system, BlinkMacSystemFont, sans-serif';
      const textWidth = ctx.measureText(text).width;
      const padX = 7;
      const pillW = textWidth + padX * 2;
      const pillH = 19;
      const pillX = Math.min(width - pillW - 6, Math.max(6, proj.x - pillW / 2));
      const pillY = proj.y - r - pillH - 5;

      ctx.fillStyle = 'rgba(3, 22, 58, 0.82)';
      ctx.strokeStyle = node.color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(pillX, pillY, pillW, pillH, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#f8fafc';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, pillX + padX, pillY + pillH / 2 + 0.5);
    }
  });
};
