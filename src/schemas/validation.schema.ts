import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Invalid email").max(255),
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
});

export const loginSchema = registerSchema;

export const roleUpdateSchema = z.object({
  role: z.enum(["admin", "manager", "user"]),
});
