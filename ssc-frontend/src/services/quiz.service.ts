import http from "./http";
import type { Quiz, QuizSubmissionPayload, QuizResult } from "@/types";

export const quizService = {
  getAll: () => http.get<Quiz[]>("/quizzes").then((r) => r.data),

  getById: (id: string) => http.get<Quiz>(`/quizzes/${id}`).then((r) => r.data),

  submit: (id: string, payload: QuizSubmissionPayload) =>
    http.post<QuizResult>(`/quizzes/${id}/submit`, payload).then((r) => r.data),

  create: (data: Partial<Quiz>) => http.post<Quiz>("/quizzes", data).then((r) => r.data),

  update: (id: string, data: Partial<Quiz>) =>
    http.put<Quiz>(`/quizzes/${id}`, data).then((r) => r.data),

  delete: (id: string) => http.delete(`/quizzes/${id}`).then((r) => r.data),
};
