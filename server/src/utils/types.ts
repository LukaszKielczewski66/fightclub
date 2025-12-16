import { UserRole } from "@/models/User";

type CreateUserBody = {
  email: string;
  name: string;
  password: string;
  role: UserRole;
};

type ListUsersParams = {
  page: number;
  limit: number;
  query?: string; 
  role?: UserRole;
  active?: boolean;
  sort?: string;
};

type ListUserItem = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
  updatedAt: string; 
};

type ListUsersResult = {
  items: ListUserItem[];
  total: number;
  page: number;
  limit: number;
};

type UserDetails = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export interface UpdateUserParams {
  id: string;
  name?: string;
  role?: UserRole;
  active?: boolean;
}

type UpdateUserBody = {
  name?: string;
  role?: UserRole;
  active?: boolean;
};

type CreateSessionInput = {
  name: string;
  type: "BJJ" | "MMA" | "Cross";
  level: "beginner" | "intermediate" | "advanced";
  capacity: number;
  weekStart?: string;
  weekday?: number;
  startHour: number;
  startMinute?: number;
  endHour: number;
  endMinute?: number;
  trainerId?: string;
};

type UserGender = "male" | "female" | "other" | "unknown";

export type TrainingGoal =
  | "lose_weight"
  | "build_muscle"
  | "improve_condition"
  | "learn_self_defense"
  | "competition_preparation"
  | "technique_improvement"
  | "rehabilitation"
  | "general_fitness"
  | "stress_relief";

export type TrainerSpecialization = "MMA" | "BJJ" | "Cross";
export type TrainerLevel = "beginner" | "intermediate" | "advanced";
interface IUser {
  email: string;
  name: string;
  role: UserRole;
  passwordHash: string;
  active: boolean;
  age?: number;
  gender?: UserGender;
  experienceMonths?: number;
  trainingGoal?: TrainingGoal;
  createdAt?: Date;
  updatedAt?: Date;
  specializations?: TrainerSpecialization[];
  levelsTaught?: TrainerLevel[];
  maxWeeklyHours?: number | null;
}

export {
    IUser,
    CreateUserBody,
    ListUsersParams,
    ListUserItem,
    ListUsersResult,
    UserDetails,
    UpdateUserBody,
    CreateSessionInput
}