'use client';

import {
  Column,
  ColumnDef,
  ColumnFiltersState,
  NoInfer,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ChevronLeftCircle, ChevronRightCircle, Inbox } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import TriggerIconButton from '../trigger-icon-button';

interface DataTableToolbarProps<TData> {
  table: any;
  filterColumn?: string;
  filterPlaceholder?: string;
}

function DataTableToolbar<TData>({
  table,
  filterColumn,
  filterPlaceholder,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex flex-col gap-4 md:flex-row items-center md:justify-between">
      <div className="flex flex-col gap-4 md:flex-row flex-1 items-center space-x-2">
        {filterColumn && (
          <Input
            placeholder={filterPlaceholder || `Filter by ${filterColumn}...`}
            value={(table.getColumn(filterColumn)?.getFilterValue() as string) ?? ''}
            onChange={(event) => table.getColumn(filterColumn)?.setFilterValue(event.target.value)}
            className="h-8 md:w-72 w-[87vw] bg-background border border-accent/60 focus:border-accent focus:ring-0"
          />
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  );
}

interface DataTableViewOptionsProps<TData> {
  table: any;
}

function DataTableViewOptions<TData>({ table }: DataTableViewOptionsProps<TData>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="ml-auto h-8 w-full">
          Columns
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[150px] bg-popover border shadow-md">
        {table
          .getAllColumns()
          .filter((column: any) => column.getCanHide())
          .map((column: any) => {
            return (
              <DropdownMenuCheckboxItem
                key={column.id}
                className="capitalize bg-background hover:bg-accent"
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(!!value)}
              >
                {column.id}
              </DropdownMenuCheckboxItem>
            );
          })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function DataTablePagination<TData>({ table }: { table: any }) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
      <div className="text-sm text-muted-foreground w-full sm:flex-1 text-center sm:text-left">
        {table.getFilteredSelectedRowModel().rows.length} of{' '}
        {table.getFilteredRowModel().rows.length} row(s) selected.
      </div>
      <div className="flex flex-col md:flex-row gap-2 w-full sm:w-auto justify-center">
        <TriggerIconButton
          variant="secondary"
          icon={ChevronLeftCircle}
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </TriggerIconButton>
        <TriggerIconButton
          variant="secondary"
          icon={ChevronRightCircle}
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          isIconLeading={false}
        >
          Next
        </TriggerIconButton>
      </div>
    </div>
  );
}

interface DataTableMeta<TData> {
  userNames?: Record<number, string>;
  fetchCollections?: () => void;
  onRowClick?: (id: number) => void;
  onEditCollection?: (id: number) => void;
  onDeleteCollection?: (id: number) => void;
  expandedCollectionId?: number | null;
  expandedRowContent?: React.ReactNode;
}

interface DataTableMeta<TData> {
  userNames?: Record<number, string>;
  fetchCollections?: () => void;
  onRowClick?: (id: number) => void;
  onEditCollection?: (id: number) => void;
  onDeleteCollection?: (id: number) => void;
  expandedCollectionId?: number | null;
  expandedRowContent?: React.ReactNode;
  [key: string]: any;
}

/**
 * Props interface for the DataTable component
 *
 * @template TData - The type of data being displayed in the table
 * @template TValue - The type of values in the table cells
 */
interface DataTableProps<TData, TValue> {
  /** Column definitions for the table */
  columns: ColumnDef<TData, TValue>[];
  /** Data array to be displayed in the table */
  data: TData[];
  /** Optional column key to enable filtering on */
  filterColumn?: string;
  /** Custom placeholder text for the filter input */
  filterPlaceholder?: string;
  /** Additional metadata and customization options */
  meta?: DataTableMeta<TData>;
}

/**
 * A responsive data table component with filtering, sorting, and pagination
 *
 * Features:
 * - Responsive design (displays as cards on mobile, table on desktop)
 * - Column filtering and sorting
 * - Pagination
 * - Expandable rows
 * - Column visibility toggle
 *
 * @template TData - The type of data being displayed
 * @template TValue - The type of values in the cells
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

  return (
    <div className="space-y-4 w-full overflow-hidden">
      {filterColumn && (
        <DataTableToolbar
          table={table}
          filterColumn={filterColumn}
          filterPlaceholder={filterPlaceholder}
        />
      )}
      <div className="rounded-md border w-full overflow-visible">
        {/* Desktop view */}
        <div className="hidden md:block w-full">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        colSpan={header.colSpan}
                        className="px-2 py-2 whitespace-nowrap font-medium text-sm"
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
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <React.Fragment key={row.id}>
                    <TableRow
                      data-state={row.getIsSelected() && 'selected'}
                      onClick={() => {
                        // Use type assertion to access custom properties
                        const customMeta = table.options.meta as DataTableMeta<TData> | undefined;
                        if (customMeta?.onRowClick && row.original) {
                          // Access id with type assertion if needed
                          const id = (row.original as any).id;
                          if (id !== undefined) {
                            customMeta.onRowClick(id);
                          }
                        }
                      }}
                      className={
                        (table.options.meta as DataTableMeta<TData> | undefined)
                          ?.expandedCollectionId === (row.original as any)?.id
                          ? 'bg-accent/30 cursor-pointer'
                          : 'cursor-pointer hover:bg-accent/10'
                      }
                    >
                      {row.getVisibleCells().map((cell) => (
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
                    {(table.options.meta as DataTableMeta<TData> | undefined)
                      ?.expandedCollectionId === (row.original as any)?.id && (
                      <TableRow className="bg-muted/50">
                        <TableCell colSpan={columns.length} className="p-0">
                          <div className="p-4 overflow-x-auto w-full">
                            {/* Use expandedRowContent from meta if provided */}
                            <div className="max-w-full overflow-x-hidden">
                              {(table.options.meta as DataTableMeta<TData>)?.expandedRowContent}
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
                    <Inbox className="h-6 w-6 mx-auto mb-2" />
                    <span className="text-muted-foreground inline">No results.</span>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden w-full overflow-visible">
          {table.getRowModel().rows?.length ? (
            <div className="grid gap-4 p-2 w-full overflow-visible">
              {table.getRowModel().rows.map((row) => (
                <div
                  key={row.id}
                  className={`rounded-lg border bg-card shadow-sm p-0 md:p-4 w-full ${
                    (table.options.meta as DataTableMeta<TData> | undefined)
                      ?.expandedCollectionId === (row.original as any)?.id
                      ? 'bg-accent/30 border-primary/50'
                      : 'border-border'
                  }`}
                  onClick={() => {
                    const customMeta = table.options.meta as DataTableMeta<TData> | undefined;
                    if (customMeta?.onRowClick && row.original) {
                      const id = (row.original as any).id;
                      if (id !== undefined) {
                        customMeta.onRowClick(id);
                      }
                    }
                  }}
                >
                  <div className="flex flex-col gap-3">
                    {/* Row header with select checkbox and expander */}
                    <div className="flex items-center justify-between mb-2 overflow-visible px-2">
                      {row.getVisibleCells().map((cell) => {
                        // Only render select and expander in the header area
                        if (cell.column.id === 'select') {
                          return (
                            <div key={cell.id} className="flex items-center gap-2 overflow-visible">
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              <span className="text-xs text-muted-foreground whitespace-nowrap">
                                Select
                              </span>
                            </div>
                          );
                        }
                        if (cell.column.id === 'expander') {
                          return (
                            <div key={cell.id} className="flex items-center gap-2">
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              <span className="text-xs text-muted-foreground">
                                {(table.options.meta as DataTableMeta<TData> | undefined)
                                  ?.expandedCollectionId === (row.original as any)?.id
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
                      {row.getVisibleCells().map((cell) => {
                        // Skip select and expander since they're in the header
                        if (cell.column.id === 'select' || cell.column.id === 'expander') {
                          return null;
                        }

                        // Get column header text
                        const headerText = cell.column.columnDef.header
                          ? typeof cell.column.columnDef.header === 'string'
                            ? cell.column.columnDef.header
                            : cell.column.id.charAt(0).toUpperCase() + cell.column.id.slice(1)
                          : cell.column.id.charAt(0).toUpperCase() + cell.column.id.slice(1);

                        // Special handling for actions column
                        if (cell.column.id === 'actions') {
                          return (
                            <div
                              key={cell.id}
                              className="flex flex-row justify-center items-center py-2 mt-2 border-t border-border"
                            >
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </div>
                          );
                        }

                        return (
                          <div
                            key={cell.id}
                            className="flex flex-col gap-1 items-center justify-center py-2"
                          >
                            <div className="text-sm font-medium text-muted-foreground">
                              {headerText}
                            </div>
                            <div className="text-base w-full text-center">
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Expanded content */}
                  {(table.options.meta as DataTableMeta<TData> | undefined)
                    ?.expandedCollectionId === (row.original as any)?.id && (
                    <div className="mt-4 pt-4 border-t border-border overflow-hidden">
                      <div className="w-full overflow-x-auto">
                        {(table.options.meta as DataTableMeta<TData>)?.expandedRowContent}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center">
              <Inbox className="h-12 w-12 text-muted-foreground mb-4" />
              <span className="text-muted-foreground">No results.</span>
            </div>
          )}
        </div>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}
