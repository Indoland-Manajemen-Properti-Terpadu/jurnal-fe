/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from 'react';
import { Box, Collapse, Group, Text, UnstyledButton } from '@mantine/core';
import { IconChevronRight } from '@tabler/icons-react';
import { useLocation, useNavigate } from 'react-router-dom';
import * as _ from 'lodash';
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
  const {
    icon: Icon,
    label,
    initiallyOpened,
    link,
    links,
    closeSidebar,
  } = props;
  const navigate = useNavigate();
  const location = useLocation();
  const hasLinks = Array.isArray(links);
  const [opened, setOpened] = useState(initiallyOpened || false);
  const [currentPath, setCurrentPath] = useState<string | undefined>();
  const ChevronIcon = IconChevronRight;

  const items = (hasLinks ? links : []).map((link) => (
    <Text
      className={classes.link}
      onClick={() => {
        navigate(link.link);
        closeSidebar();
      }}
      key={link.label}
      data-active={link.link.toLowerCase() === location.pathname.toLowerCase() || undefined}
    >
      {link.label}
    </Text>
  ));

  useEffect(() => {
    const paths = location.pathname.split('/');
    setOpened(paths.includes(label.toLowerCase()));
    setCurrentPath(_.last(paths)?.toLowerCase() || undefined);
  }, [location.pathname, label]);

  return (
    <>
      <UnstyledButton
        onClick={() => {
          setOpened((o) => !o);
          link && navigate(link || '#');
          closeSidebar();
        }}
        className={classes.control}
        data-active={opened || undefined}
      >
        <Group justify="space-between" gap={0}>
          <Box style={{ display: 'flex', alignItems: 'center' }}>
            {Icon && <Icon size={18} />}
            <Box ml="md">{label}</Box>
          </Box>
          {hasLinks && (
            <ChevronIcon
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
      {hasLinks ? <Collapse in={opened}>{items}</Collapse> : null}
    </>
  );
}
