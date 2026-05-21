import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createApp } from "../config/app.js";
import { start } from "../server.js";
import type { Server } from "http";

let server: Server;

beforeAll(async () => {
  const app = createApp();
  server = app.listen(5001);
  await new Promise((resolve) => setTimeout(resolve, 500));
});

afterAll(() => {
  server?.close();
});

describe("Health Check", () => {
  it("should return healthy status", async () => {
    const response = await fetch("http://localhost:5001/health");
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.status).toBe("healthy");
    expect(data).toHaveProperty("uptime");
    expect(data).toHaveProperty("memory");
  });
});
