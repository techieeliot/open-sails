import type { NextRequest } from 'next/server'

import { logRequest, logResponse } from '@/lib/api-middleware'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest) {
	const startTime = logRequest(request)
	let response: Response

	try {
		// Simulate a slow operation to trigger alerts
		await new Promise((resolve) => setTimeout(resolve, 1200)) // 1.2 seconds

		const testData = {
			message: 'This is a test endpoint that simulates slow responses',
			timestamp: new Date().toISOString(),
			duration: 1200,
			purpose: 'Testing alert thresholds',
		}

		response = Response.json(testData)

		logger.info(
			{
				endpoint: '/api/test-slow',
				method: GET,
				simulatedDelay: 1200,
				type: 'test_slow_endpoint',
			},
			'Test slow endpoint accessed',
		)
	} catch (error) {
		logger.error(
			{
				endpoint: '/api/test-slow',
				method: GET,
				error: (error as Error).message,
				type: 'test_slow_error',
			},
			`Test slow endpoint failed: ${(error as Error).message}`,
		)

		response = Response.json(
			{
				error: 'Test endpoint failed',
				timestamp: new Date().toISOString(),
			},
			{ status: 500 },
		)
	}

	logResponse(request, response, startTime)
	return response
}
