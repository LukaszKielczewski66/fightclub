import { Router } from "express";
import { User } from "../models/User";
import { hashPassword, signAccessToken } from "../utils/auth";
import { requireAuth, requireRole } from "../middlewares/auth";

const router = Router();

router.post("/register", async (req, res) => {
  const { email, name, password } = req.body || {};
  if (!email || !name || !password) return res.status(400).json({ message: "Missing fields" });

  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ message: "Email already in use" });

  const passwordHash = await hashPassword(password);
  const user = await User.create({ email, name, role: "user", passwordHash });
  return res.status(201).json({ id: user.id, email: user.email, name: user.name, role: user.role });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: "Missing credentials" });

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });
  if (!user.active) return res.status(423).json({ message: "Account disabled" });

  const ok = await user.comparePassword(password);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });

  const accessToken = signAccessToken(user);
  return res.json({ accessToken, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
});

router.get("/me", requireAuth, async (req, res) => {
  const user = await User.findById(req.user!.id).select("email name role active");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ user });
});

router.get("/admin/ping", requireAuth, requireRole("admin"), (_req, res) => {
  res.json({ ok: true, scope: "admin" });
});

export default router;
