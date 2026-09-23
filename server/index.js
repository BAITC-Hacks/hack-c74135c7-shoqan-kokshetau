import { createStore } from './store.js';
import { createApp } from './app.js';

const store = createStore(process.env.DATABASE_PATH);
const server = createApp(store, { origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173' });
const port = Number(process.env.PORT || 3001);
const host = process.env.HOST || '127.0.0.1';
server.listen(port, host, () => console.log(`API: http://${host}:${port}`));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(() => { store.close(); process.exit(0); }));
