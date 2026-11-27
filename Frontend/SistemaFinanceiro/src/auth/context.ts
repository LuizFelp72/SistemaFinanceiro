import { createContext, useContext } from "react";

export interface AuthContextData {
  isAuthenticated: boolean;
  /** Lança erro com a mensagem a exibir quando as credenciais são inválidas. */
  login: (email: string, password: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function useAuth() {
  return useContext(AuthContext);
}
