import type { NextRequest } from 'next/server'

import { logRequest, logResponse } from '@/lib/api-middleware'
import { API_ENDPOINTS, API_METHODS, CONTENT_TYPE_JSON, LOG_TYPES } from '@/lib/constants'
import { logger, MetricsTracker } from '@/lib/logger'

export async function GET(request: NextRequest) {
	const startTime = logRequest(request)
	const getEngagementPayload = {
		endpoint: API_ENDPOINTS.engagement,
		method: API_METHODS.GET,
		error: '',
		type: 'initial_get',
	}
	let response: Response

	try {
		const metrics = MetricsTracker.getInstance()
		const engagementData = metrics.getMetrics()
		response = new Response(JSON.stringify(engagementData), {
			headers: { 'Content-Type': CONTENT_TYPE_JSON },
		})
		logger.info({ ...getEngagementPayload, type: 'engagement_metrics_fetched' }, 'Fetched engagement metrics')
	} catch (error) {
		logger.error(
			{ ...getEngagementPayload, error: (error as Error).message, type: 'engagement_fetch_error' },
			`Failed to fetch engagement metrics: ${(error as Error).message}`,
		)
		response = Response.json(
			{ error: `Failed to fetch engagement metrics: ${(error as Error).message}` },
			{ status: 500 },
		)
	}
	logResponse(request, response, startTime)
	return response
}

export async function POST(request: NextRequest) {
	const startTime = logRequest(request)
	let response: Response

	const postEngagementPayload = {
		endpoint: API_ENDPOINTS.engagement,
		method: API_METHODS.POST,
		error: '',
		type: 'initial_post',
	}
	try {
		const { action, userId, metadata, timestamp } = await request.json()
		// Track engagement metrics
		const metrics = MetricsTracker.getInstance()
		metrics.trackUserEngagement(action, userId)
		// Log detailed engagement data
		logger.info(
			{
				...postEngagementPayload,
				action,
				userId,
				metadata,
				timestamp,
				userAgent: request.headers.get('user-agent'),
				ip: request.headers.get('x-forwarded-for'),
				type: LOG_TYPES.USER_ENGAGEMENT,
			},
			`User engagement: ${action}`,
		)
		response = new Response(
			JSON.stringify({
				message: 'Engagement tracked successfully',
				timestamp: new Date().toISOString(),
			}),
			{
				headers: { 'Content-Type': CONTENT_TYPE_JSON },
			},
		)
	} catch (error) {
		logger.error(
			{
				...postEngagementPayload,
				error: (error as Error).message,
				type: 'engagement_tracking_error',
			},
			`Failed to track engagement: ${(error as Error).message}`,
		)
		response = Response.json(
			{ error: `Failed to track engagement: ${(error as Error).message}` },
			{ status: 500 },
		)
	}
	logResponse(request, response, startTime)
	return response
}
