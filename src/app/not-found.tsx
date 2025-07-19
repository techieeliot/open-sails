import { NotFoundContent } from '@/components/not-found-content';
import PageWrapper from '@/components/page-wrapper';

export const metadata = {
  title: 'Page Not Found - Open Sails',
  description: 'The page you are looking for does not exist or has been moved.',
};

export default function NotFoundPage() {
  return (
    <PageWrapper>
      <NotFoundContent />
    </PageWrapper>
  );
}
