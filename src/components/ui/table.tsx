'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Card } from './card';

function Table({ className, ...props }: React.ComponentProps<'table'>) {
  // Responsive table: show table on md+, show cards on mobile
  return (
    <div data-slot="table-container" className="relative w-full">
      {/* Table for md+ screens */}
      <div className="hidden md:block w-full overflow-x-auto">
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
        'bg-muted/50 border-t font-medium [&>tr]:last:border-b-0',
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
        'hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors',
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
        'text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
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
        'p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
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
      className={cn('text-muted-foreground mt-4 text-sm', className)}
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
      if ((child.type as any).displayName === 'TableHeader') {
        // Find TableHead children
        const tr = React.Children.toArray((child as React.ReactElement<any>).props.children)[0] as
          | React.ReactElement<any>
          | undefined;
        if (tr && React.isValidElement(tr)) {
          headers = React.Children.toArray((tr as React.ReactElement<any>).props.children).map(
            (th) => {
              if (React.isValidElement(th)) {
                const thEl = th as React.ReactElement<any>;
                if (typeof thEl.props.children === 'string') return thEl.props.children;
                if (Array.isArray(thEl.props.children)) {
                  return thEl.props.children
                    .map((c: any) => (typeof c === 'string' ? c : ''))
                    .join(' ');
                }
                return '';
              }
              return '';
            },
          );
        }
      } else if ((child.type as any).displayName === 'TableBody') {
        body = child as React.ReactElement<any>;
      }
    }
  });

  // Helper to flatten fragments and filter out falsy children
  function flattenChildren(children: React.ReactNode): React.ReactElement[] {
    const result: React.ReactElement[] = [];
    React.Children.forEach(children, (child) => {
      if (!child) return;
      if (Array.isArray(child)) {
        result.push(...flattenChildren(child));
      } else if (React.isValidElement(child)) {
        const el = child as React.ReactElement<any>;
        if (el.type === React.Fragment) {
          result.push(...flattenChildren(el.props.children));
        } else {
          result.push(el);
        }
      }
    });
    return result;
  }

  if (!body) return null;
  const rows = flattenChildren((body as React.ReactElement<any>).props.children);

  return (
    <div
      className="grid sm:grid-cols-2 gap-x-4 gap-y-6 py-6 px-1 md:hidden w-full max-w-full overflow-visible"
      data-slot="mobile-cards"
    >
      {rows.map((row, i) => {
        if (React.isValidElement(row)) {
          const rowEl = row as React.ReactElement<any>;
          // Flatten row children to get all TableCell elements
          const cells = flattenChildren(rowEl.props.children);
          const { className: rowClassName, ...rowProps } = rowEl.props;
          return (
            <MobileTableRowCard
              key={rowEl.props.id || rowEl.key || i}
              className={rowClassName}
              {...rowProps}
            >
              {cells.map((cell, j) => {
                if (React.isValidElement(cell) && (cell.type as any).displayName === 'TableCell') {
                  const cellEl = cell as React.ReactElement<any>;
                  const header = headers[j] || '';
                  const { className: cellClassName, ...cellProps } = cellEl.props;
                  return (
                    <MobileTableCell
                      key={cellEl.props.id || cellEl.key || j}
                      header={header}
                      className={cn('w-full', cellClassName)}
                      {...cellProps}
                    >
                      {cellEl.props.children}
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
        'rounded-xl bg-card p-6 shadow-lg flex flex-col gap-4 w-full overflow-visible',
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
        'flex flex-col items-center gap-3 py-3 border-b border-muted last:border-b-0 w-full',
        className,
      )}
      data-slot="table-mobile-cell"
    >
      {header && (
        <span className="flex items-center justify-center gap-1 text-sm font-semibold mb-1 tracking-wide text-muted-foreground bg-muted/30 py-1 px-2 rounded-md w-auto">
          {header}
        </span>
      )}
      <div className="flex flex-row items-center justify-center w-full overflow-visible">
        <div className="text-base text-foreground break-words leading-normal text-center w-full [&>*]:justify-center [&_button]:min-w-24 [&_button]:min-h-10 [&_button_.lucide]:mr-1.5 [&_.lucide+span]:inline [&_a]:min-w-24 [&_a]:min-h-10 [&_a_.lucide]:mr-1.5 overflow-visible">
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
