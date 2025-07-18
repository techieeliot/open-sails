import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@radix-ui/react-dropdown-menu';
import type { Table } from '@tanstack/react-table';
import { useAtomValue } from 'jotai/react';
import { MoreHorizontal } from 'lucide-react';
import Link from 'next/link';

import EditCollectionDialog from '@/components/edit-collection-dialog';
import { Button } from '@/components/ui/button';
import { userSessionAtom } from '@/lib/atoms';
import type { Collection } from '@/types';

import DeleteCollectionDialog from '../../delete-collection-dialog';



// Actions cell renderer as a component
interface ActionsCellProps {
  row: {
    original: Collection;
  };
  table: Table<Collection>;
}

export default function ActionsCell({ row, table }: ActionsCellProps) {
  const collection = row.original;
  const userSession = useAtomValue(userSessionAtom);
  const currentUser = userSession.user;
  const isOwner = currentUser && currentUser.id === collection.ownerId;
  const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 768;
  const meta = (table.options.meta || {}) as {
    onEditCollection?: (id: number) => void;
    onDeleteCollection?: (id: number) => void;
    fetchCollections?: () => void;
  };

  return (
    <div className="flex items-center justify-end space-x-2">
      <Button variant="ghost" size="sm" asChild className="hidden items-center md:flex">
        <Link href={`/collections/${collection.id}`}>View</Link>
      </Button>
      {isOwner && isDesktop && (
        <>
          <EditCollectionDialog collectionId={collection.id} onSuccess={meta.fetchCollections} />
          <DeleteCollectionDialog collectionId={collection.id} onSuccess={meta.fetchCollections} />
        </>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex w-[60vw] items-center justify-center rounded-full p-0 hover:bg-accent/50 md:h-10 md:w-10 md:border-none"
            aria-label="Open actions menu"
          >
            <span className="inline md:hidden">Open menu</span>
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="border bg-background bg-popover shadow-md">
          <DropdownMenuLabel className="bg-background">Actions</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => navigator.clipboard.writeText(collection.id.toString())}
            className="bg-background hover:bg-accent"
          >
            Copy collection ID
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild className="bg-background hover:bg-accent md:hidden">
            <Link href={`/collections/${collection.id}`}>View details</Link>
          </DropdownMenuItem>
          {isOwner && !isDesktop && (
            <>
              <DropdownMenuSeparator className="md:hidden" />
              <DropdownMenuItem
                onClick={() => meta.onEditCollection?.(collection.id)}
                className="bg-background hover:bg-accent md:hidden"
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => meta.onDeleteCollection?.(collection.id)}
                className="bg-background text-destructive hover:bg-accent hover:text-destructive md:hidden"
              >
                Delete
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
