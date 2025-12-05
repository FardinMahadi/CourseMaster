export type UserRole = 'student' | 'admin';

export interface User {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserWithoutPassword extends Omit<User, 'password'> {}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AdminLoginInput {
  email: string;
  password: string;
  adminSecretKey: string;
}

export interface AuthResponse {
  user: UserWithoutPassword;
  token: string;
}

export interface AuthState {
  user: UserWithoutPassword | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isStudent: boolean;
}
