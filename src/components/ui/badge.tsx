import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-accent text-foreground shadow hover:bg-primary/80 hover:text-primary-foreground',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80',
        success: 'border-transparent bg-green-700 text-foreground shadow hover:bg-green-700/80',
        info: 'border-transparent bg-blue-700 text-foreground shadow hover:bg-blue-700/80',
        warning: 'border-transparent bg-yellow-700 text-foreground shadow hover:bg-yellow-700/80',
        outline: 'border border-gray-300 bg-transparent text-foreground hover:bg-accent',
        struckthrough:
          'border-transparent bg-red-500 text-foreground line-through shadow hover:bg-destructive/80',
      },
      size: {
        default: 'h-6',
        sm: 'h-5 text-xs',
        lg: 'h-8 text-sm',
        xl: 'h-10 text-base',
        '2xl': 'h-12 text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
