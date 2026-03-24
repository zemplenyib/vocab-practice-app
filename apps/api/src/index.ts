import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import './db.js'; // run migrations on startup
import { wordsRouter } from './routes/words.js';
import { practiceRouter } from './routes/practice.js';
import listsRouter from './routes/lists.js';

const app = new Hono();

app.use('*', logger());
app.use('/api/*', cors());

app.get('/api/health', (c) => c.json({ status: 'ok' }));
app.route('/api/words', wordsRouter);
app.route('/api/practice', practiceRouter);
app.route('/api/lists', listsRouter);

// Serve static frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use('/*', serveStatic({ root: './public' }));
  app.get('/*', serveStatic({ path: './public/index.html' }));
}

const port = Number(process.env.PORT ?? 3000);
console.log(`Starting server on port ${port}`);

serve({ fetch: app.fetch, port });
