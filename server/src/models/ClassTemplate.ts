import { Schema, model } from "mongoose";

export type ClassType = "BJJ" | "MMA" | "Cross";
export type ClassLevel = "beginner" | "intermediate" | "advanced";

const ClassTemplateSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ["BJJ", "MMA", "Cross"], required: true },
    level: { type: String, enum: ["beginner", "intermediate", "advanced"], required: true },

    durationMin: { type: Number, min: 15, max: 240, required: true, default: 60 },
    defaultCapacity: { type: Number, min: 1, max: 200, required: true, default: 12 },

    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

ClassTemplateSchema.index({ name: 1, type: 1, level: 1 }, { unique: true });

export const ClassTemplate = model("ClassTemplate", ClassTemplateSchema);
