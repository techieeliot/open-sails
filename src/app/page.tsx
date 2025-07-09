import PageWrapper from '@/components/page-wrapper';
import Link from 'next/link';

export default function Home() {
  return (
    <PageWrapper>
      <header className="flex items-center justify-center p-8">
        <h1 className="font-bold">Open Sails</h1>
      </header>
      <section className="flex flex-col items-center justify-center gap-8">
        {/* Authentication is optional (feel free to mock users), bonus if you can implement it. */}
        <Link href={true ? '/dashboard' : '/login'} className="text-lg font-semibold">
          Go to {true ? 'dashboard' : 'login'}
        </Link>
      </section>
    </PageWrapper>
  );
}
