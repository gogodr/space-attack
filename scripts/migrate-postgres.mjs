import { openPostgres } from '../server/database/postgres.mjs';
import { migratePostgres } from '../server/database/postgresSchema.mjs';

await migratePostgres(openPostgres(process.env.DATABASE_URL));
console.log('Postgres schema initialized; existing scores preserved.');
