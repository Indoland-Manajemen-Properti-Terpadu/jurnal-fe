import { useEffect, useRef, useState } from 'react';
import { Badge, Box, Group, Text, UnstyledButton } from '@mantine/core';
import { Icon3dCubeSphere, IconCheck, IconCompass, IconRadar2 } from '@tabler/icons-react';
import classes from './dashboard.module.css';

export type SpatialFinancialCanvasProps = {
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  cashBalance: number;
  isBalanced: boolean;
  formattedAssets: string;
  formattedLiabilities: string;
  formattedEquity: string;
  formattedCash: string;
  labels: {
    badge: string;
    dragHint: string;
    balanced: string;
    unbalanced: string;
    viewOrbit: string;
    viewRadar: string;
    viewIsometric: string;
    assets: string;
    liabilities: string;
    equity: string;
    cash: string;
  };
};

type CameraPreset = 'orbit' | 'radar' | 'isometric';

type Vec3 = { x: number; y: number; z: number };

const rotateX = (p: Vec3, angle: number): Vec3 => {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return { x: p.x, y: p.y * c - p.z * s, z: p.y * s + p.z * c };
};

const rotateY = (p: Vec3, angle: number): Vec3 => {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return { x: p.x * c + p.z * s, y: p.y, z: -p.x * s + p.z * c };
};

const rotateZ = (p: Vec3, angle: number): Vec3 => {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return { x: p.x * c - p.y * s, y: p.x * s + p.y * c, z: p.z };
};

// Octahedron vertices & edges for the central Equilibrium Core
const CORE_VERTICES: Vec3[] = [
  { x: 0, y: 1, z: 0 },
  { x: 1, y: 0, z: 0 },
  { x: 0, y: 0, z: 1 },
  { x: -1, y: 0, z: 0 },
  { x: 0, y: 0, z: -1 },
  { x: 0, y: -1, z: 0 },
];

const CORE_EDGES: [number, number][] = [
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

export function SpatialFinancialCanvas({
  totalAssets,
  totalLiabilities,
  totalEquity,
  cashBalance,
  isBalanced,
  formattedAssets,
  formattedLiabilities,
  formattedEquity,
  formattedCash,
  labels,
}: Readonly<SpatialFinancialCanvasProps>) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [preset, setPreset] = useState<CameraPreset>('orbit');

  // Interactive camera rotation state stored in ref for 60fps loop
  const interactionRef = useRef({
    isDragging: false,
    lastX: 0,
    lastY: 0,
    targetRotX: 0.42,
    targetRotY: 0.55,
    currentRotX: 0.42,
    currentRotY: 0.55,
    autoSpinSpeed: 0.0045,
  });

  useEffect(() => {
    if (preset === 'radar') {
      interactionRef.current.targetRotX = 1.38;
      interactionRef.current.autoSpinSpeed = 0.003;
    } else if (preset === 'isometric') {
      interactionRef.current.targetRotX = 0.62;
      interactionRef.current.targetRotY = 0.78;
      interactionRef.current.autoSpinSpeed = 0.0015;
    } else {
      interactionRef.current.targetRotX = 0.42;
      interactionRef.current.autoSpinSpeed = 0.0045;
    }
  }, [preset]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    let animationFrameId = 0;
    let time = 0;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

    const orbits = [
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

    // Ambient spatial dust particles
    const stars: Array<{ pos: Vec3; size: number; alpha: number }> = Array.from(
      { length: 36 },
      (_, idx) => {
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
      }
    );

    const render = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      const targetW = Math.floor(rect.width * dpr);
      const targetH = Math.floor(rect.height * dpr);
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      const { width, height } = rect;
      const cx = width / 2;
      const cy = height / 2 + 4;
      const fov = 340;
      const scaleFactor = Math.min(width, height) / 290;

      ctx.clearRect(0, 0, width, height);

      // Update camera rotation with smooth damping
      const state = interactionRef.current;
      if (!state.isDragging && !prefersReducedMotion) {
        state.targetRotY += state.autoSpinSpeed;
      }
      state.currentRotX += (state.targetRotX - state.currentRotX) * 0.08;
      state.currentRotY += (state.targetRotY - state.currentRotY) * 0.08;

      if (!prefersReducedMotion) {
        time += 0.014;
      }

      const project = (pt: Vec3) => {
        const scaled = {
          x: pt.x * scaleFactor,
          y: pt.y * scaleFactor,
          z: pt.z * scaleFactor,
        };
        const ry = rotateY(scaled, state.currentRotY);
        const rx = rotateX(ry, state.currentRotX);
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

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [
    totalAssets,
    totalLiabilities,
    totalEquity,
    cashBalance,
    isBalanced,
    formattedAssets,
    formattedLiabilities,
    formattedEquity,
    formattedCash,
    labels,
  ]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    interactionRef.current.isDragging = true;
    interactionRef.current.lastX = e.clientX;
    interactionRef.current.lastY = e.clientY;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!interactionRef.current.isDragging) return;
    const dx = e.clientX - interactionRef.current.lastX;
    const dy = e.clientY - interactionRef.current.lastY;
    interactionRef.current.lastX = e.clientX;
    interactionRef.current.lastY = e.clientY;
    interactionRef.current.targetRotY += dx * 0.01;
    interactionRef.current.targetRotX = Math.max(
      -0.6,
      Math.min(1.45, interactionRef.current.targetRotX + dy * 0.01)
    );
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    interactionRef.current.isDragging = false;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  return (
    <Box className={classes.spatialViewport}>
      {/* Top HUD Bar */}
      <Group
        justify="space-between"
        align="center"
        pos="absolute"
        top={12}
        left={14}
        right={14}
        style={{ zIndex: 2, pointerEvents: 'none' }}
      >
        <Group gap={6}>
          <Badge
            size="xs"
            radius="sm"
            variant="filled"
            style={{
              backgroundColor: 'rgba(9, 178, 255, 0.22)',
              border: '1px solid rgba(9, 178, 255, 0.45)',
              color: '#e0f2fe',
              letterSpacing: 0.6,
            }}
          >
            {labels.badge}
          </Badge>
          <Badge
            size="xs"
            radius="sm"
            variant="filled"
            color={isBalanced ? 'teal' : 'orange'}
            leftSection={<IconCheck size={10} />}
          >
            {isBalanced ? labels.balanced : labels.unbalanced}
          </Badge>
        </Group>

        {/* Camera Preset Switcher */}
        <Group gap={4} style={{ pointerEvents: 'auto' }}>
          {(
            [
              { id: 'orbit', label: labels.viewOrbit, icon: Icon3dCubeSphere },
              { id: 'radar', label: labels.viewRadar, icon: IconRadar2 },
              { id: 'isometric', label: labels.viewIsometric, icon: IconCompass },
            ] as const
          ).map((btn) => {
            const Icon = btn.icon;
            const active = preset === btn.id;
            return (
              <UnstyledButton
                key={btn.id}
                onClick={() => setPreset(btn.id)}
                className={classes.cameraPill}
                data-active={active || undefined}
                title={btn.label}
              >
                <Icon size={12} />
                <span>{btn.label}</span>
              </UnstyledButton>
            );
          })}
        </Group>
      </Group>

      {/* Interactive 3D Canvas */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          width: '100%',
          height: '250px',
          display: 'block',
          cursor: 'grab',
          touchAction: 'none',
        }}
        aria-label={labels.badge}
      />

      {/* Bottom Legend & Drag Hint */}
      <Group
        justify="space-between"
        align="center"
        pos="absolute"
        bottom={10}
        left={14}
        right={14}
        style={{ zIndex: 2, pointerEvents: 'none' }}
        wrap="wrap"
        gap={6}
      >
        <Group gap={10} wrap="wrap">
          {[
            { label: labels.assets, color: '#09B2FF' },
            { label: labels.equity, color: '#14b8a6' },
            { label: labels.liabilities, color: '#f59e0b' },
            { label: labels.cash, color: '#60a5fa' },
          ].map((item) => (
            <Group key={item.label} gap={5} wrap="nowrap">
              <Box
                w={8}
                h={8}
                style={{
                  borderRadius: '50%',
                  backgroundColor: item.color,
                  boxShadow: `0 0 8px ${item.color}`,
                }}
              />
              <Text fz={11} c="rgba(255,255,255,0.82)" fw={600}>
                {item.label}
              </Text>
            </Group>
          ))}
        </Group>
        <Text fz={10.5} c="rgba(255,255,255,0.6)" fs="italic">
          {labels.dragHint}
        </Text>
      </Group>
    </Box>
  );
}

export default SpatialFinancialCanvas;
