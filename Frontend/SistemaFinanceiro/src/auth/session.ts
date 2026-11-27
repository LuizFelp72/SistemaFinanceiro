import { createContext, useContext } from "react";
export interface User { id: string; nome: string; email: string }
export const Session = createContext<{
  user: User | null; loading: boolean; sessionError: boolean;
  signIn: (email: string, senha: string, nome?: string) => Promise<void>;
  updateUser: (user: User) => void;
  logout: () => void;
} | null>(null);
export function useAuth() {
  const auth = useContext(Session);
  if (!auth) throw new Error("AuthProvider ausente");
  return auth;
}
