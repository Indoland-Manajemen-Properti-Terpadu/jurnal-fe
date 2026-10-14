import { useEffect, useMemo, useState } from 'react';
import {
  ActionIcon,
  Alert,
  Box,
  Button,
  Divider,
  Grid,
  Group,
  Modal,
  MultiSelect,
  NumberInput,
  Paper,
  Select,
  Stack,
  Switch,
  Tabs,
  Text,
  TextInput,
  Textarea,
  ThemeIcon,
  Tooltip,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import {
  IconBuildingBank,
  IconFileInvoice,
  IconInfoCircle,
  IconMapPin,
  IconPlus,
  IconTrash,
  IconUser,
} from '@tabler/icons-react';
import type { Contact, ContactFormValues, ContactType } from '../types/contact';
import {
  useAccountOptions,
  useContactGroups,
  useFilteredAccounts,
  usePaymentTerms,
} from '../hooks/useContactQueries';

type ContactFormModalProps = {
  opened: boolean;
  contact?: Contact;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: ContactFormValues) => void;
};

const CONTACT_TYPE_OPTIONS = [
  { value: 'Pelanggan', label: 'Pelanggan (Customer)' },
  { value: 'Supplier', label: 'Pemasok / Vendor (Supplier)' },
  { value: 'Karyawan', label: 'Karyawan (Employee)' },
  { value: 'Unit', label: 'Unit (Penghuni / Unit Properti)' },
  { value: 'Lainnya', label: 'Lainnya (Other)' },
];

const PREFIX_OPTIONS = [
  { value: 'Bapak', label: 'Bapak' },
  { value: 'Ibu', label: 'Ibu' },
  { value: 'Sdr', label: 'Sdr (Saudara)' },
  { value: 'Sdri', label: 'Sdri (Saudari)' },
  { value: 'Mr', label: 'Mr.' },
  { value: 'Mrs', label: 'Mrs.' },
  { value: 'Ms', label: 'Ms.' },
  { value: 'Dr', label: 'Dr.' },
  { value: 'Prof', label: 'Prof.' },
];

const IDENTITY_TYPE_OPTIONS = [
  { value: 'KTP', label: 'KTP (Kartu Tanda Penduduk)' },
  { value: 'SIM', label: 'SIM (Surat Izin Mengemudi)' },
  { value: 'Passport', label: 'Paspor (Passport)' },
];

const extractId = (val: unknown): string | null => {
  if (!val) return null;
  if (typeof val === 'string') return val;
  if (typeof val === 'object' && 'id' in val) return String((val as { id: unknown }).id);
  if (typeof val === 'object' && '_id' in val) return String((val as { _id: unknown })._id);
  return null;
};

export function ContactFormModal({
  opened,
  contact,
  isSubmitting,
  onClose,
  onSubmit,
}: Readonly<ContactFormModalProps>) {
  const [activeTab, setActiveTab] = useState<string | null>('general');
  const accountsQuery = useAccountOptions();
  const paymentTermsQuery = usePaymentTerms();
  const groupsQuery = useContactGroups();
  const arFilteredQuery = useFilteredAccounts('AR');
  const apFilteredQuery = useFilteredAccounts('AP');

  const form = useForm<ContactFormValues>({
    initialValues: {
      displayName: '',
      contactType: ['Pelanggan'],
      contactGroups: [],
      fullName: {
        prefix: '',
        firstName: '',
        middleName: '',
        lastName: '',
      },
      identity: {
        type: 'KTP',
        number: '',
      },
      emails: [''],
      companyName: '',
      phones: {
        mobile: '',
        telephone: '',
        fax: '',
      },
      npwp: '',
      addresses: {
        billing: {
          general: '',
          detail: {
            no: '',
            rt: '',
            rw: '',
            zipCode: '',
            kelurahan: '',
            kecamatan: '',
            city: '',
            province: '',
          },
        },
        shipping: {
          isSameAsBilling: true,
          general: '',
          detail: {
            no: '',
            rt: '',
            rw: '',
            zipCode: '',
            kelurahan: '',
            kecamatan: '',
            city: '',
            province: '',
          },
        },
      },
      otherInfo: '',
      bankAccounts: [],
      mappingAccount: {
        arAccount: null,
        apAccount: null,
        defaultPaymentTerm: 30,
        maxReceivable: { isActive: false, amount: 0 },
        maxPayable: { isActive: false, amount: 0 },
      },
    },
    validate: {
      displayName: (v) => (!v.trim() ? 'Nama tampilan wajib diisi' : null),
      contactType: (v) => (v.length === 0 ? 'Pilih minimal satu tipe kontak' : null),
    },
  });

  // Sync form when contact changes
  useEffect(() => {
    if (opened) {
      if (contact) {
        form.setValues({
          displayName: contact.displayName ?? '',
          contactType: contact.contactType.length > 0 ? contact.contactType : ['Pelanggan'],
          contactGroups: contact.contactGroups ?? [],
          fullName: {
            prefix: contact.fullName?.prefix ?? '',
            firstName: contact.fullName?.firstName ?? '',
            middleName: contact.fullName?.middleName ?? '',
            lastName: contact.fullName?.lastName ?? '',
          },
          identity: {
            type: contact.identity?.type ?? 'KTP',
            number: contact.identity?.number ?? '',
          },
          emails:
            contact.emails.length > 0 ? contact.emails : [''],
          companyName: contact.companyName ?? '',
          phones: {
            mobile: contact.phones?.mobile ?? '',
            telephone: contact.phones?.telephone ?? '',
            fax: contact.phones?.fax ?? '',
          },
          npwp: contact.npwp ?? '',
          addresses: {
            billing: {
              general: contact.addresses?.billing?.general ?? '',
              detail: {
                no: contact.addresses?.billing?.detail?.no ?? '',
                rt: contact.addresses?.billing?.detail?.rt ?? '',
                rw: contact.addresses?.billing?.detail?.rw ?? '',
                zipCode: contact.addresses?.billing?.detail?.zipCode ?? '',
                kelurahan: contact.addresses?.billing?.detail?.kelurahan ?? '',
                kecamatan: contact.addresses?.billing?.detail?.kecamatan ?? '',
                city: contact.addresses?.billing?.detail?.city ?? '',
                province: contact.addresses?.billing?.detail?.province ?? '',
              },
            },
            shipping: {
              isSameAsBilling:
                contact.addresses?.shipping?.isSameAsBilling ?? true,
              general: contact.addresses?.shipping?.general ?? '',
              detail: {
                no: contact.addresses?.shipping?.detail?.no ?? '',
                rt: contact.addresses?.shipping?.detail?.rt ?? '',
                rw: contact.addresses?.shipping?.detail?.rw ?? '',
                zipCode: contact.addresses?.shipping?.detail?.zipCode ?? '',
                kelurahan: contact.addresses?.shipping?.detail?.kelurahan ?? '',
                kecamatan: contact.addresses?.shipping?.detail?.kecamatan ?? '',
                city: contact.addresses?.shipping?.detail?.city ?? '',
                province: contact.addresses?.shipping?.detail?.province ?? '',
              },
            },
          },
          otherInfo: contact.otherInfo ?? '',
          bankAccounts:
            contact.bankAccounts.length > 0
              ? contact.bankAccounts.map((b) => ({
                  bankName: b.bankName ?? '',
                  branch: b.branch ?? '',
                  accountHolder: b.accountHolder ?? '',
                  accountNumber: b.accountNumber ?? '',
                }))
              : [],
          mappingAccount: {
            arAccount: extractId(contact.mappingAccount?.arAccount),
            apAccount: extractId(contact.mappingAccount?.apAccount),
            defaultPaymentTerm:
              typeof contact.mappingAccount?.defaultPaymentTerm === 'number'
                ? contact.mappingAccount.defaultPaymentTerm
                : 30,
            maxReceivable: contact.mappingAccount?.maxReceivable ?? {
              isActive: false,
              amount: 0,
            },
            maxPayable: contact.mappingAccount?.maxPayable ?? {
              isActive: false,
              amount: 0,
            },
          },
        });
      } else {
        form.reset();
      }
      setActiveTab('general');
    }
  }, [opened, contact]);

  // Account options for AR & AP (Proper Mantine v8 ComboboxItemGroup: { group, items })
  const accountSelectData = useMemo(() => {
    const list = accountsQuery.data ?? [];
    const groupsMap = new Map<string, Array<{ value: string; label: string }>>();
    const seenIds = new Set<string>();

    list.forEach((acc) => {
      if (acc.id && !seenIds.has(acc.id)) {
        seenIds.add(acc.id);
        const cat = acc.category || 'Akun Lainnya';
        if (!groupsMap.has(cat)) {
          groupsMap.set(cat, []);
        }
        groupsMap.get(cat)!.push({
          value: acc.id,
          label: acc.label,
        });
      }
    });

    return Array.from(groupsMap.entries()).map(([group, items]) => ({
      group,
      items,
    }));
  }, [accountsQuery.data]);

  // Specific AR accounts with fallback to general COA
  const arSelectData = useMemo(() => {
    const result: Array<{ group: string; items: Array<{ value: string; label: string }> }> = [];
    const filtered = arFilteredQuery.data ?? [];
    if (filtered.length > 0) {
      result.push({
        group: 'Akun Piutang Direkomendasikan (AR)',
        items: filtered.map((a) => ({
          value: a.id,
          label: `${a.accountNumber} - ${a.name}`,
        })),
      });
    }
    return [...result, ...accountSelectData];
  }, [arFilteredQuery.data, accountSelectData]);

  // Specific AP accounts with fallback to general COA
  const apSelectData = useMemo(() => {
    const result: Array<{ group: string; items: Array<{ value: string; label: string }> }> = [];
    const filtered = apFilteredQuery.data ?? [];
    if (filtered.length > 0) {
      result.push({
        group: 'Akun Hutang Direkomendasikan (AP)',
        items: filtered.map((a) => ({
          value: a.id,
          label: `${a.accountNumber} - ${a.name}`,
        })),
      });
    }
    return [...result, ...accountSelectData];
  }, [apFilteredQuery.data, accountSelectData]);

  // Contact groups options
  const groupSelectData = useMemo(() => {
    return (groupsQuery.data ?? []).map((g) => ({
      value: g.name,
      label: g.name,
    }));
  }, [groupsQuery.data]);

  // Payment terms options (deduplicated by days)
  const paymentTermSelectData = useMemo(() => {
    const terms = paymentTermsQuery.data ?? [];
    const seenDays = new Set<number>();
    const options: Array<{ value: string; label: string }> = [];

    terms.forEach((t) => {
      if (!seenDays.has(t.days)) {
        seenDays.add(t.days);
        options.push({
          value: String(t.days),
          label: `${t.name} (${t.days === 0 ? 'Langsung Tunai' : `${t.days} hari`})`,
        });
      }
    });

    return options;
  }, [paymentTermsQuery.data]);

  const handleAddBankAccount = () => {
    form.insertListItem('bankAccounts', {
      bankName: '',
      branch: '',
      accountHolder: '',
      accountNumber: '',
    });
  };

  const handleSubmit = (values: ContactFormValues) => {
    onSubmit(values);
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Box>
          <Text fw={700} size="md" c="primary.9">
            {contact ? 'Ubah Data Kontak' : 'Tambah Kontak Baru'}
          </Text>
          <Text size="xs" c="dimmed">
            {contact
              ? `Perbarui profil dan pemetaan akun untuk "${contact.displayName}"`
              : 'Daftarkan kontak pelanggan, pemasok, atau karyawan ke sistem akuntansi.'}
          </Text>
        </Box>
      }
      size="xl"
      radius="md"
      centered
      padding="lg"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <Tabs value={activeTab} onChange={setActiveTab} color="primary" variant="outline">
            <Tabs.List>
              <Tabs.Tab value="general" leftSection={<IconUser size={15} />}>
                Informasi Utama
              </Tabs.Tab>
              <Tabs.Tab value="address" leftSection={<IconMapPin size={15} />}>
                Alamat
              </Tabs.Tab>
              <Tabs.Tab
                value="banks"
                leftSection={<IconBuildingBank size={15} />}
                rightSection={
                  form.values.bankAccounts.length > 0 ? (
                    <Text size="xs" c="primary.6" fw={700}>
                      ({form.values.bankAccounts.length})
                    </Text>
                  ) : null
                }
              >
                Rekening Bank
              </Tabs.Tab>
              <Tabs.Tab value="mapping" leftSection={<IconFileInvoice size={15} />}>
                Pemetaan Akun
              </Tabs.Tab>
            </Tabs.List>

            {/* TAB 1: INFORMASI UTAMA */}
            <Tabs.Panel value="general" pt="md">
              <Stack gap="sm">
                <Grid gutter="sm">
                  <Grid.Col span={{ base: 12, sm: 5 }}>
                    <TextInput
                      label="Nama Tampilan (Display Name)"
                      placeholder="Contoh: PT. Sumber Makmur Abadi / John Doe"
                      withAsterisk
                      {...form.getInputProps('displayName')}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 4 }}>
                    <MultiSelect
                      label="Tipe Kontak"
                      placeholder="Pilih tipe kontak"
                      data={CONTACT_TYPE_OPTIONS}
                      withAsterisk
                      {...form.getInputProps('contactType')}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 3 }}>
                    <MultiSelect
                      label="Grup Kontak"
                      placeholder="Pilih grup"
                      data={groupSelectData}
                      searchable
                      clearable
                      {...form.getInputProps('contactGroups')}
                    />
                  </Grid.Col>
                </Grid>

                <Paper withBorder radius="md" p="sm" bg="gray.0">
                  <Text size="xs" fw={700} c="primary.9" mb="xs">
                    Rincian Nama Lengkap
                  </Text>
                  <Grid gutter="xs">
                    <Grid.Col span={{ base: 12, sm: 3 }}>
                      <Select
                        label="Gelar / Sapaan"
                        placeholder="Pilih"
                        data={PREFIX_OPTIONS}
                        clearable
                        searchable
                        {...form.getInputProps('fullName.prefix')}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 3 }}>
                      <TextInput
                        label="Nama Depan"
                        placeholder="Nama depan"
                        {...form.getInputProps('fullName.firstName')}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 3 }}>
                      <TextInput
                        label="Nama Tengah"
                        placeholder="Nama tengah"
                        {...form.getInputProps('fullName.middleName')}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 3 }}>
                      <TextInput
                        label="Nama Belakang"
                        placeholder="Nama belakang"
                        {...form.getInputProps('fullName.lastName')}
                      />
                    </Grid.Col>
                  </Grid>
                </Paper>

                <Grid gutter="sm">
                  <Grid.Col span={{ base: 12, sm: 4 }}>
                    <Select
                      label="Jenis Identitas"
                      data={IDENTITY_TYPE_OPTIONS}
                      {...form.getInputProps('identity.type')}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 8 }}>
                    <TextInput
                      label="Nomor Identitas"
                      placeholder="Nomor KTP / SIM / Paspor"
                      {...form.getInputProps('identity.number')}
                    />
                  </Grid.Col>
                </Grid>

                <Grid gutter="sm">
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <TextInput
                      label="Nama Perusahaan"
                      placeholder="Contoh: PT. Indoland Manajemen Properti"
                      {...form.getInputProps('companyName')}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <TextInput
                      label="NPWP"
                      placeholder="00.000.000.0-000.000"
                      {...form.getInputProps('npwp')}
                    />
                  </Grid.Col>
                </Grid>

                <Grid gutter="sm">
                  <Grid.Col span={{ base: 12, sm: 4 }}>
                    <TextInput
                      label="Email Utama"
                      placeholder="kontak@perusahaan.com"
                      value={form.values.emails[0] ?? ''}
                      onChange={(e) => {
                        const next = [...form.values.emails];
                        next[0] = e.currentTarget.value;
                        form.setFieldValue('emails', next);
                      }}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 4 }}>
                    <TextInput
                      label="No. Handphone (Mobile)"
                      placeholder="0812xxxxxxxx"
                      {...form.getInputProps('phones.mobile')}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 4 }}>
                    <TextInput
                      label="No. Telepon Kantor"
                      placeholder="021-xxxxxxx"
                      {...form.getInputProps('phones.telephone')}
                    />
                  </Grid.Col>
                </Grid>

                <Textarea
                  label="Catatan Tambahan (Opsional)"
                  placeholder="Keterangan pendukung atau preferensi komunikasi kontak..."
                  rows={2}
                  {...form.getInputProps('otherInfo')}
                />
              </Stack>
            </Tabs.Panel>

            {/* TAB 2: ALAMAT */}
            <Tabs.Panel value="address" pt="md">
              <Stack gap="md">
                <Paper withBorder radius="md" p="md" bg="white">
                  <Text fw={700} size="sm" c="primary.9" mb="xs">
                    Alamat Penagihan (Billing Address)
                  </Text>
                  <Stack gap="xs">
                    <Textarea
                      label="Alamat Lengkap"
                      placeholder="Jalan, nomor gedung/rumah, kelurahan, kecamatan..."
                      rows={2}
                      {...form.getInputProps('addresses.billing.general')}
                    />
                    <Grid gutter="xs">
                      <Grid.Col span={{ base: 12, sm: 4 }}>
                        <TextInput
                          label="Kota / Kabupaten"
                          placeholder="Jakarta Selatan"
                          {...form.getInputProps('addresses.billing.detail.city')}
                        />
                      </Grid.Col>
                      <Grid.Col span={{ base: 12, sm: 4 }}>
                        <TextInput
                          label="Provinsi"
                          placeholder="DKI Jakarta"
                          {...form.getInputProps('addresses.billing.detail.province')}
                        />
                      </Grid.Col>
                      <Grid.Col span={{ base: 12, sm: 4 }}>
                        <TextInput
                          label="Kode Pos"
                          placeholder="12345"
                          {...form.getInputProps('addresses.billing.detail.zipCode')}
                        />
                      </Grid.Col>
                    </Grid>
                  </Stack>
                </Paper>

                <Paper withBorder radius="md" p="md" bg="white">
                  <Group justify="space-between" align="center" mb="xs">
                    <Text fw={700} size="sm" c="primary.9">
                      Alamat Pengiriman (Shipping Address)
                    </Text>
                    <Switch
                      label="Sama dengan alamat penagihan"
                      checked={form.values.addresses.shipping.isSameAsBilling}
                      onChange={(e) =>
                        form.setFieldValue(
                          'addresses.shipping.isSameAsBilling',
                          e.currentTarget.checked
                        )
                      }
                    />
                  </Group>

                  {!form.values.addresses.shipping.isSameAsBilling ? (
                    <Stack gap="xs" mt="sm">
                      <Textarea
                        label="Alamat Pengiriman Lengkap"
                        placeholder="Alamat gudang / tempat penerimaan barang..."
                        rows={2}
                        {...form.getInputProps('addresses.shipping.general')}
                      />
                      <Grid gutter="xs">
                        <Grid.Col span={{ base: 12, sm: 4 }}>
                          <TextInput
                            label="Kota / Kabupaten"
                            placeholder="Kota pengiriman"
                            {...form.getInputProps('addresses.shipping.detail.city')}
                          />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, sm: 4 }}>
                          <TextInput
                            label="Provinsi"
                            placeholder="Provinsi pengiriman"
                            {...form.getInputProps('addresses.shipping.detail.province')}
                          />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, sm: 4 }}>
                          <TextInput
                            label="Kode Pos"
                            placeholder="Kode pos"
                            {...form.getInputProps('addresses.shipping.detail.zipCode')}
                          />
                        </Grid.Col>
                      </Grid>
                    </Stack>
                  ) : (
                    <Text size="xs" c="dimmed">
                      Alamat pengiriman otomatis mengikuti alamat penagihan di atas.
                    </Text>
                  )}
                </Paper>
              </Stack>
            </Tabs.Panel>

            {/* TAB 3: REKENING BANK */}
            <Tabs.Panel value="banks" pt="md">
              <Stack gap="md">
                <Group justify="space-between" align="center">
                  <Box>
                    <Text fw={700} size="sm" c="primary.9">
                      Daftar Rekening Bank
                    </Text>
                    <Text size="xs" c="dimmed">
                      Simpan informasi rekening bank untuk pembayaran atau penerimaan dana.
                    </Text>
                  </Box>
                  <Button
                    size="xs"
                    variant="light"
                    color="primary"
                    leftSection={<IconPlus size={14} />}
                    onClick={handleAddBankAccount}
                  >
                    Tambah Rekening
                  </Button>
                </Group>

                {form.values.bankAccounts.length === 0 ? (
                  <Paper withBorder p="xl" radius="md" ta="center" bg="gray.0">
                    <ThemeIcon size={40} radius="xl" color="gray" variant="light" mx="auto" mb="xs">
                      <IconBuildingBank size={20} />
                    </ThemeIcon>
                    <Text size="sm" fw={600} c="dark.8">
                      Belum ada rekening bank
                    </Text>
                    <Text size="xs" c="dimmed" mt={2} mb="md">
                      Tambahkan informasi rekening jika kontak ini memerlukan transfer pembayaran.
                    </Text>
                    <Button
                      size="xs"
                      variant="outline"
                      color="primary"
                      leftSection={<IconPlus size={14} />}
                      onClick={handleAddBankAccount}
                    >
                      Tambah Rekening Pertama
                    </Button>
                  </Paper>
                ) : (
                  <Stack gap="sm">
                    {form.values.bankAccounts.map((_, index) => (
                      // eslint-disable-next-line react/no-array-index-key
                      <Paper key={`bank-${index}`} withBorder p="sm" radius="md" bg="white">
                        <Group justify="space-between" align="center" mb="xs">
                          <Text size="xs" fw={700} c="primary.8">
                            Rekening #{index + 1}
                          </Text>
                          <ActionIcon
                            color="red"
                            variant="subtle"
                            size="sm"
                            onClick={() => form.removeListItem('bankAccounts', index)}
                            aria-label="Hapus Rekening"
                          >
                            <IconTrash size={14} />
                          </ActionIcon>
                        </Group>

                        <Grid gutter="xs">
                          <Grid.Col span={{ base: 12, sm: 6 }}>
                            <TextInput
                              label="Nama Bank"
                              placeholder="BCA / Mandiri / BNI / BRI / CIMB"
                              {...form.getInputProps(`bankAccounts.${index}.bankName`)}
                            />
                          </Grid.Col>
                          <Grid.Col span={{ base: 12, sm: 6 }}>
                            <TextInput
                              label="Nomor Rekening"
                              placeholder="Nomor rekening bank"
                              {...form.getInputProps(`bankAccounts.${index}.accountNumber`)}
                            />
                          </Grid.Col>
                          <Grid.Col span={{ base: 12, sm: 6 }}>
                            <TextInput
                              label="Atas Nama (Account Holder)"
                              placeholder="Nama pemilik rekening"
                              {...form.getInputProps(`bankAccounts.${index}.accountHolder`)}
                            />
                          </Grid.Col>
                          <Grid.Col span={{ base: 12, sm: 6 }}>
                            <TextInput
                              label="Kantor Cabang"
                              placeholder="Cabang pembukaan rekening"
                              {...form.getInputProps(`bankAccounts.${index}.branch`)}
                            />
                          </Grid.Col>
                        </Grid>
                      </Paper>
                    ))}
                  </Stack>
                )}
              </Stack>
            </Tabs.Panel>

            {/* TAB 4: PEMETAAN AKUN AKUNTANSI */}
            <Tabs.Panel value="mapping" pt="md">
              <Stack gap="md">
                <Alert color="blue" icon={<IconInfoCircle size={16} />}>
                  Pemetaan akun memastikan invoice penjualan atau tagihan vendor langsung membukukan
                  piutang atau hutang ke akun yang Anda tentukan di bawah ini.
                </Alert>

                <Paper withBorder radius="md" p="md" bg="white">
                  <Text fw={700} size="sm" c="primary.9" mb="xs">
                    Akun Piutang & Hutang
                  </Text>
                  <Grid gutter="md">
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <Select
                        label="Akun Piutang (Accounts Receivable)"
                        description="Digunakan untuk membukukan tagihan kepada pelanggan ini."
                        placeholder="Pilih akun piutang"
                        data={arSelectData}
                        searchable
                        clearable
                        nothingFoundMessage="Akun tidak ditemukan"
                        {...form.getInputProps('mappingAccount.arAccount')}
                      />
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <Select
                        label="Akun Hutang (Accounts Payable)"
                        description="Digunakan untuk membukukan kewajiban tagihan dari pemasok ini."
                        placeholder="Pilih akun hutang"
                        data={apSelectData}
                        searchable
                        clearable
                        nothingFoundMessage="Akun tidak ditemukan"
                        {...form.getInputProps('mappingAccount.apAccount')}
                      />
                    </Grid.Col>
                  </Grid>
                </Paper>

                <Paper withBorder radius="md" p="md" bg="white">
                  <Text fw={700} size="sm" c="primary.9" mb="xs">
                    Termin Pembayaran Default
                  </Text>
                  <Grid gutter="md">
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <Select
                        label="Termin Standar"
                        description="Jangka waktu jatuh tempo pembayaran transaksi."
                        data={paymentTermSelectData}
                        value={
                          form.values.mappingAccount.defaultPaymentTerm !== null &&
                          form.values.mappingAccount.defaultPaymentTerm !== undefined
                            ? String(form.values.mappingAccount.defaultPaymentTerm)
                            : null
                        }
                        onChange={(v) =>
                          form.setFieldValue(
                            'mappingAccount.defaultPaymentTerm',
                            v !== null ? Number(v) : 0
                          )
                        }
                        clearable
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <NumberInput
                        label="Jumlah Hari Jatuh Tempo"
                        description="0 berarti Cash on Delivery (Tunai langsung)."
                        min={0}
                        max={365}
                        {...form.getInputProps('mappingAccount.defaultPaymentTerm')}
                      />
                    </Grid.Col>
                  </Grid>
                </Paper>

                <Paper withBorder radius="md" p="md" bg="white">
                  <Text fw={700} size="sm" c="primary.9" mb="xs">
                    Batas Kredit Maksimum (Credit Limit)
                  </Text>
                  <Grid gutter="md">
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <Stack gap="xs">
                        <Switch
                          label="Aktifkan Batas Maksimum Piutang"
                          checked={form.values.mappingAccount.maxReceivable?.isActive ?? false}
                          onChange={(e) =>
                            form.setFieldValue(
                              'mappingAccount.maxReceivable.isActive',
                              e.currentTarget.checked
                            )
                          }
                        />
                        {form.values.mappingAccount.maxReceivable?.isActive && (
                          <NumberInput
                            label="Jumlah Batas Piutang (Rp)"
                            placeholder="Contoh: 50.000.000"
                            thousandSeparator="."
                            decimalSeparator=","
                            min={0}
                            {...form.getInputProps('mappingAccount.maxReceivable.amount')}
                          />
                        )}
                      </Stack>
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <Stack gap="xs">
                        <Switch
                          label="Aktifkan Batas Maksimum Hutang"
                          checked={form.values.mappingAccount.maxPayable?.isActive ?? false}
                          onChange={(e) =>
                            form.setFieldValue(
                              'mappingAccount.maxPayable.isActive',
                              e.currentTarget.checked
                            )
                          }
                        />
                        {form.values.mappingAccount.maxPayable?.isActive && (
                          <NumberInput
                            label="Jumlah Batas Hutang (Rp)"
                            placeholder="Contoh: 100.000.000"
                            thousandSeparator="."
                            decimalSeparator=","
                            min={0}
                            {...form.getInputProps('mappingAccount.maxPayable.amount')}
                          />
                        )}
                      </Stack>
                    </Grid.Col>
                  </Grid>
                </Paper>
              </Stack>
            </Tabs.Panel>
          </Tabs>

          <Divider />

          {/* Footer Actions */}
          <Group justify="flex-end" gap="sm">
            <Button variant="default" onClick={onClose} disabled={isSubmitting}>
              Batal
            </Button>
            <Button
              type="submit"
              color="primary"
              loading={isSubmitting}
            >
              {contact ? 'Simpan Perubahan' : 'Tambah Kontak'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

export default ContactFormModal;

