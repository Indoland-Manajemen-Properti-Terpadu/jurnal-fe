import { useState } from 'react';
import type { FormEvent } from 'react';
import { notifications } from '@mantine/notifications';
import { IconCheck } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { routes } from '@/router/routes';
import { ComparisonSection } from '../components/ComparisonSection';
import { DifferentiatorSection } from '../components/DifferentiatorSection';
import { EbookModal } from '../components/EbookModal';
import { EbooksSection } from '../components/EbooksSection';
import { FaqSection } from '../components/FaqSection';
import { FinalCtaSection } from '../components/FinalCtaSection';
import { HeroSection } from '../components/HeroSection';
import { LandingFooter } from '../components/LandingFooter';
import { LandingHeader } from '../components/LandingHeader';
import { LivePreviewSection } from '../components/LivePreviewSection';
import { TestimonialsSection } from '../components/TestimonialsSection';
import type { EbookItem } from '../components/ebookData';
import type { DecimalPrecision, PreviewTab } from '../components/previewTypes';
import classes from './LandingPage.module.css';

export function LandingPage() {
  const navigate = useNavigate();
  const { t } = useTranslation('landing');

  // Interactive live preview state
  const [activeTab, setActiveTab] = useState<PreviewTab>('dashboard');
  const [decimalPrecision, setDecimalPrecision] = useState<DecimalPrecision>(2);
  const [isDemoSynced, setIsDemoSynced] = useState(false);

  // E-book lead magnet modal state
  const [ebookModalOpened, setEbookModalOpened] = useState(false);
  const [selectedEbook, setSelectedEbook] = useState<EbookItem | null>(null);
  const [ebookEmail, setEbookEmail] = useState('');
  const [ebookSuccess, setEbookSuccess] = useState(false);

  const goLogin = () => navigate(routes.login);

  const ebookTitle = (ebook: EbookItem) => t(`ebooks.items.${ebook.id}.title`);

  const handleToggleSync = () => {
    setIsDemoSynced(!isDemoSynced);
    notifications.show({
      title: !isDemoSynced ? t('preview.sync.postedTitle') : t('preview.sync.resetTitle'),
      message: !isDemoSynced ? t('preview.sync.postedMessage') : t('preview.sync.resetMessage'),
      color: 'teal',
    });
  };

  const handleOpenEbook = (ebook: EbookItem) => {
    setSelectedEbook(ebook);
    setEbookEmail('');
    setEbookSuccess(false);
    setEbookModalOpened(true);
  };

  const handleDownloadEbook = (e: FormEvent) => {
    e.preventDefault();
    if (!ebookEmail || !ebookEmail.includes('@')) {
      notifications.show({
        title: t('ebooks.notify.invalidTitle'),
        message: t('ebooks.notify.invalidMessage'),
        color: 'red',
      });
      return;
    }
    setEbookSuccess(true);
    notifications.show({
      title: t('ebooks.notify.sentTitle'),
      message: t('ebooks.notify.sentMessage', {
        title: selectedEbook ? ebookTitle(selectedEbook) : '',
        email: ebookEmail,
      }),
      color: 'teal',
      icon: <IconCheck size={18} />,
    });
  };

  const handleOpenPdf = () => {
    setEbookModalOpened(false);
    if (!selectedEbook) return;
    notifications.show({
      title: t('ebooks.notify.downloadTitle'),
      message: t('ebooks.notify.downloadMessage', { title: ebookTitle(selectedEbook) }),
      color: 'teal',
    });
  };

  return (
    <div className={classes.page}>
      <LandingHeader onLogin={goLogin} />
      <HeroSection onLogin={goLogin} />
      <LivePreviewSection
        activeTab={activeTab}
        onTabChange={setActiveTab}
        decimalPrecision={decimalPrecision}
        onPrecisionChange={setDecimalPrecision}
        isDemoSynced={isDemoSynced}
        onToggleSync={handleToggleSync}
      />
      <DifferentiatorSection />
      <ComparisonSection />
      <EbooksSection onOpenEbook={handleOpenEbook} />
      <TestimonialsSection />
      <FaqSection />
      <FinalCtaSection onLogin={goLogin} />
      <LandingFooter />
      <EbookModal
        opened={ebookModalOpened}
        ebook={selectedEbook}
        email={ebookEmail}
        isSuccess={ebookSuccess}
        onEmailChange={setEbookEmail}
        onSubmit={handleDownloadEbook}
        onClose={() => setEbookModalOpened(false)}
        onOpenPdf={handleOpenPdf}
      />
    </div>
  );
}

export default LandingPage;
