// src/store/useRole.ts
import create from 'zustand';
import { AccessRole } from '@/types/AccessRole/getAccessRole';

type RoleStore = {
  defaultRoles: AccessRole[];
  additionalRoles: AccessRole[];
  setDefaultRoles: (roles: AccessRole[]) => void;
  setAdditionalRoles: (roles: AccessRole[]) => void;
};

export const useRoleStore = create<RoleStore>((set) => ({
  defaultRoles: [],
  additionalRoles: [],
  setDefaultRoles: (roles: AccessRole[]) => set({ defaultRoles: roles }),
  setAdditionalRoles: (roles: AccessRole[]) => set({ additionalRoles: roles }),
}));
