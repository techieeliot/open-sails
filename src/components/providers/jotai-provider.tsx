'use client';

import { jotaiStore } from '@/lib/atoms';
import { Provider } from 'jotai';
import { ReactNode } from 'react';

export default function JotaiProvider({ children }: { children: ReactNode }) {
  return <Provider store={jotaiStore}>{children}</Provider>;
}
