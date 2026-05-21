import axios, { type AxiosError } from "axios";
import env from "@/config/env";

const http = axios.create({
  baseURL: env.apiUrl,
  withCredentials: true,
  timeout: 30000,
});

const PUBLIC_PATHS = ["/", "/login", "/register"];

http.interceptors.response.use(
  (res) => res,
  (err: AxiosError) => {
    const status = err.response?.status;
    const message = (err.response?.data as { message?: string })?.message || err.message;

    if (status === 401) {
      const path = window.location.pathname;
      const isPublic = PUBLIC_PATHS.some((p) => path === p || path.startsWith("/login") || path.startsWith("/register"));
      if (!isPublic) {
        window.location.href = "/login";
      }
    } else if (status === 403) {
      console.error("Access denied:", message);
    } else if (status === 404) {
      console.error("Resource not found:", message);
    } else if (status && status >= 500) {
      console.error("Server error:", message);
    } else if (err.code === "ECONNABORTED") {
      console.error("Request timeout");
    } else if (!err.response) {
      console.error("Network error - check connection");
    }

    return Promise.reject(err);
  }
);

export default http;
