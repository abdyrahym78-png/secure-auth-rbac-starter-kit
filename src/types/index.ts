export enum Role {
  ADMIN = "admin",
  MANAGER = "manager",
  USER = "user",
}

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: Role;
  refreshTokenHash?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserInput {
  email: string;
  password: string;
  role?: Role;
}

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  create(data: CreateUserInput & { passwordHash: string }): Promise<User>;
  updateRefreshToken(userId: string, refreshTokenHash: string | null): Promise<void>;
  updateRole(userId: string, role: Role): Promise<void>;
}
