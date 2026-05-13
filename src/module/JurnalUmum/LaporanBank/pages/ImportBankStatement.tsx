// import { useState } from 'react';
// import { Stack, Button, Divider, Container, Flex, Text, Stepper } from '@mantine/core';
// import { IconCircleCheck, IconFileText, IconPencil, IconUpload, IconDownload } from '@tabler/icons-react';
// import { gradientColors, themeColors } from '@/theme';
// import EmptyState from '@/components/EmptyState/EmptyTable';
// import CustomConfirmModal from '@/components/Modals/ConfirmModal';
// import CustomDropzone from '@/components/Dropzone/CustomDropzone';
// import { FileRejection } from '@mantine/dropzone';
// import { notifications } from '@mantine/notifications';
// import { useFileStore } from '@/store/JurnalUmum/useFileStore';
// import { getBankStatement } from '../services/ListBankStatement.service';
// import { getImportBankStatement } from '../services/ImportBankStatement.service';
// import { useNavigate } from 'react-router-dom';
// import { routes } from '@/router';

// type ImportBankStatementProps = {
//     idAccount: string,
//     onContinue: () => void;
// };

// const ImportBankStatement: React.FC<ImportBankStatementProps> = ({ idAccount, onContinue }) => {
//     const navigate = useNavigate();
//     const [active, setActive] = useState(0);
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const addFile = useFileStore((state) => state.addFile);
//     const [files, setFiles] = useFileStore((state) => [
//         state.files,
//         state.setFiles,
//         state.clearFiles,
//     ]);
//     const { mutate: importBankStatement } = getImportBankStatement(idAccount)

//     const handleDrop = (f: File[]) => {
//         setFiles(f);
//     };

//     const handleReject = (files: FileRejection[]) => {
//         notifications.show({
//             color: 'red',
//             title: 'Unsupported Files',
//             message: 'Sorry, your file is not supported, please try again with supported files',
//         });
//     };

//     const handleOpenModal = () => {
//         setIsModalOpen(true);
//     };

//     const handleCloseModal = () => {
//         if (active < 2) {
//             setActive((prev) => prev + 1);
//         } else {
//             if (files.length > 0) {
//                 importBankStatement(files[0]);
//                 onContinue();
//                 navigate(routes.generalJournal.bankStatementDraftImport)
//             } else {
//                 notifications.show({
//                     color: 'red',
//                     title: 'No file to upload',
//                     message: 'Please, insert your file before continue',
//                 });
//                 console.log('No file to upload');
//             }
//             setIsModalOpen(false);

//         }
//     };

//     const handlePreviousStep = () => {
//         if (active > 0) {
//             setActive((prev) => prev - 1);
//         } else {
//             setIsModalOpen(false);
//         }
//     };

//     const handleDownloadTemplate = () => {
//         const link = document.createElement('a');
//         link.href = '/templates/csv/Bank Statement Template ProApps.csv';
//         link.download = 'Bank Statement Template ProApps.csv';
//         document.body.appendChild(link);
//         link.click();
//         document.body.removeChild(link);
//     }
//     return (
//         <Container fluid p='xl'>
//             <Stack gap='md'>
//                 <EmptyState />
//                 <Button
//                     variant="outline"
//                     radius="md"
//                     color={themeColors.blue[6]}
//                     onClick={handleOpenModal}
//                 >
//                     Import Bank Statement
//                 </Button>
//                 <CustomConfirmModal
//                     size="55rem"
//                     opened={isModalOpen}
//                     onClose={handleCloseModal}
//                     withCloseButton={true}
//                     title={<Text>Import Account</Text>}
//                     labels={{
//                         confirm: (
//                             <Button variant="gradient" gradient={gradientColors.gradient} onClick={handleCloseModal}>
//                                 {active === 2 ? 'Continue' : 'Next'}
//                             </Button>
//                         ),
//                         cancel: (
//                             <Button variant="light"
//                                 color={themeColors.grey[7]}
//                                 onClick={handlePreviousStep}>
//                                 {active === 0 ? 'Cancel' : 'Previous'}
//                             </Button>
//                         ),
//                     }}
//                 >
//                     <Stack gap="md" align="stretch" justify="center">
//                         <Divider />
//                         <Stepper
//                             active={active}
//                             onStepClick={setActive}
//                             completedIcon={<IconCircleCheck style={{ width: '18px', height: '18px' }} />}
//                         >
//                             <Stepper.Step
//                                 icon={<IconFileText style={{ width: '18px', height: '18px' }} />}
//                                 label="Download Template"
//                             >
//                                 <Container fluid p={100}>
//                                     <Flex mih={50} gap="xs" justify="center" align="center" direction="column" wrap="wrap">
//                                         <Text ta="center" fw={600} fz={20} c={themeColors.defaultBlack[10]}>
//                                             Download CSV Template
//                                         </Text>
//                                         <Text ta="center" fw={500} fz={14} c={themeColors.grey[7]}>
//                                             This file contains header columns that are necessary for correctly importing journal account data.
//                                         </Text>
//                                         <Button variant="outline" color={themeColors.blue[6]} leftSection={<IconDownload />} onClick={handleDownloadTemplate}>
//                                             Download Template
//                                         </Button>
//                                     </Flex>
//                                 </Container>
//                             </Stepper.Step>
//                             <Stepper.Step
//                                 icon={<IconPencil style={{ width: '18px', height: '18px' }} />}
//                                 label="How To Insert"
//                             >
//                                 <Container fluid p={50}>
//                                     <Flex mih={50} gap="xs" justify="center" align="center" direction="column" wrap="wrap">
//                                         <Text ta="center" fw={600} fz={20} c={themeColors.defaultBlack[10]}>
//                                             Insert your data into a csv file
//                                         </Text>
//                                         <Text ta="center" fw={500} fz={14} c={themeColors.grey[7]}>
//                                             Use CSV or another spreadsheet application to copy and paste your journal transaction data from the file you previously exported into the downloaded template. Ensure that the data you input matches the header columns provided in the template.
//                                         </Text>
//                                         <Button variant="outline" color={themeColors.blue[6]} leftSection={<IconDownload />} onClick={handleDownloadTemplate}>
//                                             Download Template
//                                         </Button>
//                                     </Flex>
//                                 </Container>
//                             </Stepper.Step>
//                             <Stepper.Step
//                                 icon={<IconUpload style={{ width: '18px', height: '18px' }} />}
//                                 label="Upload File"
//                             >
//                                 <Container fluid p={50}>
//                                     <Stack gap='md'>
//                                         <Flex mih={50} gap="xs" justify="center" align="center" direction="column" wrap="wrap">
//                                             <Text ta="center" fw={600} fz={20} c={themeColors.defaultBlack[10]}>
//                                                 Upload CSV Templates
//                                             </Text>
//                                             <Text ta="center" fw={500} fz={14} c={themeColors.grey[7]}>
//                                                 After making the changes, please upload the file. The file you upload must be in CSV (Comma Separated Values) format. Your file should have the extension .csv.
//                                             </Text>

//                                         </Flex>
//                                         <CustomDropzone
//                                             onDrop={handleDrop}
//                                             onReject={handleReject}
//                                             description="Attach images or documents, each file should not exceed 5mb"
//                                         />
//                                     </Stack>
//                                 </Container>
//                             </Stepper.Step>
//                         </Stepper>

//                         <Divider />
//                     </Stack>
//                 </CustomConfirmModal>
//             </Stack>
//         </Container>
//     );
// };

// export default ImportBankStatement;
