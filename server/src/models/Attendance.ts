import { Schema, model, Types } from "mongoose";

type AttendanceStatus = "present" | "absent";

const AttendanceSchema = new Schema(
  {
    sessionId: { type: Types.ObjectId, ref: "Session", required: true, index: true },
    userId: { type: Types.ObjectId, ref: "User", required: true, index: true },
    status: { type: String, enum: ["present", "absent"], required: true },
    markedBy: { type: Types.ObjectId, ref: "User", required: true },
    markedAt: { type: Date, required: true, default: () => new Date() },
  },
  { timestamps: true }
);

AttendanceSchema.index({ sessionId: 1, userId: 1 }, { unique: true });

export const Attendance = model("Attendance", AttendanceSchema);
export type { AttendanceStatus };
