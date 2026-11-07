import { useEffect, useId, useState } from 'react';
import { Box, Collapse, Group, Text, Tooltip, UnstyledButton } from '@mantine/core';
import { CaretRight } from '@phosphor-icons/react';
import { useLocation, useNavigate } from 'react-router-dom';
import classes from '@/components/Navbar/Links/NavLinksGroup.module.css';
import { isNavigationChildActive, isNavigationLinkActive } from '../activeNavigation';

export type LinksGroupChild = {
  label: string;
  link: string;
  icon?: React.ElementType;
  badge?: React.ReactNode;
};

interface LinksGroupProps {
  icon?: React.ElementType;
  label: string;
  initiallyOpened?: boolean;
  link: string;
  /** Address prefix that keeps the entry active when its pages are deeper than `link`. */
  match?: string;
  badge?: React.ReactNode;
  links?: LinksGroupChild[];
  closeSidebar: () => void;
  collapsed?: boolean;
  siblingLinks?: string[];
  /** Clicking the parent only expands/collapses the sub-menu instead of navigating. */
  expandOnly?: boolean;
}

export function LinksGroup(props: LinksGroupProps) {
  const {
    icon: Icon,
    label,
    initiallyOpened,
    link,
    match,
    badge,
    links,
    closeSidebar,
    collapsed = false,
    siblingLinks = [],
    expandOnly = false,
  } = props;
  const subtreeId = useId();
  const navigate = useNavigate();
  const location = useLocation();

  const hasLinks = Array.isArray(links) && links.length > 0;
  const activeLink = match ?? link;
  const isParentActive = isNavigationLinkActive(
    location.pathname,
    activeLink,
    siblingLinks.length ? siblingLinks : [activeLink]
  );
  const childLinks = (hasLinks ? links : []).map((item) => item.link);
  const isChildActive =
    hasLinks &&
    links.some((item) => isNavigationChildActive(location.pathname, item.link, childLinks));
  const isActive = isParentActive || isChildActive;
  // Start open when this section is active so the sidebar height is stable on first paint.
  const [opened, setOpened] = useState(initiallyOpened || (isActive && !collapsed));

  useEffect(() => {
    if (collapsed) {
      setOpened(false);
      return;
    }
    setOpened(isActive);
  }, [isActive, collapsed]);

  const handleNavigation = () => {
    // expandOnly groups only navigate (to their first page) when the sidebar is collapsed.
    if (!expandOnly || collapsed) {
      navigate(link);
      closeSidebar();
    }
    if (!collapsed && hasLinks) {
      setOpened((o) => !o);
    }
  };

  const items = (hasLinks ? links : []).map((item) => {
    const isCurrentChild = isNavigationChildActive(location.pathname, item.link, childLinks);
    const SubIcon = item.icon;

    return (
      <UnstyledButton
        key={item.link}
        className={classes.subLink}
        data-active={isCurrentChild || undefined}
        aria-current={isCurrentChild ? 'page' : undefined}
        onClick={() => {
          navigate(item.link);
          closeSidebar();
        }}
      >
        <Group gap={10} wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
          {SubIcon ? (
            <SubIcon
              size={18}
              className={classes.subIcon}
              weight={isCurrentChild ? 'fill' : 'duotone'}
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
          data-active={(isActive && (!hasLinks || collapsed)) || undefined}
          data-section-active={(hasLinks && isActive) || undefined}
          aria-expanded={hasLinks && !collapsed ? opened : undefined}
          aria-controls={hasLinks && !collapsed ? subtreeId : undefined}
          aria-current={isActive && !hasLinks ? 'page' : undefined}
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
          <Box id={subtreeId} className={classes.subtree}>
            {items}
          </Box>
        </Collapse>
      )}
    </>
  );
}
