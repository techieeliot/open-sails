"use client";

export default function RowItem({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="w-full max-w-8xl min-w-sm p-4 rounded-lg shadow-md flex items-center justify-between">
      <div>{title}</div>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}
