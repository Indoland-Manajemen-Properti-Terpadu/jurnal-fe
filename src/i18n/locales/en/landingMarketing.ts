export const landingMarketing = {
  advantages: {
    kicker: 'Absolute Competitive Advantage',
    title: 'Why Modern Companies Choose Jurnal ProApps Over General Accounting Software',
    subtitle:
      'Conventional accounting software is built as a passive recording tool. Jurnal ProApps is designed as a financial orchestration hub that connects field operations in real time.',
    cards: {
      syncQueue: {
        badge: 'Exclusive',
        title: 'Native Operational Sync Queue',
        text: 'Eliminate discrepancies between the field team and the bookkeeping department. Rent, utility, and late-payment (FINE) charges, and even tenant portal payments flow automatically into the accountant review queue with no manual re-entry.',
        benefit: '0% risk of operational invoices slipping through',
      },
      approval: {
        badge: 'Tight Control',
        title: 'Data Change Approval Center',
        text: 'No opening balance revision, journal deletion, or rate change ever damages the general ledger directly. Every change is presented in a transparent queue with a before vs after comparison.',
        benefit: 'Complete audit trail for Big 4 auditors',
      },
      guided: {
        badge: 'Anti Human-Error',
        title: 'Guided Smart Accounting Fields',
        text: 'Finance staff will no longer enter debit or credit the wrong way around. It comes with visual micro-guidance, soft color markers (teal for debit, indigo for credit), and smart contra-side warnings.',
        benefit: '99% fewer journal entry mistakes by new staff',
      },
      precision: {
        badge: 'High Precision',
        title: 'Multi-Decimal Precision Engine (0-4 Digits)',
        text: 'General software limits numbers to 2 decimal digits. ProApps supports up to 4 decimals for foreign exchange rates (USD, SGD), chemical costs per liter, and rental rates per square meter.',
        benefit: 'Remove commodity rounding differences',
      },
      dualLanguage: {
        badge: 'Global Standard',
        title: 'Instant Dual-Language (PSAK & IFRS)',
        text: 'Switch between Bahasa Indonesia (local PSAK) and English (IFRS / GAAP) instantly in 1 click, with no need to reload the system. Ideal for companies with expatriate directors or foreign investors.',
        benefit: 'Bilingual reports ready for board presentations',
      },
      periodLock: {
        badge: 'Maximum Security',
        title: 'Strict Period Lock & Full Audit Trail',
        text: 'Lock finalized accounting periods to prevent tampering with past figures. It includes a tiered opening balance draft history that records the user name, time, and reason for every adjustment.',
        benefit: 'ISO 27001 security standard compliance',
      },
    },
  },

  comparison: {
    kicker: 'Feature Comparison Table',
    title: 'Head-to-Head Comparison: Jurnal ProApps vs Conventional Software',
    subtitle:
      'See transparently how the ProApps architecture delivers real technical advantages for the efficiency and accuracy of your finance team.',
    colFeature: 'CAPABILITY / KEY FEATURE',
    brandTitle: 'JURNAL PROAPPS',
    brandTagline: 'Next-Generation Advantage',
    colCompetitors: 'CONVENTIONAL ACCOUNTING SOFTWARE',
    rows: {
      integration: {
        feature: 'Property & Tenant Operations Integration',
        desc: 'Automatic sync of rent charges, late-payment penalties (FINE), & tenant portal payments.',
        proApps:
          'Native Operational Sync Queue. Inbound events are automatically presented to the accountant approval queue with no discrepancies.',
        competitors:
          'Separate. Requires manual re-entry or building custom webhooks that are prone to delivery failures.',
      },
      approvalQueue: {
        feature: 'Data Change Approval Center (Approval Queue)',
        desc: 'Control over amount adjustments, cancellations, and revisions before they reach the general ledger.',
        proApps:
          'A dedicated queue with payload comparison, revision history, and 1-click bulk approval.',
        competitors:
          'No inbound queue. Changes overwrite old data directly without a transparent audit trail.',
      },
      inputErrors: {
        feature: 'Debit & Credit Input Error Prevention',
        desc: 'Visual guidance when entering journals and adjusting opening balances.',
        proApps:
          'Guided Smart Accounting: soft color shading, automatic mutual exclusion, and Contra Side badges.',
        competitors:
          'Ordinary generic input grid. Staff are prone to wrong column positions or unbalanced entries.',
      },
      decimals: {
        feature: 'Decimal Precision & Rounding',
        desc: 'Flexible calculation of foreign exchange rates (USD/SGD), unit prices, and commodities.',
        proApps:
          'Multi-Decimal Precision Engine (0 to 4 decimal digits) with accurate half-up rounding.',
        competitors:
          'Locked to 2 decimal digits. Prone to accumulated commodity differences and foreign exchange rate differences.',
      },
      language: {
        feature: 'Global Language & Reporting Standards',
        desc: 'Easy report preparation for expatriate directors, independent auditors, & investors.',
        proApps:
          'Instant Dual-Language Hot-Switch (Indonesian PSAK & English IFRS) with no system reload.',
        competitors: 'Mostly Bahasa Indonesia only, or requires a separate paid deployment.',
      },
      closing: {
        feature: 'Month-End Close Speed',
        desc: 'Time the finance team needs from the 30th until reports are ready for audit.',
        proApps: 'Close 4x faster (average 1-2 days) because balance validation runs in real time.',
        competitors:
          '5-7 working days due to slow manual reconciliation and tracing scattered operational receipts.',
      },
    },
  },
};

export default landingMarketing;
