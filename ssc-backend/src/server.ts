import { env } from "./config/env.js";
import { createApp } from "./config/app.js";
import connectDB from "./config/db.js";

export async function start() {
  await connectDB();

  const app = createApp();

  app.listen(env.PORT, () => {
    console.log(`[server] running on http://localhost:${env.PORT} (${env.NODE_ENV})`);
  });
}
