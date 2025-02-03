import { useEffect, useState } from 'react';
import { Box, Collapse, Group, Text, UnstyledButton } from '@mantine/core';
import { IconChevronRight } from '@tabler/icons-react';
import { useLocation, useNavigate } from 'react-router-dom';
import classes from './page.module.css';

interface LinksGroupProps {
  icon?: any;
  label: string;
  initiallyOpened?: boolean;
  link?: string;
  links?: {
    label: string;
    link: string;
  }[];
  closeSidebar: () => void;
}

export function LinksGroup(props: LinksGroupProps) {
  const { icon: Icon, label, initiallyOpened, link, links, closeSidebar } = props;
  const navigate = useNavigate();
  const location = useLocation();

  const hasLinks = Array.isArray(links);
  const [opened, setOpened] = useState(initiallyOpened || false);

  // Check if current route starts with the parent link
  const isParentActive = link && location.pathname.startsWith(link);

  useEffect(() => {
    setOpened(Boolean(isParentActive));
  }, [isParentActive]);

  const items = (hasLinks ? links : []).map((linkItem) => {
    const isActive = location.pathname === linkItem.link;

    return (
      <Text
        className={classes.link}
        key={linkItem.label}
        onClick={() => {
          navigate(linkItem.link);
          closeSidebar();
        }}
        data-active={isActive || undefined}
      >
        {linkItem.label}
      </Text>
    );
  });

  const handleNavigation = () => {
    if (link) {
      navigate(link);
      closeSidebar();
    }
    setOpened((o) => !o);
  };

  return (
    <>
      <UnstyledButton
        onClick={handleNavigation}
        className={classes.control}
        data-active={isParentActive || opened || undefined}
      >
        <Group justify="space-between" gap={0}>
          <Box style={{ display: 'flex', alignItems: 'center' }}>
            {Icon && <Icon size={18} />}
            <Box ml="md">{label}</Box>
          </Box>
          {hasLinks && (
            <IconChevronRight
              className={classes.chevron}
              size="1rem"
              stroke={1.5}
              style={{
                transform: opened ? 'rotate(90deg)' : 'none',
              }}
            />
          )}
        </Group>
      </UnstyledButton>
      {hasLinks && <Collapse in={opened}>{items}</Collapse>}
    </>
  );
}
