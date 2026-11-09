import type { CanReadMenu } from '@/components/Navbar/navigationAccess';
import { useMyGrants } from '@/module/user-management/access';

/**
 * What the signed-in person may read, for hiding menus. `null` until the rights are known (or when
 * they cannot be loaded), so a failed request never empties the navigation.
 */
export function useNavigationAccess(): CanReadMenu {
  const { isReady, canRead } = useMyGrants();
  return isReady ? canRead : null;
}
