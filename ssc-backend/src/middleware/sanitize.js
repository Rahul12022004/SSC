// Sanitize user input to prevent NoSQL injection
export const sanitizeInput = (req, res, next) => {
  const sanitize = (obj) => {
    if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
      Object.keys(obj).forEach(key => {
        // Remove MongoDB operators from user input
        if (key.startsWith('$') || key.startsWith('_')) {
          delete obj[key];
        } else if (typeof obj[key] === 'object') {
          sanitize(obj[key]);
        }
      });
    }
    return obj;
  };

  // Sanitize body (safe to reassign)
  if (req.body && typeof req.body === 'object') {
    sanitize(req.body);
  }

  // Sanitize query (mutate in place, don't reassign)
  if (req.query && typeof req.query === 'object') {
    sanitize(req.query);
  }

  // Sanitize params (mutate in place, don't reassign)
  if (req.params && typeof req.params === 'object') {
    sanitize(req.params);
  }
  
  next();
};
