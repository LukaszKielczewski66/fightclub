import { Schema, model, Document } from "mongoose";
import bcrypt from "bcryptjs";

export type UserRole = "admin" | "trainer" | "client";

export interface IUser extends Document {
  email: string;
  name: string;
  role: UserRole;
  passwordHash: string;
  active: boolean;
  comparePassword(plain: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, unique: true, required: true, lowercase: true, trim: true },
    name: { type: String, required: true },
    role: { type: String, enum: ["admin", "trainer", "client"], default: "client", required: true },
    passwordHash: { type: String, required: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

UserSchema.methods.comparePassword = async function (plain: string) {
  return bcrypt.compare(plain, this.passwordHash);
};

export const User = model<IUser>("User", UserSchema);
