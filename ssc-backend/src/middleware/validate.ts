import type { RequestHandler } from "express";
import { type ZodSchema } from "zod";

type Target = "body" | "params" | "query";

export const validate =
  (schema: ZodSchema, target: Target = "body"): RequestHandler =>
  (req, _res, next) => {
    const result = schema.safeParse(req[target]);
    if (!result.success) {
      next(result.error);
      return;
    }
    req[target] = result.data;
    next();
  };
