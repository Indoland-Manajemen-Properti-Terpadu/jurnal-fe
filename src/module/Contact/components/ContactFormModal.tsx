import { useEffect, useMemo, useState } from 'react';
import {
  ActionIcon,
  Alert,
  Autocomplete,
  Badge,
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
  IconPencil,
  IconPlus,
  IconTrash,
  IconUser,
  IconUserPlus,
} from '@tabler/icons-react';
import type { Contact, ContactFormValues, ContactType } from '../types/contact';
import {
  useAccountOptions,
  useContactGroups,
  useFilteredAccounts,
  usePaymentTerms,
} from '../hooks/useContactQueries';
import { INDONESIA_BANKS } from '@/constants/banks';
import {
  INDONESIA_PROVINCES,
  getCitiesByProvince,
  findProvinceByCity,
  ALL_INDONESIA_CITIES,
} from '@/constants/regionsIndonesia';

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
          emails: contact.emails.length > 0 ? contact.emails : [''],
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
              isSameAsBilling: contact.addresses?.shipping?.isSameAsBilling ?? true,
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

  // Specific AR accounts with fallback to general COA (strictly deduplicated)
  const arSelectData = useMemo(() => {
    const filtered = arFilteredQuery.data ?? [];
    const seenIds = new Set<string>();
    const result: Array<{ group: string; items: Array<{ value: string; label: string }> }> = [];

    if (filtered.length > 0) {
      const recItems: Array<{ value: string; label: string }> = [];
      filtered.forEach((a) => {
        if (a.id && !seenIds.has(a.id)) {
          seenIds.add(a.id);
          recItems.push({
            value: a.id,
            label: `${a.accountNumber} - ${a.name}`,
          });
        }
      });
      if (recItems.length > 0) {
        result.push({
          group: 'Akun Piutang Direkomendasikan (AR)',
          items: recItems,
        });
      }
    }

    accountSelectData.forEach((grp) => {
      const remainingItems = grp.items.filter((item) => {
        if (!item.value || seenIds.has(item.value)) return false;
        seenIds.add(item.value);
        return true;
      });
      if (remainingItems.length > 0) {
        result.push({
          group: grp.group,
          items: remainingItems,
        });
      }
    });

    return result;
  }, [arFilteredQuery.data, accountSelectData]);

  // Specific AP accounts with fallback to general COA (strictly deduplicated)
  const apSelectData = useMemo(() => {
    const filtered = apFilteredQuery.data ?? [];
    const seenIds = new Set<string>();
    const result: Array<{ group: string; items: Array<{ value: string; label: string }> }> = [];

    if (filtered.length > 0) {
      const recItems: Array<{ value: string; label: string }> = [];
      filtered.forEach((a) => {
        if (a.id && !seenIds.has(a.id)) {
          seenIds.add(a.id);
          recItems.push({
            value: a.id,
            label: `${a.accountNumber} - ${a.name}`,
          });
        }
      });
      if (recItems.length > 0) {
        result.push({
          group: 'Akun Hutang Direkomendasikan (AP)',
          items: recItems,
        });
      }
    }

    accountSelectData.forEach((grp) => {
      const remainingItems = grp.items.filter((item) => {
        if (!item.value || seenIds.has(item.value)) return false;
        seenIds.add(item.value);
        return true;
      });
      if (remainingItems.length > 0) {
        result.push({
          group: grp.group,
          items: remainingItems,
        });
      }
    });

    return result;
  }, [apFilteredQuery.data, accountSelectData]);

  // Contact groups options (strictly deduplicated)
  const groupSelectData = useMemo(() => {
    const seen = new Set<string>();
    const opts: Array<{ value: string; label: string }> = [];
    (groupsQuery.data ?? []).forEach((g) => {
      if (g.name && !seen.has(g.name)) {
        seen.add(g.name);
        opts.push({
          value: g.name,
          label: g.name,
        });
      }
    });
    return opts;
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

  // Master Bank Options for Autocomplete
  const bankAutocompleteData = useMemo(() => {
    return INDONESIA_BANKS.map((b) => ({
      value: b.name,
      label: `${b.name} (${b.code}) - ${b.category}`,
    }));
  }, []);

  // Master Region Options - Billing
  const billingProvince = form.values.addresses.billing.detail.province;
  const billingCity = form.values.addresses.billing.detail.city;

  const billingProvinceOptions = useMemo(() => {
    const list = INDONESIA_PROVINCES.map((p) => ({ value: p, label: p }));
    if (billingProvince && !INDONESIA_PROVINCES.includes(billingProvince)) {
      return [{ value: billingProvince, label: billingProvince }, ...list];
    }
    return list;
  }, [billingProvince]);

  const billingCityOptions = useMemo(() => {
    const cities = billingProvince ? getCitiesByProvince(billingProvince) : ALL_INDONESIA_CITIES;
    const list = cities.map((c) => ({ value: c, label: c }));
    if (billingCity && !cities.includes(billingCity)) {
      return [{ value: billingCity, label: billingCity }, ...list];
    }
    return list;
  }, [billingProvince, billingCity]);

  // Master Region Options - Shipping
  const shippingProvince = form.values.addresses.shipping.detail.province;
  const shippingCity = form.values.addresses.shipping.detail.city;

  const shippingProvinceOptions = useMemo(() => {
    const list = INDONESIA_PROVINCES.map((p) => ({ value: p, label: p }));
    if (shippingProvince && !INDONESIA_PROVINCES.includes(shippingProvince)) {
      return [{ value: shippingProvince, label: shippingProvince }, ...list];
    }
    return list;
  }, [shippingProvince]);

  const shippingCityOptions = useMemo(() => {
    const cities = shippingProvince ? getCitiesByProvince(shippingProvince) : ALL_INDONESIA_CITIES;
    const list = cities.map((c) => ({ value: c, label: c }));
    if (shippingCity && !cities.includes(shippingCity)) {
      return [{ value: shippingCity, label: shippingCity }, ...list];
    }
    return list;
  }, [shippingProvince, shippingCity]);

  const handleBillingProvinceChange = (val: string | null) => {
    const newProv = val || '';
    form.setFieldValue('addresses.billing.detail.province', newProv);

    if (newProv) {
      const citiesInNewProv = getCitiesByProvince(newProv);
      if (billingCity && !citiesInNewProv.includes(billingCity)) {
        form.setFieldValue('addresses.billing.detail.city', '');
      }
    }
  };

  const handleBillingCityChange = (val: string | null) => {
    const newCity = val || '';
    form.setFieldValue('addresses.billing.detail.city', newCity);

    if (newCity && !billingProvince) {
      const detected = findProvinceByCity(newCity);
      if (detected) {
        form.setFieldValue('addresses.billing.detail.province', detected);
      }
    }
  };

  const handleShippingProvinceChange = (val: string | null) => {
    const newProv = val || '';
    form.setFieldValue('addresses.shipping.detail.province', newProv);

    if (newProv) {
      const citiesInNewProv = getCitiesByProvince(newProv);
      if (shippingCity && !citiesInNewProv.includes(shippingCity)) {
        form.setFieldValue('addresses.shipping.detail.city', '');
      }
    }
  };

  const handleShippingCityChange = (val: string | null) => {
    const newCity = val || '';
    form.setFieldValue('addresses.shipping.detail.city', newCity);

    if (newCity && !shippingProvince) {
      const detected = findProvinceByCity(newCity);
      if (detected) {
        form.setFieldValue('addresses.shipping.detail.province', detected);
      }
    }
  };

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
        <Group gap="sm" align="center">
          <ThemeIcon size={38} radius="md" variant="light" color="primary">
            {contact ? <IconPencil size={20} /> : <IconUserPlus size={20} />}
          </ThemeIcon>
          <Box>
            <Text fw={700} size="md" c="dark.8">
              {contact ? 'Ubah Data Kontak' : 'Tambah Kontak Baru'}
            </Text>
            <Text size="xs" c="dimmed">
              {contact
                ? `Perbarui profil dan pemetaan akun untuk "${contact.displayName}"`
                : 'Daftarkan kontak pelanggan, pemasok, atau karyawan ke sistem akuntansi.'}
            </Text>
          </Box>
        </Group>
      }
      size="920px"
      radius="lg"
      centered
      padding="xl"
      overlayProps={{
        backgroundOpacity: 0.5,
        blur: 3,
      }}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="lg">
          <Tabs
            value={activeTab}
            onChange={setActiveTab}
            color="primary"
            variant="outline"
            radius="md"
          >
            <Tabs.List mb="md">
              <Tabs.Tab value="general" leftSection={<IconUser size={16} />}>
                Informasi Utama
              </Tabs.Tab>
              <Tabs.Tab value="address" leftSection={<IconMapPin size={16} />}>
                Alamat
              </Tabs.Tab>
              <Tabs.Tab
                value="banks"
                leftSection={<IconBuildingBank size={16} />}
                rightSection={
                  form.values.bankAccounts.length > 0 ? (
                    <Badge size="xs" variant="filled" color="primary" circle>
                      {form.values.bankAccounts.length}
                    </Badge>
                  ) : null
                }
              >
                Rekening Bank
              </Tabs.Tab>
              <Tabs.Tab value="mapping" leftSection={<IconFileInvoice size={16} />}>
                Pemetaan Akun
              </Tabs.Tab>
            </Tabs.List>

            {/* TAB 1: INFORMASI UTAMA */}
            <Tabs.Panel value="general">
              <Stack gap="md">
                {/* 1. Profil & Tipe Kontak */}
                <Grid gutter="md">
                  <Grid.Col span={{ base: 12, md: 7 }}>
                    <TextInput
                      label="Nama Tampilan (Display Name)"
                      description="Nama yang tercetak pada invoice, kwitansi, dan laporan keuangan."
                      placeholder="Contoh: PT. Sumber Makmur Abadi / John Doe"
                      withAsterisk
                      {...form.getInputProps('displayName')}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 5 }}>
                    <MultiSelect
                      label="Tipe Kontak"
                      description="Klasifikasi peran kontak dalam transaksi bisnis."
                      placeholder="Pilih tipe kontak"
                      data={CONTACT_TYPE_OPTIONS}
                      withAsterisk
                      {...form.getInputProps('contactType')}
                    />
                  </Grid.Col>
                </Grid>

                <Grid gutter="md">
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <TextInput
                      label="Nama Perusahaan / Bisnis"
                      placeholder="Contoh: PT. Indoland Manajemen Properti"
                      {...form.getInputProps('companyName')}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <MultiSelect
                      label="Grup Kontak"
                      placeholder="Pilih grup kontak"
                      data={groupSelectData}
                      searchable
                      clearable
                      {...form.getInputProps('contactGroups')}
                    />
                  </Grid.Col>
                </Grid>

                {/* 2. Rincian Nama Personal / PIC */}
                <Paper withBorder radius="md" p="md" bg="gray.0">
                  <Group gap="xs" mb="xs">
                    <ThemeIcon size={24} radius="sm" variant="light" color="primary">
                      <IconUser size={14} />
                    </ThemeIcon>
                    <Text size="xs" fw={700} c="primary.9">
                      Kontak Person / PIC (Person In Charge)
                    </Text>
                    <Text size="xs" c="dimmed">
                      (Opsional jika mewakili entitas perusahaan)
                    </Text>
                  </Group>
                  <Grid gutter="sm">
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

                {/* 3. Dokumen Identitas & Pajak */}
                <Grid gutter="md">
                  <Grid.Col span={{ base: 12, sm: 4 }}>
                    <Select
                      label="Jenis Identitas"
                      data={IDENTITY_TYPE_OPTIONS}
                      {...form.getInputProps('identity.type')}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 4 }}>
                    <TextInput
                      label="Nomor Identitas"
                      placeholder="Nomor KTP / SIM / Paspor"
                      {...form.getInputProps('identity.number')}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 4 }}>
                    <TextInput
                      label="NPWP"
                      placeholder="00.000.000.0-000.000"
                      {...form.getInputProps('npwp')}
                    />
                  </Grid.Col>
                </Grid>

                {/* 4. Kontak & Saluran Komunikasi */}
                <Grid gutter="md">
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

                {/* 5. Catatan Tambahan */}
                <Textarea
                  label="Catatan Tambahan (Opsional)"
                  placeholder="Keterangan pendukung atau preferensi komunikasi kontak..."
                  rows={2}
                  {...form.getInputProps('otherInfo')}
                />
              </Stack>
            </Tabs.Panel>

            {/* TAB 2: ALAMAT */}
            <Tabs.Panel value="address">
              <Stack gap="md">
                <Paper withBorder radius="md" p="md" bg="white">
                  <Text fw={700} size="sm" c="primary.9" mb="xs">
                    Alamat Penagihan (Billing Address)
                  </Text>
                  <Stack gap="sm">
                    <Textarea
                      label="Alamat Lengkap"
                      placeholder="Jalan, nomor gedung/rumah, kelurahan, kecamatan..."
                      rows={2}
                      {...form.getInputProps('addresses.billing.general')}
                    />
                    <Grid gutter="sm">
                      <Grid.Col span={{ base: 12, sm: 4 }}>
                        <Select
                          label="Provinsi"
                          placeholder="Pilih provinsi"
                          data={billingProvinceOptions}
                          searchable
                          clearable
                          nothingFoundMessage="Provinsi tidak ditemukan"
                          value={form.values.addresses.billing.detail.province || null}
                          onChange={handleBillingProvinceChange}
                        />
                      </Grid.Col>
                      <Grid.Col span={{ base: 12, sm: 4 }}>
                        <Select
                          label="Kota / Kabupaten"
                          placeholder={
                            billingProvince
                              ? `Pilih kota di ${billingProvince}`
                              : 'Pilih atau cari kota'
                          }
                          data={billingCityOptions}
                          searchable
                          clearable
                          nothingFoundMessage="Kota tidak ditemukan"
                          value={form.values.addresses.billing.detail.city || null}
                          onChange={handleBillingCityChange}
                        />
                      </Grid.Col>
                      <Grid.Col span={{ base: 12, sm: 4 }}>
                        <TextInput
                          label="Kode Pos"
                          placeholder="Contoh: 12190"
                          maxLength={5}
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
                    <Stack gap="sm" mt="sm">
                      <Textarea
                        label="Alamat Pengiriman Lengkap"
                        placeholder="Alamat gudang / tempat penerimaan barang..."
                        rows={2}
                        {...form.getInputProps('addresses.shipping.general')}
                      />
                      <Grid gutter="sm">
                        <Grid.Col span={{ base: 12, sm: 4 }}>
                          <Select
                            label="Provinsi"
                            placeholder="Pilih provinsi"
                            data={shippingProvinceOptions}
                            searchable
                            clearable
                            nothingFoundMessage="Provinsi tidak ditemukan"
                            value={form.values.addresses.shipping.detail.province || null}
                            onChange={handleShippingProvinceChange}
                          />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, sm: 4 }}>
                          <Select
                            label="Kota / Kabupaten"
                            placeholder={
                              shippingProvince
                                ? `Pilih kota di ${shippingProvince}`
                                : 'Pilih atau cari kota'
                            }
                            data={shippingCityOptions}
                            searchable
                            clearable
                            nothingFoundMessage="Kota tidak ditemukan"
                            value={form.values.addresses.shipping.detail.city || null}
                            onChange={handleShippingCityChange}
                          />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, sm: 4 }}>
                          <TextInput
                            label="Kode Pos"
                            placeholder="Contoh: 12190"
                            maxLength={5}
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
            <Tabs.Panel value="banks">
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

                        <Grid gutter="sm">
                          <Grid.Col span={{ base: 12, sm: 6 }}>
                            <Autocomplete
                              label="Nama Bank"
                              placeholder="Cari atau pilih bank (cth: BCA, Mandiri, BRI)"
                              data={bankAutocompleteData}
                              limit={8}
                              maxDropdownHeight={240}
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
              </Stack>
            </Tabs.Panel>
          </Tabs>

          <Divider />

          {/* Footer Actions */}
          <Group justify="flex-end" gap="sm">
            <Button variant="default" onClick={onClose} disabled={isSubmitting}>
              Batal
            </Button>
            <Button type="submit" color="primary" loading={isSubmitting}>
              {contact ? 'Simpan Perubahan' : 'Tambah Kontak'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

export default ContactFormModal;
