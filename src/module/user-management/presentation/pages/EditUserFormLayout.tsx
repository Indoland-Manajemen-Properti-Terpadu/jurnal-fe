import { ReactNode } from 'react';
import AppShellLayout from '@/components/AppShellLayout';
import classes from '@/module/user-management/presentation/pages/EditUser.module.css';

type Props = {
  children: ReactNode;
  footer: ReactNode;
};

function EditUserFormLayout({ children, footer }: Readonly<Props>) {
  return <AppShellLayout footer={<div className={classes.footer}>{footer}</div>}>{children}</AppShellLayout>;
}

export default EditUserFormLayout;
