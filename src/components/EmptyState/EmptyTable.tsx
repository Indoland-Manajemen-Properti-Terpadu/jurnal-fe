import React from 'react';
import { Stack, Text, Image, AspectRatio } from '@mantine/core';
import defaultEmptyImage from '@/assets/images/illustrations/empty-table.svg';

interface EmptyStateProps {
  title?: string;
  imageSrc?: string;
  imageAlt?: string;
  withImage?: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'There is no data available yet',
  imageSrc = defaultEmptyImage,
  imageAlt = 'No data found',
  withImage = true,
}) => (
  <Stack align="center" gap="xs">
    {withImage && (
      <AspectRatio ratio={4 / 3} maw={300} mx="auto">
        <Image
          fit="contain"
          radius="md"
          src={imageSrc}
          alt={imageAlt}
          style={{ filter: 'grayscale(1)' }}
        />
      </AspectRatio>
    )}
    <Text c="dimmed" size="sm">
      {title}
    </Text>
  </Stack>
);

export default EmptyState;
