import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Router } from './router/index';
import '@/assets/fonts/font.css';

const theme = {
  fontFamily: 'Montserrat, sans-serif',
};

const queryClient = new QueryClient();
export default function App() {
  return (
    <MantineProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <ModalsProvider>
          <Router />
        </ModalsProvider>
      </QueryClientProvider>
    </MantineProvider>
  );
}
