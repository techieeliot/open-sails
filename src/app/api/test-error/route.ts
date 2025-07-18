import type { NextRequest } from 'next/server'

import { logRequest, logResponse } from '@/lib/api-middleware'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest) {
	const startTime = logRequest(request)
	let response: Response

	try {
		// Simulate random errors to test error rate alerting
		const shouldError = Math.random() < 0.7 // 70% chance of error for testing

		if (shouldError) {
			throw new Error('Simulated error for testing error rate alerts')
		}

		const testData = {
			message: 'This endpoint simulates errors for testing error rate alerts',
			timestamp: new Date().toISOString(),
			success: true,
		}

		response = Response.json(testData)

		logger.info(
			{
				endpoint: '/api/test-error',
				method: GET,
				success: true,
				type: 'test_error_endpoint',
			},
			'Test error endpoint accessed successfully',
		)
	} catch (error) {
		logger.error(
			{
				endpoint: '/api/test-error',
				method: GET,
				error: (error as Error).message,
				type: 'test_error_endpoint_error',
			},
			`Test error endpoint failed: ${(error as Error).message}`,
		)

		response = Response.json(
			{
				error: 'Simulated error',
				message: (error as Error).message,
				timestamp: new Date().toISOString(),
			},
			{ status: 500 },
		)
	}

	logResponse(request, response, startTime)
	return response
}
