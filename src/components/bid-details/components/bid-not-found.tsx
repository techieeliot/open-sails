import { ArrowLeft } from 'lucide-react';
import GoBackButton from '@/components/go-back-button.tsx';

export default function BidNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px]">
      <h1 className="text-2xl font-bold mb-4">Bid Not Found</h1>
      <p className="text-gray-600 mb-4">
        The bid you&apos;re looking for doesn&apos;t exist or may have been removed.
      </p>
      <GoBackButton icon={ArrowLeft} />
    </div>
  );
}
