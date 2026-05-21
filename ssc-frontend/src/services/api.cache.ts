import http from "./http";

const cache = new Map<string, { data: any; timestamp: number }>();

const CACHE_TIME = 5 * 60 * 1000; // 5 minutes

const getCached = (key: string) => {
  const cached = cache.get(key);

  if (cached && Date.now() - cached.timestamp < CACHE_TIME) {
    return cached.data;
  }

  return null;
};

const setCache = (key: string, data: any) => {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
};

export const api = {
  async getQuizzes() {
    const cached = getCached("quizzes");

    if (cached) return cached;

    const res = await http.get("/quiz/all");

    setCache("quizzes", res.data);

    return res.data;
  },

  async getCategories() {
    const cached = getCached("categories");

    if (cached) return cached;

    const res = await http.get("/category");

    setCache("categories", res.data);

    return res.data;
  },

  async getCourses() {
    const cached = getCached("courses");

    if (cached) return cached;

    const res = await http.get("/courses");

    setCache("courses", res.data);

    return res.data;
  },

  async getSubjectCards() {
    const cached = getCached("subjectCards");

    if (cached) return cached;

    const res = await http.get("/subject-cards");

    setCache("subjectCards", res.data);

    return res.data;
  },

  clearCache(key?: string) {
    if (key) {
      cache.delete(key);
    } else {
      cache.clear();
    }
  },
};