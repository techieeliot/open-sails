import { Bitcoin } from 'lucide-react'

import { DynamicInputDialog } from '@/app/dashboard/components/dynamic-input-dialog'
import { API_METHODS } from '@/lib/constants'

export const AcceptBidButton = () => {
	return (
		<DynamicInputDialog
			triggerText="Accept Bid"
			triggerIcon={Bitcoin}
			triggerAriaLabel="open dialog to accept a bid on the collection"
			dialogTitle="Accept Bid"
			dialogDescription="Fill out the form to accept a bid on this collection."
			modalCategory="bid"
			method={API_METHODS.PUT}
		/>
	)
}
AcceptBidButton.displayName = 'AcceptBidButton'
