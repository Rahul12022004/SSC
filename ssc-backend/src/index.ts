import "dotenv/config";
import { start } from "./server.js";

start().catch((err) => {
  console.error("[fatal]", err);
  process.exit(1);
});
