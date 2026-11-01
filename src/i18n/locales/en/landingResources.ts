export const landingResources = {
  ebooks: {
    kicker: 'Education Center & Free E-Books',
    title: 'Raise Your Company Accounting Standards with the Best Practical Guides',
    subtitle:
      'We write exclusive guidebooks together with senior practitioners, auditors, and leading property controllers in Indonesia. Available for free to accelerate your career and your business.',
    pagesLabel: '{count} Pages',
    readTimeLabel: '{count} Min Read',
    meta: '📄 {pages} • ⏱ {readTime}',
    pdfBadge: 'Ready-to-Download PDF',
    download: 'Download Free E-Book',
    items: {
      'property-accounting-2026': {
        tag: 'Featured E-Book',
        title: 'Property & Modern Business Accounting Playbook 2026',
        desc: 'A complete guide to managing rent billing, automatic penalty reconciliation, and eliminating cash differences between the operations and finance divisions.',
        highlights: {
          first: 'Tenant billing automation flow with no manual re-entry',
          second: 'How to prevent receipt cash differences in the tenant portal',
          third: 'Chart of Accounts (COA) standard for commercial buildings',
        },
      },
      'psak-ifrs-dictionary': {
        tag: 'Financial Glossary',
        title: 'Complete Dictionary of PSAK & IFRS Financial Terms (200+ Terms)',
        desc: 'A practical bilingual reference for finance staff, controllers, and expatriate directors preparing financial statements to international standards.',
        highlights: {
          first: 'Standard translations of Indonesian - English accounting terms',
          second: 'Classification rules for Assets, Liabilities, Equity, & Expenses',
          third: 'PSAK 73 / IFRS 16 adjustments for leases',
        },
      },
      'bank-recon-mastery': {
        tag: 'Practical Checklist',
        title: 'Mastering 3-Way Bank Reconciliation: Close the Books 4x Faster',
        desc: 'A step-by-step framework to finish cash reconciliation and month-end closing without overtime and without a single Rp 1 difference.',
        highlights: {
          first: '3-way matching technique: Bank Statement vs Ledger vs Invoice',
          second: 'Audit checklist for verifying opening balances and period locks',
          third: 'Ready-to-use monthly closing SOP template',
        },
      },
    },
    modal: {
      title: 'Download Free Accounting E-Book',
      metaLine: '{pages} • {readTime}',
      intro:
        'Enter your company email to get an instant PDF download link delivered straight to your inbox:',
      emailLabel: 'Company Email',
      emailPlaceholder: 'your.name@company.com',
      cancel: 'Cancel',
      submit: 'Download Now (PDF)',
      successTitle: 'Your E-Book Is Ready!',
      sentBefore: 'The download link for the document',
      sentAfter: 'has been sent to',
      openPdf: 'Open PDF Document Now',
    },
    notify: {
      invalidTitle: 'Invalid Email',
      invalidMessage: 'Please enter a valid company email address.',
      sentTitle: 'Link Sent!',
      sentMessage: 'The e-book "{title}" has been sent to {email}.',
      downloadTitle: 'Download Started',
      downloadMessage: 'Downloading file {title}.pdf...',
    },
  },

  testimonials: {
    kicker: 'User Reviews & Validation',
    title: 'Trusted by More Than 2,500+ Finance Leaders & Business Managers',
    subtitle:
      'Hear directly how Jurnal ProApps transforms operational efficiency and eliminates human error at leading companies.',
    items: {
      hendrik: {
        name: 'Hendrik Wijaya, SE, Ak, CA',
        title: 'Group Financial Controller, PT Mega Properti Nusantara',
        quote:
          'Before using Jurnal ProApps, we needed 6 days just to match tenant rent payments from 14 buildings against the general ledger. With the Operational Sync Queue, every transaction is validated and ready to post in 30 minutes.',
      },
      jessica: {
        name: 'Jessica Clarissa, CPA',
        title: 'Head of Finance & Tax, Urban Living Residence Group',
        quote:
          'The Smart Accounting Fields feature has been a lifesaver! Junior staff are no longer confused about the normal debit or credit side of contra accounts. Over the past 12 months, our Big 4 external audit finished with zero findings.',
      },
      bambang: {
        name: 'Bambang Sudiro',
        title: 'Chief Financial Officer, Cipta Karya Prima Logistik',
        quote:
          '4-decimal precision for diesel rates and warehouse unit rentals is a decisive differentiator. Other competitors cut figures at 2 decimals, which causes differences of millions of rupiah every month. ProApps is truly enterprise-grade.',
      },
    },
    badges: {
      iso: {
        title: 'ISO 27001 Certified',
        desc: 'Global Data Security Certification',
      },
      encryption: {
        title: '256-Bit Financial Encryption',
        desc: 'Bank-Grade Encryption',
      },
      compliance: {
        title: 'PSAK / IFRS Standards Compliance',
        desc: 'Aligned with IAI & Standards Board Guidelines',
      },
      uptime: {
        title: '99.99% Cloud Uptime SLA',
        desc: 'Resilient Cloud Infrastructure',
      },
    },
  },

  faq: {
    kicker: 'Frequently Asked Questions',
    title: 'All the Answers for Your Best Financial Decisions',
    subtitle:
      'Have questions about data migration, system integration, or bookkeeping security? Find the answers here.',
    items: {
      migration: {
        question: 'Can data from an old bookkeeping system or Excel spreadsheet be migrated?',
        answer:
          'Absolutely. Jurnal ProApps provides an Opening Balance and Chart of Accounts (COA) import module based on convenient Excel / CSV templates. Our onboarding team is also ready to help with account mapping and validation of last year closing balances so your transition goes smoothly with no figures left behind.',
      },
      operationalSync: {
        question: 'Why is Jurnal ProApps far better for property and utility businesses?',
        answerBefore:
          'General accounting software has no native connection to unit, tenant, penalty (fine), and utility billing data. As a result, accountants must key in receipts manually one by one, which is prone to cash differences. In Jurnal ProApps, all billing events and tenant portal payments automatically flow into the',
        answerEmphasis: 'Operational Inbound Queue',
        answerAfter: 'to be reviewed and bulk posted in 1 click.',
      },
      pendingChanges: {
        question: 'How does the Data Change Approval (Pending Changes) feature work?',
        answerBefore:
          'When operational staff revise an invoice amount, cancel it, or adjust a balance, the change does not overwrite the final books directly. The data goes into the',
        answerEmphasis: 'Change Approval (Pending Changes)',
        answerAfter:
          'menu, where the Controller or Finance Manager can compare old vs new data, see who made the request, and then approve or reject the change with an official note.',
      },
      multiDecimal: {
        question: 'What is the 4-decimal precision feature used for?',
        answer:
          'In foreign exchange transactions (e.g. USD to IDR at a rate of Rp 16.240,5512), liquid commodities (such as fuel and industrial chemicals per liter), or rental costs per square meter, the conventional 2-decimal limit creates rounding differences of millions of rupiah when multiplied by large volumes. The ProApps multi-decimal engine keeps accuracy down to the smallest fraction.',
      },
      bilingual: {
        question: 'Can financial statements be presented in English standards (IFRS)?',
        answer:
          'Yes. With the 1-Click Dual-Language Switch, you can dynamically switch between Indonesian accounting terminology (PSAK) and English (IFRS/GAAP) whenever needed. You can export the Balance Sheet and Income Statement in English for international audits or reporting to foreign shareholders.',
      },
    },
  },
};

export default landingResources;
