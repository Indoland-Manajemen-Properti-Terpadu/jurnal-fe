// import { useEffect } from 'react';

// import { useRoleStore } from '@/store/useRole';
// import {
//   useGetDefaultRole,
//   useGetAdditionalRole,
// } from '@/module/SettingMenu/UserManagement/Role/Main/service/Role.service';

// export const useFetchRoles = () => {
//   const setDefaultRoles = useRoleStore((state) => state.setDefaultRoles);
//   const setAdditionalRoles = useRoleStore((state) => state.setAdditionalRoles);

//   const { data: defaultRoleData } = useGetDefaultRole();
//   const { data: additionalRoleData } = useGetAdditionalRole();

//   useEffect(() => {
//     if (defaultRoleData) {
//       setDefaultRoles(defaultRoleData);
//     }
//   }, [defaultRoleData, setDefaultRoles]);

//   useEffect(() => {
//     if (additionalRoleData) {
//       setAdditionalRoles(additionalRoleData);
//     }
//   }, [additionalRoleData, setAdditionalRoles]);
// };
