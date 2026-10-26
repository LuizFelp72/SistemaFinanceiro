import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

interface AuthContextData {
  isAuthenticated: boolean;
  login: (usernameOrEmail: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setIsAuthenticated(true);
  }, []);

  function login(usernameOrEmail: string, password: string): boolean {
    // Extrai a parte antes do @ (se tiver @) ou usa o valor direto
    const usuario = usernameOrEmail.includes("@")
      ? usernameOrEmail.split("@")[0]
      : usernameOrEmail;

    // Validação fake, sem API — troque depois pela chamada real
    if (usuario === "admin" && password === "123456") {
      localStorage.setItem("token", "fake-token");
      setIsAuthenticated(true);
      return true;
    }
    return false;
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

export function useAuth() {
  return useContext(AuthContext);
}