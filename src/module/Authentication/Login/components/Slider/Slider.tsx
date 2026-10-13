import { Carousel } from "@mantine/carousel";
import { Center, Image, Overlay, Space, Stack, Text } from "@mantine/core";
import { useRef } from "react";
// import '@mantine/core/styles.css';
// import '@mantine/carousel/styles.css';
import Slider1 from '@/assets/img/Slider/tower.png';
import Slider2 from '@/assets/img/Slider/accounting.png';

const assets = [
    {
        src: Slider1,
        title: "Optimize Your Building Management with ProApps!",
        text: "Organize and manage your building. From maintenance to reporting, everything can be managed in one application. Save time, effort and costs with ProApps.",
        sunText: "start managing your finance faster and better",
        id: 1,
    },
    {
        src: Slider2,
        title: "Welcome to Back!",
        text: "start managing your finance faster and better",
        sunText: "start managing your finance faster and better",
        id: 2,
    },
];

export default function Slider() {

    return (
        <Carousel
            mx="auto"
            emblaOptions={{ loop: true }}
            // withIndicators
            height='100%'
        >
            {assets.map((item) => {
                return (
                    <Carousel.Slide key={item.id}>
                        <Image src={item.src} p={0} m={0} />
                        <Overlay
                            gradient="var(--jurnal-gradient-brand-overlay)"
                            opacity={0.85}
                        />
                        <Center>
                            <>
                                <Text size="lg" w={"bold"}>
                                    {item.title}
                                </Text>
                                <Space h="xs" />
                                <Text size="sm" c="dimmed" w={"normal"}>
                                    {item.text}
                                </Text>
                                <Text size="xs" c="dimmed" w={"normal"}>
                                    {item.sunText}
                                </Text>
                            </>
                        </Center>
                    </Carousel.Slide>
                );
            })}
        </Carousel>
    );
}
