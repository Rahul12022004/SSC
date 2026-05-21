import http from "./http";
import type { LoginPayload, RegisterPayload, AuthUser } from "@/types";

export const authService = {
  login: async (data: LoginPayload) => {
    const res = await http.post<{ token: string; user: AuthUser }>("/auth/login", data);
    return res.data.user;
  },

  register: (data: RegisterPayload) =>
    http.post<{ message: string }>("/auth/register", data).then((r) => r.data),

  verifyOtp: (email: string, otp: string) =>
    http.post<{ token: string; user: AuthUser }>("/auth/verify-otp", { email, otp }),

  me: () => http.get<AuthUser>("/auth/me").then((r) => r.data),

  logout: () => http.post("/auth/logout"),
};
