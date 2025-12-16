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
  specializations?: TrainerSpecialization[] | null;
  levelsTaught?: TrainerLevel[] | null;
  maxWeeklyHours?: number | null;
};

function normalizeNumber(v: unknown): number | undefined {
  if (v === null || v === undefined || v === "") return undefined;
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return undefined;
  return n;
}

export async function getMyProfileSvc(userId: string) {
  const u = await User.findById(userId)
    .select("email name role active age gender experienceMonths trainingGoal specializations levelsTaught maxWeeklyHours")
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
    specializations: (u as any).specializations ?? [],
    levelsTaught: (u as any).levelsTaught ?? [],
    maxWeeklyHours: (u as any).maxWeeklyHours ?? null,
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

const SPEC_ALLOWED: TrainerSpecialization[] = ["MMA", "BJJ", "Cross"];
const LEVEL_ALLOWED: TrainerLevel[] = ["beginner", "intermediate", "advanced"];

function uniq<T>(arr: T[]) {
  return Array.from(new Set(arr));
}

function isSpec(x: unknown): x is TrainerSpecialization {
  return typeof x === "string" && (SPEC_ALLOWED as string[]).includes(x);
}

function isLevel(x: unknown): x is TrainerLevel {
  return typeof x === "string" && (LEVEL_ALLOWED as string[]).includes(x);
}

const ALLOWED_SPECS = ["MMA", "BJJ", "Cross"] as const;
const ALLOWED_LEVELS = ["beginner", "intermediate", "advanced"] as const;

type TrainerSpecialization = (typeof ALLOWED_SPECS)[number];
type TrainerLevel = (typeof ALLOWED_LEVELS)[number];

function normalizeStringArray<T extends readonly string[]>(
  value: unknown,
  allowed: T
): Array<T[number]> | undefined {
  if (value === null) return undefined;
  if (value === undefined) return undefined;

  if (!Array.isArray(value)) return [];

  const set = new Set<T[number]>();
  for (const x of value) {
    if (typeof x === "string" && (allowed as readonly string[]).includes(x)) {
      set.add(x as T[number]);
    }
  }
  return Array.from(set);
}

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

  if (input.specializations !== undefined) {
    if (input.specializations === null) {
      update.specializations = undefined;
    } else {
      const arr = normalizeStringArray(input.specializations, ALLOWED_SPECS);
      update.specializations = arr;
    }
  }

  if (input.levelsTaught !== undefined) {
    if (input.levelsTaught === null) {
      update.levelsTaught = undefined;
    } else {
      const arr = normalizeStringArray(input.levelsTaught, ALLOWED_LEVELS);
      update.levelsTaught = arr;
    }
  }

  if (input.maxWeeklyHours !== undefined) {
    const n = normalizeNumber(input.maxWeeklyHours);
    if (n === undefined) {
      update.maxWeeklyHours = undefined;
    } else {
      if (n < 0 || n > 60) throw httpError("Max godzin tygodniowo musi być w zakresie 0–60", 400);
      update.maxWeeklyHours = Math.round(n * 10) / 10;
    }
  }

  const u = await User.findByIdAndUpdate(userId, { $set: update }, { new: true })
    .select(
      "email name role active age gender experienceMonths trainingGoal specializations levelsTaught maxWeeklyHours"
    )
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
    specializations: (u as any).specializations ?? [],
    levelsTaught: (u as any).levelsTaught ?? [],
    maxWeeklyHours: (u as any).maxWeeklyHours ?? null,
  };
}

