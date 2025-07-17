import { Metadata } from 'next';

import { LoginForm } from '@/components/login-form';
import PageWrapper from '@/components/page-wrapper';

export const metadata: Metadata = {
  title: 'Login',
  description: 'Login to your account',
  keywords: ['login', 'authentication'],
  openGraph: {
    title: 'Login',
    description: 'Login to your account',
    url: '/login',
    type: 'website',
  },
  twitter: {
    title: 'Login',
    description: 'Login to your account',
  },
  icons: {
    icon: '/favicon.ico',
  },
  alternates: {
    canonical: '/login',
  },
};

export default function LoginPage() {
  return (
    <PageWrapper>
      <div className="w-full min-h-screen flex items-center justify-center bg-background text-foreground">
        <LoginForm />
      </div>
    </PageWrapper>
  );
}
