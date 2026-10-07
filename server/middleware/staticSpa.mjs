import express from 'express';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

export function mountStaticSpa(app, distPath) {
  const indexPath = resolve(distPath, 'index.html');
  if (!existsSync(indexPath)) return;
  app.use(express.static(distPath));
  // Express 5 requires a named wildcard; root must also match for SPA entry.
  app.get('/{*path}', (_req, res) => res.sendFile(indexPath));
}
