import mongoose, { type Document, type Model } from "mongoose";

export interface IVisitor extends Document {
  count: number;
}

const visitorSchema = new mongoose.Schema<IVisitor>({
  count: { type: Number, default: 0 },
});

export const Visitor: Model<IVisitor> =
  mongoose.models.Visitor ?? mongoose.model<IVisitor>("Visitor", visitorSchema);
