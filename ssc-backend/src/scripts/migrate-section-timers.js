import mongoose from "mongoose";
import Quiz from "../models/Quiz.js";
import dotenv from "dotenv";

dotenv.config();

async function migrateQuizzes() {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected!");

    console.log("🔍 Finding quizzes without sectionTime...");
    
    // Find all quizzes where at least one question is missing sectionTime
    const quizzes = await Quiz.find({
      questions: {
        $elemMatch: {
          type: "section",
          sectionTime: { $exists: false }
        }
      }
    });

    console.log(`📊 Found ${quizzes.length} quizzes to migrate`);

    let updated = 0;
    for (const quiz of quizzes) {
      let needsUpdate = false;

      // Update each question to add sectionTime if missing
      quiz.questions = quiz.questions.map((q) => {
        if (q.type === "section" && !q.sectionTime) {
          needsUpdate = true;
          return {
            ...q,
            sectionTime: 0, // Set to 0 (no timer) for backward compatibility
            autoLock: q.autoLock || false,
          };
        }
        return q;
      });

      if (needsUpdate) {
        await quiz.save();
        updated++;
        console.log(`  ✅ Updated: ${quiz.title} (ID: ${quiz._id})`);
      }
    }

    console.log(`\n🎉 Migration complete! ${updated} quizzes updated.`);
    console.log("⚠️  Note: sectionTime is set to 0 for old quizzes.");
    console.log("💡 To use section timers, edit the quiz and set section times.");

    await mongoose.connection.close();
    console.log("✅ Database connection closed");
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
    process.exit(1);
  }
}

migrateQuizzes();
