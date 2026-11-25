import { Anchor } from '@mantine/core';
import { Link } from 'react-router-dom';
import { routes } from '@/router/routes';

interface TransferWarehouseLinkProps {
  warehouseId: string;
  name: string;
}

/** The warehouse's name as a link to its page; a deleted warehouse (empty id) has none, so plain text. */
export const TransferWarehouseLink = ({
  warehouseId,
  name,
}: Readonly<TransferWarehouseLinkProps>) =>
  warehouseId ? (
    <Anchor
      component={Link}
      to={routes.inventory.warehouseDetail.replace(':id', warehouseId)}
      fw={700}
    >
      {name}
    </Anchor>
  ) : (
    <span>{name}</span>
  );
