// ─── Auth ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  roleLevel: number;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

// ─── Quiz ────────────────────────────────────────────────────────────────────

export interface QuizOption {
  text: string;
  image?: string;
}

export interface QuizQuestion {
  _id?: string;
  type: string;
  answerType: "single" | "multiple" | "descriptive";
  question: unknown;
  questionImage?: string;
  options: QuizOption[];
  sectionTime?: number;
}

export interface Quiz {
  _id: string;
  title: string;
  duration?: number;
  negativeMarking?: boolean;
  negativeValue?: number;
  eachMarks?: number;
  questions: QuizQuestion[];
  scheduledAt?: string | null;
  endsAt?: string | null;
  quizType?: string;
  quizCode?: string;
  subject?: string;
  category?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuizSubmissionPayload {
  answers: Record<string, unknown>;
  timeTaken: number;
}

export interface QuizResult {
  score: number;
  total: number;
  correct: number;
  wrong: number;
  unattempted: number;
  percentage: number;
}

// ─── Courses ─────────────────────────────────────────────────────────────────

export interface Course {
  _id: string;
  title: string;
  description?: string;
  image?: string;
  category?: string;
  price?: number;
  createdAt: string;
}

export interface Category {
  _id: string;
  name: string;
  slug?: string;
}

// ─── API wrapper ─────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}
