'use client';

import { ColumnDef } from '@tanstack/react-table';
import { useAtomValue } from 'jotai/react';
import {
  ArrowUpDown,
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  CircleX,
  Edit,
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { userNamesAtom, userSessionAtom } from '@/lib/atoms';
import { formatPrice, toStartCase } from '@/lib/utils';
import { Collection } from '@/types';
import TriggerIconButton from '@/components/trigger-icon-button';

export const collectionColumnDefinition: ColumnDef<Collection>[] = [
  {
    id: 'expander',
    header: () => null,
    cell: ({ row, table }) => {
      // Use type assertion to access custom properties
      const meta =
        (table.options.meta as {
          expandedCollectionId?: number | null;
          onRowClick?: (id: number) => void;
        }) || {};
      const expandedCollectionId = meta.expandedCollectionId;
      const onRowClick = meta.onRowClick;
      const isExpanded = expandedCollectionId === row.original.id;

      return (
        <Button
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            if (onRowClick) {
              onRowClick(row.original.id);
            }
          }}
          size="sm"
          className="p-0 h-10 w-10 md:border-none flex items-center justify-center rounded-full hover:bg-accent/50"
          aria-label={isExpanded ? 'Collapse row' : 'Expand row'}
        >
          {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </Button>
      );
    },
  },
  {
    id: 'select',
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="h-5 w-5"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="h-5 w-5"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="font-semibold"
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const name = row.getValue('name') as string;
      const id = row.original.id;

      return (
        <div className="font-medium">
          <Link href={`/collections/${id}`} className="hover:underline text-accent">
            {name}
          </Link>
        </div>
      );
    },
  },
  {
    accessorKey: 'ownerId',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Owner
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row, table }) => {
      const ownerId = row.getValue('ownerId') as number;
      // Access userNames from the meta property
      const userNames = useAtomValue(userNamesAtom);
      const ownerName = userNames[ownerId] || `User ${ownerId}`;

      return <div>{ownerName}</div>;
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      return (
        <Badge
          variant={status === 'open' ? 'secondary' : 'outline'}
          className="w-[60vw] md:w-auto justify-center min-h-8 text-base"
        >
          {toStartCase(status)}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'price',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Price
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('price') as string) || 0;
      const formatted = formatPrice(amount);

      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: 'stocks',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Quantity
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const quantity = row.getValue('stocks') as number;
      return <div>{quantity.toLocaleString()} units</div>;
    },
  },
  {
    id: 'actions',
    cell: ({ row, table }) => {
      const collection = row.original;
      const userSession = useAtomValue(userSessionAtom);
      const currentUser = userSession.user;
      const isOwner = currentUser && currentUser.id === collection.ownerId;

      // Check if table has meta with edit/delete/fetch handlers
      const meta = (table.options.meta || {}) as {
        onEditCollection?: (id: number) => void;
        onDeleteCollection?: (id: number) => void;
        fetchCollections?: () => void;
      };

      return (
        <div className="flex items-center justify-end space-x-2">
          {/* Edit and Delete buttons for owners on desktop */}
          {isOwner && (
            <div className="hidden md:flex items-center space-x-2">
              <TriggerIconButton
                variant="outline"
                size="sm"
                icon={Edit}
                onClick={() => meta.onEditCollection?.(collection.id)}
              >
                Edit
              </TriggerIconButton>
              <TriggerIconButton
                variant="destructive"
                size="sm"
                icon={CircleX}
                onClick={() => meta.onDeleteCollection?.(collection.id)}
              >
                Delete
              </TriggerIconButton>
            </div>
          )}

          {/* Dropdown menu for all devices (contains all actions on mobile) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="md:h-10 md:w-10 p-0 md:border-none flex items-center justify-center rounded-full hover:bg-accent/50"
                aria-label="Open actions menu"
              >
                <span className="inline md:hidden mr-2">Actions</span>
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover border shadow-md bg-background">
              <DropdownMenuLabel className="bg-background">Actions</DropdownMenuLabel>

              {/* Common actions */}
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(collection.id.toString())}
                className="bg-background hover:bg-accent"
              >
                Copy collection ID
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {/* View details is always available */}
              <DropdownMenuItem asChild className="bg-background hover:bg-accent ">
                <Link href={`/collections/${collection.id}`}>View details</Link>
              </DropdownMenuItem>

              {/* Owner-specific actions (available on mobile and as dropdown on desktop) */}
              {isOwner && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => meta.onEditCollection?.(collection.id)}
                    className="bg-background hover:bg-accent md:flex"
                  >
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => meta.onDeleteCollection?.(collection.id)}
                    className="bg-background hover:bg-accent text-destructive hover:text-destructive"
                  >
                    Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
