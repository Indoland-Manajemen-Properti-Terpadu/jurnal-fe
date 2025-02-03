import React from "react";
import { Button, Menu } from "@mantine/core";
import { IconFileExport } from "@tabler/icons-react";

interface ExportMenuProps {
    onExportPDF?: () => void;
    onExportCSV?: () => void;
    onExportXLSX?: () => void;
}

const ExportMenu: React.FC<ExportMenuProps> = ({ onExportPDF, onExportCSV, onExportXLSX }) => {
    return (
        <Menu position="bottom-end">
            <Menu.Target>
                <Button
                    leftSection={<IconFileExport size={14} />}
                    variant="default"
                    size="xs"
                >
                    Export
                </Button>
            </Menu.Target>
            <Menu.Dropdown>
                <Menu.Item onClick={onExportPDF}>Export to (.pdf)</Menu.Item>
                <Menu.Item onClick={onExportCSV}>Export to (.csv)</Menu.Item>
                <Menu.Item onClick={onExportXLSX}>Export to (.xlsx)</Menu.Item>
            </Menu.Dropdown>
        </Menu>
    );
};

export default ExportMenu;
