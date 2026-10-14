import { Request, Response } from "express";
import * as bcrypt from "bcryptjs";
import { userRepository } from "../repositories/user.repository";
import { ConflictError, UnauthorizedError } from "../utils/errors";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt";
import { Role } from "../types";

export const register = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const existing = await userRepository.findByEmail(email);
  if (existing) {
    throw new ConflictError("Email already registered");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  
  const role = Role.USER;

  const user = await userRepository.create({ email, password, role, passwordHash });

  const accessToken = signAccessToken({ sub: user.id, email: user.email, role: user.role });
  const refreshToken = signRefreshToken({ sub: user.id, email: user.email, role: user.role });

  await userRepository.updateRefreshToken(user.id, await bcrypt.hash(refreshToken, 10));

  return res.status(201).json({
    status: "success",
    data: {
      user: { id: user.id, email: user.email, role: user.role },
      accessToken,
      refreshToken,
    },
  });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await userRepository.findByEmail(email);
  if (!user) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const isValidPassword = await bcrypt.compare(password, user.passwordHash);
  if (!isValidPassword) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const accessToken = signAccessToken({ sub: user.id, email: user.email, role: user.role });
  const refreshToken = signRefreshToken({ sub: user.id, email: user.email, role: user.role });

  await userRepository.updateRefreshToken(user.id, await bcrypt.hash(refreshToken, 10));

  return res.json({
    status: "success",
    data: {
      user: { id: user.id, email: user.email, role: user.role },
      accessToken,
      refreshToken,
    },
  });
};

export const refresh = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    throw new UnauthorizedError("Refresh token is required");
  }

  const payload = verifyRefreshToken(refreshToken);
  const user = await userRepository.findById(payload.sub);
  if (!user || !user.refreshTokenHash) {
    throw new UnauthorizedError("Invalid refresh token");
  }

  const isValid = await bcrypt.compare(refreshToken, user.refreshTokenHash);
  if (!isValid) {
    throw new UnauthorizedError("Invalid refresh token");
  }

  const accessToken = signAccessToken({ sub: user.id, email: user.email, role: user.role });
  const newRefreshToken = signRefreshToken({ sub: user.id, email: user.email, role: user.role });

  await userRepository.updateRefreshToken(user.id, await bcrypt.hash(newRefreshToken, 10));

  return res.json({
    status: "success",
    data: {
      accessToken,
      refreshToken: newRefreshToken,
    },
  });
};

export const logout = async (req: any, res: Response) => {
  const userId = req.user?.id;
  if (userId) {
    await userRepository.updateRefreshToken(userId, null);
  }
  return res.json({ status: "success", message: "Logged out successfully" });
};

export const getMe = async (req: any, res: Response) => {
  const user = await userRepository.findById(req.user?.id);
  if (!user) {
    throw new UnauthorizedError("User not found");
  }
  return res.json({
    status: "success",
    data: { user: { id: user.id, email: user.email, role: user.role, createdAt: user.createdAt } },
  });
};

export const updateRole = async (req: any, res: Response) => {
  const { id } = req.params;
  const { role } = req.body;

  const user = await userRepository.findById(id);
  if (!user) {
    throw new UnauthorizedError("User not found");
  }

  await userRepository.updateRole(id, role);
  return res.json({
    status: "success",
    message: `User role updated to ${role}`,
  });
};
