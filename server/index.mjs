import { createApp } from './app.mjs';

const port = Number(process.env.PORT || 3001);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be an integer between 1 and 65535.');
}

const { app, close } = createApp();
const server = app.listen(port, process.env.HOST || '127.0.0.1', () => {
  console.log(`Space Attack server listening on port ${port}`);
});
server.on('error', (error) => {
  console.error(error.message);
  close();
  process.exitCode = 1;
});

let shuttingDown = false;
function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;
  server.close(() => {
    close();
  });
  server.closeIdleConnections();
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
