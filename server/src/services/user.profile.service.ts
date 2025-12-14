import { TrainingGoal } from "@/utils/types";
import { User } from "../models/User";

type HttpErr = Error & { status?: number };
function httpError(message: string, status: number): HttpErr {
  const err: HttpErr = new Error(message);
  err.status = status;
  return err;
}

export type UpdateMyProfileInput = {
  age?: number | null;
  gender?: "male" | "female" | "other" | "unknown" | null;
  experienceMonths?: number | null;
  trainingGoal?: TrainingGoal | null;
};

function normalizeNumber(v: unknown): number | undefined {
  if (v === null || v === undefined || v === "") return undefined;
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return undefined;
  return n;
}

export async function getMyProfileSvc(userId: string) {
  const u = await User.findById(userId)
    .select("email name role active age gender experienceMonths trainingGoal")
    .lean();

  if (!u) throw httpError("User not found", 404);

  return {
    id: String((u as any)._id),
    email: u.email,
    name: u.name,
    role: u.role,
    active: u.active,
    age: (u as any).age ?? null,
    gender: (u as any).gender ?? null,
    experienceMonths: (u as any).experienceMonths ?? null,
    trainingGoal: (u as any).trainingGoal ?? null,
  };
}

const ALLOWED_GOALS = [
  "lose_weight",
  "build_muscle",
  "improve_condition",
  "learn_self_defense",
  "competition_preparation",
  "technique_improvement",
  "rehabilitation",
  "general_fitness",
  "stress_relief",
] as const;

export async function updateMyProfileSvc(userId: string, input: UpdateMyProfileInput) {
  const update: Record<string, unknown> = {};

  if (input.age !== undefined) {
    const n = normalizeNumber(input.age);
    if (n === undefined) {
      update.age = undefined;
    } else {
      if (n < 5 || n > 120) throw httpError("Wiek musi być w zakresie 5–120", 400);
      update.age = Math.round(n);
    }
  }

  if (input.gender !== undefined) {
    if (input.gender === null) {
      update.gender = undefined;
    } else {
      const allowed = ["male", "female", "other", "unknown"] as const;
      if (!allowed.includes(input.gender)) throw httpError("Nieprawidłowa płeć", 400);
      update.gender = input.gender;
    }
  }

  if (input.experienceMonths !== undefined) {
    const n = normalizeNumber(input.experienceMonths);
    if (n === undefined) {
      update.experienceMonths = undefined;
    } else {
      if (n < 0 || n > 600) throw httpError("Staż musi być w zakresie 0–600 miesięcy", 400);
      update.experienceMonths = Math.round(n);
    }
  }

  if (input.trainingGoal !== undefined) {
    if (input.trainingGoal === null) {
      update.trainingGoal = undefined;
    } else {
      if (!ALLOWED_GOALS.includes(input.trainingGoal)) {
        throw httpError("Nieprawidłowy cel treningowy", 400);
      }
      update.trainingGoal = input.trainingGoal;
    }
  }

  const u = await User.findByIdAndUpdate(
    userId,
    { $set: update },
    { new: true }
  )
    .select("email name role active age gender experienceMonths trainingGoal")
    .lean();

  if (!u) throw httpError("User not found", 404);

  return {
    id: String((u as any)._id),
    email: u.email,
    name: u.name,
    role: u.role,
    active: u.active,
    age: (u as any).age ?? null,
    gender: (u as any).gender ?? null,
    experienceMonths: (u as any).experienceMonths ?? null,
    trainingGoal: (u as any).trainingGoal ?? null,
  };
}
