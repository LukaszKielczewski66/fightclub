import { Request, Response } from "express";
import { getUsersListSvc, getUserByIdSvc, createUser } from "../services/admin.users.service"
import { CreateUserBody } from "@/utils/types";

//  *********** GET /api/admin/users
export async function getUsersListCtrl(req: Request, res: Response) {
  const {
    page = "1",
    limit = "20",
    query,
    role,
    active,
    sort = "createdAt:desc",
  } = (req.query ?? {}) as Record<string, string>;

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);

  try {
    const result = await getUsersListSvc({
      page: pageNum,
      limit: limitNum,
      query: query?.trim() || undefined,
      role: role as any,
      active: typeof active === "string" ? (active === "true" ? true : active === "false" ? false : undefined) : undefined,
      sort,
    });

    return res.json(result);
  } catch (err: any) {
    const message = err?.message || "Failed to fetch users";
    const status = Number(err?.status || 500);
    return res.status(status).json({ message });
  }
}


//  *********** GET /api/admin/users/:id
export async function getUserByIdCtrl(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const user = await getUserByIdSvc(id);
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json({ user });
  } catch (err: any) {
    const message = err?.message || "Failed to fetch user";
    const status = Number(err?.status || 500);
    return res.status(status).json({ message });
  }
}


//  *********** POST /api/admin/users/
export async function createUserCtrl(
  req: Request<{}, any, CreateUserBody>,
  res: Response
) {
  try {
    const { email, name, password, role } = req.body;

    if (!email || !name || !password) {
      return res.status(400).json({ message: "Brakuje wymaganych pól" });
    }

    if (!["admin", "trainer", "user"].includes(role)) {
      return res.status(400).json({ message: "Nieprawidłowa rola użytkownika" });
    }

    const user = await createUser({ email, name, password, role });

    return res.status(201).json(user);
  } catch (err: any) {
    if (err?.code === 11000) {
      return res.status(409).json({ message: "Użytkownik z takim e-mailem już istnieje" });
    }

    console.error("createUserCtrl error:", err);
    return res.status(500).json({ message: "Błąd serwera" });
  }
}