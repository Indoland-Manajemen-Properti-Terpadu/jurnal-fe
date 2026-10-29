import { Outlet } from 'react-router-dom';
import { PettyCashPrototypeProvider } from '../hooks/usePettyCashPrototype';

export default function PettyCashRouteScope() {
  return (
    <PettyCashPrototypeProvider>
      <Outlet />
    </PettyCashPrototypeProvider>
  );
}
