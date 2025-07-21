'use client';

import { type Table as ReactTable } from '@tanstack/react-table';
import * as React from 'react';
import { Button } from '@/components/ui/button';

export function DataTablePagination<TData>({ table }: { table: ReactTable<TData> }) {
  return (
    <>
      <div className="flex flex-col items-center justify-between gap-4 py-4 sm:flex-row"></div>
      <div className="w-full text-center text-muted-foreground text-sm sm:flex-1 sm:text-left">
        {table.getFilteredSelectedRowModel().rows.length} of{' '}
        {table.getFilteredRowModel().rows.length} row(s) selected.
      </div>
      <div className="flex w-full flex-col justify-center gap-2 sm:w-auto md:flex-row">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="min-w-[100px]"
        >
          Previous
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="min-w-[100px]"
        >
          Next
        </Button>
      </div>
    </>
  );
}
