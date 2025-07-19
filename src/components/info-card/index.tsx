// src/components/info-card/index.tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import React from 'react';

interface InfoCardProps {
  title: React.ReactNode;
  color?:
    | 'primary'
    | 'secondary'
    | 'muted'
    | 'destructive'
    | 'blue'
    | 'yellow'
    | 'slate'
    | 'emerald'
    | 'amber';
  className?: string;
  children: React.ReactNode;
}

const colorMap = {
  primary: 'border-primary/20 bg-primary/10 text-primary-200',
  secondary: 'border-secondary/20 bg-secondary/10 text-secondary-200',
  muted: 'border-muted/20 bg-muted/10 text-muted-200',
  destructive: 'border-destructive/20 bg-destructive/10 text-destructive-200',
  blue: 'border-blue-500/20 bg-blue-500/10 text-blue-200',
  yellow: 'border-yellow-500/20 bg-yellow-500/10 text-yellow-200',
  slate: 'border-slate-600 bg-slate-800 text-slate-300',
  emerald: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200',
  amber: 'border-amber-500/20 bg-amber-500/10 text-amber-200',
};

export function InfoCard({ title, color = 'blue', className, children }: InfoCardProps) {
  return (
    <Card className={cn(colorMap[color], className)}>
      <CardHeader>
        <CardTitle
          className={cn(
            'text-xl font-semibold mb-4',
            color === 'primary' && 'text-primary-400',
            color === 'secondary' && 'text-secondary-400',
            color === 'muted' && 'text-muted-400',
            color === 'destructive' && 'text-destructive-400',
            color === 'blue' && 'text-blue-400',
            color === 'yellow' && 'text-yellow-400',
            color === 'slate' && 'text-white',
            color === 'emerald' && 'text-emerald-400',
            color === 'amber' && 'text-amber-400',
          )}
        >
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
InfoCard.displayName = 'InfoCard';
