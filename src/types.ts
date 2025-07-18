import type { DialogProps } from '@radix-ui/react-dialog'
import type { VariantProps } from 'class-variance-authority'
import type { LucideIcon } from 'lucide-react'

import type { Button } from './components/ui/button'

// Export the database types
export type { User, NewUser, Collection, NewCollection, Bid, NewBid } from './db/schema'

export interface DialogModalProps extends DialogProps, React.HTMLAttributes<HTMLDivElement> {
	triggerText: string
	triggerVariant?: VariantProps<typeof Button>['variant']
	triggerAriaLabel?: string
	triggerIcon?: LucideIcon
	fullWidthTrigger?: boolean
	dialogTitle?: string
	dialogDescription?: string
}
