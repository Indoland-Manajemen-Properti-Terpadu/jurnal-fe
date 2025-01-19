import { Carousel } from '@mantine/carousel';

const imageSources = [
  'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-6.png',
  'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-6.png',
  'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-6.png',
];

export function CarouselCompanyProfile() {
  return (
    <Carousel
      slideSize="33.333%" // Ensures three images fit in the carousel view
      height={200}
      slideGap="md"
      align="start"
      controlsOffset="xs"
      withControls
      withIndicators
      loop
    >
      <Carousel.Slide>
        <img
          src="https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-6.png"
          style={{ width: '100%', height: '20%', objectFit: 'cover' }}
        />
        <img
          src="https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-6.png"
          style={{ width: '100%', height: '20%', objectFit: 'cover' }}
        />
      </Carousel.Slide>
    </Carousel>
  );
}
