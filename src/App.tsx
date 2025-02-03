import '@mantine/core/styles.layer.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/tiptap/styles.css';
import 'mantine-datatable/styles.layer.css';
import '@/assets/layout.css';
import '@/assets/fonts/font.css';
import '@mantine/carousel/styles.css';
import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Notifications } from '@mantine/notifications';
import { Router } from './router/index';
import { myTheme } from './theme/index';


const queryClient = new QueryClient();

export default function App() {
  return (
    <MantineProvider forceColorScheme="light" theme={myTheme}>
      <QueryClientProvider client={queryClient}>
        <ModalsProvider>
          <Notifications />
          <Router />
        </ModalsProvider>

      </QueryClientProvider>
    </MantineProvider>
  );
}
