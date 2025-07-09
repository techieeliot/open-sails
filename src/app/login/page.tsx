import { LoginForm } from '@/components/login-form';
import PageWrapper from '@/components/page-wrapper';

export default function LoginPage() {
  return (
    <PageWrapper>
      <h1 className="text-2xl font-bold mb-4">Login Page</h1>
      <LoginForm />
    </PageWrapper>
  );
}
