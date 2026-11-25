import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/tiptap/styles.css';
import 'mantine-datatable/styles.css';
import '@mantine/carousel/styles.css';
import '@/styles/fonts.css';
import '@/styles/global.css';
import { MantineProvider } from '@mantine/core';
import { DatesProvider } from '@mantine/dates';
import { ModalsProvider } from '@mantine/modals';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Notifications } from '@mantine/notifications';
import { cssVariablesResolver, myTheme } from '@/theme';
import { useI18nStore } from '@/i18n/store';
import { ApiLoadingBar } from '@/components/ApiLoadingBar';
import { Router } from './router/index';

const queryClient = new QueryClient();

export default function App() {
  const language = useI18nStore((state) => state.language);
  return (
    <MantineProvider
      forceColorScheme="light"
      theme={myTheme}
      cssVariablesResolver={cssVariablesResolver}
    >
      <QueryClientProvider client={queryClient}>
        <ModalsProvider>
          <DatesProvider settings={{ locale: language === 'id' ? 'id' : 'en' }}>
            <ApiLoadingBar />
            <Notifications />
            <Router />
          </DatesProvider>
        </ModalsProvider>
      </QueryClientProvider>
    </MantineProvider>
  );
}
