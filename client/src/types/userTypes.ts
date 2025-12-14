export type Gender = "male" | "female" | "other" | "unknown";

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


export type UserProfileDto = {
  id: string;
  email: string;
  name: string;
  role: "admin" | "trainer" | "user";
  active: boolean;

  age: number | null;
  gender: Gender | null;
  experienceMonths: number | null;
  trainingGoal: TrainingGoal | null;
};


export type UpdateMyProfilePayload = {
  age?: number | null;
  gender?: Gender | null;
  experienceMonths?: number | null;
  trainingGoal?: TrainingGoal | null;
};