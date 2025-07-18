// Simple test script to verify environment loading
import { config } from 'dotenv';
import path from 'node:path';
import fs from 'node:fs';

// Log script startup
console.log('Script started');

// Check if .env.production exists
const envPath = path.resolve(process.cwd(), '.env.production');
console.log('Checking for .env file at:', envPath);
console.log('File exists:', fs.existsSync(envPath));

// Load environment variables
try {
  console.log('Loading environment variables');
  config({ path: '.env.production' });
  console.log('Environment loaded');
  console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);

  // Print masked database URL if it exists (for security)
  if (process.env.DATABASE_URL) {
    const url = process.env.DATABASE_URL;
    const maskedUrl = url.replace(/\/\/([^:]+):([^@]+)@/, '//****:****@');
    console.log('DATABASE_URL:', maskedUrl);
  }
} catch (error) {
  console.error('Error loading environment:', error);
}

console.log('Script completed');
