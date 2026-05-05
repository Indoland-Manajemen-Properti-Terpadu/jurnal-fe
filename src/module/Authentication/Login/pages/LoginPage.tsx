import {
  Paper,
  TextInput,
  PasswordInput,
  Checkbox,
  Button,
  Text,
  Anchor,
  Image,
  Center,
  Stack,
  AspectRatio,
  Overlay,
  Flex,
  Title,
  Grid,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useLogin } from '../service/Login.service';
import classes from './page.module.css';
import LogoProapps from '@/assets/img/proapps-md-teal.svg';
import { Carousel } from '@mantine/carousel';
import { useRef } from 'react';
import Slider1 from '@/assets/img/Slider/tower.png';
import Slider2 from '@/assets/img/Slider/accounting.png';
import { gradientColors, themeColors } from '@/theme';

function LoginPage() {
  const { mutate: login } = useLogin({});
  const loginForm = useForm({
    mode: 'uncontrolled',
    initialValues: { email: '', password: '' },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      password: (value) => (value.length < 8 ? 'Your password must be at least 8 to login' : null),
    },
  });

  const sliderImages = [
    { src: Slider1, alt: "Slider Image 1" },
    { src: Slider2, alt: "Slider Image 2" },
  ];

  const handleSubmit = (values: any) => {
    login(values);
  };

  const carouselRef = useRef(null);

  return (
    <Grid style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'row',
      overflow: 'hidden'
    }}>
      <Grid.Col span={6} p={0}  >
        <Carousel
          ref={carouselRef}
          emblaOptions={{ loop: true }}
          height="100%"
          withControls={false}
          withIndicators
        >
          {sliderImages.map((image, index) => (
            <Carousel.Slide key={index}>
              <Image
                src={image.src}
                alt={image.alt}
                fit="cover"
                height="100%"
              />
              <Overlay
                gradient="var(--jurnal-gradient-teal-overlay)"
                opacity={0.85}
                zIndex={1}
              />
              <Text c={themeColors.defaultBlack[10]}>
                Optimize Your
                Building Management
                with ProApps!
              </Text>
            </Carousel.Slide>
          ))}
        </Carousel>
      </Grid.Col>
      <Grid.Col span={6} bg={themeColors.grey[1]} style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
      }}>
        <Paper
          withBorder
          radius="md"
          px={40}
          py={30}
          style={{ width: 500, border: 0 }}
          className={classes.card}
        >
          <Center mb="lg">
            <AspectRatio ratio={5 / 3} style={{ width: 120 }}>
              <Image src={LogoProapps} fit="contain" />
            </AspectRatio>
          </Center>
          <Title order={3} ta="center" mb="md">
            LOGIN FIRST TO YOUR ACCOUNT
          </Title>
          <form onSubmit={loginForm.onSubmit(handleSubmit)}>
            <TextInput
              label="Email"
              placeholder="Your email"
              required
              {...loginForm.getInputProps('email')}
            />
            <PasswordInput
              label="Password"
              placeholder="Your password"
              required
              mt="md"
              {...loginForm.getInputProps('password')}
            />
            <Flex align="center" justify="space-between" mt="md">
              <Checkbox label="Remember me" />
              <Anchor fz={14} fw={600} size="sm" href="#">
                Forgot password?
              </Anchor>
            </Flex>
            <Stack gap='md'>
              <Button
                type="submit"
                variant='gradient'
                fullWidth
                mt="xl"
                gradient={gradientColors.gradient}
              >
                Login
              </Button>
              <Button
                type='button'
                variant='outline'
                fullWidth
                gradient={gradientColors.gradient}
              >
                Back
              </Button>
            </Stack>
          </form>
        </Paper>
      </Grid.Col>
    </Grid>
  );
}

export default LoginPage;
