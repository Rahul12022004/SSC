import { Quiz, type IQuiz } from '../models/quiz.model';
import { AppError } from '../middleware/error';

export const quizService = {
  async findAll(filter: Record<string, unknown> = {}): Promise<IQuiz[]> {
    return Quiz.find(filter)
      .select("-questions.correctAnswer")
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  },

  async findById(id: string): Promise<IQuiz> {
    const quiz = await Quiz.findById(id).select("-questions.correctAnswer").lean();
    if (!quiz) throw new AppError(404, "Quiz not found");
    return quiz;
  },

  async create(data: Partial<IQuiz>): Promise<IQuiz> {
    return Quiz.create(data);
  },

  async update(id: string, data: Partial<IQuiz>): Promise<IQuiz> {
    const quiz = await Quiz.findByIdAndUpdate(id, data, { returnDocument: 'after', runValidators: true });
    if (!quiz) throw new AppError(404, "Quiz not found");
    return quiz;
  },

  async delete(id: string): Promise<void> {
    const quiz = await Quiz.findByIdAndDelete(id);
    if (!quiz) throw new AppError(404, "Quiz not found");
  },
};
