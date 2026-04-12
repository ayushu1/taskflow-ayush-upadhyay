import { api } from '../../lib/api';
import type {
  AuthResponse,
  LoginInput,
  RegisterInput,
  User,
} from '../../types';

export async function login(input: LoginInput): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/login', input);
  return data;
}

export async function register(input: RegisterInput): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/register', input);
  return data;
}

export async function getCurrentUser(): Promise<User | null> {
  const token = localStorage.getItem('taskflow_token');
  if (!token) return null;
  const user = localStorage.getItem('taskflow_user');
  return user ? (JSON.parse(user) as User) : null;
}

export function logout(): void {
  localStorage.removeItem('taskflow_token');
  localStorage.removeItem('taskflow_user');
}
