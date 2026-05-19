import {
  Container,
  Paper,
  PaperProps,
  Text,
  Image,
  Flex,
} from '@mantine/core';
import classes from './SetingsCard.module.css';
import { Surface } from '@/components';
import { themeColors } from '@/theme';
import ImageImport from '@/assets/img/SettingsAccount-Import.svg';
import ImageExport from '@/assets/img/SettingsAccount-Export.svg';
import ImageRestore from '@/assets/img/SettingsAccount-Restore.svg';
import { HeadingText } from '../Text/CustomText';

type SettingsCardProps = {
  data: { type: string; title: string; description: string };
} & PaperProps;

const SettingsCard = ({ data, ...others }: SettingsCardProps) => {
  const { type, title, description } = data;
  let imageSrc;
  switch (type) {
    case 'Import':
      imageSrc = ImageImport;
      break;
    case 'Export':
      imageSrc = ImageExport;
      break;
    case 'Restore':
      imageSrc = ImageRestore;
      break;
    default:
      imageSrc = ImageImport;
  }
  return (
    <Surface component={Paper} {...others}>
      <Flex gap="sm" justify="center" align="flex-start" direction="column">
        {/* <UnstyledButton> */}
        <Container
          fluid
          bg={themeColors.gray[0]}
          c={themeColors.teal[6]}
          p={16}
          className={classes.container}
        >
          {type}
        </Container>

        <Container
          fluid
          className={classes.containerImage}
          styles={(theme) => ({
            root: {
              border: `1px dashed ${theme.colors.dark[0]}`,
              borderRadius: theme.radius.md,
              padding: theme.spacing.md,
            },
          })}
        >
          <Image src={imageSrc} alt={type} fit="contain" className={classes.image} />
        </Container>
        <HeadingText>{title}</HeadingText>
        <Text c={themeColors.gray[7]} className={classes.description}>
          {description}
        </Text>
        {/* </UnstyledButton> */}
      </Flex>
    </Surface>
  );
};

export default SettingsCard;
