'use client';

import { PropsWithChildren } from 'react';

export interface RowItemProps {
  rowTitle: string;
  onClick?: () => void;
}

export default function RowItem({ rowTitle, children, onClick }: PropsWithChildren<RowItemProps>) {
  return (
    <div
      className="w-full max-w-8xl min-w-sm p-4 rounded-lg shadow-md flex items-center justify-between cursor-pointer"
      onClick={onClick}
    >
      <div>{rowTitle}</div>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}
