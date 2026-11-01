import { Image, Container, Title, Text, Button, SimpleGrid } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import image from '@/assets/images/illustrations/not-found.svg';
import classes from './NotFound.module.css';

export function NotFound() {
  const navigate = useNavigate();

  const goBack = () => {
    navigate(-1); // Navigasi ke halaman sebelumnya dalam riwayat router
  };
  return (
    <Container className={classes.root}>
      <SimpleGrid spacing={{ base: 40, sm: 80 }} cols={{ base: 1, sm: 2 }}>
        <Image src={image} className={classes.mobileImage} />
        <div>
          <Title className={classes.title}>Something is not right...</Title>
          <Text c="dimmed" size="lg">
            Page you are trying to open does not exist. You may have mistyped the address, or the
            page has been moved to another URL. If you think this is an error contact support.
          </Text>
          <Button variant="outline" size="md" mt="xl" className={classes.control} onClick={goBack}>
            Get back to previous page
          </Button>
        </div>
        <Image src={image} className={classes.desktopImage} />
      </SimpleGrid>
    </Container>
  );
}
