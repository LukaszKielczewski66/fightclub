import { ClassTemplate } from "../models/ClassTemplate";

type HttpErr = Error & { status?: number };
function httpError(message: string, status: number): HttpErr {
  const err: HttpErr = new Error(message);
  err.status = status;
  return err;
}

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export type ListClassTemplatesParams = {
  query?: string;
  type?: "BJJ" | "MMA" | "Cross";
  active?: boolean;
  sort?: "createdAt:desc" | "createdAt:asc" | "name:asc" | "name:desc";
};

export async function listClassTemplatesSvc(params: ListClassTemplatesParams) {
  const filter: any = {};

  if (typeof params.active === "boolean") filter.active = params.active;

  if (params.type && ["BJJ", "MMA", "Cross"].includes(params.type)) {
    filter.type = params.type;
  }

  if (params.query && params.query.trim()) {
    const rx = new RegExp(escapeRegex(params.query.trim()), "i");
    filter.$or = [{ name: rx }];
  }

  let sortObj: Record<string, 1 | -1> = { createdAt: -1 };
  const sort = params.sort ?? "createdAt:desc";
  const [field, dir] = sort.split(":");
  if (field) sortObj = { [field]: dir === "asc" ? 1 : -1 };

  const items = await ClassTemplate.find(filter)
    .sort(sortObj)
    .select("name type level durationMin defaultCapacity active createdAt updatedAt")
    .lean();

  return {
    items: items.map((x: any) => ({
      id: String(x._id),
      name: x.name,
      type: x.type,
      level: x.level,
      durationMin: x.durationMin,
      defaultCapacity: x.defaultCapacity,
      active: x.active,
      createdAt: new Date(x.createdAt).toISOString(),
      updatedAt: new Date(x.updatedAt).toISOString(),
    })),
  };
}

export async function createClassTemplateSvc(input: {
  name: string;
  type: "BJJ" | "MMA" | "Cross";
  level: "beginner" | "intermediate" | "advanced";
  durationMin: number;
  defaultCapacity: number;
}) {
  const { name, type, level, durationMin, defaultCapacity } = input;

  if (!name?.trim()) throw httpError("Nazwa jest wymagana", 400);
  if (!["BJJ", "MMA", "Cross"].includes(type)) throw httpError("Nieprawidłowy typ", 400);
  if (!["beginner", "intermediate", "advanced"].includes(level)) throw httpError("Nieprawidłowy poziom", 400);

  if (!Number.isFinite(durationMin) || durationMin < 15 || durationMin > 240) {
    throw httpError("Nieprawidłowy czas trwania (15..240)", 400);
  }
  if (!Number.isFinite(defaultCapacity) || defaultCapacity < 1 || defaultCapacity > 200) {
    throw httpError("Nieprawidłowa pojemność (1..200)", 400);
  }

  try {
    const created = await ClassTemplate.create({
      name: name.trim(),
      type,
      level,
      durationMin,
      defaultCapacity,
      active: true,
    });

    return {
      id: created.id,
      name: created.name,
      type: created.type,
      level: created.level,
      durationMin: created.durationMin,
      defaultCapacity: created.defaultCapacity,
      active: created.active,
      createdAt: (created.createdAt as Date).toISOString(),
      updatedAt: (created.updatedAt as Date).toISOString(),
    };
  } catch (err: unknown) {
    const e = err as { code?: number };
    if (e.code === 11000) throw httpError("Taki szablon już istnieje (name/type/level)", 409);
    throw err;
  }
}

export async function updateClassTemplateSvc(args: {
  id: string;
  name?: string;
  type?: "BJJ" | "MMA" | "Cross";
  level?: "beginner" | "intermediate" | "advanced";
  durationMin?: number;
  defaultCapacity?: number;
  active?: boolean;
}) {
  const { id } = args;
  if (!id) throw httpError("Brak id", 400);

  const patch: any = {};
  if (typeof args.name === "string") patch.name = args.name.trim();
  if (typeof args.type === "string") patch.type = args.type;
  if (typeof args.level === "string") patch.level = args.level;
  if (typeof args.durationMin === "number") patch.durationMin = args.durationMin;
  if (typeof args.defaultCapacity === "number") patch.defaultCapacity = args.defaultCapacity;
  if (typeof args.active === "boolean") patch.active = args.active;

  const updated = await ClassTemplate.findByIdAndUpdate(id, patch, { new: true })
    .select("name type level durationMin defaultCapacity active createdAt updatedAt")
    .lean();

  if (!updated) throw httpError("Szablon nie istnieje", 404);

  const u: any = updated;
  return {
    id: String(u._id),
    name: u.name,
    type: u.type,
    level: u.level,
    durationMin: u.durationMin,
    defaultCapacity: u.defaultCapacity,
    active: u.active,
    createdAt: new Date(u.createdAt).toISOString(),
    updatedAt: new Date(u.updatedAt).toISOString(),
  };
}
