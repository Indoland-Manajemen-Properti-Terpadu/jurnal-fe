import React, { useState } from 'react';
import { Text } from '@mantine/core';
import { useLocation } from 'react-router-dom';
import BrandIcon from '@/assets/images/brand/icon.svg';
import { useLogin } from '@/module/authentication/presentation/hooks/useLogin';
import { AuthShowcase } from '@/module/authentication/presentation/components/AuthShowcase';
import { LoginForm } from '@/module/authentication/presentation/components/LoginForm';
import { ForgotPasswordForm } from '@/module/authentication/presentation/components/ForgotPasswordForm';
import classes from '@/module/authentication/presentation/components/Auth.module.css';

import { useTranslation } from '@/i18n';

interface LoginPageProps {
  initialMode?: 'login' | 'forgot';
}

export default function LoginPage({ initialMode = 'login' }: LoginPageProps) {
  const { t: ta } = useTranslation('authentication');
  const location = useLocation();
  const isForgotPath = location.pathname.includes('forgot-password');
  const [mode, setMode] = useState<'login' | 'forgot'>(
    isForgotPath || initialMode === 'forgot' ? 'forgot' : 'login'
  );
  const [presetEmail, setPresetEmail] = useState('');

  const { mutate: login, isPending } = useLogin();

  const handleLoginSubmit = (values: { email: string; password: string }) => {
    login(values);
  };

  const handleOpenForgotPassword = (currentEmail?: string) => {
    if (currentEmail) setPresetEmail(currentEmail);
    setMode('forgot');
  };

  return (
    <div className={classes.page}>
      <AuthShowcase />

      <main className={classes.formSide}>
        <div className={classes.formBody}>
          <div className={classes.mobileBrand}>
            <img src={BrandIcon} width={36} height={36} alt="" />
            <span>{ta('visual.brand')}</span>
          </div>
          {mode === 'login' ? (
            <LoginForm
              onForgotPassword={handleOpenForgotPassword}
              onSubmit={handleLoginSubmit}
              isPending={isPending}
            />
          ) : (
            <ForgotPasswordForm onBackToLogin={() => setMode('login')} defaultEmail={presetEmail} />
          )}
        </div>

        <Text fz="xs" c="dimmed" ta="center">
          {ta('page.copyright')}
        </Text>
      </main>
    </div>
  );
}
