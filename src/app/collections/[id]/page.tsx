import PageWrapper from '@/components/page-wrapper';
import Link from 'next/link';

export default async function CollectionDetailsPage() {
  return (
    <PageWrapper>
      <Link href="/dashboard">
        <p className="text-blue-500">Back to Dashboard</p>
      </Link>
      <h1 className="text-2xl font-bold mb-4">Collection Details</h1>
      <p className="mb-4">Here you can view and manage the details of the collection.</p>
    </PageWrapper>
  );
}
