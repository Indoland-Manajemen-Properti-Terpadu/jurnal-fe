import { TextMediumGR } from "@/components/Text/CustomText"
import { themeColors, buttonGradient, gradientColors } from "@/theme"
import { Button, Alert, Stack, List, Divider, rem, Stepper, Text, Container, Flex } from "@mantine/core"
import { IconCircleCheck, IconDownload, IconFileText, IconInfoCircle, IconPencil, IconUpload } from "@tabler/icons-react"
import CustomConfirmModal from "@/components/Modals/ConfirmModal"
import { useState } from "react"

interface ImportAccountModalProps {
    opened: boolean;
    onClose: () => void;
}

export const ImportAccountModal: React.FC<ImportAccountModalProps> = ({ opened, onClose }) => {
    const [active, setActive] = useState(1);
    return (
        <CustomConfirmModal
            size="55rem"
            opened={opened}
            onClose={onClose}
            withCloseButton={true}
            title={<TextMediumGR>Import Account</TextMediumGR>}
            labels={{
                confirm:
                    <Button variant="gradient" gradient={buttonGradient.gradient} onClick={onClose}>Continue</Button>,
                cancel: <Button variant="light" color={themeColors.gray[7]} onClick={onClose}>Cancel</Button>
            }}
        >
            <Stack gap='md' align="stretch" justify="center">
                <Divider />
                <Stepper
                    active={active}
                    onStepClick={setActive}
                    completedIcon={<IconCircleCheck style={{ width: rem(18), height: rem(18) }} />}
                >
                    <Stepper.Step
                        icon={<IconFileText style={{ width: rem(18), height: rem(18) }} />}
                        label="Download Template"
                    />
                    <Stepper.Step
                        icon={<IconPencil style={{ width: rem(18), height: rem(18) }} />}
                        label="How To Insert"
                    />
                    <Stepper.Step
                        icon={<IconUpload style={{ width: rem(18), height: rem(18) }} />}
                        label="Upload File"
                    />
                </Stepper>
                <Container fluid p={100} >
                    <Flex
                        mih={50}
                        gap="xs"
                        justify="center"
                        align="center"
                        direction="column"
                        wrap="wrap"
                    >
                        <Text ta='center' fw={600} fz={20} c={themeColors.black[9]}>Download CSV Template</Text>
                        <Text ta='center' fw={500} fz={14} c={themeColors.gray[7]}>This file contains header columns that are necessary for correctly importing journal account data.</Text>

                        <Button variant="outline" color={themeColors.blue[6]} leftSection={<IconDownload />}>Download Template</Button>
                    </Flex>
                </Container>
                <Divider />
            </Stack>
        </CustomConfirmModal>
    )
}
