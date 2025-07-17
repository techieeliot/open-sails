import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import PageWrapper from '@/components/page-wrapper';
import { Button } from '@/components/ui/button';

export default function PlaygroundButtonsPage() {
  return (
    <PageWrapper>
      <div className="flex flex-col items-center gap-10 min-h-screen bg-background text-foreground">
        <h1 className="text-3xl font-bold mb-2">Playground Buttons</h1>
        <p className="mb-6 text-lg opacity-80">This is a playground for testing buttons.</p>
        <div className="flex flex-col flex-wrap gap-4 justify-center w-full">
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
