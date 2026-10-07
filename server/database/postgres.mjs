import { neon } from '@neondatabase/serverless';

/** HTTP queries have no process-local connection or ephemeral filesystem state. */
export function openPostgres(databaseUrl) {
  if (!databaseUrl)
    throw new Error('DATABASE_URL is required for Vercel deployment.');
  const sql = neon(databaseUrl);
  return { query: (text, parameters = []) => sql.query(text, parameters) };
}
