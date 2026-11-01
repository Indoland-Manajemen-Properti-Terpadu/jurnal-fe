import React from 'react';
import { MultiSelect } from '@mantine/core';
import { IconChevronDown } from '@tabler/icons-react';

interface Option {
  value: string;
  label: string;
}

interface AccessMemberSelectsProps {
  accessScope: string;
  usersLabel: string;
  usersPlaceholder: string;
  rolesLabel: string;
  rolesPlaceholder: string;
  userOptions: Option[];
  roleOptions: Option[];
  specialUsers: string[];
  certainRoles: string[];
  onSpecialUsersChange: (value: string[]) => void;
  onCertainRolesChange: (value: string[]) => void;
  isLoadingUsers: boolean;
  isLoadingRoles: boolean;
  labelStyles?: { label: React.CSSProperties };
}

/** User or role picker shown for a single account with a restricted access scope. */
export const AccessMemberSelects: React.FC<AccessMemberSelectsProps> = ({
  accessScope,
  usersLabel,
  usersPlaceholder,
  rolesLabel,
  rolesPlaceholder,
  userOptions,
  roleOptions,
  specialUsers,
  certainRoles,
  onSpecialUsersChange,
  onCertainRolesChange,
  isLoadingUsers,
  isLoadingRoles,
  labelStyles,
}) => (
  <>
    {accessScope === 'SpecialUsers' && (
      <MultiSelect
        label={usersLabel}
        placeholder={usersPlaceholder}
        data={userOptions}
        value={specialUsers}
        onChange={onSpecialUsersChange}
        withAsterisk
        searchable
        clearable
        disabled={isLoadingUsers}
        rightSection={<IconChevronDown size={16} />}
        styles={labelStyles}
      />
    )}

    {accessScope === 'CertainRoles' && (
      <MultiSelect
        label={rolesLabel}
        placeholder={rolesPlaceholder}
        data={roleOptions}
        value={certainRoles}
        onChange={onCertainRolesChange}
        withAsterisk
        searchable
        clearable
        disabled={isLoadingRoles}
        rightSection={<IconChevronDown size={16} />}
        styles={labelStyles}
      />
    )}
  </>
);
