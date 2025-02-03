import { TextMediumGR } from "@/components/Text/CustomText"
import { themeColors, buttonGradient } from "@/theme"
import { Button, Alert, Stack, List, Divider } from "@mantine/core"
import { DatePickerInput } from "@mantine/dates"
import { IconCalendar, IconInfoCircle } from "@tabler/icons-react"
import { dateTimeNow } from "@/utils/DateTimeNow"
import CustomConfirmModal from "@/components/Modals/ConfirmModal"
import { routes } from "@/router"
import { closeAllModals } from "@mantine/modals"
import { notifications } from "@mantine/notifications"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { formatDate } from "@/utils/FormatDate"
import { useInitialBalanceStore } from "@/store/GeneralJournal/initialBalanceAccount"

interface BeginningBalanceModalProps {
    opened: boolean;
    onClose: () => void;
}

export const BeginningBalanceModal: React.FC<BeginningBalanceModalProps> = ({ opened, onClose }) => {
    const navigate = useNavigate();
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const { setConverstion } = useInitialBalanceStore()

    const handleFinalConfirmCheck = () => {
        if (selectedDate) {
            setConverstion(selectedDate);
            closeAllModals();
            navigate(routes.generalJournal.beginningBalance);
        } else {
            notifications.show({
                color: 'red',
                autoClose: 3000,
                title: 'Error',
                message: 'Please select a valid conversion date.',
            });
        }
    };

    return (
        <CustomConfirmModal
            size="55rem"
            opened={opened}
            onClose={onClose}
            withCloseButton={true}
            title={<TextMediumGR>Set Conversion Date</TextMediumGR>}
            labels={{
                confirm:
                    <Button variant="gradient" gradient={buttonGradient.gradient} onClick={handleFinalConfirmCheck}>Set Date</Button>,
                cancel: <Button variant="light" color={themeColors.grey[7]} onClick={onClose}>Cancel</Button>
            }}
        >
            <Stack gap='md' align="stretch" justify="center">
                <Divider />
                <DatePickerInput
                    placeholder="Pick date"
                    label="Conversion Date"
                    rightSection={<IconCalendar />}
                    description={selectedDate
                        ? `Your initial balance is as of ${formatDate(selectedDate)}`
                        : 'Please select a conversion date'}
                    withAsterisk
                    onChange={setSelectedDate}
                />
                <Alert variant="light" color="blue" title="Important Information" icon={<IconInfoCircle />} p='xs'>
                    <List>
                        <List.Item>⁠You can still change the conversion date and adjust the beginning balance as long as the books have not been closed.</List.Item>
                        <List.Item>⁠You can create journal entries for transactions before the conversion date with a limit of 100,000 transaction accounts.The journal entries entered prior to the conversion date will not affect the current beginning balance.</List.Item>
                    </List>
                </Alert>
                <Divider />
            </Stack>
        </CustomConfirmModal>
    )
}


