import { themeColors } from '@/theme';
import { Badge } from '@mantine/core';

interface BadgeStatusProps {
    reconciled: boolean;
}

const BadgeStatusReconciled = ({ reconciled }: BadgeStatusProps) => {
    return reconciled ? (
        <Badge variant="light" color="green" style={{ '--badge-fz': '10px' }}>Reconciled</Badge>
    ) : (
        <Badge variant="light" bg={themeColors.grey[0]} c={themeColors.defaultBlack[10]} fw={400} fz={10} style={{ textTransform: 'capitalize' }}>Inreconciled</Badge>
    );
};

export default BadgeStatusReconciled;
