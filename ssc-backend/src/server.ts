import { env } from './config/env';
import { createApp } from './config/app';
import connectDB from './config/db';

export async function start() {
  await connectDB();

  const app = createApp();

  app.listen(env.PORT, () => {
    console.log(`[server] running on http://localhost:${env.PORT} (${env.NODE_ENV})`);
  });
}
