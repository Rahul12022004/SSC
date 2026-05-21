import http from "./http";
import type { Course, Category } from "@/types";

export const coursesService = {
  getAll: () => http.get<Course[]>("/courses").then((r) => r.data),
  getById: (id: string) => http.get<Course>(`/courses/${id}`).then((r) => r.data),
  getCategories: () => http.get<Category[]>("/categories").then((r) => r.data),
};
