import {
  Schema,
  model,
  type Model,
  type HydratedDocument,
  type Types,
} from "mongoose";
import bcrypt from "bcryptjs";

export type UserRole = "admin" | "trainer" | "user";

export interface IUser {
  email: string;
  name: string;
  role: UserRole;
  passwordHash: string;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
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
  },
  {
    timestamps: true,
  }
);

UserSchema.methods.comparePassword = async function (plain: string) {
  return bcrypt.compare(plain, this.passwordHash);
};

export const User = model<IUser, UserModel>("User", UserSchema);
