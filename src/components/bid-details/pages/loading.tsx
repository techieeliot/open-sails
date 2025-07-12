import PageWrapper from '@/components/page-wrapper';
import { Bitcoin } from 'lucide-react';

export default function LoadingPage() {
  return (
    <PageWrapper>
      <div className="flex justify-center items-center min-h-[300px]">
        <p className="text-gray-600">
          <Bitcoin className="animate-pulse" height={300} width={300} />
        </p>
      </div>
    </PageWrapper>
  );
}
