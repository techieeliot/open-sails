'use client'

import { useCallback } from 'react'

import { API_ENDPOINTS, API_METHODS } from '@/lib/constants'
import { MetricsTracker } from '@/lib/logger'

interface UserEngagementData {
	action: string
	userId?: string
	metadata?: Record<string, unknown>
}

export function useUserEngagement() {
	const trackEngagement = useCallback(async ({ action, userId, metadata }: UserEngagementData) => {
		try {
			// Track on client side
			const metrics = MetricsTracker.getInstance()
			metrics.trackUserEngagement(action, userId)

			// Send to server for persistent logging
			await fetch(API_ENDPOINTS.engagement, {
				method: API_METHODS.POST,
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					action,
					userId,
					metadata,
					timestamp: new Date().toISOString(),
				}),
			})
		} catch (error) {
			console.error('Failed to track user engagement:', error)
		}
	}, [])

	const trackPageView = useCallback(
		(page: string, userId?: string) => {
			trackEngagement({
				action: 'page_view',
				userId,
				metadata: { page },
			})
		},
		[trackEngagement],
	)

	const trackButtonClick = useCallback(
		(buttonId: string, userId?: string) => {
			trackEngagement({
				action: 'button_click',
				userId,
				metadata: { buttonId },
			})
		},
		[trackEngagement],
	)

	const trackFormSubmit = useCallback(
		(formId: string, userId?: string) => {
			trackEngagement({
				action: 'form_submit',
				userId,
				metadata: { formId },
			})
		},
		[trackEngagement],
	)

	const trackSearch = useCallback(
		(query: string, userId?: string) => {
			trackEngagement({
				action: 'search',
				userId,
				metadata: { query },
			})
		},
		[trackEngagement],
	)

	const trackCollectionAction = useCallback(
		(action: 'create' | 'update' | 'delete' | 'view', collectionId: string, userId?: string) => {
			trackEngagement({
				action: `collection_${action}`,
				userId,
				metadata: { collectionId },
			})
		},
		[trackEngagement],
	)

	const trackBidAction = useCallback(
		(action: 'create' | 'update' | 'delete' | 'view', bidId: string, userId?: string) => {
			trackEngagement({
				action: `bid_${action}`,
				userId,
				metadata: { bidId },
			})
		},
		[trackEngagement],
	)

	return {
		trackEngagement,
		trackPageView,
		trackButtonClick,
		trackFormSubmit,
		trackSearch,
		trackCollectionAction,
		trackBidAction,
	}
}
