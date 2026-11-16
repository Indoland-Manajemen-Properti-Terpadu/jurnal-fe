import { useState } from 'react';
import { Button, Group, Image, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconPhoto, IconPhotoPlus } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import classes from './AssetDetail.module.css';

export type AssetPhotoGalleryProps = {
  name: string;
  photos: string[];
  /** Opens the edit form; leave out when photos cannot be changed here. */
  onAdd?: () => void;
  /** Photos of a ProApps asset are kept in ProApps. */
  managedElsewhere?: boolean;
};

/** One large photo with its thumbnails below, or a slim invitation to add the first one. */
export function AssetPhotoGallery({
  name,
  photos,
  onAdd,
  managedElsewhere,
}: Readonly<AssetPhotoGalleryProps>) {
  const { t } = useTranslation('assets');
  const [selected, setSelected] = useState(0);

  if (photos.length === 0) {
    return (
      <div className={classes.prompt}>
        <Group gap="sm" wrap="nowrap">
          <ThemeIcon size={36} radius="md" variant="light" color="gray">
            <IconPhoto size={18} stroke={1.8} />
          </ThemeIcon>
          <div>
            <Text fz="sm" fw={600} c="dark.8">
              {t('photosEmptyTitle')}
            </Text>
            <Text fz="xs" c="dimmed">
              {managedElsewhere ? t('photosManagedInProapps') : t('photosEmptyDesc')}
            </Text>
          </div>
        </Group>
        {onAdd && (
          <Button
            variant="default"
            size="xs"
            radius="md"
            leftSection={<IconPhotoPlus size={15} />}
            onClick={onAdd}
          >
            {t('photosAdd')}
          </Button>
        )}
      </div>
    );
  }

  const current = photos[Math.min(selected, photos.length - 1)];

  return (
    <Stack gap="xs">
      <a
        href={current}
        target="_blank"
        rel="noopener noreferrer"
        className={classes.photoMain}
        aria-label={t('photoOpen')}
      >
        <Image
          src={current}
          alt={t('photoAlt', { name: `${name} ${selected + 1}` })}
          h={260}
          fit="contain"
        />
      </a>
      {photos.length > 1 && (
        <Group gap="xs">
          {photos.map((url, index) => (
            <button
              key={url}
              type="button"
              className={classes.thumb}
              data-active={index === selected}
              aria-label={t('photoShow', { number: index + 1 })}
              aria-pressed={index === selected}
              onClick={() => setSelected(index)}
            >
              <Image src={url} alt="" w={56} h={56} fit="cover" />
            </button>
          ))}
        </Group>
      )}
    </Stack>
  );
}

export default AssetPhotoGallery;
