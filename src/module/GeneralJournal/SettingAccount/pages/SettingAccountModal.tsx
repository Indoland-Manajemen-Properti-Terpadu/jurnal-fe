import { TextMediumGR } from "@/components/Text/CustomText"
import { themeColors, buttonGradient } from "@/theme"
import { Button, Stack, Divider } from "@mantine/core"
import { ImportAccountModal } from "../components/ImportModal";
import { useState } from "react";
import useFetchData from '../../../../../hooks/useFetchData';
import CustomConfirmModal from "@/components/Modals/ConfirmModal"
import SettingsGrid from "@/components/SettingsCard/SettingsGrid"

interface SettingAccountModalProps {
    opened: boolean;
    onClose: () => void;
}

const PAPER_PROPS = {
    p: 'md',
    shadow: 'md',
    radius: 'md',
};

export const SettingAccountModal: React.FC<SettingAccountModalProps> = ({ opened, onClose }) => {

    const [modals, setModals] = useState({
        importAccount: false,
    });

    const openModal = (modalName: string) => {
        setModals((prevState) => ({
            ...prevState,
            [modalName]: true,
        }));
    };

    const closeModal = (modalName: string) => {
        setModals((prevState) => ({
            ...prevState,
            [modalName]: false,
        }));
    };

    const {
        data: statsData,
        error: statsError,
        loading: statsLoading,
    } = useFetchData('/mocks/SettingsAccount.json');

    return (
        <>
            <CustomConfirmModal
                size="55rem"
                opened={opened}
                onClose={onClose}
                title={
                    <TextMediumGR>Setting Account</TextMediumGR>
                }
                labels={{
                    confirm: (
                        <Button variant="gradient" gradient={buttonGradient.gradient} onClick={() => openModal('importAccount')}>
                            Continue
                        </Button>
                    ),
                    cancel: (
                        <Button variant="light" color={themeColors.gray[7]} onClick={onClose}>
                            Cancel
                        </Button>
                    ),
                }}
                withCloseButton={true}
            >
                <Stack gap='md' align="stretch" justify="center">

                    <Divider />
                    <SettingsGrid
                        data={statsData.data}
                        loading={statsLoading}
                        error={statsError}
                        paperProps={PAPER_PROPS}
                    />
                    <Divider />

                </Stack>
            </CustomConfirmModal>
            <ImportAccountModal opened={modals.importAccount} onClose={() => closeModal('importAccount')} />
        </>
    )
}