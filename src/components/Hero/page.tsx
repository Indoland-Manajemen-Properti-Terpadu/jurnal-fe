import { Container, Title, Text, Button, Grid } from '@mantine/core';
import classes from './page.module.css';

export function HeroComponent() {
  return (
    <div className={classes.root}>
      <Container size="xl">
        <div className={classes.inner}>
          <div className={classes.content}>
            <Title className={classes.title}>
              A{' '}
              <Text
                component="span"
                inherit
                variant="gradient"
                gradient={{ from: '#00B194', to: '#1C8FD4', deg: 90 }}
              >
                Saas for Manage Your Building
              </Text>{' '}
              & Finance
            </Title>

            <Text className={classes.description} mt={30}>
              Saas for Manage Your Building & Finance
            </Text>
            <Grid justify="flex-start" align="flex-start" className={classes.grid}>
              <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                <Text className={classes.title} fw={700}>
                  300
                </Text>
                <Text className={classes.titlesmall} size="sm">
                  Finance
                </Text>
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                <Text className={classes.title} fw={700}>
                  200
                </Text>
                <Text className={classes.titlesmall} size="sm">
                  Tower
                </Text>
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                <Text className={classes.title} fw={700}>
                  200
                </Text>
                <Text className={classes.titlesmall} size="sm">
                  Building
                </Text>
              </Grid.Col>
            </Grid>

            <Button radius="xl" variant="gradient" size="xl" className={classes.control} mt={40}>
              Start With Us
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
}
