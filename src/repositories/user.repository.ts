import { User, CreateUserInput, IUserRepository, Role } from "../types";

export class InMemoryUserRepository implements IUserRepository {
  private users: User[] = [];

  async findByEmail(email: string): Promise<User | null> {
    const user = this.users.find((u) => u.email === email);
    return user || null;
  }

  async findById(id: string): Promise<User | null> {
    const user = this.users.find((u) => u.id === id);
    return user || null;
  }

  async create(data: CreateUserInput & { passwordHash: string }): Promise<User> {
    const newUser: User = {
      id: Math.random().toString(36) + Date.now().toString(36),
      email: data.email,
      passwordHash: data.passwordHash,
      role: data.role || Role.USER,
      refreshTokenHash: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.push(newUser);
    return newUser;
  }

  async updateRefreshToken(userId: string, refreshTokenHash: string | null): Promise<void> {
    const user = await this.findById(userId);
    if (user) {
      user.refreshTokenHash = refreshTokenHash;
      user.updatedAt = new Date();
    }
  }

  async updateRole(userId: string, role: Role): Promise<void> {
    const user = await this.findById(userId);
    if (user) {
      user.role = role;
      user.updatedAt = new Date();
    }
  }
}

export const userRepository = new InMemoryUserRepository();
