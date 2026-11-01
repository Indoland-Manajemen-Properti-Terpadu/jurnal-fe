export const profile = {
  loading: 'Loading user profile...',
  header: {
    title: 'My Profile',
    description:
      'Manage your account information, password security, access rights and active business entity.',
    home: 'Home',
  },
  hero: {
    defaultName: 'User',
    defaultRole: 'User',
    verified: 'Verified',
    unverified: 'Not Verified',
    site: 'Site: {name}',
    joined: 'Joined: {date}',
    copiedTooltip: 'Copied!',
    copyTooltip: 'Copy User ID',
    copied: 'Copied',
    copyButton: 'Copy User ID',
  },
  metrics: {
    accountStatus: 'ACCOUNT STATUS',
    activeVerified: 'Active & Verified',
    activeUnverified: 'Active (Not Verified)',
    authorizationRole: 'AUTHORIZATION ROLE',
    standardRole: 'STANDARD',
    siteEntity: 'SITE ENTITY',
    defaultSite: 'Main',
    lastUpdated: 'LAST UPDATED',
  },
  tabs: {
    personal: 'Personal Information',
    security: 'Security & Password',
    roles: 'Access Rights & Role',
    site: 'Site & Business Entity',
  },
  copyField: {
    copied: 'Copied',
    copy: 'Copy',
  },
  personal: {
    title: 'User Personal Data',
    description: 'Update the full name and email address linked to your bookkeeping account.',
    nameLabel: 'Full Name',
    namePlaceholder: 'Enter full name',
    emailLabel: 'Email Address',
    emailPlaceholder: 'name@email.com',
    emailDescription: 'Email is used for sign-in authentication and bookkeeping notifications.',
    userIdLabel: 'User ID (System)',
    cancel: 'Cancel',
    save: 'Save Changes',
    membershipTitle: 'Membership Details',
    registeredDate: 'Registration Date',
    emailStatus: 'Email Status',
    emailVerified: 'Verified',
    emailUnverified: 'Not Verified',
    userRole: 'User Role',
    defaultRole: 'User',
    defaultSite: 'Default Site',
    integrityTitle: 'Account Integrity Guaranteed',
    integrityText:
      'Every transaction and journal you record is kept in the system audit trail for accounting compliance.',
  },
  security: {
    title: 'Update Password',
    description: 'Make sure your password is strong and not reused on other applications.',
    newPasswordLabel: 'New Password',
    newPasswordPlaceholder: 'At least 8 characters, mixed',
    confirmLabel: 'Confirm New Password',
    confirmPlaceholder: 'Re-enter the new password',
    checklistTitle: 'PASSWORD SECURITY STANDARDS:',
    minLength: 'At least 8 characters long',
    hasLetter: 'Contains letters',
    hasNumber: 'Contains a number',
    matches: 'Password confirmation matches',
    resetInput: 'Reset Input',
    submit: 'Update Password',
    sessionTitle: 'Active Authentication Session',
    sessionText:
      'The current sign-in session is protected by a JWT Bearer token that is refreshed automatically.',
    encryptionMethod: 'Encryption Method',
    encryptionValue: 'Bearer JWT (HS256)',
    refreshStatus: 'Token Refresh Status',
    refreshValue: 'Automatically Active',
    tipsTitle: 'Account Security Tips',
    tipsText:
      'Never share your password or account credentials with anyone. The Proapps team never asks for your password.',
  },
  roles: {
    title: 'Accounting Access Rights Matrix',
    description:
      'Authorization level of the bookkeeping and operations modules based on your current account role.',
    defaultRole: 'USER',
    multiModule: 'Multi-Module Access',
    accessFull: 'Full (Read & Write)',
    accessFullExport: 'Full (Export & Analysis)',
    accessAdministrator: 'Administrator',
    accessLimited: 'Limited',
    modules: {
      ledger: {
        title: 'General Ledger & Journal',
        description:
          'Recording of memorial and adjusting journals and a summary of account balance movements.',
      },
      cashBank: {
        title: 'Cash, Bank & Reconciliation',
        description: 'Bank statement import, bank transaction matching and cash withdrawals.',
      },
      sales: {
        title: 'Sales & Accounts Receivable',
        description: 'Issuing sales invoices, tracking receivable settlement and collections.',
      },
      purchases: {
        title: 'Purchases & Accounts Payable',
        description: 'Operational purchase invoices, supplier payables payment and expense recap.',
      },
      reports: {
        title: 'Financial & Fiscal Reports',
        description:
          'Access to profit and loss, trial balance, cash flow and changes in equity reports.',
      },
      masterData: {
        title: 'Master Data & Entity Settings',
        description:
          'Management of the chart of accounts, payment terms, taxes and entity profile.',
      },
    },
  },
  site: {
    title: 'Active Entity & Site Information',
    description:
      'The bookkeeping entity data that defines the operational scope of your account right now.',
    nameLabel: 'Site / Business Entity Name',
    defaultName: 'Proapps Accounting',
    idLabel: 'Entity ID (System)',
    connectionStatus: 'SITE CONNECTION STATUS',
    connected: 'Connected & Active',
    scope: 'ACCOUNTING SCOPE',
    scopeValue: 'SAK Standards & IDR Tax',
    multiEntityTitle: 'Multi-Entity Management',
    multiEntityText:
      'The Proapps accounting system supports multiple sites and branches. Ledger access and account balances are isolated per selected site.',
    switchSiteNote:
      'To switch sites or request access to another branch entity, please contact your company Superadmin.',
  },
  notifications: {
    successTitle: 'Success',
    saved: 'Profile changes saved.',
    failedTitle: 'Failed',
    updateFailed: 'Failed to update profile',
    validationTitle: 'Validation Failed',
    emptyPersonalInfo: 'Name and email must not be empty.',
    passwordTooShort: 'The new password must be at least 8 characters.',
    passwordMismatch: 'Password confirmation does not match.',
  },
  emptyValue: '-',
};

export default profile;
