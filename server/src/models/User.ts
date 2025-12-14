import {
  Schema,
  model,
  type Model,
  type HydratedDocument,
  type Types,
} from "mongoose";
import bcrypt from "bcryptjs";
import { IUser, TrainingGoal } from "@/utils/types";

export type UserRole = "admin" | "trainer" | "user";

export interface IUserMethods {
  comparePassword(plain: string): Promise<boolean>;
}

export type UserDoc = HydratedDocument<IUser, IUserMethods> & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

type UserModel = Model<IUser, {}, IUserMethods>;

const UserSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
    },
    name: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "trainer", "user"],
      default: "user",
      required: true,
    },
    passwordHash: { type: String, required: true },
    active: { type: Boolean, default: true },

    age: { type: Number, min: 5, max: 120, required: false },
    gender: { type: String, enum: ["male", "female", "other", "unknown"], required: false },
    experienceMonths: { type: Number, min: 0, max: 600, required: false },
    trainingGoal: {
  type: String,
  enum: [
    "lose_weight",
    "build_muscle",
    "improve_condition",
    "learn_self_defense",
    "competition_preparation",
    "technique_improvement",
    "rehabilitation",
    "general_fitness",
    "stress_relief",
  ],
  required: false,
},
  },
  {
    timestamps: true,
  }
);

UserSchema.methods.comparePassword = async function (plain: string) {
  return bcrypt.compare(plain, this.passwordHash);
};

export const User = model<IUser, UserModel>("User", UserSchema);