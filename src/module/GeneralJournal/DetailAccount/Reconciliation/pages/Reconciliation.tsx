import { useState } from 'react';
import { FindAndReconModal } from '../components/FindAndReconModal';
import ReconciliationTable from '../components/ReconTable';


const Reconciliation = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    return (
        <>
            <ReconciliationTable />
            {/* <FindAndReconModal opened={isModalOpen} onClose={handleCloseModal} /> */}
        </>
    );
};

export default Reconciliation;
