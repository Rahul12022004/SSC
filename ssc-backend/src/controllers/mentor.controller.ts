import type { Request, Response } from "express";
import { mentorService } from '../services/mentor.service';

export const mentorController = {
  async getAllMentors(req: Request, res: Response) {
    try {
      const mentors = await mentorService.getAllMentors();
      res.json({ success: true, mentors });
    } catch (error) {
      console.error("Get mentors error:", error);
      res.status(500).json({ success: false, message: "Failed to fetch mentors" });
    }
  },

  async getMentorById(req: Request, res: Response) {
    try {
      const mentor = await mentorService.getMentorById(req.params.id as string);
      if (!mentor) {
        return res.status(404).json({ success: false, message: "Mentor not found" });
      }
      res.json({ success: true, mentor });
    } catch (error) {
      console.error("Get mentor error:", error);
      res.status(500).json({ success: false, message: "Failed to fetch mentor" });
    }
  },

  async createMentor(req: Request, res: Response) {
    try {
      const { name, subject, description, achievements, imageUrl } = req.body;

      if (!name || !subject) {
        return res.status(400).json({ success: false, message: "Name and subject are required" });
      }

      const mentor = await mentorService.createMentor({
        name,
        subject,
        description,
        achievements,
        imageUrl,
      });

      res.status(201).json({ success: true, mentor });
    } catch (error) {
      console.error("Create mentor error:", error);
      res.status(500).json({ success: false, message: "Failed to create mentor" });
    }
  },

  async updateMentor(req: Request, res: Response) {
    try {
      const { name, subject, description, achievements, imageUrl } = req.body;

      const mentor = await mentorService.updateMentor(req.params.id as string, {
        name,
        subject,
        description,
        achievements,
        imageUrl,
      });

      if (!mentor) {
        return res.status(404).json({ success: false, message: "Mentor not found" });
      }

      res.json({ success: true, mentor });
    } catch (error) {
      console.error("Update mentor error:", error);
      res.status(500).json({ success: false, message: "Failed to update mentor" });
    }
  },

  async deleteMentor(req: Request, res: Response) {
    try {
      const mentor = await mentorService.deleteMentor(req.params.id as string);

      if (!mentor) {
        return res.status(404).json({ success: false, message: "Mentor not found" });
      }

      res.json({ success: true, message: "Mentor deleted successfully" });
    } catch (error) {
      console.error("Delete mentor error:", error);
      res.status(500).json({ success: false, message: "Failed to delete mentor" });
    }
  },
};
