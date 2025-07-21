import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { type Table as ReactTable } from '@tanstack/react-table';
import { DataTableViewOptions } from './data-table-view-options';

interface DataTableToolbarProps<TData> {
  table: ReactTable<TData>;
  filterColumn?: string;
  filterPlaceholder?: string;
}

export function DataTableToolbar<TData>({
  table,
  filterColumn,
  filterPlaceholder,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between w-full">
      <div className="flex flex-1 flex-col items-center gap-4 md:flex-row w-full">
        {filterColumn && (
          <div className="w-full md:w-72">
            <Input
              placeholder={filterPlaceholder || `Filter by ${filterColumn}...`}
              value={(table.getColumn(filterColumn)?.getFilterValue() as string) ?? ''}
              onChange={(event) =>
                table.getColumn(filterColumn)?.setFilterValue(event.target.value)
              }
              className="h-8 w-full border border-accent/60  focus:border-accent focus:ring-0 px-3"
            />
          </div>
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
