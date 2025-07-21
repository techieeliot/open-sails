'use client';

import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type Row,
  type Cell,
  type HeaderGroup,
} from '@tanstack/react-table';
import { Inbox } from 'lucide-react';
import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DataTableMeta } from '@/types';
import { DataTableToolbar } from './data-table-toolbar';
import { DataTablePagination } from './data-table-pagination';

/**
 * Props interface for the DataTable component
 *
 * @template TData - The type of data being displayed in the table
 * @template TValue - The type of values in the table cells
 */
export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  filterColumn?: string;
  filterPlaceholder?: string;
  meta?: DataTableMeta<TData>;
}

/**
 * A responsive data table component with filtering, sorting, and pagination
 */
export function DataTable<TData, TValue>({
  columns,
  data,
  filterColumn,
  filterPlaceholder,
  meta,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    meta,
    enableRowSelection: true,
    enableExpanding: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  // Sort data so that the most recently updated (or created) item is at the top
  const sortedData = React.useMemo(() => {
    if (!data || !Array.isArray(data)) return data;
    return [...data].sort((a, b) => {
      // Use type assertion to TData & Record<string, unknown> for safe property access
      const aObj = a as TData & Record<string, unknown>;
      const bObj = b as TData & Record<string, unknown>;
      const aDate =
        (aObj.updatedAt as string | undefined) || (aObj.createdAt as string | undefined);
      const bDate =
        (bObj.updatedAt as string | undefined) || (bObj.createdAt as string | undefined);
      if (!aDate || !bDate) return 0;
      return new Date(bDate).getTime() - new Date(aDate).getTime();
    });
  }, [data]);

  // Use sortedData for the table
  const tableWithSortedData = useReactTable({
    ...table.options,
    data: sortedData,
  });

  return (
    <div className="w-full space-y-4 overflow-hidden">
      {filterColumn && (
        <DataTableToolbar
          table={tableWithSortedData}
          filterColumn={filterColumn}
          filterPlaceholder={filterPlaceholder}
        />
      )}
      <div className="w-full overflow-visible rounded-md border">
        {/* Desktop view */}
        <div className="hidden w-full md:block">
          <Table>
            <TableHeader>
              {tableWithSortedData.getHeaderGroups().map((headerGroup: HeaderGroup<TData>) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        colSpan={header.colSpan}
                        className="whitespace-nowrap px-2 py-2 font-medium text-sm"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {tableWithSortedData.getRowModel().rows?.length ? (
                tableWithSortedData.getRowModel().rows.map((row: Row<TData>) => (
                  <React.Fragment key={row.id}>
                    <TableRow
                      data-state={row.getIsSelected() && 'selected'}
                      onClick={() => {
                        const customMeta = tableWithSortedData.options.meta as
                          | DataTableMeta<TData>
                          | undefined;
                        if (customMeta?.onRowClick && row.original) {
                          const id = (row.original as { id?: number })?.id;
                          if (id !== undefined) {
                            customMeta.onRowClick(id);
                          }
                        }
                      }}
                      className={
                        (tableWithSortedData.options.meta as DataTableMeta<TData> | undefined)
                          ?.expandedCollectionId === (row.original as { id?: number })?.id
                          ? 'cursor-pointer bg-accent/30'
                          : 'cursor-pointer hover:bg-accent/10'
                      }
                    >
                      {row.getVisibleCells().map((cell: Cell<TData, unknown>) => (
                        <TableCell
                          key={cell.id}
                          colSpan={1}
                          className={`px-2 py-2 ${
                            cell.column.id === 'actions'
                              ? 'w-[250px] min-w-[250px]'
                              : cell.column.id === 'expander'
                                ? 'w-[50px] min-w-[50px]'
                                : cell.column.id === 'select'
                                  ? 'w-[50px] min-w-[50px]'
                                  : cell.column.id === 'price'
                                    ? 'text-center'
                                    : ''
                          }`}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>

                    {/* Render expanded content inline if this row is expanded */}
                    {(tableWithSortedData.options.meta as DataTableMeta<TData> | undefined)
                      ?.expandedCollectionId === (row.original as { id?: number })?.id && (
                      <TableRow className="bg-muted/50">
                        <TableCell colSpan={columns.length} className="p-0">
                          <div className="w-full overflow-x-auto p-4">
                            <div className="max-w-full overflow-x-hidden">
                              {
                                (tableWithSortedData.options.meta as DataTableMeta<TData>)
                                  ?.expandedRowContent
                              }
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center w-full h-full py-8">
                      <Inbox className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />
                      <span className="inline text-muted-foreground">No results.</span>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Card View */}
        <div className="w-full overflow-visible md:hidden">
          {tableWithSortedData.getRowModel().rows?.length ? (
            <div className="grid w-full gap-4 overflow-visible p-2 max-w-[88vw]">
              {tableWithSortedData.getRowModel().rows.map((row: Row<TData>) => (
                <div
                  key={row.id}
                  className={`w-full rounded-lg border bg-card p-0 shadow-sm md:p-4 max-w-[85vw] ${
                    (tableWithSortedData.options.meta as DataTableMeta<TData> | undefined)
                      ?.expandedCollectionId === (row.original as { id?: number })?.id
                      ? 'border-primary/50 bg-accent/30'
                      : 'border-border'
                  }`}
                  onClick={() => {
                    const customMeta = tableWithSortedData.options.meta as
                      | DataTableMeta<TData>
                      | undefined;
                    if (customMeta?.onRowClick && row.original) {
                      const id = (row.original as { id?: number })?.id;
                      if (id !== undefined) {
                        customMeta.onRowClick(id);
                      }
                    }
                  }}
                >
                  <div className="flex flex-col gap-3 pt-4 max-w-[85vw]">
                    {/* Row header with select checkbox and expander */}
                    <div className="mb-2 flex items-center justify-between overflow-visible px-2 max-w-[82vw]">
                      {row.getVisibleCells().map((cell: Cell<TData, unknown>) => {
                        if (cell.column.id === 'select') {
                          return (
                            <div
                              key={cell.id}
                              className="flex items-center gap-2 overflow-visible pr-4"
                            >
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              <span className="whitespace-nowrap text-muted-foreground text-xs">
                                Select
                              </span>
                            </div>
                          );
                        }
                        if (cell.column.id === 'expander') {
                          return (
                            <div key={cell.id} className="flex items-center gap-2 pl-4">
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              <span className="text-muted-foreground text-xs">
                                {(
                                  tableWithSortedData.options.meta as
                                    | DataTableMeta<TData>
                                    | undefined
                                )?.expandedCollectionId === (row.original as { id?: number })?.id
                                  ? 'Collapse'
                                  : 'Expand'}
                              </span>
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>

                    {/* Main content cells */}
                    <div className="grid gap-3">
                      {row.getVisibleCells().map((cell: Cell<TData, unknown>) => {
                        if (cell.column.id === 'select' || cell.column.id === 'expander') {
                          return null;
                        }

                        const headerText = cell.column.columnDef.header
                          ? typeof cell.column.columnDef.header === 'string'
                            ? cell.column.columnDef.header
                            : cell.column.id.charAt(0).toUpperCase() + cell.column.id.slice(1)
                          : cell.column.id.charAt(0).toUpperCase() + cell.column.id.slice(1);

                        if (cell.column.id === 'actions') {
                          return (
                            <div
                              key={cell.id}
                              className="mt-2 flex flex-row items-center justify-center border-border border-t py-2"
                            >
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </div>
                          );
                        }

                        return (
                          <div
                            key={cell.id}
                            className="flex flex-col items-center justify-center gap-1 py-2"
                          >
                            <div className="font-medium text-muted-foreground text-sm">
                              {headerText}
                            </div>
                            <div className="w-full text-center text-base">
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Expanded content */}
                  {(tableWithSortedData.options.meta as DataTableMeta<TData> | undefined)
                    ?.expandedCollectionId === (row.original as { id?: number })?.id && (
                    <div className="mt-4 overflow-hidden border-border border-t pt-4">
                      <div className="w-full overflow-x-auto">
                        {
                          (tableWithSortedData.options.meta as DataTableMeta<TData>)
                            ?.expandedRowContent
                        }
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-48 flex-col items-center justify-center">
              <Inbox className="mb-4 h-12 w-12 text-muted-foreground" />
              <span className="text-muted-foreground">No results.</span>
            </div>
          )}
        </div>
      </div>
      <DataTablePagination table={tableWithSortedData} />
    </div>
  );
}
