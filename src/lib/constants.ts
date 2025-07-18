export const BIDS_PATH = 'src/db/bids.json'
export const COLLECTIONS_PATH = 'src/db/collections.json'
export const USERS_PATH = 'src/db/users.json'

export const GLOBAL = 'global'
export const UNKNOWN = 'unknown'
export const WARNING = 'danger'
export const DANGER = 'danger'
export const AUTH = 'auth'
export const INFO = 'info'
export const DEBUG = 'debug'

export const STATUS = {
	SUCCESS: 'success',
	ERROR: 'error',
	LOADING: 'loading',
	NOT_FOUND: 'not_found',
	UNAUTHORIZED: 'unauthorized',
	FORBIDDEN: 'forbidden',
	BAD_REQUEST: 'bad_request',
	SERVER_ERROR: 'server_error',
}

export const ALERT_THRESHOLDS = {
	warning: 75,
	danger: 90,
}

export const STATUS_CODES = {
	200: 'OK',
	201: 'Created',
	204: 'No Content',
	400: 'Bad Request',
	401: 'Unauthorized',
	403: 'Forbidden',
	404: 'Not Found',
	500: 'Internal Server Error',
	502: 'Bad Gateway',
	503: 'Service Unavailable',
	504: 'Gateway Timeout',
}

export const { SUCCESS, ERROR, LOADING, NOT_FOUND, UNAUTHORIZED, FORBIDDEN, BAD_REQUEST, SERVER_ERROR } =
	STATUS

export const API_ENDPOINTS = {
	bids: '/api/bids',
	collections: '/api/collections',
	users: '/api/users',
	alerts: '/api/alerts',
	engagement: '/api/engagement',
	health: '/api/health',
	metrics: '/api/metrics',
	testError: '/api/test-error',
	testSlow: '/api/test-slow',
	uptime: '/api/uptime',
}

export const API_METHODS = {
	GET: 'GET',
	POST: 'POST',
	PUT: 'PUT',
	DELETE: 'DELETE',
} as const

export type API_METHODS = (typeof API_METHODS)[keyof typeof API_METHODS]

export const { GET, POST, PUT, DELETE } = API_METHODS

export const MODAL_CATEGORY = {
	COLLECTION: 'collection',
	BID: 'bid',
} as const

export const CONTENT_TYPE_JSON = 'application/json'

export const LOG_TYPES = {
	INCOMING_REQUEST: 'incoming_request',
	RESPONSE_SENT: 'response_sent',
	USER_ENGAGEMENT: 'user_engagement',
	HEALTH_CHECK: 'health_check',
}

export const ALERT_ACTIONS = {
	TEST: 'test',
	RESET: 'reset',
}

export const HEALTH_CHECK_SERVICES = {
	DATABASE: 'database',
	EXTERNAL_APIS: 'external_apis',
	MEMORY_USAGE: 'memory_usage',
	FILE_SYSTEM: 'file_system',
}

export const API_ERRORS = {
	NOT_FOUND: 'Resource not found',
	UNAUTHORIZED: 'Unauthorized access',
	FORBIDDEN: 'Access forbidden',
	SERVER_ERROR: 'Internal server error',
	BAD_REQUEST: 'Bad request',
	CONFLICT: 'Conflict detected',
}

export const API_SUCCESS_MESSAGES = {
	CREATED: 'Resource created successfully',
	UPDATED: 'Resource updated successfully',
	DELETED: 'Resource deleted successfully',
	FETCHED: 'Resource fetched successfully',
}
