import { Outlet } from 'react-router-dom';
import { PettyCashPrototypeProvider } from '@/module/petty-cash/presentation/hooks/usePettyCashPrototype';

export default function PettyCashRouteScope() {
  return (
    <PettyCashPrototypeProvider>
      <Outlet />
    </PettyCashPrototypeProvider>
  );
}
