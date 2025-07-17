import { Bitcoin } from 'lucide-react';

export default function LoadingIndicator() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <p className="text-gray-600">
        <Bitcoin className="animate-pulse" height={300} width={300} />
      </p>
    </div>
  );
}
