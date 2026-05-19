import { Carousel } from '@mantine/carousel';
import { Paper, Title, Text, Card } from '@mantine/core';
import classes from './CarouselLogin.module.css';

const data = [
  {
    image: 'https://i.pinimg.com/564x/fc/83/51/fc835195085f5438427647f7430615bc.jpg',
    title:
      'Organize and manage your building. From maintenance to reporting, everything can be managed in one application. Save time, effort and costs with ProApps.',
    category: 'Optimize Your Building Management with ProApps!',
  },
  {
    image: 'https://i.pinimg.com/564x/66/78/5c/66785ca102e13e99785e7bed0851f5cb.jpg',
    title:
      'Organize and manage your building. From maintenance to reporting, everything can be managed in one application. Save time, effort and costs with ProApps.',
    category: 'Optimize Your Building Management with ProApps!',
  },
];

interface CardProps {
  image: string;
  title: string;
  category: string;
}

function Cards({ image, title, category }: CardProps) {
  return (
    <Paper
      shadow="md"
      p="md"
      radius="md"
      style={{ backgroundImage: `url(${image})` }}
      className={classes.card}
    >
      <div>
        <Title order={3} className={classes.category}>
          {category}
        </Title>
        <Text className={classes.title} size="xl" mt={20}>
          {title}
        </Text>
      </div>
    </Paper>
  );
}

export function CarouselLoginComponent() {
  const slides = data.map((item) => (
    <Carousel.Slide key={item.title}>
      <Cards {...item} />
    </Carousel.Slide>
  ));

  return (
    <Card radius="md" withBorder className={classes.carouselCard}>
      <Card.Section>
        <Carousel
          orientation="horizontal"
          withControls={false}
          withIndicators
          draggable
        >
          {slides}
        </Carousel>
      </Card.Section>
    </Card>
  );
}
