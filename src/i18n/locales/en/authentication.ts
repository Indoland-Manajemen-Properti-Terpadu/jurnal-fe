export const authentication = {
  validation: {
    emailInvalid: 'Invalid email address',
    passwordMin: 'The password must be at least 6 characters',
  },
  login: {
    successTitle: 'Login Successful!',
    successMessage: 'Hey {{name}}, Welcome to Journal Proapps. Let’s get started!',
    deniedTitle: 'Access Denied',
    deniedMessage: 'Incorrect email & password, please try again',
    welcome: 'Welcome Back 👋',
    intro:
      'Sign in to your account to access the bookkeeping system and business financial reports.',
    emailLabel: 'Email Address',
    emailPlaceholder: 'name@company.com',
    passwordLabel: 'Password',
    passwordPlaceholder: 'Enter your account password',
    remember: 'Remember me',
    forgot: 'Forgot your password?',
    submit: 'Sign In',
    or: 'or',
    backHome: 'Back to Home',
  },
  oauth: {
    successMessage: 'Welcome to Journal Proapps. Let’s get started!',
    failedTitle: 'Authentication Failed',
    failedMessage: 'Unable to authenticate with Jurnal. Please try again.',
    invalidCode: 'Invalid OAuth Code',
    waiting: 'Authenticating, please wait...',
  },
  visual: {
    brand: 'PROAPPS JURNAL',
    tagline: 'Accounting & ERP Cloud',
    version: 'v2.0 Enterprise',
    liveSync: 'Live Sync',
    trusted: 'Trusted for Business & Property Management',
    standard: 'SAK Accounting Standard',
  },
  slide1: {
    badge: 'Journal & Ledger Automation',
    title: 'Real-time Bookkeeping & Financial Precision',
    description:
      'Record debit-credit transactions, bank reconciliation and adjusting journals automatically with the double-entry standard.',
    kpiTitle: 'Ledger Status',
    kpiValue: '100% Balanced',
  },
  slide2: {
    badge: 'PSAK Standard Reports',
    title: 'Balance Sheet, Cash Flow & Income Statement Analysis',
    description:
      'Get full, instant visibility of assets, liabilities and liquidity of the company, ready to export to PDF and Excel.',
    kpiTitle: 'Balance Sheet Balance',
    kpiValue: 'Assets = Liabilities',
  },
  slide3: {
    badge: 'Enterprise Security',
    title: 'Complete Audit Trail & Data Encryption',
    description:
      'Every change and transaction authorization leaves a digital audit trail, backed by tiered role-based access control (RBAC).',
    kpiTitle: 'Security Standard',
    kpiValue: '256-bit SSL',
  },
  forgot: {
    sentTitle: 'Link Sent',
    sentMessage: 'Password recovery instructions have been sent to {{email}}.',
    resentTitle: 'Link Resent',
    resentMessage: 'A new instruction email has been sent to {{email}}.',
    checkEmail: 'Check Your Email 📬',
    sentTo: 'We have sent a password recovery link to:',
    checkInbox:
      'Please open your inbox or spam folder and click the button inside to set a new password. The link is valid for 60 minutes.',
    backToSignIn: 'Back to Sign In',
    resend: 'Did not get the email? Resend',
    backToLogin: 'Back to Login',
    help: 'Account Help',
    title: 'Forgot Your Password? 🔑',
    intro:
      'Enter your registered email address. We will send instructions and a link to create a new password.',
    emailLabel: 'Registered Email Address',
    emailHint: 'Make sure the email matches the one registered to your ProApps Jurnal account.',
    submit: 'Send Recovery Link',
    cancel: 'Cancel and Back to Login',
  },
  page: {
    logoAlt: 'Proapps Jurnal Logo',
    secure: 'Secure SSL 256-Bit Encrypted Connection',
    copyright: '© 2026 PT Solusi Digital Properti Manajemen. All rights reserved.',
  },
};
