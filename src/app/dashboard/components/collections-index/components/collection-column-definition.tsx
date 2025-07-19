'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, ChevronDown, ChevronRight } from 'lucide-react';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { formatPrice, toStartCase } from '@/lib/utils';
import type { Collection } from '@/types';

import CollectionActionCell from './collection-action-cell';
import OwnerCell from './owner-cell';

export const collectionColumnDefinition: ColumnDef<Collection>[] = [
  {
    id: 'expander',
    header: () => null,
    cell: ({ row, table }) => {
      const meta =
        (table.options.meta as {
          expandedCollectionId?: number | null;
          onRowClick?: (id: number) => void;
        }) || {};
      const expandedCollectionId = meta.expandedCollectionId;
      const onRowClick = meta.onRowClick;
      const isExpanded = expandedCollectionId === row.original.id;

      return (
        <div className="flex items-center justify-center md:justify-center md:items-center w-full h-full">
          <Button
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              if (onRowClick) {
                onRowClick(row.original.id);
              }
            }}
            size="sm"
            className="flex h-10 w-10 items-center justify-center rounded-full p-0 hover:bg-accent/50 md:border-none"
            aria-label={isExpanded ? 'Collapse row' : 'Expand row'}
          >
            {isExpanded ? (
              <ChevronDown className="h-5 w-5" />
            ) : (
              <ChevronRight className="h-5 w-5" />
            )}
          </Button>
        </div>
      );
    },
  },
  {
    id: 'select',
    header: ({ table }) => (
      <div className="flex items-center justify-center md:justify-center md:items-center w-full h-full">
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
      <div className="flex items-center justify-center md:justify-center md:items-center w-full h-full">
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
          size="sm"
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
        <div className="font-medium flex flex-col md:flex-row items-center gap-2">
          <Link href={`/collections/${id}`} className="text-accent hover:underline fle">
            {toStartCase(name)}
          </Link>
          <span className="text-muted-foreground text-xs">ID# {id}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Status
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      return (
        <Badge
          variant={status === 'open' ? 'default' : status === 'closed' ? 'secondary' : 'info'}
          className="inline-flex justify-center px-2 py-1 font-semibold text-base"
        >
          {toStartCase(status)}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'ownerId',
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Owner
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: OwnerCell,
  },
  {
    accessorKey: 'price',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          size="sm"
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
          size="sm"
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
    cell: CollectionActionCell,
  },
];
