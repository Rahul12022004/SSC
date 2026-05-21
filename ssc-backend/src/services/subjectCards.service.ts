import { SubjectCard, type ISubjectCard, type ICardBlock } from '../models/subjectCard.model';
import { Quiz } from '../models/quiz.model';
import { AppError } from '../middleware/error';

export const subjectCardsService = {
  async findAll(): Promise<any[]> {
    const cards = await SubjectCard.find().sort({ order: 1, createdAt: 1 });
    return Promise.all(
      cards.map(async (card) => {
        const quizCount = await Quiz.countDocuments({ subjectCardId: card._id });
        return { ...card.toObject(), quizCount };
      })
    );
  },

  async findById(id: string): Promise<ISubjectCard> {
    const card = await SubjectCard.findById(id);
    if (!card) throw new AppError(404, "Card not found");
    return card;
  },

  async create(data: { name: string; description?: string; imageUrl?: string; order?: number; buttonText?: string; status?: ISubjectCard["status"] }): Promise<ISubjectCard> {
    if (!data.name?.trim()) throw new AppError(400, "Name required");
    const count = await SubjectCard.countDocuments();
    return SubjectCard.create({
      name: data.name.trim(),
      description: data.description?.trim() ?? "",
      imageUrl: data.imageUrl?.trim() ?? "",
      order: data.order ?? count,
      buttonText: data.buttonText?.trim() ?? "Start",
      status: data.status ?? "active",
    });
  },

  async update(id: string, data: Partial<ISubjectCard>): Promise<ISubjectCard> {
    const card = await SubjectCard.findByIdAndUpdate(id, data, { returnDocument: 'after', runValidators: true });
    if (!card) throw new AppError(404, "Card not found");
    return card;
  },

  async delete(id: string): Promise<void> {
    const quizCount = await Quiz.countDocuments({ subjectCardId: id });
    if (quizCount > 0) throw new AppError(400, `Cannot delete: ${quizCount} quiz(es) linked. Remove quizzes first.`);
    await SubjectCard.findByIdAndDelete(id);
  },

  async addBlock(cardId: string, data: Pick<ICardBlock, "title" | "description" | "videoUrl" | "pdfUrl">): Promise<ICardBlock> {
    if (!data.title?.trim()) throw new AppError(400, "Title required");
    const card = await SubjectCard.findById(cardId);
    if (!card) throw new AppError(404, "Card not found");
    card.blocks.push({ title: data.title.trim(), description: data.description?.trim() ?? "", videoUrl: data.videoUrl?.trim() ?? "", pdfUrl: data.pdfUrl?.trim() ?? "", order: card.blocks.length } as ICardBlock);
    await card.save();
    return card.blocks[card.blocks.length - 1];
  },

  async updateBlock(cardId: string, blockId: string, data: Partial<ICardBlock>): Promise<ICardBlock> {
    const card = await SubjectCard.findById(cardId);
    if (!card) throw new AppError(404, "Card not found");
    const block = card.blocks.id(blockId);
    if (!block) throw new AppError(404, "Block not found");
    if (data.title?.trim()) block.title = data.title.trim();
    if (data.description !== undefined) block.description = data.description?.trim() ?? "";
    if (data.videoUrl !== undefined) block.videoUrl = data.videoUrl?.trim() ?? "";
    if (data.pdfUrl !== undefined) block.pdfUrl = data.pdfUrl?.trim() ?? "";
    if (data.order !== undefined) block.order = data.order;
    await card.save();
    return block;
  },

  async deleteBlock(cardId: string, blockId: string): Promise<void> {
    const card = await SubjectCard.findById(cardId);
    if (!card) throw new AppError(404, "Card not found");
    card.blocks.pull(blockId);
    await card.save();
  },
};
