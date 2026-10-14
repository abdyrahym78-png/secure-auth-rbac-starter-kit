import { Router } from "express";
import { register, login, refresh, logout, getMe, updateRole } from "../controllers/auth.controller";
import { validateBody } from "../middlewares/validate.middleware";
import { registerSchema, loginSchema, roleUpdateSchema } from "../schemas/validation.schema";
import { authenticate } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/rbac.middleware";
import { Role } from "../types";

const router = Router();

router.post("/register", validateBody(registerSchema), register);
router.post("/login", validateBody(loginSchema), login);
router.post("/refresh", refresh);
router.post("/logout", authenticate, logout);
router.get("/me", authenticate, getMe);
router.patch("/users/:id/role", authenticate, requireRole([Role.ADMIN]), validateBody(roleUpdateSchema), updateRole);

export default router;
