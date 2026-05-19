import { Button, Container, Group, Paper, Stack, Tabs } from "@mantine/core";
import { IconBuildingBank, IconFileDollar, IconUser } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { themeColors } from "@/theme";
import { navigate } from "@/router";
import ContactFormLayout from "./FormLayout";
import PageHeaderV2 from "@/components/PageHeader/PageHeaderV2";
import BankInformationForm from "../components/AddContactForm/BankInformationForm";
import AccountMappingForm from "../components/AddContactForm/AccountMappingForm";
import ContactInformationForm from "../components/AddContactForm/ContactInformationForm";


const items = [
    { title: 'Contact', href: () => navigate(-1) },
    { title: 'Add Contact', href: undefined },
]

const AddContactPage = () => {
    const navigate = useNavigate();
    return (
        <>
            <ContactFormLayout footer={
                <Group grow justify="flex-end" p='md'>
                    <Group justify="flex-end" gap="xs" >
                        <Button
                            variant="light"
                            color={themeColors.gray[7]}
                            onClick={() => navigate(-1)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="filled"
                            bg={themeColors.teal[6]}
                        >
                            Add Contact
                        </Button>
                    </Group>
                </Group>
            }
            >
                <Container fluid>
                    <Stack gap="lg">
                        <Paper p="md" shadow="md" radius="md">
                            <PageHeaderV2
                                type='withBreadcrumbs'
                                title="Add Contact"
                                breadcrumbItems={items}
                            />
                        </Paper>
                        <Paper p="md" shadow="md" radius="md">
                            <Tabs defaultValue="contact-information" styles={{ panel: { paddingTop: 16 } }}>
                                <Tabs.List>
                                    <Tabs.Tab
                                        value="contact-information"
                                        leftSection={<IconUser size={12} />}
                                    >
                                        Contact Information
                                    </Tabs.Tab>
                                    <Tabs.Tab
                                        value="bank-information"
                                        leftSection={<IconBuildingBank size={12} />}
                                    >
                                        Bank Information
                                    </Tabs.Tab>
                                    <Tabs.Tab
                                        value="account-mapping"
                                        leftSection={<IconFileDollar size={12} />}
                                    >
                                        Account Mapping
                                    </Tabs.Tab>
                                </Tabs.List>

                                <Tabs.Panel value="contact-information">
                                    <ContactInformationForm />
                                </Tabs.Panel>
                                <Tabs.Panel value="bank-information">
                                    <BankInformationForm />
                                </Tabs.Panel>
                                <Tabs.Panel value="account-mapping">
                                    <AccountMappingForm />
                                </Tabs.Panel>
                            </Tabs>
                        </Paper>
                    </Stack>
                </Container>
            </ContactFormLayout>
        </>
    );
}

export default AddContactPage;