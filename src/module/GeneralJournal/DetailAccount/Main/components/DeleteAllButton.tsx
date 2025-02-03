import { Button } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';

interface DeleteAllButtonProps {
    onDelete: () => void;
    hasSelection: boolean;
}

const DeleteAllButton: React.FC<DeleteAllButtonProps> = ({ onDelete, hasSelection }) => (
    <Button
        size="xs"
        color="red"
        leftSection={<IconTrash size={16} />}
        onClick={onDelete}
        style={{ visibility: hasSelection ? 'visible' : 'hidden' }}
    >
        Delete All
    </Button>
);

export default DeleteAllButton;
