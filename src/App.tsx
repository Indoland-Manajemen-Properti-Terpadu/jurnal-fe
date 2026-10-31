import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/tiptap/styles.css';
import 'mantine-datatable/styles.css';
import '@mantine/carousel/styles.css';
import '@/styles/fonts.css';
import '@/styles/global.css';
import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Notifications } from '@mantine/notifications';
import { cssVariablesResolver, myTheme } from '@/theme';
import { ApiLoadingBar } from '@/components/ApiLoadingBar';
import { Router } from './router/index';

const queryClient = new QueryClient();

export default function App() {
  return (
    <MantineProvider
      forceColorScheme="light"
      theme={myTheme}
      cssVariablesResolver={cssVariablesResolver}
    >
      <QueryClientProvider client={queryClient}>
        <ModalsProvider>
          <ApiLoadingBar />
          <Notifications />
          <Router />
        </ModalsProvider>
      </QueryClientProvider>
    </MantineProvider>
  );
}
