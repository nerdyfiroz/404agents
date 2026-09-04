import { Pool } from '@neondatabase/serverless';

let pool: Pool | null = null;

export function getDbPool() {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL is not defined in environment variables');
    }
    pool = new Pool({ connectionString });
  }
  return pool;
}
