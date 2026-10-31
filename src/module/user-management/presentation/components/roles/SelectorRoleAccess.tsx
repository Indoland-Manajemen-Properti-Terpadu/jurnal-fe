import { Accordion, Group, List, Switch, Text } from '@mantine/core';
import { gradientColors } from '@/theme';
import classes from '@/module/SettingMenu/UserManagement/Role/components/RoleTable.module.css';
import { AccessRole } from '@/types/AccessRole/getAccessRole';

interface AcordionRoleAccessProps {
    roles: AccessRole[];
}

const AcordionRoleAccess = ({ roles }: AcordionRoleAccessProps) => {
    return (
        <Accordion
            variant="contained"
            chevronPosition="left"
            multiple
        >
            {roles.map((item) => (
                <Accordion.Item key={item.name} value={item.name}>
                    <Accordion.Control>
                        <Group grow align="center">
                            <div style={{ flexGrow: 1 }}>
                                {item.name}
                            </div>
                            <Switch
                                color="primary"
                                size="sm"
                                className={classes.switch}
                            />
                        </Group>
                    </Accordion.Control>

                    {item.description && (
                        <Accordion.Panel className={classes.accordionDesc}>
                            <Text
                                variant="gradient"
                                gradient={gradientColors.mainGR}
                                className={classes.descriptionTitle}
                            >
                                Description
                            </Text>
                            <List
                                size="xs"
                                withPadding
                                className={classes.accordionList}
                            >
                                {(item.description?.split('\n') || []).map((line) => (
                                    <List.Item key={`${item.name}-${line.trim()}`}>
                                        {line.trim()}
                                    </List.Item>
                                ))}
                            </List>
                        </Accordion.Panel>
                    )}
                </Accordion.Item>
            ))}
        </Accordion>
    );
};


export default AcordionRoleAccess;
