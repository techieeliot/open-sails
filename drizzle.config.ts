import { config } from 'dotenv'
import { defineConfig } from 'drizzle-kit'

config({ path: '.env.production' })

export default defineConfig({
	dialect: 'postgresql',
	schema: './src/db/schema.ts',
	out: './drizzle',
	dbCredentials: {
		url: process.env.DATABASE_URL!,
	},
})
