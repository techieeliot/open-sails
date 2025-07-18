import { db } from '../src/db'
import { sql } from 'drizzle-orm'

async function clearDatabase() {
	try {
		console.log('Dropping all tables...')
		await db.execute(sql`DROP TABLE IF EXISTS bids CASCADE;`)
		await db.execute(sql`DROP TABLE IF EXISTS collections CASCADE;`)
		await db.execute(sql`DROP TABLE IF EXISTS users CASCADE;`)
		console.log('Tables dropped successfully.')
	} catch (error) {
		console.error('Error clearing database:', error)
		process.exit(1)
	}
}

clearDatabase()
