'use client'

import { Provider } from 'jotai'
import type { ReactNode } from 'react'

import { jotaiStore } from '@/lib/atoms'

export default function JotaiProvider({ children }: { children: ReactNode }) {
	return <Provider store={jotaiStore}>{children}</Provider>
}
