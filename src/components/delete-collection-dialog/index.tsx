'use client'

import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { ConfirmationDialog } from '@/components/confirmation-dialog'

interface DeleteCollectionDialogProps {
	collectionId: number
	onSuccess?: () => void
}

export default function DeleteCollectionDialog({ collectionId, onSuccess }: DeleteCollectionDialogProps) {
	const [isDeleting, setIsDeleting] = useState(false)

	const handleDelete = async () => {
		try {
			setIsDeleting(true)

			const response = await fetch(`/api/collections/${collectionId}`, {
				method: 'DELETE',
			})

			if (response.ok) {
				toast.success('Collection deleted successfully')
				if (onSuccess) {
					onSuccess()
				}
			} else {
				const errorData = await response.text()
				toast.error('Failed to delete collection', {
					description: errorData || 'An unknown error occurred',
				})
			}
		} catch (error) {
			console.error('Error deleting collection:', error)
			toast.error('Failed to delete collection', {
				description: 'Please try again later',
			})
		} finally {
			setIsDeleting(false)
		}
	}

	return (
		<ConfirmationDialog
			triggerText="Delete"
			triggerIcon={Trash2}
			triggerVariant="destructive"
			triggerAriaLabel="delete this collection"
			dialogTitle="Delete Collection"
			dialogDescription="Are you sure you want to delete this collection? This action cannot be undone."
			onConfirm={handleDelete}
		/>
	)
}
