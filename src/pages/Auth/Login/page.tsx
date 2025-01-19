import {
  Paper,
  TextInput,
  PasswordInput,
  Checkbox,
  Button,
  Title,
  Text,
  Anchor,
  Container,
  Group,
  Image,
  createTheme,
  MantineProvider,
  Stack,
  Center,
  Space,
  Grid,
} from '@mantine/core';
import classes from './page.module.css';
import LogoProapps from '@/assets/img/proapps-md-teal.svg';
import Surface from '@/components/Surface/Surface';
import { CarouselLoginComponent } from '@/components/Carousell/CarouselLogin';
import { Link } from 'react-router-dom';

 function LoginPage() {
  return (
    <div className={classes.splitScreen}>
      <div className={classes.leftpane}>
        {/* <CarouselLoginComponent /> */}
      </div>
      <div className={classes.rightpane}>
        {/* <Paper className={classes.form} radius={0} p={30}> */}
        <Surface component={Paper} className={classes.card}>
          <Image src={LogoProapps} width={30} height={30} style={{ objectFit: 'contain' }} />
          <Space h="md" />
          <Text fw={700} ta="center" color="black">
            LOGIN FIRST TO YOUR ACCOUNT
          </Text>
          <Space h="sm" />
          <TextInput label="Email" placeholder="you@mantine.dev" required />
          <PasswordInput label="Password" placeholder="Your password" required mt="lg" />
          <Group justify="space-between" mt="lg">
            <Checkbox label="Remember me" />
            <Anchor className={classes.forgotpassword} component="button" size="sm">
              Forgot password?
            </Anchor>
          </Group>
          <Button className={classes.buttonLogin} fullWidth mt="xl" component={Link} to='/dashboard' >
            Login
          </Button>
          <Center style={{ height: '100%' }}>
            <Text className={classes.copyright}>Copyright © 2024 ProApps</Text>
          </Center>
        </Surface>
        {/* </Paper> */}
      </div>
    </div>

    // export default Page;

    // <div className={classes.container}>
    //   <Paper className={classes.wrapper} radius={0}>
    //     {/* <CarouselLoginComponent /> */}
    //   </Paper>
    //   <Paper className={classes.form} radius={0} p={30}>
    //     <Surface component={Paper} className={classes.card}>
    //       <Image src={LogoProapps} width={30} height={30} style={{ objectFit: 'contain' }} />
    //       <Space h="md" />
    //       <Text fw={700} ta="center">
    //         LOGIN FIRST TO YOUR ACCOUNT
    //       </Text>
    //       <Space h="sm" />
    //       <TextInput label="Email" placeholder="you@mantine.dev" required />
    //       <PasswordInput label="Password" placeholder="Your password" required mt="lg" />
    //       <Group justify="space-between" mt="lg">
    //         <Checkbox label="Remember me" />
    //         <Anchor className={classes.forgotpassword} component="button" size="sm">
    //           Forgot password?
    //         </Anchor>
    //       </Group>
    //       <Button className={classes.buttonLogin} fullWidth mt="xl">
    //         Login
    //       </Button>
    //       <Center style={{ height: '100%' }}>
    //         <Text className={classes.copyright}>Copyright © 2024 ProApps</Text>
    //       </Center>
    //     </Surface>
    //   </Paper>
    // </div>
  );
}

export default LoginPage;
