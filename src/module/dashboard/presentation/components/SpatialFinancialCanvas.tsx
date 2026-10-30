import { useEffect, useRef, useState } from 'react';
import { Badge, Box, Group, Text, UnstyledButton } from '@mantine/core';
import { Icon3dCubeSphere, IconCheck, IconCompass, IconRadar2 } from '@tabler/icons-react';
import classes from './dashboard.module.css';
import { createOrbits, createStars, drawSpatialFrame } from './spatialScene';

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

    const orbits = createOrbits({
      totalAssets,
      totalLiabilities,
      totalEquity,
      formattedAssets,
      formattedLiabilities,
      formattedEquity,
      formattedCash,
      labels,
    });
    const stars = createStars();

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

      drawSpatialFrame({
        ctx,
        width,
        height,
        camera: { rotX: state.currentRotX, rotY: state.currentRotY },
        time,
        orbits,
        stars,
        isBalanced,
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
