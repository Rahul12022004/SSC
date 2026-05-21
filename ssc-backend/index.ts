import "dotenv/config";
import { start } from "./src/server.js";

start().catch((err) => {
  console.error("[fatal]", err);
  process.exit(1);
});
