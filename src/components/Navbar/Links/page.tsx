import { useEffect, useState } from 'react';
import { Box, Collapse, Group, Text, Tooltip, UnstyledButton } from '@mantine/core';
import { CaretRight } from '@phosphor-icons/react';
import { useLocation, useNavigate } from 'react-router-dom';
import classes from './page.module.css';
import { themeColors } from '@/theme';

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
  collapsed?: boolean;
}

export function LinksGroup(props: LinksGroupProps) {
  const { icon: Icon, label, initiallyOpened, link, links, closeSidebar, collapsed = false } = props;
  const navigate = useNavigate();
  const location = useLocation();

  const hasLinks = Array.isArray(links);
  const [opened, setOpened] = useState(initiallyOpened || false);

  // Check if current route starts with the parent link
  const isParentActive = link && location.pathname.startsWith(link);
  const isChildActive = hasLinks && links.some((item) => location.pathname === item.link);
  const isActive = Boolean(isParentActive || isChildActive);

  useEffect(() => {
    if (collapsed) {
      setOpened(false);
      return;
    }
    setOpened(isActive);
  }, [isActive, collapsed]);

  const handleNavigation = () => {
    if (link) {
      navigate(link);
      closeSidebar();
    }
    if (!collapsed) {
      setOpened((o) => !o);
    }
  };

  const items = (hasLinks ? links : []).map((item) => (
    <Text
      component="button"
      type="button"
      className={classes.link}
      key={item.label}
      data-active={location.pathname === item.link || undefined}
      onClick={() => {
        navigate(item.link);
        closeSidebar();
      }}
    >
      {item.label}
    </Text>
  ));

  return (
    <>
      <Tooltip label={label} position="right" disabled={!collapsed}>
        <UnstyledButton
          onClick={handleNavigation}
          className={classes.control}
          data-active={isActive || undefined}
          data-collapsed={collapsed || undefined}
        >
          <Group justify="space-between" gap={12} wrap="nowrap" w="100%">
            <Group gap={12} wrap="nowrap" justify={collapsed ? 'center' : 'flex-start'} w={collapsed ? '100%' : undefined}>
              {Icon && <Icon size={24} color={isActive ? themeColors.primary[5] : 'currentColor'} weight="duotone" />}
              {!collapsed && <Box className={classes.label}>{label}</Box>}
            </Group>
            {hasLinks && !collapsed && (
              <CaretRight
                className={classes.chevron}
                data-rotate={opened || undefined}
                size={16}
                weight="duotone"
              />
            )}
          </Group>
        </UnstyledButton>
      </Tooltip>
      {!collapsed && hasLinks && <Collapse in={opened}>{items}</Collapse>}
    </>
  );
}
