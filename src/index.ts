import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import "express-async-errors";
import { env } from "./config/env";
import authRoutes from "./routes/auth.routes";
import { errorHandler } from "./middlewares/error.middleware";
import { authenticate } from "./middlewares/auth.middleware";
import { requireRole } from "./middlewares/rbac.middleware";
import { Role } from "./types";

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/api/public", (req: Request, res: Response) => {
  res.json({ message: "This is a public endpoint" });
});

app.get("/api/protected", authenticate, (req: any, res: Response) => {
  res.json({ message: `Hello ${req.user.email}, you are authenticated!`, user: req.user });
});

app.get("/api/admin", authenticate, requireRole([Role.ADMIN]), (req: any, res: Response) => {
  res.json({ message: "Welcome Admin, you have full access!" });
});

app.use("/api/auth", authRoutes);

app.use(errorHandler);

const port = env.PORT;
app.listen(port, () => {
  console.log(`🚀 Secure Auth RBAC Server is running on port ${port} in ${env.NODE_ENV} mode`);
});

export default app;
