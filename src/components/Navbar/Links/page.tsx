import { useEffect, useState } from 'react';
import { Box, Collapse, Group, Text, Tooltip, UnstyledButton } from '@mantine/core';
import { CaretRight } from '@phosphor-icons/react';
import { useLocation, useNavigate } from 'react-router-dom';
import classes from './page.module.css';
import { isNavigationChildActive, isNavigationLinkActive } from '../activeNavigation';

interface LinksGroupProps {
  icon?: any;
  label: string;
  initiallyOpened?: boolean;
  link?: string;
  badge?: React.ReactNode;
  links?: {
    label: string;
    link: string;
    icon?: any;
    badge?: React.ReactNode;
  }[];
  closeSidebar: () => void;
  collapsed?: boolean;
  siblingLinks?: string[];
}

export function LinksGroup(props: LinksGroupProps) {
  const {
    icon: Icon,
    label,
    initiallyOpened,
    link,
    badge,
    links,
    closeSidebar,
    collapsed = false,
    siblingLinks = [],
  } = props;
  const navigate = useNavigate();
  const location = useLocation();

  const hasLinks = Array.isArray(links);
  const [opened, setOpened] = useState(initiallyOpened || false);

  const isParentActive =
    link &&
    isNavigationLinkActive(location.pathname, link, siblingLinks.length ? siblingLinks : [link]);
  const childLinks = (hasLinks ? links : []).map((item) => item.link);
  const isChildActive =
    hasLinks &&
    links.some((item) => isNavigationChildActive(location.pathname, item.link, childLinks));
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

  const items = (hasLinks ? links : []).map((item) => {
    const isCurrentChild = isNavigationChildActive(location.pathname, item.link, childLinks);
    const SubIcon = item.icon;

    return (
      <UnstyledButton
        key={item.label}
        className={classes.subLink}
        data-active={isCurrentChild || undefined}
        onClick={() => {
          navigate(item.link);
          closeSidebar();
        }}
      >
        <Group gap={10} wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
          {SubIcon ? (
            <SubIcon
              size={16}
              className={classes.subIcon}
              weight={isCurrentChild ? 'fill' : 'regular'}
            />
          ) : (
            <span className={classes.bullet} data-active={isCurrentChild || undefined} />
          )}
          <Text className={classes.subLabel} truncate>
            {item.label}
          </Text>
        </Group>
        {item.badge}
      </UnstyledButton>
    );
  });

  return (
    <>
      <Tooltip label={label} position="right" disabled={!collapsed}>
        <UnstyledButton
          onClick={handleNavigation}
          className={classes.control}
          data-active={isActive || undefined}
          data-collapsed={collapsed || undefined}
        >
          <Group justify="space-between" gap={8} wrap="nowrap" w="100%">
            <Group
              gap={12}
              wrap="nowrap"
              justify={collapsed ? 'center' : 'flex-start'}
              w={collapsed ? '100%' : undefined}
              style={{ minWidth: 0, flex: 1 }}
            >
              {Icon && (
                <Icon size={22} color="currentColor" weight={isActive ? 'fill' : 'duotone'} />
              )}
              {!collapsed && <Box className={classes.label}>{label}</Box>}
            </Group>
            {!collapsed && (
              <Group gap={6} wrap="nowrap">
                {badge}
                {hasLinks && (
                  <CaretRight
                    className={classes.chevron}
                    data-rotate={opened || undefined}
                    size={16}
                    weight="duotone"
                  />
                )}
              </Group>
            )}
          </Group>
        </UnstyledButton>
      </Tooltip>
      {!collapsed && hasLinks && (
        <Collapse in={opened}>
          <Box className={classes.subtree}>{items}</Box>
        </Collapse>
      )}
    </>
  );
}
