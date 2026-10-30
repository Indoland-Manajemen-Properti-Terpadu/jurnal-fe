import { useState, type MouseEvent, type ReactNode } from 'react';
import { Box } from '@mantine/core';
import classes from './dashboard.module.css';

/* ---------- Spatial Glass Surface with 3D Perspective Tilt ---------- */

type GlassCardProps = {
  children: ReactNode;
  lift?: boolean;
  spatialTilt?: boolean;
  p?: number | string;
  delay?: number;
  h?: number | string;
};

export function GlassCard({
  children,
  lift,
  spatialTilt = true,
  p = 'lg',
  delay = 0,
  h,
}: Readonly<GlassCardProps>) {
  const [tiltStyle, setTiltStyle] = useState<Record<string, string>>({});

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!spatialTilt) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const pctX = x / rect.width;
    const pctY = y / rect.height;
    const rotateY = (pctX - 0.5) * 4.5;
    const rotateX = (0.5 - pctY) * 4.5;

    setTiltStyle({
      '--tilt-x': `${rotateX.toFixed(2)}deg`,
      '--tilt-y': `${rotateY.toFixed(2)}deg`,
      '--glare-x': `${(pctX * 100).toFixed(1)}%`,
      '--glare-y': `${(pctY * 100).toFixed(1)}%`,
    });
  };

  const handleMouseLeave = () => {
    if (!spatialTilt) return;
    setTiltStyle({
      '--tilt-x': '0deg',
      '--tilt-y': '0deg',
    });
  };

  return (
    <Box
      p={p}
      h={h}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`${classes.glass} ${lift ? classes.lift : ''} ${classes.reveal}`}
      style={{ animationDelay: `${delay}ms`, ...tiltStyle }}
    >
      <Box pos="relative" style={{ zIndex: 1 }} h="100%">
        {children}
      </Box>
    </Box>
  );
}

/* ---------- Section & Card Headers ---------- */
