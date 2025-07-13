import { Button } from '../ui/button';
import { VariantProps } from 'class-variance-authority';
import { LucideIcon } from 'lucide-react';

export default function TriggerIconButton({
  icon: Icon,
  children,
  ...props
}: {
  icon?: LucideIcon;
} & VariantProps<typeof Button>) {
  return (
    <Button {...props}>
      {Icon && <Icon className="h-5 w-5" />}
      <span className="hidden md:inline">{children}</span>
    </Button>
  );
}
