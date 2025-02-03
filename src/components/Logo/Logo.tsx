import { Group, Text, Image, UnstyledButtonProps } from '@mantine/core';
import { Link } from 'react-router-dom';
import { Button } from '@mantine/core'; // Pastikan Button diimpor dari @mantine/core
import ProappsLogo from '@/assets/img/proapps-md-teal.svg';
import classes from './Logo.module.css';

type LogoProps = {
  href?: string;
} & UnstyledButtonProps;

const LogoProapps = () => (
    <Button
      className={classes.logo}
      component={Link}
      to="/"
      variant="subtle"
    >
      <Group gap="xs">
        <Image src={ProappsLogo} alt="Proapps Logo" />
        <Text fw={700}>Mantine admin</Text>
      </Group>
    </Button>
  );

export default LogoProapps;
