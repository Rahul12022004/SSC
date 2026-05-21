const env = {
  apiUrl: import.meta.env.VITE_API_URL ?? "http://localhost:5000/api",
  recaptchaSiteKey: import.meta.env.VITE_RECAPTCHA_SITE_KEY ?? "",
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
} as const;

export default env;
