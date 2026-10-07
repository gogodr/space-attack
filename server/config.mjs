import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));

export function resolveAppConfig({
  databasePath = process.env.DATABASE_PATH ||
    resolve(projectRoot, 'data/space-attack.sqlite'),
  distPath = resolve(projectRoot, 'dist'),
  rateLimits = true,
} = {}) {
  return { databasePath, distPath, rateLimits };
}
