import { Alert, List, Text } from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";

interface InformationAlertProps {
    title: string;
    items: string[];
    icon?: React.ReactNode,
    color: 'blue' | 'yellow';
    variant?: 'list' | 'normal';
}

export const InformationAlert: React.FC<InformationAlertProps> = ({ title, items, color, variant = 'list', icon = <IconInfoCircle /> }) => (
    <Alert variant="light" color={color} title={title} icon={icon} p="xs">
        {variant === 'list' ? (
            <List size="xs">
                {items.map((item, index) => (
                    <List.Item key={index}>{item}</List.Item>
                ))}
            </List>
        ) : (
            <>
                {Array.isArray(items) ? items.join(' ') : items}
            </>
        )}
    </Alert >
);
