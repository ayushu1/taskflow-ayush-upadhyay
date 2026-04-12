import { createContext, useState, useCallback, type ReactNode } from 'react';
import type { User, LoginInput, RegisterInput } from '../../types';
import { storage } from '../../lib/storage';
import * as authApi from './api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getInitialAuthState(): { user: User | null; isLoading: boolean } {
  try {
    const storedUser = storage.getUser();
    return { user: storedUser, isLoading: false };
  } catch {
    return { user: null, isLoading: false };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const initialState = getInitialAuthState();
  const [user, setUser] = useState<User | null>(initialState.user);
  const isLoading = initialState.isLoading;

  const login = useCallback(async (input: LoginInput) => {
    const response = await authApi.login(input);
    storage.setToken(response.token);
    storage.setUser(response.user);
    setUser(response.user);
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const response = await authApi.register(input);
    storage.setToken(response.token);
    storage.setUser(response.user);
    setUser(response.user);
  }, []);

  const logout = useCallback(() => {
    authApi.logout();
    storage.clearAuth();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext };
