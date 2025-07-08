'use client';

import { ReactNode } from 'react';

export default function RowItem({
  title,
  children,
  onClick,
}: {
  title: string;
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <div
      className="w-full max-w-8xl min-w-sm p-4 rounded-lg shadow-md flex items-center justify-between cursor-pointer"
      onClick={onClick}
    >
      <div>{title}</div>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}
