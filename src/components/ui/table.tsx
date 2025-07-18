'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';

import { Card } from './card';

function Table({ className, ...props }: React.ComponentProps<'table'>) {
  // Responsive table: show table on md+, show cards on mobile
  return (
    <div data-slot="table-container" className="relative w-full">
      {/* Table for md+ screens */}
      <div className="hidden w-full overflow-x-auto md:block">
        <table
          data-slot="table"
          className={cn('w-full caption-bottom text-sm', className)}
          {...props}
        />
      </div>
      {/* Mobile: render children as cards */}
      <MobileCards {...props} className={className} />
    </div>
  );
}

function TableHeader({ className, ...props }: React.ComponentProps<'thead'>) {
  return (
    <thead
      data-slot="table-header"
      className={cn('[&_tr]:border-b', 'hidden md:table-header-group', className)}
      {...props}
    />
  );
}
TableHeader.displayName = 'TableHeader';

function TableFooter({ className, ...props }: React.ComponentProps<'tfoot'>) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        'border-t bg-muted/50 font-medium [&>tr]:last:border-b-0',
        'hidden md:table-footer-group',
        className,
      )}
      {...props}
    />
  );
}
TableFooter.displayName = 'TableFooter';

function TableBody({ className, ...props }: React.ComponentProps<'tbody'>) {
  return (
    <tbody
      data-slot="table-body"
      className={cn('[&_tr:last-child]:border-0', 'hidden md:table-row-group', className)}
      {...props}
    />
  );
}
TableBody.displayName = 'TableBody';

function TableRow({ className, ...props }: React.ComponentProps<'tr'>) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        'border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted',
        'hidden md:table-row',
        className,
      )}
      {...props}
    />
  );
}
TableRow.displayName = 'TableRow';

function TableHead({ className, ...props }: React.ComponentProps<'th'>) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        'h-10 whitespace-nowrap px-2 text-left align-middle font-medium text-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
        'hidden md:table-cell',
        className,
      )}
      {...props}
    />
  );
}
TableHead.displayName = 'TableHead';

function TableCell({ className, ...props }: React.ComponentProps<'td'>) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        'whitespace-nowrap p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
        'hidden md:table-cell',
        className,
      )}
      {...props}
    />
  );
}
TableCell.displayName = 'TableCell';

function TableCaption({ className, ...props }: React.ComponentProps<'caption'>) {
  return (
    <caption
      data-slot="table-caption"
      className={cn('mt-4 text-muted-foreground text-sm', className)}
      {...props}
    />
  );
}
TableCaption.displayName = 'TableCaption';

function MobileCards(
  props: React.ComponentPropsWithoutRef<'div'> & {
    className?: string;
  },
) {
  // Extract headers and body from children
  let headers: string[] = [];
  let body: React.ReactElement | undefined;
  React.Children.forEach(props.children, (child) => {
    if (React.isValidElement(child)) {
      if ((child.type as { displayName?: string }).displayName === 'TableHeader') {
        // Find TableHead children
        const childProps = child.props as { children?: React.ReactNode };
        const trCandidate = React.Children.toArray(childProps.children)[0];
        if (React.isValidElement(trCandidate)) {
          const trProps = trCandidate.props as { children?: React.ReactNode };
          headers = React.Children.toArray(trProps.children).map((th) => {
            if (
              React.isValidElement(th) &&
              th.props &&
              typeof th.props === 'object' &&
              'children' in (th.props as object)
            ) {
              const thChildren = (th.props as { children?: React.ReactNode }).children;
              if (typeof thChildren === 'string') return thChildren;
              if (Array.isArray(thChildren)) {
                return thChildren.map((c) => (typeof c === 'string' ? c : '')).join(' ');
              }
              return '';
            }
            return '';
          });
        }
      } else if ((child.type as { displayName?: string }).displayName === 'TableBody') {
        if (React.isValidElement(child)) {
          body = child;
        }
      }
    }
  });

  // Helper to flatten fragments and filter out falsy children
  function flattenChildren(children: React.ReactNode): React.ReactElement[] {
    const result: React.ReactElement[] = [];
    React.Children.forEach(children, (child: React.ReactNode) => {
      if (!child) return;
      if (Array.isArray(child)) {
        result.push(...flattenChildren(child));
      } else if (React.isValidElement(child)) {
        if (child.type === React.Fragment) {
          const fragProps = child.props as { children?: React.ReactNode };
          result.push(...flattenChildren(fragProps.children));
        } else {
          result.push(child);
        }
      }
    });
    return result;
  }

  if (!body) return null;
  // Type guard for body.props
  const bodyChildren =
    React.isValidElement(body) &&
    body.props &&
    typeof body.props === 'object' &&
    'children' in body.props
      ? (body.props as { children?: React.ReactNode }).children
      : null;
  const rows = flattenChildren(bodyChildren);

  return (
    <div
      className="grid w-full max-w-full gap-x-4 gap-y-6 overflow-visible px-1 py-6 sm:grid-cols-2 md:hidden"
      data-slot="mobile-cards"
    >
      {rows.map((row, i) => {
        if (
          React.isValidElement(row) &&
          row.props &&
          typeof row.props === 'object' &&
          'children' in row.props
        ) {
          const rowEl = row;
          type RowProps = {
            id?: string;
            className?: string;
            children?: React.ReactNode;
            [key: string]: unknown;
          };
          const rowPropsTyped = rowEl.props as RowProps;
          const rowChildren = rowPropsTyped.children;
          // Flatten row children to get all TableCell elements
          const cells = flattenChildren(rowChildren);
          const { className: rowClassName, ...rowProps } = rowPropsTyped;
          return (
            <MobileTableRowCard
              key={rowPropsTyped.id || rowEl.key || i}
              className={rowClassName}
              {...rowProps}
            >
              {cells.map((cell, j) => {
                if (
                  React.isValidElement(cell) &&
                  cell.props &&
                  typeof cell.props === 'object' &&
                  (cell.type as { displayName?: string }).displayName === 'TableCell'
                ) {
                  const cellEl = cell;
                  type CellProps = {
                    id?: string;
                    className?: string;
                    children?: React.ReactNode;
                    [key: string]: unknown;
                  };
                  const cellPropsTyped = cellEl.props as CellProps;
                  const header = headers[j] || '';
                  const { className: cellClassName, ...cellProps } = cellPropsTyped;
                  return (
                    <MobileTableCell
                      key={cellPropsTyped.id || cellEl.key || j}
                      header={header}
                      className={cn('w-full', cellClassName)}
                      {...cellProps}
                    >
                      {cellPropsTyped.children}
                    </MobileTableCell>
                  );
                }
                return null;
              })}
            </MobileTableRowCard>
          );
        }
        return null;
      })}
    </div>
  );
}
MobileCards.displayName = 'MobileCards';

function MobileTableRowCard({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <Card
      className={cn(
        'flex w-full flex-col gap-4 overflow-visible rounded-xl bg-card p-6 shadow-lg',
        className,
      )}
      data-slot="table-mobile-row-card"
      {...props}
    >
      {children}
    </Card>
  );
}
MobileTableRowCard.displayName = 'MobileTableRowCard';

function MobileTableCell({
  children,
  header,
  className,
}: { header?: React.ReactNode; className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex w-full flex-col items-center gap-3 border-muted border-b py-3 last:border-b-0',
        className,
      )}
      data-slot="table-mobile-cell"
    >
      {header && (
        <span className="mb-1 flex w-auto items-center justify-center gap-1 rounded-md bg-muted/30 px-2 py-1 font-semibold text-muted-foreground text-sm tracking-wide">
          {header}
        </span>
      )}
      <div className="flex w-full flex-row items-center justify-center overflow-visible">
        <div className="w-full overflow-visible break-words text-center text-base text-foreground leading-normal [&>*]:justify-center [&_.lucide+span]:inline [&_a]:min-h-10 [&_a]:min-w-24 [&_a_.lucide]:mr-1.5 [&_button]:min-h-10 [&_button]:min-w-24 [&_button_.lucide]:mr-1.5">
          {children}
        </div>
      </div>
    </div>
  );
}
MobileTableCell.displayName = 'MobileTableCell';

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  MobileCards,
  MobileTableRowCard,
  MobileTableCell,
};
