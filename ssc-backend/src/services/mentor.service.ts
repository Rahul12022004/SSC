import { Mentor } from "../models/mentor.model.js";

export const mentorService = {
  async getAllMentors() {
    return await Mentor.find().sort({ createdAt: -1 });
  },

  async getMentorById(id: string) {
    return await Mentor.findById(id);
  },

  async createMentor(data: {
    name: string;
    subject: string;
    description?: string;
    achievements?: string;
    imageUrl?: string;
  }) {
    const mentor = new Mentor(data);
    return await mentor.save();
  },

  async updateMentor(
    id: string,
    data: {
      name?: string;
      subject?: string;
      description?: string;
      achievements?: string;
      imageUrl?: string;
    }
  ) {
    return await Mentor.findByIdAndUpdate(id, data, { returnDocument: 'after' });
  },

  async deleteMentor(id: string) {
    return await Mentor.findByIdAndDelete(id);
  },
};
