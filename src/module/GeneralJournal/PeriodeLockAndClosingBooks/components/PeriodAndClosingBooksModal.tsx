import { TextMediumGR } from "@/components/Text/CustomText";
import { themeColors, buttonGradient } from "@/theme";
import { Button, Alert, Stack, Divider, Text, Container, Image } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { IconCalendar, IconInfoCircle } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { useNavigate } from "react-router-dom";
import { routes } from "@/router/routes";
import { InformationAlert } from "@/components/Alert/Alert";
import CustomConfirmModal from "@/components/Modals/ConfirmModal";
import useModalStore from "@/store/useModals";
import KeyPeriodeImage from '@/assets/img/closing_period.svg';

interface PeriodAndClosingBooksModalProps {
    opened: boolean;
    onClose: () => void;
}

export const PeriodAndClosingBooksModal: React.FC<PeriodAndClosingBooksModalProps> = ({ opened, onClose }) => {
    const navigate = useNavigate();
    const {
        PLDateSettingOpened,
        CBDateSettingOpened,
        PLConfirmOpened,
        CBConfirmOpened,
        setPLDateSettingOpened,
        setCBDateSettingOpened,
        setPLConfirmOpened,
        setCBConfirmOpened,
        cancelToCheckPL,
        cancelToCheckCB,
        closeAllModals,
    } = useModalStore();

    const handleFinalConfirmCheck = () => {
        notifications.show({
            color: themeColors.green[6],
            autoClose: 3000,
            title: 'Successfully Closing Period',
            message: 'Selected account has been deleted',
        });
        closeAllModals();
        navigate(routes.generalJournal.closingBooks)
    };

    return (
        <>
            <CustomConfirmModal
                key="MainMenu"
                size="55rem"
                opened={opened}
                onClose={onClose}
                withCloseButton={true}
                title={<TextMediumGR>Period Lock & Closing Books</TextMediumGR>}
                labels={{
                    confirm: <Button variant="gradient" gradient={buttonGradient.gradient} onClick={() => {
                        onClose();
                        setCBDateSettingOpened(true);
                    }}>Start Closing Books</Button>,

                    cancel: <Button variant="light" color={themeColors.gray[7]} onClick={() => {
                        onClose();
                        setPLDateSettingOpened(true);
                    }}>Start Period Lock</Button>
                }}
            >
                <Stack gap='md' align="stretch" justify="center">
                    <Divider />
                    <Container
                        size='xs'
                        styles={(theme) => ({
                            root: {
                                borderRadius: theme.radius.md,
                                padding: theme.spacing.md,
                            },
                        })}
                    >
                        <Image src={KeyPeriodeImage} fit="contain" height={250} />
                    </Container>
                    <Text fz={20} fw={600} c={themeColors.black[9]} ta='center'> Period Lock & Closing Books Functionality</Text>
                    <Text fz={14} fw={500} c={themeColors.gray[7]} ta='center'>
                        Ensure that transactions remain unchanged during the locked period.
                        Unlike the book closing feature, the period lock does not automatically generate closing journals.
                    </Text>
                    <InformationAlert
                        title="Important Information"
                        color="yellow"

                        items={[
                            'Period locking can be done once the transactions in the report have been reviewed and are not intended to be changed.',
                            'Book closing is typically performed at the end of the year, at the end of the accounting period, or both.'
                        ]}
                    />
                    <InformationAlert
                        title="Benefits of Period Lock"
                        color="blue"
                        items={[
                            'Prevent data changes within the locked period from unauthorized access.',
                            'Provide certainty and security for the period that has been locked.'
                        ]}
                    />
                    <InformationAlert
                        title="Benefits of Closing Books"
                        color="blue"
                        items={[
                            'Prevent data changes within the locked period from unauthorized access.',
                            'Provide certainty and security for the period that has been locked.'
                        ]}
                    />
                    <Divider />
                </Stack>
            </CustomConfirmModal>

            {/* FLOW PERIOD LOCK */}
            <CustomConfirmModal
                key="PLDateSetting"
                size="55rem"
                opened={PLDateSettingOpened}
                onClose={closeAllModals}
                withCloseButton={true}
                title={<TextMediumGR>Set Closing Period Date</TextMediumGR>}
                labels={{
                    confirm: <Button variant="gradient" gradient={buttonGradient.gradient} onClick={() => setPLConfirmOpened(true)}>Set Date</Button>,
                    cancel: <Button variant="light" color={themeColors.gray[7]} onClick={closeAllModals}>Cancel</Button>,
                }}
            >
                <Stack gap='md' align="stretch" justify="center">
                    <Divider />
                    <DatePickerInput
                        placeholder="From the beginning"
                        label="From Date"
                        rightSection={<IconCalendar />}
                        withAsterisk
                        disabled
                    />
                    <DatePickerInput
                        placeholder="Pick date"
                        label="To Date"
                        rightSection={<IconCalendar />}
                        withAsterisk
                    />
                    <InformationAlert
                        title="Important Information"
                        color="blue"
                        variant="normal"
                        items={['After the locked period, you cannot create, modify, or delete transactions before 01/08/2024.']}
                    />
                    <Divider />
                </Stack>
            </CustomConfirmModal >

            <CustomConfirmModal
                key="PLConfirm"
                opened={PLConfirmOpened}
                onClose={cancelToCheckPL}
                withCloseButton={true}
                title={<TextMediumGR>Check</TextMediumGR>}
                labels={{
                    confirm: <Button variant="gradient" gradient={buttonGradient.gradient} onClick={handleFinalConfirmCheck}>Continue</Button>,
                    cancel: <Button variant="light" color={themeColors.gray[7]} onClick={cancelToCheckPL}>Cancel</Button>,
                }}
            >
                <Stack gap="md" align="stretch" justify="center">
                    <Text fz={14} fw={400} c={themeColors.black[9]}>
                        Please check your last reconciliation date and ensure that nothing is missing!
                    </Text>
                </Stack>
            </CustomConfirmModal>

            {/* FLOW CLOSING BOOKS */}
            <CustomConfirmModal
                key="CBDateSetting"
                size="55rem"
                opened={CBDateSettingOpened}
                onClose={closeAllModals}
                withCloseButton={true}
                title={<TextMediumGR>Set Financial Period Date</TextMediumGR>}
                labels={{
                    confirm: <Button variant="gradient" gradient={buttonGradient.gradient} onClick={() => setCBConfirmOpened(true)}>Set Date</Button>,
                    cancel: <Button variant="light" color={themeColors.gray[7]} onClick={closeAllModals}>Cancel</Button>,
                }}
            >
                <Stack gap='md' align="stretch" justify="center">
                    <Divider />
                    <DatePickerInput
                        placeholder="From the beginning"
                        label="From Date"
                        rightSection={<IconCalendar />}
                        withAsterisk
                        disabled
                    />
                    <DatePickerInput
                        placeholder="Pick date"
                        label="To Date"
                        rightSection={<IconCalendar />}
                        withAsterisk
                    />
                    <Alert variant="light" color="blue" title="Important Information" icon={<IconInfoCircle />} p='xs'>
                        After the locked period, you cannot create, modify, or delete transactions before <strong>01/08/2024.</strong>
                    </Alert>
                    <Divider />
                </Stack>
            </CustomConfirmModal>

            <CustomConfirmModal
                key="CBConfirm"
                opened={CBConfirmOpened}
                onClose={cancelToCheckCB}
                withCloseButton={true}
                title={<TextMediumGR>Check</TextMediumGR>}
                labels={{
                    confirm: <Button variant="gradient" gradient={buttonGradient.gradient} onClick={handleFinalConfirmCheck}>Continue</Button >,
                    cancel: <Button variant="light" color={themeColors.gray[7]} onClick={cancelToCheckCB}>Cancel</Button>,
                }}
            >
                <Stack gap="md" align="stretch" justify="center">
                    <Text fz={14} fw={400} c={themeColors.black[9]}>
                        Please check your last reconciliation date and ensure that nothing is missing!
                    </Text>
                </Stack>
            </CustomConfirmModal >
        </>
    );
};
