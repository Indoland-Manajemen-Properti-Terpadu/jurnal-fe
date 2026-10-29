import { landingPreview } from './landingPreview';
import { landingMarketing } from './landingMarketing';
import { landingResources } from './landingResources';

export const landing = {
  ...landingPreview,
  ...landingMarketing,
  ...landingResources,
  brandName: 'Jurnal ProApps',

  header: {
    badge: 'Enterprise',
    navAdvantages: 'Advantages',
    navPreview: 'Live Demo',
    navComparison: 'Comparison',
    navEbooks: 'Free E-Books',
    navTestimonials: 'Client Reviews',
    navFaq: 'FAQ',
    login: 'Sign in to Jurnal',
  },

  hero: {
    ratingStrong: 'Rating 4.9/5',
    ratingRest: 'from 2,500+ Controllers & CFOs • PSAK & IFRS Standards',
    titleLead: 'Integrated Accounting Software:',
    titleHighlight: 'Operational Sync, Zero Bookkeeping Discrepancies.',
    subtitle:
      "Indonesia's first accounting solution that connects general ledger recording directly to the approval queue of your business and property operations. Close the books 4x faster with automatic balance validation.",
    ctaStart: 'Get Started for Free',
    ctaDemo: 'Explore the Live Demo',
    ctaEbook: 'Download Accounting E-Books',
  },

  trust: {
    throughput: {
      label: 'Real-time Transactions / Hour',
      sub: 'Powered by the High-Speed Ledger Engine',
    },
    discrepancy: {
      label: 'Data Discrepancy Reduction',
      sub: 'Through the Operational Inbound Queue',
    },
    closing: {
      label: 'Faster Month-End Close',
      sub: 'From 7 working days down to 1-2 days',
    },
    compliance: {
      label: 'PSAK & IFRS Compliance',
      sub: 'Ready for External Audits & Global Investors',
    },
  },

  cta: {
    title: 'Raise Your Business Bookkeeping Accuracy to the Enterprise Level',
    text: 'Join thousands of accountants, controllers, and finance directors who have left behind the hassle of spreadsheets and accounting software that is disconnected from operations.',
    login: 'Sign in to Jurnal ProApps',
    ebook: 'Download Free E-Book',
    perkInstall: '✓ No complicated installation',
    perkMigration: '✓ Full migration support',
    perkGuarantee: '✓ PSAK compliance guarantee',
  },

  footer: {
    tagline:
      "A next-generation enterprise accounting and general ledger management platform. Natively connected to Indonesia's property and business operations ecosystem.",
    status: 'System Active & Protected by 256-Bit SSL',
    productsTitle: 'Products & Modules',
    products: {
      ledger: 'General Journal & Ledger',
      sync: 'Operational Sync Queue',
      reconciliation: '3-Way Bank Reconciliation',
      openingBalance: 'Opening Balance & Period Lock',
      reports: 'Real-Time Financial Reports',
    },
    resourcesTitle: 'Education & Resources',
    resources: {
      playbook: 'Property Accounting Playbook 2026',
      dictionary: 'PSAK & IFRS Financial Dictionary',
      reconciliation: 'Mastering Bank Reconciliation',
      comparison: 'Feature Comparison Table',
      help: 'Help Center & FAQ',
    },
    accessTitle: 'Access & Security',
    access: {
      login: 'Client Login Portal',
      iso: 'ISO 27001 Compliance Standard',
      privacy: 'Data Privacy Policy',
      terms: 'Enterprise Terms of Service',
    },
    copyright: '© {year} PT ProApps Solusi Digital Indonesia. All rights reserved.',
    madeWith: 'Built to a standard of excellence for modern finance and accounting teams.',
  },
};

export default landing;
