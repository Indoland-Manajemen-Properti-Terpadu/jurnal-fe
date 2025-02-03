// import { create } from 'zustand';
// import { devtools } from 'zustand/middleware';
// import { AccessRole } from '@/types/AccessRole/getAccessRole';

// interface RoleState {
//   defaultRoles: AccessRole[];
//   additionalRoles: AccessRole[];
//   setDefaultRoles: (roles: AccessRole[]) => void;
//   setAdditionalRoles: (roles: AccessRole[]) => void;
// }

// export const useRoleStore = create<RoleState>()(
//   devtools((set) => ({
//     defaultRoles: [],
//     additionalRoles: [],
//     setDefaultRoles: (roles) => set({ defaultRoles: roles }),
//     setAdditionalRoles: (roles) => set({ additionalRoles: roles }),
//   }))
// );
