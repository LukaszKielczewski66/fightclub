import { Schema, model, Types } from "mongoose";

export type SessionType = "BJJ" | "MMA" | "Cross";
export type SessionLevel = "beginner" | "intermediate" | "advanced";

const SessionSchema = new Schema(
  {
    name: { type: String, required: true },
    type: { type: String, enum: ["BJJ", "MMA", "Cross"], required: true },
    level: { type: String, enum: ["beginner", "intermediate", "advanced"], required: true },

    trainerId: { type: Types.ObjectId, ref: "User", required: true },

    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },

    capacity: { type: Number, required: true, min: 1 },

    participants: { type: [{ type: Types.ObjectId, ref: "User" }], default: [] },
  },
  { timestamps: true }
);

SessionSchema.index({ startAt: 1 });

SessionSchema.index({ trainerId: 1, startAt: 1, name: 1 }, { unique: true });

SessionSchema.pre("validate", function (next) {
  if (this.startAt && this.endAt && this.endAt <= this.startAt) {
    return next(new Error("endAt must be greater than startAt"));
  }
  next();
});

export const Session = model("Session", SessionSchema);
