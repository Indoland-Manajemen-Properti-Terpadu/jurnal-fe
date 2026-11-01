import { Button, Group, Text, Image } from '@mantine/core';
import { Link } from 'react-router-dom';
import ProappsLogo from '@/assets/images/brand/logo.svg';
import classes from './Logo.module.css';

const LogoProapps = () => (
  <Button className={classes.logo} component={Link} to="/" variant="subtle">
    <Group gap="xs">
      <Image src={ProappsLogo} alt="Proapps Logo" />
      <Text fw={700}>Mantine admin</Text>
    </Group>
  </Button>
);

export default LogoProapps;
