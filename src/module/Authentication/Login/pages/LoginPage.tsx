import React, { useState } from 'react';
import {
  AspectRatio,
  Box,
  Center,
  Grid,
  Group,
  Image,
  Paper,
  Stack,
  Text,
} from '@mantine/core';
import { IconShieldCheck } from '@tabler/icons-react';
import { useLocation } from 'react-router-dom';
import LogoProapps from '@/assets/img/proapps-logo.svg';
import { useLogin } from '../service/Login.service';
import { AuthVisualSide } from '../components/AuthVisualSide';
import { LoginForm } from '../components/LoginForm';
import { ForgotPasswordForm } from '../components/ForgotPasswordForm';

interface LoginPageProps {
  initialMode?: 'login' | 'forgot';
}

export default function LoginPage({ initialMode = 'login' }: LoginPageProps) {
  const location = useLocation();
  const isForgotPath = location.pathname.includes('forgot-password');
  const [mode, setMode] = useState<'login' | 'forgot'>(
    isForgotPath || initialMode === 'forgot' ? 'forgot' : 'login'
  );
  const [presetEmail, setPresetEmail] = useState('');

  const { mutate: login, isPending } = useLogin({});

  const handleLoginSubmit = (values: { email: string; password: string }) => {
    login(values);
  };

  const handleOpenForgotPassword = (currentEmail?: string) => {
    if (currentEmail) setPresetEmail(currentEmail);
    setMode('forgot');
  };

  return (
    <Grid
      gutter={0}
      style={{
        minHeight: '100vh',
        height: '100vh',
        margin: 0,
        overflow: 'hidden',
        backgroundColor: '#ffffff',
      }}
    >
      {/* Left Column: Visual Branding & Product Showcase (Side-by-side) */}
      <Grid.Col
        span={{ base: 0, lg: 6.5, xl: 7 }}
        style={{
          display: 'block',
          height: '100vh',
        }}
        visibleFrom="lg"
      >
        <AuthVisualSide />
      </Grid.Col>

      {/* Right Column: Authentication Card Form */}
      <Grid.Col
        span={{ base: 12, lg: 5.5, xl: 5 }}
        style={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          overflowY: 'auto',
          backgroundColor: '#f8fafc',
          padding: '24px',
        }}
      >
        <Box my="auto" py={{ base: 'md', sm: 'xl' }}>
          <Paper
            withBorder
            radius="xl"
            p={{ base: 'xl', sm: 36 }}
            bg="white"
            shadow="xs"
            mx="auto"
            style={{
              maxWidth: 460,
              width: '100%',
              borderColor: 'var(--mantine-color-gray-2)',
            }}
          >
            {/* Logo */}
            <Center mb="xl">
              <AspectRatio ratio={230 / 64} style={{ width: 140 }}>
                <Image src={LogoProapps} fit="contain" alt="Proapps Jurnal Logo" />
              </AspectRatio>
            </Center>

            {/* Dynamic View: Login vs Forgot Password */}
            {mode === 'login' ? (
              <LoginForm
                onForgotPassword={handleOpenForgotPassword}
                onSubmit={handleLoginSubmit}
                isPending={isPending}
              />
            ) : (
              <ForgotPasswordForm
                onBackToLogin={() => setMode('login')}
                defaultEmail={presetEmail}
              />
            )}
          </Paper>
        </Box>

        {/* Security & Copyright Footer */}
        <Box ta="center" pt="md">
          <Group justify="center" gap={6} align="center" mb={4}>
            <IconShieldCheck size={16} color="#10b981" />
            <Text size="xs" c="dimmed" fw={500}>
              Koneksi Terenkripsi SSL 256-Bit & Aman
            </Text>
          </Group>
          <Text size="11px" c="gray.5">
            © 2026 PT Solusi Properti Pintar (ProApps). Seluruh Hak Cipta Dilindungi.
          </Text>
        </Box>
      </Grid.Col>
    </Grid>
  );
}
