import React, { useEffect, useState } from 'react';
import { Badge, Box, Group, Image, Paper, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import {
  IconCheck,
  IconReceipt2,
  IconScale,
  IconShieldCheck,
  IconStarFilled,
} from '@tabler/icons-react';
import ProappsIconWhite from '@/assets/images/brand/icon-white.svg';
import SlideImg1 from '@/assets/images/auth/slide-1.png';
import SlideImg2 from '@/assets/images/auth/slide-2.png';
import SlideImg3 from '@/assets/images/auth/slide-3.png';

import { useTranslation } from '@/i18n';

interface SlideData {
  /** Key of the slide texts in the `authentication` namespace (`<id>.badge`, `<id>.title`, ...). */
  id: string;
  badgeColor: string;
  image: string;
  kpiIcon: React.ReactNode;
}

const slides: SlideData[] = [
  {
    id: 'slide1',
    badgeColor: 'blue',
    image: SlideImg1,
    kpiIcon: <IconReceipt2 size={20} color="var(--mantine-color-blue-4)" />,
  },
  {
    id: 'slide2',
    badgeColor: 'teal',
    image: SlideImg2,
    kpiIcon: <IconScale size={20} color="var(--mantine-color-emerald-4)" />,
  },
  {
    id: 'slide3',
    badgeColor: 'violet',
    image: SlideImg3,
    kpiIcon: <IconShieldCheck size={20} color="var(--mantine-color-violet-4)" />,
  },
];

export const AuthVisualSide: React.FC = () => {
  const { t: ta } = useTranslation('authentication');
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const current = slides[activeSlide];

  return (
    <Box
      style={{
        height: '100vh',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '40px 48px',
        overflow: 'hidden',
        background:
          'radial-gradient(circle at 10% 15%, color-mix(in srgb, var(--mantine-color-blue-6) 35%, transparent) 0%, transparent 45%), radial-gradient(circle at 90% 85%, color-mix(in srgb, var(--mantine-color-violet-6) 28%, transparent) 0%, transparent 45%), var(--mantine-color-slate-9)',
        color: 'var(--mantine-color-white)',
      }}
    >
      {/* Subtle Background Pattern Mesh */}
      <Box
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'radial-gradient(color-mix(in srgb, var(--mantine-color-white) 8%, transparent) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          opacity: 0.5,
          pointerEvents: 'none',
        }}
      />

      {/* Top Header */}
      <Group justify="space-between" align="center" style={{ position: 'relative', zIndex: 2 }}>
        <Group gap="sm" align="center">
          <Image src={ProappsIconWhite} w={32} h={32} fit="contain" />
          <Box>
            <Text fw={800} size="md" c="white" style={{ letterSpacing: '0.5px' }}>
              {ta('visual.brand')}
            </Text>
            <Text size="10px" c="gray.4" tt="uppercase" fw={600} style={{ letterSpacing: '1px' }}>
              {ta('visual.tagline')}
            </Text>
          </Box>
        </Group>

        <Badge
          variant="outline"
          color="blue"
          size="sm"
          radius="xl"
          styles={{
            root: {
              borderColor: 'color-mix(in srgb, var(--mantine-color-white) 25%, transparent)',
              color: 'var(--mantine-color-blue-3)',
              backgroundColor: 'color-mix(in srgb, var(--mantine-color-white) 5%, transparent)',
            },
          }}
        >
          {ta('visual.version')}
        </Badge>
      </Group>

      {/* Center Showcase Content */}
      <Box style={{ position: 'relative', zIndex: 2, margin: 'auto 0', maxWidth: 540 }}>
        {/* Visual Mockup Frame */}
        <Box
          style={{
            position: 'relative',
            borderRadius: '16px',
            overflow: 'hidden',
            border: '1px solid color-mix(in srgb, var(--mantine-color-white) 15%, transparent)',
            boxShadow:
              '0 25px 50px -12px color-mix(in srgb, var(--mantine-color-black) 60%, transparent), 0 0 40px color-mix(in srgb, var(--mantine-color-blue-6) 20%, transparent)',
            marginBottom: '32px',
            height: '240px',
            backgroundColor: 'color-mix(in srgb, var(--mantine-color-slate-9) 80%, transparent)',
          }}
        >
          <Image
            src={current.image}
            alt={ta(`${current.id}.title`)}
            fit="cover"
            h="100%"
            style={{
              transition: 'opacity 0.6s ease-in-out',
            }}
          />
          {/* Soft dark vignette */}
          <Box
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(to top, color-mix(in srgb, var(--mantine-color-slate-9) 90%, transparent) 0%, color-mix(in srgb, var(--mantine-color-slate-9) 20%, transparent) 60%, transparent 100%)',
            }}
          />

          {/* Floating Glassmorphic Metric Widget */}
          <Paper
            radius="md"
            p="sm"
            style={{
              position: 'absolute',
              bottom: '16px',
              left: '16px',
              right: '16px',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              backgroundColor: 'color-mix(in srgb, var(--mantine-color-slate-9) 75%, transparent)',
              border: '1px solid color-mix(in srgb, var(--mantine-color-white) 15%, transparent)',
              boxShadow:
                '0 8px 24px color-mix(in srgb, var(--mantine-color-black) 40%, transparent)',
            }}
          >
            <Group justify="space-between" align="center">
              <Group gap="xs">
                <ThemeIcon
                  variant="light"
                  radius="md"
                  size={36}
                  style={{
                    backgroundColor:
                      'color-mix(in srgb, var(--mantine-color-white) 10%, transparent)',
                  }}
                >
                  {current.kpiIcon}
                </ThemeIcon>
                <Box>
                  <Text size="11px" c="gray.3" fw={600} tt="uppercase">
                    {ta(`${current.id}.kpiTitle`)}
                  </Text>
                  <Text size="sm" fw={800} c="white">
                    {ta(`${current.id}.kpiValue`)}
                  </Text>
                </Box>
              </Group>

              <Badge size="xs" variant="light" color="teal" radius="sm">
                {ta('visual.liveSync')}
              </Badge>
            </Group>
          </Paper>
        </Box>

        {/* Text Details with animated slide */}
        <Stack gap="xs">
          <Badge variant="filled" color={current.badgeColor} size="sm" radius="sm" w="fit-content">
            {ta(`${current.id}.badge`)}
          </Badge>
          <Title order={2} c="white" fw={800} lh={1.3}>
            {ta(`${current.id}.title`)}
          </Title>
          <Text size="sm" c="gray.4" lh={1.6}>
            {ta(`${current.id}.description`)}
          </Text>
        </Stack>

        {/* Slide Indicators */}
        <Group gap={8} mt="xl">
          {slides.map((_, idx) => (
            <Box
              key={idx}
              onClick={() => setActiveSlide(idx)}
              style={{
                height: '6px',
                width: activeSlide === idx ? '32px' : '8px',
                borderRadius: '3px',
                backgroundColor:
                  activeSlide === idx
                    ? 'var(--mantine-color-sky-4)'
                    : 'color-mix(in srgb, var(--mantine-color-white) 25%, transparent)',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            />
          ))}
        </Group>
      </Box>

      {/* Bottom Trust & Security Bar */}
      <Box
        pt="md"
        style={{
          position: 'relative',
          zIndex: 2,
          borderTop: '1px solid color-mix(in srgb, var(--mantine-color-white) 10%, transparent)',
        }}
      >
        <Group justify="space-between" align="center" wrap="wrap" gap="sm">
          <Group gap="xs" align="center">
            <Group gap={2}>
              {[...Array(5)].map((_, i) => (
                <IconStarFilled key={i} size={14} color="var(--mantine-color-amber-4)" />
              ))}
            </Group>
            <Text size="xs" c="gray.3" fw={500}>
              {ta('visual.trusted')}
            </Text>
          </Group>

          <Group gap={6} align="center">
            <IconCheck size={14} color="var(--mantine-color-emerald-4)" />
            <Text size="xs" c="gray.4">
              {ta('visual.standard')}
            </Text>
          </Group>
        </Group>
      </Box>
    </Box>
  );
};
