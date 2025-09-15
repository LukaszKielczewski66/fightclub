import { Request, Response } from "express";
import { getUsersListSvc, getUserByIdSvc } from "@/services/admin.users.service";

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
