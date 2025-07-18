import type { VariantProps } from 'class-variance-authority';
import type { LucideIcon } from 'lucide-react';

import { Button, buttonVariants } from '../ui/button';

export default function TriggerIconButton({
  icon: Icon,
  isIconLeading: leadingIcon = true,
  children,
  className,
  ...props
}: {
  isIconLeading?: boolean;
  icon?: LucideIcon;
  className?: string;
} & React.ComponentProps<typeof Button> &
  VariantProps<typeof buttonVariants>) {
  return (
    <Button
      className={`flex-1 h-12 md:h-8 md:max-w-xs font-medium text-base transition-all duration-200 active:scale-98 sm:active:scale-100 ${className || ''}`}
      {...props}
    >
      {Icon && leadingIcon && <Icon className="h-4 w-4 mr-2" />}
      <span className="inline">{children}</span>
      {Icon && !leadingIcon && <Icon className="h-4 w-4 ml-2" />}
    </Button>
  );
}
