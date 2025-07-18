import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import type * as React from 'react';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  [
    cn(
      // Base styles for the button
      'inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium text-sm md:w-auto',
      // Common styles for all buttons
      "shrink-0 outline-none transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
      // Focus ring and border for accessibility
      'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
      // Custom focus/invalid states
      'aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
    ),
  ],
  {
    variants: {
      variant: {
        default: [
          'bg-primary-foreground text-secondary-foreground',
          'border border-primary shadow-[0_2px_8px_0_rgba(255,238,55,0.10)]',
          'hover:bg-primary hover:text-black hover:shadow-[0_4px_12px_0_rgba(255,238,55,0.25)]',
          'focus-visible:ring-primary/70',
        ],
        secondary: [
          'bg-secondary text-secondary-foreground',
          'border border-secondary shadow-[0_2px_8px_0_rgba(1,51,155,0.10)]',
          'hover:bg-secondary/80 focus-visible:ring-secondary/60',
        ],
        destructive: [
          'bg-transparent',
          'border',
          'border-[#F86403]',
          'text-[#F86403]',
          'hover:bg-[#F86403]/10',
          'focus-visible:ring-[#F86403]',
        ],
        outline: [
          'border',
          'border-accent',
          'text-accent',
          'bg-transparent',
          'hover:bg-accent/10 hover:text-accent-foreground',
          'focus-visible:ring-accent',
        ],
        ghost: [
          'bg-transparent border border-muted-foreground text-muted-foreground',
          'hover:bg-accent/10 hover:text-accent-foreground',
          'focus-visible:ring-accent/40 focus-visible:ring-offset-2',
        ],
        link: [
          'bg-transparent border-none text-accent',
          'underline underline-offset-4',
          'hover:text-accent-foreground hover:opacity-80',
          'focus-visible:ring-accent/40',
        ],
        icon: [
          'bg-transparent border-none text-accent',
          'hover:bg-accent/10 hover:text-accent-foreground',
          'focus-visible:ring-accent/40',
        ],
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-8 max-h-[2rem] rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
        icon: 'size-9',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

function Button({
  className,
  variant,
  size,
  fullWidth = false,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, fullWidth, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
