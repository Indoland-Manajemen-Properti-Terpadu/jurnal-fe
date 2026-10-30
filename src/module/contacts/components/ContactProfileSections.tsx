import {
  ActionIcon,
  Badge,
  Box,
  CopyButton,
  Divider,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  Tooltip,
} from '@mantine/core';
import {
  IconBuildingBank,
  IconCheck,
  IconCopy,
  IconFileInvoice,
  IconMapPin,
  IconUser,
} from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { Contact, ContactAddress } from '../types/contact';
import { formatContactName, resolveAccountName } from '../utils/contactFormat';
import classes from '../view/DetailContactPage.module.css';

type Props = { contact: Contact; accountMap: Map<string, string> };

function CopyableValue({ value, label }: { value?: string | null; label: string }) {
  const { t } = useTranslation('contactDetail');
  if (!value)
    return (
      <Text c="dimmed" fz="sm">
        {t('notProvided')}
      </Text>
    );
  return (
    <Group gap={4} wrap="nowrap" className={classes.valueGroup}>
      <Text fz="sm" fw={600} className={classes.breakValue}>
        {value}
      </Text>
      <CopyButton value={value} timeout={1800}>
        {({ copied, copy }) => (
          <Tooltip label={copied ? t('copied') : t('copy', { label })}>
            <ActionIcon
              variant="subtle"
              color={copied ? 'teal' : 'gray'}
              size="md"
              onClick={copy}
              aria-label={t('copy', { label })}
            >
              {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
            </ActionIcon>
          </Tooltip>
        )}
      </CopyButton>
    </Group>
  );
}

function InfoRow({
  label,
  value,
  copyable = false,
}: {
  label: string;
  value?: string | null;
  copyable?: boolean;
}) {
  const { t } = useTranslation('contactDetail');
  return (
    <div className={classes.infoRow}>
      <Text fz="xs" c="dimmed" fw={600}>
        {label}
      </Text>
      {copyable ? (
        <CopyableValue value={value} label={label} />
      ) : (
        <Text fz="sm" fw={600} className={classes.breakValue}>
          {value || t('notProvided')}
        </Text>
      )}
    </div>
  );
}

function SectionTitle({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: typeof IconUser;
  title: string;
  subtitle?: string;
}) {
  return (
    <Group gap="sm" mb="lg" wrap="nowrap" align="flex-start">
      <Box className={classes.sectionIcon}>
        <Icon size={20} stroke={1.8} />
      </Box>
      <div>
        <Text fw={700} fz="md">
          {title}
        </Text>
        {subtitle && (
          <Text c="dimmed" fz="xs">
            {subtitle}
          </Text>
        )}
      </div>
    </Group>
  );
}

function AddressBlock({
  label,
  address,
  sameAsBilling,
}: {
  label: string;
  address?: ContactAddress | null;
  sameAsBilling?: boolean;
}) {
  const { t } = useTranslation('contactDetail');
  const detail = address?.detail;
  const region = [
    detail?.kelurahan,
    detail?.kecamatan,
    detail?.city,
    detail?.province,
    detail?.zipCode,
  ]
    .filter(Boolean)
    .join(', ');
  return (
    <div className={classes.addressBlock}>
      <Group justify="space-between" gap="xs">
        <Text fz="xs" fw={700} c="dimmed">
          {label}
        </Text>
        {sameAsBilling && (
          <Badge size="xs" color="primary" variant="light">
            {t('sameAsBilling')}
          </Badge>
        )}
      </Group>
      <Text fz="sm" fw={600} mt="xs">
        {address?.general || t('notProvided')}
      </Text>
      {region && (
        <Text fz="xs" c="dimmed" mt={4}>
          {region}
        </Text>
      )}
    </div>
  );
}

export function ContactProfileSections({ contact, accountMap }: Props) {
  const { t, currentLanguage } = useTranslation('contactDetail');
  const locale = currentLanguage === 'id' ? 'id-ID' : 'en-US';
  const date = (value?: string | null) => {
    if (!value) return t('notProvided');
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime())
      ? t('notProvided')
      : new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric' }).format(
          parsed
        );
  };
  const amount = (value?: { isActive: boolean; amount: number }) =>
    value?.isActive
      ? new Intl.NumberFormat(locale, {
          style: 'currency',
          currency: 'IDR',
          maximumFractionDigits: 0,
        }).format(value.amount)
      : t('notSet');
  const paymentDays = contact.mappingAccount?.defaultPaymentTerm;
  const paymentTerm =
    paymentDays == null
      ? t('notSet')
      : paymentDays === 0
        ? t('cod')
        : t('netDays', { count: paymentDays });
  const billing = contact.addresses?.billing;
  const shipping = contact.addresses?.shipping?.isSameAsBilling
    ? contact.addresses.billing
    : contact.addresses?.shipping;
  const banks = (contact.bankAccounts ?? []).filter((bank) =>
    Boolean(
      bank.bankName?.trim() ||
      bank.accountNumber?.trim() ||
      bank.accountHolder?.trim() ||
      bank.branch?.trim()
    )
  );

  return (
    <div className={classes.profileGrid}>
      <Stack gap="lg">
        <Paper withBorder radius="lg" p={{ base: 'md', sm: 'lg' }}>
          <SectionTitle
            icon={IconUser}
            title={t('identityTitle')}
            subtitle={t('identitySubtitle')}
          />
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
            <InfoRow label={t('fullName')} value={formatContactName(contact)} />
            <InfoRow label={t('company')} value={contact.companyName} />
            <InfoRow label={t('taxId')} value={contact.npwp} copyable />
            <InfoRow
              label={contact.identity?.type || t('identityNumber')}
              value={contact.identity?.number}
              copyable
            />
          </SimpleGrid>
          <Divider my="lg" />
          <Text fw={700} fz="sm" mb="sm">
            {t('reachContact')}
          </Text>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
            <InfoRow label={t('email')} value={contact.emails?.join(', ')} copyable />
            <InfoRow label={t('mobile')} value={contact.phones?.mobile} copyable />
            <InfoRow label={t('telephone')} value={contact.phones?.telephone} copyable />
            <InfoRow label={t('fax')} value={contact.phones?.fax} />
          </SimpleGrid>
          {contact.otherInfo && (
            <>
              <Divider my="lg" />
              <InfoRow label={t('notes')} value={contact.otherInfo} />
            </>
          )}
        </Paper>

        <Paper withBorder radius="lg" p={{ base: 'md', sm: 'lg' }}>
          <SectionTitle
            icon={IconMapPin}
            title={t('addressesTitle')}
            subtitle={t('addressesSubtitle')}
          />
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <AddressBlock label={t('billingAddress')} address={billing} />
            <AddressBlock
              label={t('shippingAddress')}
              address={shipping}
              sameAsBilling={contact.addresses?.shipping?.isSameAsBilling}
            />
          </SimpleGrid>
        </Paper>

        <Paper withBorder radius="lg" p={{ base: 'md', sm: 'lg' }}>
          <SectionTitle
            icon={IconBuildingBank}
            title={t('bankAccounts')}
            subtitle={t('bankAccountsSubtitle')}
          />
          {banks.length ? (
            <Stack gap="sm">
              {banks.map((bank, index) => (
                <div
                  key={`${bank.bankName}-${bank.accountNumber}-${index}`}
                  className={classes.bankRow}
                >
                  <div>
                    <Text fw={700} fz="sm">
                      {bank.bankName || t('bank')}
                    </Text>
                    <Text fz="xs" c="dimmed">
                      {[bank.accountHolder, bank.branch].filter(Boolean).join(' · ')}
                    </Text>
                  </div>
                  <CopyableValue value={bank.accountNumber} label={t('accountNumber')} />
                </div>
              ))}
            </Stack>
          ) : (
            <Text fz="sm" c="dimmed">
              {t('noBankAccounts')}
            </Text>
          )}
        </Paper>
      </Stack>

      <Stack gap="lg">
        <Paper withBorder radius="lg" p={{ base: 'md', sm: 'lg' }}>
          <SectionTitle
            icon={IconFileInvoice}
            title={t('accountingTitle')}
            subtitle={t('accountingSubtitle')}
          />
          <Stack gap="md">
            <InfoRow
              label={t('receivableAccount')}
              value={resolveAccountName(contact.mappingAccount?.arAccount, accountMap)}
            />
            <InfoRow
              label={t('payableAccount')}
              value={resolveAccountName(contact.mappingAccount?.apAccount, accountMap)}
            />
            <Divider />
            <InfoRow label={t('paymentTerm')} value={paymentTerm} />
            <InfoRow
              label={t('receivableLimit')}
              value={amount(contact.mappingAccount?.maxReceivable)}
            />
            <InfoRow label={t('payableLimit')} value={amount(contact.mappingAccount?.maxPayable)} />
          </Stack>
        </Paper>

        <Paper withBorder radius="lg" p={{ base: 'md', sm: 'lg' }}>
          <Text fw={700} fz="md" mb="md">
            {t('recordTitle')}
          </Text>
          <Stack gap="md">
            <InfoRow label={t('contactNumber')} value={contact.contactNumber} copyable />
            <InfoRow label={t('externalCode')} value={contact.external_id} copyable />
            <InfoRow label={t('systemId')} value={contact.id} copyable />
            <InfoRow label={t('createdAt')} value={date(contact.createdAt)} />
            <InfoRow label={t('updatedAt')} value={date(contact.updatedAt)} />
          </Stack>
        </Paper>
      </Stack>
    </div>
  );
}
