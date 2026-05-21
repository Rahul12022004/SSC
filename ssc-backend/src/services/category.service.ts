import { Category, COLORS, type ICategory } from "../models/category.model.js";
import { AppError } from "../middleware/error.js";

export const categoryService = {
  async findAll(): Promise<ICategory[]> {
    return Category.find().sort({ createdAt: 1 });
  },

  async create(name: string, icon?: string): Promise<ICategory> {
    if (!name?.trim()) throw new AppError(400, "Name required");
    const count = await Category.countDocuments();
    try {
      return await Category.create({ name: name.trim(), icon: icon?.trim() ?? "📝", color: COLORS[count % COLORS.length] });
    } catch (err: unknown) {
      if ((err as { code?: number }).code === 11000) throw new AppError(409, "Category already exists");
      throw err;
    }
  },

  async delete(id: string): Promise<void> {
    await Category.findByIdAndDelete(id);
  },

  async addSubject(categoryId: string, name: string, icon?: string): Promise<ICategory> {
    if (!name?.trim()) throw new AppError(400, "Name required");
    const category = await Category.findById(categoryId);
    if (!category) throw new AppError(404, "Category not found");
    const color = COLORS[category.subjects.length % COLORS.length];
    category.subjects.push({ name: name.trim(), icon: icon?.trim() ?? "📚", color, subSubjects: [], mockGroups: [] } as never);
    await category.save();
    return category;
  },

  async deleteSubject(categoryId: string, subjectId: string): Promise<ICategory> {
    const category = await Category.findById(categoryId);
    if (!category) throw new AppError(404, "Category not found");
    category.subjects = category.subjects.filter((s) => s._id.toString() !== subjectId) as typeof category.subjects;
    await category.save();
    return category;
  },

  async addSubSubject(categoryId: string, subjectId: string, name: string, icon?: string): Promise<ICategory> {
    if (!name?.trim()) throw new AppError(400, "Name required");
    const category = await Category.findById(categoryId);
    if (!category) throw new AppError(404, "Category not found");
    const subject = category.subjects.id(subjectId);
    if (!subject) throw new AppError(404, "Subject not found");
    const color = COLORS[(subject.subSubjects?.length ?? 0) % COLORS.length];
    subject.subSubjects.push({ name: name.trim(), icon: icon?.trim() ?? "📖", color } as never);
    await category.save();
    return category;
  },

  async deleteSubSubject(categoryId: string, subjectId: string, subSubId: string): Promise<ICategory> {
    const category = await Category.findById(categoryId);
    if (!category) throw new AppError(404, "Category not found");
    const subject = category.subjects.id(subjectId);
    if (!subject) throw new AppError(404, "Subject not found");
    subject.subSubjects = subject.subSubjects.filter((s) => s._id.toString() !== subSubId) as typeof subject.subSubjects;
    await category.save();
    return category;
  },

  async addMockGroup(categoryId: string, subjectId: string, data: { name: string; icon?: string; mockType: "full" | "sectional" }): Promise<ICategory> {
    if (!data.name?.trim()) throw new AppError(400, "Name required");
    if (!["full", "sectional"].includes(data.mockType)) throw new AppError(400, "Invalid mockType");
    const category = await Category.findById(categoryId);
    if (!category) throw new AppError(404, "Category not found");
    const subject = category.subjects.id(subjectId);
    if (!subject) throw new AppError(404, "Subject not found");
    const count = (subject.mockGroups ?? []).filter((g) => g.mockType === data.mockType).length;
    const color = COLORS[count % COLORS.length];
    subject.mockGroups.push({ name: data.name.trim(), icon: data.icon?.trim() ?? "📋", color, mockType: data.mockType } as never);
    await category.save();
    return category;
  },

  async deleteMockGroup(categoryId: string, subjectId: string, groupId: string): Promise<ICategory> {
    const category = await Category.findById(categoryId);
    if (!category) throw new AppError(404, "Category not found");
    const subject = category.subjects.id(subjectId);
    if (!subject) throw new AppError(404, "Subject not found");
    subject.mockGroups = (subject.mockGroups ?? []).filter((g) => g._id.toString() !== groupId) as typeof subject.mockGroups;
    await category.save();
    return category;
  },
};
