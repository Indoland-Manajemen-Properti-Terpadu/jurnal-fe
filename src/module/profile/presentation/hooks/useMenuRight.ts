import { hasMenuRight, type RightType } from '../../domain/access';
import { useMyAccess } from './useProfileQueries';

/** Whether the signed-in person holds `right` on the menu; false while the rights load. */
export const useMenuRight = (menuId: string, right: RightType): boolean =>
  hasMenuRight(useMyAccess().data, menuId, right);
