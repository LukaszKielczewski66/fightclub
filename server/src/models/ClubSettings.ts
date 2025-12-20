import { Schema, model } from "mongoose";

const ClubSettingsSchema = new Schema(
  {
    clubName: { type: String, trim: true, default: "FightClub" },
    address: { type: String, trim: true, default: "" },
    contactEmail: { type: String, trim: true, default: "" },
    contactPhone: { type: String, trim: true, default: "" },
    timezone: { type: String, trim: true, default: "Europe/Warsaw" },

    maxBookingsPerWeek: { type: Number, min: 0, max: 50, default: 6 },
    bookingCutoffHours: { type: Number, min: 0, max: 168, default: 2 }, //
    cancelCutoffHours: { type: Number, min: 0, max: 168, default: 2 },  //
  },
  { timestamps: true }
);

ClubSettingsSchema.index({ clubName: 1 });

export const ClubSettings = model("ClubSettings", ClubSettingsSchema);
