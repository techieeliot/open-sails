import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

import PageWrapper from '@/components/page-wrapper';
import { Button } from '@/components/ui/button';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Buttons - Open Sails',
  description: 'A playground for testing different button styles and states',
};

export default function PlaygroundButtonsPage() {
  return (
    <PageWrapper>
      <div className="flex min-h-screen flex-col items-center gap-10 bg-background text-foreground">
        <h1 className="mb-2 font-bold text-3xl">Playground Buttons</h1>
        <p className="mb-6 text-lg opacity-80">This is a playground for testing buttons.</p>
        <div className="flex w-full flex-col flex-wrap justify-center gap-4">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
          <Button variant="destructive">Destructive</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
          <Button disabled>Disabled</Button>
          <Button asChild>
            <Link href="#">asChild Link</Link>
          </Button>
          <Button>
            With Icon <ChevronRight className="ml-2" />
          </Button>
        </div>
      </div>
    </PageWrapper>
  );
}
