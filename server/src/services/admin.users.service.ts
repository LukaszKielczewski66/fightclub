import { Types, type FilterQuery } from "mongoose";
import { User, type UserRole } from "@/models/User";

// TODO EXPORT THIS TO TYPES 
export type ListUsersParams = {
  page: number;
  limit: number;
  query?: string; 
  role?: UserRole;
  active?: boolean;
  sort?: string;
};

export type ListUserItem = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
  updatedAt: string; 
};

export type ListUsersResult = {
  items: ListUserItem[];
  total: number;
  page: number;
  limit: number;
};

export type UserDetails = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export async function getUsersListSvc(params: ListUsersParams): Promise<ListUsersResult> {
  const { page, limit, query, role, active, sort = "createdAt:desc" } = params;

  const filter: FilterQuery<typeof User> = {};

  if (query && query.trim()) {
    const rx = new RegExp(escapeRegex(query.trim()), "i");
    filter.$or = [{ name: rx }, { email: rx }];
  }

  if (role && isUserRole(role)) {
    filter.role = role;
  }

  if (typeof active === "boolean") {
    filter.active = active;
  }
  let sortObj: Record<string, 1 | -1> = { createdAt: -1 };

  if (sort) {
    const [field, dir] = String(sort).split(":");
    if (field) sortObj = { [field]: dir === "asc" ? 1 : -1 };
  }

  const skip = (page - 1) * limit;

  const projection = "email name role active createdAt updatedAt";

  type LeanUser = {
    _id: Types.ObjectId;
    email: string;
    name: string;
    role: UserRole;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
  };

  const [rows, total] = await Promise.all([
    User.find(filter).select(projection).sort(sortObj).skip(skip).limit(limit).lean<LeanUser[]>(),
    User.countDocuments(filter),
  ]);

  const items: ListUserItem[] = rows.map((u) => ({
    id: u._id.toString(),
    email: u.email,
    name: u.name,
    role: u.role,
    active: u.active,
    createdAt: u.createdAt.toISOString(),
    updatedAt: u.updatedAt.toISOString(),
  }));

  return { items, total, page, limit };
}
export async function getUserByIdSvc(id: string): Promise<UserDetails | null> {
  if (!id) throw withStatus(new Error("Missing id"), 400);
  if (!Types.ObjectId.isValid(id)) throw withStatus(new Error("Invalid id"), 400);

  const projection = "email name role active createdAt updatedAt";

  type LeanUser = {
    _id: Types.ObjectId;
    email: string;
    name: string;
    role: UserRole;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
  };

  const doc = await User.findById(id).select(projection).lean<LeanUser | null>();
  if (!doc) return null;

  return {
    id: doc._id.toString(),
    email: doc.email,
    name: doc.name,
    role: doc.role,
    active: doc.active,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

function escapeRegex(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function withStatus<T extends Error>(err: T, status: number): T & { status: number } {
  return Object.assign(err, { status });
}

function isUserRole(v: unknown): v is UserRole {
  return v === "admin" || v === "trainer" || v === "client";
}
