import type { NextRequest } from 'next/server'

import { seedDatabase } from '@/db'
import { logRequest, logResponse } from '@/lib/api-middleware'
import { logger, PerformanceTracker } from '@/lib/logger'

import { getUsers } from './utils'

export async function GET(request: NextRequest) {
	const startTime = logRequest(request)
	let response: Response

	const getUsersPayload = {
		endpoint: '/api/users',
		method: 'GET',
		error: '',
		type: 'initial_get',
	}
	try {
		await seedDatabase()
		const tracker = new PerformanceTracker('GET /api/users')
		const { searchParams } = new URL(request.url)
		const userIdStr = searchParams.get('id')
		logger.info(
			{ ...getUsersPayload, userId: userIdStr || 'all', type: 'users_fetch_started' },
			userIdStr ? `Fetching user: ${userIdStr}` : 'Fetching all users',
		)
		const users = await getUsers()
		if (userIdStr) {
			const userId = parseInt(userIdStr, 10)
			const user = users.find((u) => u.id === userId)
			if (!user) {
				logger.warn({ ...getUsersPayload, userId, type: 'user_not_found' }, `User not found: ${userId}`)
				response = Response.json({ error: 'User not found' }, { status: 404 })
				logResponse(request, response, startTime)
				return response
			}
			tracker.finish({ userId })
			response = new Response(JSON.stringify(user), {
				headers: { 'Content-Type': 'application/json' },
			})
			logger.info(
				{ ...getUsersPayload, userId, type: 'user_fetched' },
				`Successfully fetched user: ${userId}`,
			)
		} else {
			tracker.finish({ count: users.length })
			response = new Response(JSON.stringify(users), {
				headers: { 'Content-Type': 'application/json' },
			})
			logger.info(
				{ ...getUsersPayload, usersCount: users.length, type: 'users_fetched' },
				`Fetched ${users.length} users`,
			)
		}
	} catch (error) {
		logger.error(
			{ ...getUsersPayload, error: (error as Error).message, type: 'users_fetch_error' },
			`Failed to fetch users: ${(error as Error).message}`,
		)
		response = Response.json({ error: `Failed to fetch users: ${(error as Error).message}` }, { status: 500 })
	}
	logResponse(request, response, startTime)
	return response
}
