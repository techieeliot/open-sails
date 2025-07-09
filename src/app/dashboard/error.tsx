'use client';

import PageWrapper from '@/components/page-wrapper';

export default function ErrorPage(props: { error: any }) {
  return (
    <PageWrapper>
      <h1 className="text-4xl font-bold">Something went wrong</h1>
      <p className="mt-4 text-lg">Please try again later.</p>
      {props.error && props.error && (
        <div className="mt-4 text-red-500">
          <p>Error details:</p>
          <pre>{JSON.stringify(props.error.toString())}</pre>
        </div>
      )}
    </PageWrapper>
  );
}
