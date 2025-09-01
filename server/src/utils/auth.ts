import jwt from "jsonwebtoken";
import type { SignOptions, Secret, JwtPayload } from "jsonwebtoken";

import bcrypt from "bcryptjs";
import { IUser } from "../models/User";

const JWT_SECRET: Secret = (process.env.JWT_SECRET ?? "change-me") as Secret;


const JWT_EXPIRES_IN: SignOptions["expiresIn"] =
  ((process.env.JWT_EXPIRES_IN as SignOptions["expiresIn"]) ?? "1h");

export interface AccessTokenPayload extends JwtPayload {
  sub: string; 
  role: IUser["role"];
  email: string;
}

export async function hashPassword(plain: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plain, salt);
}

export function signAccessToken(user: IUser) {
  const payload: AccessTokenPayload = {
    sub: user.id,
    role: user.role,
    email: user.email,
  };
  const options: SignOptions = { expiresIn: JWT_EXPIRES_IN };
  return jwt.sign(payload, JWT_SECRET, options);
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as AccessTokenPayload;
}
