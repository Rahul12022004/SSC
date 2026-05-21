import { Course, type ICourse, type IBlock } from "../models/course.model.js";
import { AppError } from "../middleware/error.js";

export const coursesService = {
  async findAll(): Promise<ICourse[]> {
    return Course.find().sort({ order: 1, createdAt: 1 }).lean().exec();
  },

  async findById(id: string): Promise<ICourse> {
    const course = await Course.findById(id);
    if (!course) throw new AppError(404, "Course not found");
    return course;
  },

  async create(data: { name: string; description?: string; imageUrl?: string; status?: ICourse["status"]; order?: number }): Promise<ICourse> {
    const count = await Course.countDocuments();
    return Course.create({
      name: data.name,
      description: data.description ?? "",
      imageUrl: data.imageUrl ?? "",
      status: data.status ?? "coming_soon",
      order: data.order ?? count,
    });
  },

  async update(id: string, data: Partial<Pick<ICourse, "name" | "description" | "imageUrl" | "status" | "order">>): Promise<ICourse> {
    const course = await Course.findByIdAndUpdate(id, data, { returnDocument: 'after', runValidators: true });
    if (!course) throw new AppError(404, "Course not found");
    return course;
  },

  async delete(id: string): Promise<void> {
    const course = await Course.findByIdAndDelete(id);
    if (!course) throw new AppError(404, "Course not found");
  },

  async addBlock(courseId: string, data: Pick<IBlock, "title" | "description" | "videoUrl" | "pdfUrl">): Promise<IBlock> {
    const course = await Course.findById(courseId);
    if (!course) throw new AppError(404, "Course not found");
    if (!data.title?.trim()) throw new AppError(400, "Title required");
    course.blocks.push({ title: data.title.trim(), description: data.description?.trim() ?? "", videoUrl: data.videoUrl?.trim() ?? "", pdfUrl: data.pdfUrl?.trim() ?? "", order: course.blocks.length } as IBlock);
    await course.save();
    return course.blocks[course.blocks.length - 1];
  },

  async updateBlock(courseId: string, blockId: string, data: Partial<IBlock>): Promise<IBlock> {
    const course = await Course.findById(courseId);
    if (!course) throw new AppError(404, "Course not found");
    const block = course.blocks.id(blockId);
    if (!block) throw new AppError(404, "Block not found");
    if (data.title?.trim()) block.title = data.title.trim();
    if (data.description !== undefined) block.description = data.description?.trim() ?? "";
    if (data.videoUrl !== undefined) block.videoUrl = data.videoUrl?.trim() ?? "";
    if (data.pdfUrl !== undefined) block.pdfUrl = data.pdfUrl?.trim() ?? "";
    if (data.order !== undefined) block.order = data.order;
    await course.save();
    return block;
  },

  async deleteBlock(courseId: string, blockId: string): Promise<void> {
    const course = await Course.findById(courseId);
    if (!course) throw new AppError(404, "Course not found");
    course.blocks.pull(blockId);
    await course.save();
  },
};
