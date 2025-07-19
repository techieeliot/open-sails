import Link from 'next/link';
import { Button } from './ui/button';

export function NotFoundContent() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-lg opacity-80 mb-6">The page you are looking for does not exist.</p>
      <Button asChild>
        <Link href="/">Go back to Home</Link>
      </Button>
    </div>
  );
}
