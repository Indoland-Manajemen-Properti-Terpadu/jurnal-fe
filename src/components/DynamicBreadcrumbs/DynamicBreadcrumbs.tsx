import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Breadcrumbs, Anchor, Text as MantineText, BreadcrumbsProps } from '@mantine/core';
import { themeColors } from '@/theme/theme.exports'; // Assuming themeColors are accessible globally or via context

interface DynamicBreadcrumbsProps extends BreadcrumbsProps {
  startSegment?: string; // Optional segment to start breadcrumbs from (e.g., 'accounts')
  segmentMap?: Record<string, string>; // Optional custom mapping for path segments
  includeHome?: boolean; // Whether to include the Home breadcrumb (defaults to true)
  homeLabel?: string; // Custom label for the Home breadcrumb (defaults to 'Home')
  homeLink?: string; // Custom link for the Home breadcrumb (defaults to '/')
}

const DynamicBreadcrumbs: React.FC<DynamicBreadcrumbsProps> = ({
  startSegment,
  segmentMap,
  includeHome = true,
  homeLabel = 'Home',
  homeLink = '/',
  ...otherProps
}) => {
  const location = useLocation();

  const generateBreadcrumbItems = () => {
    const pathnames = location.pathname.split('/').filter((x) => x);

    let relevantPathnames = pathnames;
    let pathSliceStart = 0;

    if (startSegment) {
      const startIndex = pathnames.indexOf(startSegment);
      if (startIndex !== -1) {
        relevantPathnames = pathnames.slice(startIndex);
        pathSliceStart = startIndex;
      }
    }

    const items = relevantPathnames.map((name, index) => {
      const routeTo = `/${pathnames.slice(0, pathSliceStart + index + 1).join('/')}`;
      const isLast = index === relevantPathnames.length - 1;

      const defaultDisplayMapping: Record<string, string> = {
        'general-journal': 'General Journal',
        accounts: 'Daftar Akun',
        add: 'Tambah Akun',
        'edit-account': 'Ubah Akun',
        // Add more default mappings here as needed
      };
      const mergedSegmentMap = { ...defaultDisplayMapping, ...segmentMap };

      const displayName = mergedSegmentMap[name] || name.charAt(0).toUpperCase() + name.slice(1);

      return isLast ? (
        <MantineText fz={12} key={displayName} c={themeColors.figmaTeal[5]}>
          {displayName}
        </MantineText>
      ) : (
        <Anchor
          component={Link}
          to={routeTo}
          key={displayName}
          fz={12}
          style={{ color: themeColors.defaultBlack[9] }}
        >
          {displayName}
        </Anchor>
      );
    });

    const homeItem = includeHome ? (
      <Anchor component={Link} to={homeLink} key="home" fz={12} style={{ color: themeColors.defaultBlack[9] }}>
        {homeLabel}
      </Anchor>
    ) : null;

    return homeItem ? [homeItem, ...items] : items;
  };

  const breadcrumbItems = generateBreadcrumbItems();

  if (breadcrumbItems.length <= (includeHome ? 1 : 0)) { // Adjust condition if only home is present
    return null;
  }

  return (
    <Breadcrumbs mb="xl" {...otherProps}>
      {breadcrumbItems}
    </Breadcrumbs>
  );
};

export default DynamicBreadcrumbs;
