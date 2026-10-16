/**
 * Daftar Master Bank di Indonesia
 * Terstandarisasi berdasarkan Bank Indonesia (BI) dan Otoritas Jasa Keuangan (OJK).
 */

export interface BankMasterItem {
  code: string;
  name: string;
  shortName: string;
  category: 'Populer' | 'Digital' | 'BUMN' | 'Swasta' | 'BPD' | 'Syariah' | 'Asing';
}

export const INDONESIA_BANKS: BankMasterItem[] = [
  // --- BANK TERPOPULER & BUMN ---
  { code: '014', name: 'Bank Central Asia (BCA)', shortName: 'BCA', category: 'Populer' },
  { code: '008', name: 'Bank Mandiri', shortName: 'Mandiri', category: 'Populer' },
  { code: '002', name: 'Bank Rakyat Indonesia (BRI)', shortName: 'BRI', category: 'Populer' },
  { code: '009', name: 'Bank Negara Indonesia (BNI)', shortName: 'BNI', category: 'Populer' },
  { code: '451', name: 'Bank Syariah Indonesia (BSI)', shortName: 'BSI', category: 'Populer' },
  { code: '022', name: 'CIMB Niaga', shortName: 'CIMB Niaga', category: 'Populer' },
  { code: '013', name: 'Permata Bank', shortName: 'Permata', category: 'Populer' },
  { code: '011', name: 'Bank Danamon', shortName: 'Danamon', category: 'Populer' },
  { code: '200', name: 'Bank Tabungan Negara (BTN)', shortName: 'BTN', category: 'Populer' },
  { code: '019', name: 'Panin Bank', shortName: 'Panin', category: 'Populer' },
  { code: '028', name: 'OCBC NISP', shortName: 'OCBC', category: 'Populer' },

  // --- BANK DIGITAL ---
  { code: '542', name: 'Bank Jago', shortName: 'Jago', category: 'Digital' },
  { code: '535', name: 'SeaBank Indonesia', shortName: 'SeaBank', category: 'Digital' },
  { code: '213', name: 'Jenius / Bank BTPN', shortName: 'Jenius', category: 'Digital' },
  { code: '501', name: 'BCA Digital (blu)', shortName: 'blu', category: 'Digital' },
  { code: '567', name: 'Allo Bank Indonesia', shortName: 'Allo Bank', category: 'Digital' },
  { code: '490', name: 'Bank Neo Commerce', shortName: 'Neo Commerce', category: 'Digital' },
  { code: '562', name: 'Superbank', shortName: 'Superbank', category: 'Digital' },
  { code: '947', name: 'Bank Aladin Syariah', shortName: 'Aladin', category: 'Digital' },

  // --- BANK SWASTA NASIONAL & LAINNYA ---
  { code: '016', name: 'Maybank Indonesia', shortName: 'Maybank', category: 'Swasta' },
  { code: '426', name: 'Bank Mega', shortName: 'Mega', category: 'Swasta' },
  { code: '153', name: 'Bank Sinarmas', shortName: 'Sinarmas', category: 'Swasta' },
  { code: '147', name: 'Bank Muamalat', shortName: 'Muamalat', category: 'Syariah' },
  { code: '441', name: 'KB Bukopin', shortName: 'Bukopin', category: 'Swasta' },
  { code: '023', name: 'Bank UOB Indonesia', shortName: 'UOB', category: 'Swasta' },
  { code: '046', name: 'Bank DBS Indonesia', shortName: 'DBS', category: 'Swasta' },
  { code: '212', name: 'Bank Woori Saudara', shortName: 'Woori Saudara', category: 'Swasta' },
  { code: '484', name: 'Line Bank / KEB Hana', shortName: 'Line Bank', category: 'Swasta' },
  { code: '485', name: 'MNC Bank', shortName: 'MNC Bank', category: 'Swasta' },
  { code: '161', name: 'Bank Ganesha', shortName: 'Ganesha', category: 'Swasta' },
  { code: '566', name: 'Bank Victoria International', shortName: 'Victoria', category: 'Swasta' },
  { code: '513', name: 'Bank Ina Perdana', shortName: 'Bank Ina', category: 'Swasta' },
  { code: '523', name: 'Bank Sahabat Sampoerna', shortName: 'Sampoerna', category: 'Swasta' },
  { code: '157', name: 'Bank Maspion', shortName: 'Maspion', category: 'Swasta' },
  { code: '031', name: 'Citibank Indonesia', shortName: 'Citibank', category: 'Asing' },
  { code: '041', name: 'HSBC Indonesia', shortName: 'HSBC', category: 'Asing' },
  {
    code: '050',
    name: 'Standard Chartered Bank',
    shortName: 'Standard Chartered',
    category: 'Asing',
  },

  // --- BANK PEMBANGUNAN DAERAH (BPD) ---
  { code: '111', name: 'Bank DKI (Jakarta)', shortName: 'Bank DKI', category: 'BPD' },
  { code: '110', name: 'Bank BJB (Jawa Barat & Banten)', shortName: 'Bank BJB', category: 'BPD' },
  { code: '113', name: 'Bank Jateng', shortName: 'Bank Jateng', category: 'BPD' },
  { code: '114', name: 'Bank Jatim', shortName: 'Bank Jatim', category: 'BPD' },
  { code: '117', name: 'Bank Sumut', shortName: 'Bank Sumut', category: 'BPD' },
  { code: '118', name: 'Bank Nagari (Sumatera Barat)', shortName: 'Bank Nagari', category: 'BPD' },
  { code: '119', name: 'Bank Riau Kepri Syariah', shortName: 'Bank Riau Kepri', category: 'BPD' },
  { code: '120', name: 'Bank Sumsel Babel', shortName: 'Bank Sumsel Babel', category: 'BPD' },
  { code: '121', name: 'Bank Lampung', shortName: 'Bank Lampung', category: 'BPD' },
  { code: '123', name: 'Bank Kalbar', shortName: 'Bank Kalbar', category: 'BPD' },
  { code: '122', name: 'Bank Kalsel', shortName: 'Bank Kalsel', category: 'BPD' },
  { code: '124', name: 'Bank Kaltimtara', shortName: 'Bank Kaltimtara', category: 'BPD' },
  { code: '126', name: 'Bank Sulselbar', shortName: 'Bank Sulselbar', category: 'BPD' },
  { code: '127', name: 'Bank SulutGo', shortName: 'Bank SulutGo', category: 'BPD' },
  { code: '112', name: 'Bank BPD DIY (Yogyakarta)', shortName: 'BPD DIY', category: 'BPD' },
  { code: '129', name: 'Bank BPD Bali', shortName: 'BPD Bali', category: 'BPD' },
  { code: '130', name: 'Bank NTT', shortName: 'Bank NTT', category: 'BPD' },
  { code: '128', name: 'Bank NTB Syariah', shortName: 'Bank NTB', category: 'BPD' },
  { code: '131', name: 'Bank Maluku Malut', shortName: 'Bank Maluku', category: 'BPD' },
  { code: '132', name: 'Bank Papua', shortName: 'Bank Papua', category: 'BPD' },
  { code: '133', name: 'Bank Bengkulu', shortName: 'Bank Bengkulu', category: 'BPD' },
  { code: '115', name: 'Bank Jambi', shortName: 'Bank Jambi', category: 'BPD' },
  {
    code: '135',
    name: 'Bank Sultra (Sulawesi Tenggara)',
    shortName: 'Bank Sultra',
    category: 'BPD',
  },
];

/**
 * Format untuk Mantine Select (ComboboxItemGroup)
 */
export const BANK_GROUPED_OPTIONS = [
  {
    group: 'Bank Terpopuler',
    items: INDONESIA_BANKS.filter((b) => b.category === 'Populer').map((b) => ({
      value: b.name,
      label: `${b.name} (${b.code})`,
    })),
  },
  {
    group: 'Bank Digital',
    items: INDONESIA_BANKS.filter((b) => b.category === 'Digital').map((b) => ({
      value: b.name,
      label: `${b.name} (${b.code})`,
    })),
  },
  {
    group: 'Bank Swasta & Lainnya',
    items: INDONESIA_BANKS.filter(
      (b) => b.category === 'Swasta' || b.category === 'Syariah' || b.category === 'Asing'
    ).map((b) => ({
      value: b.name,
      label: `${b.name} (${b.code})`,
    })),
  },
  {
    group: 'Bank Pembangunan Daerah (BPD)',
    items: INDONESIA_BANKS.filter((b) => b.category === 'BPD').map((b) => ({
      value: b.name,
      label: `${b.name} (${b.code})`,
    })),
  },
];

/**
 * Flat list nama bank untuk Autocomplete
 */
export const BANK_NAMES_LIST: string[] = INDONESIA_BANKS.map((b) => b.name);
