import { useState, type ReactNode } from "react";
import { entrar } from "../services/auth";
import { AuthContext } from "./context";

export function AuthProvider({ children }: { children: ReactNode }) {
  // Lido já na primeira renderização, para que recarregar a página não leve ao login.
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(localStorage.getItem("token")));

  function login(email: string, password: string) {
    const { token } = entrar(email, password);
    localStorage.setItem("token", token);
    setIsAuthenticated(true);
  }

  function logout() {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
