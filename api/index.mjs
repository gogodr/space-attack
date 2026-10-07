import { createApp } from '../server/app.mjs';

// Vercel owns request handling and scaling; do not open a listening socket here.
export default createApp().app;
