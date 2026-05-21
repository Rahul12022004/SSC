import { Request, Response, NextFunction } from 'express';

export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  const sanitize = (obj: any) => {
    if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
      Object.keys(obj).forEach(key => {
        if (key.startsWith('$') || key.startsWith('_')) {
          delete obj[key];
        } else if (typeof obj[key] === 'object') {
          sanitize(obj[key]);
        }
      });
    }
    return obj;
  };

  if (req.body && typeof req.body === 'object') sanitize(req.body);
  if (req.query && typeof req.query === 'object') sanitize(req.query);
  if (req.params && typeof req.params === 'object') sanitize(req.params);

  next();
};
