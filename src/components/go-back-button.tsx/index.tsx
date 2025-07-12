'use client';

import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { ComponentProps } from 'react';

export default function GoBackButton({
  children = 'Go Back',
  icon: Icon,
  ...props
}: { icon?: React.ElementType } & ComponentProps<typeof Button>) {
  const router = useRouter();

  return (
    <Button onClick={() => router.back()} {...props}>
      {Icon && (
        <span className="mr-2">
          <Icon />
        </span>
      )}
      {children}
    </Button>
  );
}
