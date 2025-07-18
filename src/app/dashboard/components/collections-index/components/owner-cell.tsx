import { Row } from '@tanstack/react-table';
import { useAtomValue } from 'jotai/react';

import { userNamesAtom } from '@/lib/atoms';
import { Collection } from '@/types';

// Owner cell renderer as a component
export default function OwnerCell({ row }: { row: Row<Collection> }) {
  const ownerId = row.getValue('ownerId') as number;
  const userNames = useAtomValue(userNamesAtom);
  const ownerName = userNames[ownerId] || `User ${ownerId}`;
  return <div>{ownerName}</div>;
}
