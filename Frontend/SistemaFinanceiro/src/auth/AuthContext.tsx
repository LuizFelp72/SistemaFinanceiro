import { useState, useEffect, type ReactNode } from "react";
import { Session, type User } from "./session";
import { api, clearStoredToken, getStoredToken, sessionKey, setStoredToken } from "../services/api";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(() => !!getStoredToken());
  const [sessionError, setSessionError] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    const expired = () => setUser(null);
    const onStorage = (event: StorageEvent) => {
      if (event.key === sessionKey && !event.newValue) setUser(null);
    };
    window.addEventListener("session-expired", expired);
    window.addEventListener("storage", onStorage);
    const token = getStoredToken();
    if (token) {
      api<User>("/auth/me", { signal: controller.signal })
        .then(person => { if (getStoredToken() === token) setUser(person); })
        .catch(() => { if (!controller.signal.aborted && getStoredToken() === token) setSessionError(true); })
        .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    }
    return () => {
      controller.abort();
      window.removeEventListener("session-expired", expired);
      window.removeEventListener("storage", onStorage);
    };
  }, []);
  async function signIn(email: string, senha: string, nome?: string) {
    const result = await api<{ user: User; token: string }>(nome ? "/auth/register" : "/auth/login", {
      method: "POST", body: JSON.stringify({ email, senha, nome }),
    }, false);
    setStoredToken(result.token);
    setSessionError(false);
    setUser(result.user);
  }
  function logout() { clearStoredToken(); setUser(null); setSessionError(false); }
  return <Session.Provider value={{ user, loading, sessionError, signIn, logout, updateUser: setUser }}>{children}</Session.Provider>;
}
