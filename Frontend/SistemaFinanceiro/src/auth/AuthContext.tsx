import { useState, useEffect, type ReactNode } from "react";
import { Session, type User } from "./session";
import { api, sessionKey } from "../services/api";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(() => !!sessionStorage.getItem(sessionKey));
  const [sessionError, setSessionError] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    const expired = () => setUser(null);
    window.addEventListener("session-expired", expired);
    const token = sessionStorage.getItem(sessionKey);
    if (token) {
      api<User>("/auth/me", { signal: controller.signal })
        .then(person => { if (sessionStorage.getItem(sessionKey) === token) setUser(person); })
        .catch(() => { if (!controller.signal.aborted && sessionStorage.getItem(sessionKey) === token) setSessionError(true); })
        .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    }
    return () => { controller.abort(); window.removeEventListener("session-expired", expired); };
  }, []);
  async function signIn(email: string, senha: string, nome?: string) {
    const result = await api<{ user: User; token: string }>(nome ? "/auth/register" : "/auth/login", {
      method: "POST", body: JSON.stringify({ email, senha, nome }),
    }, false);
    sessionStorage.setItem(sessionKey, result.token);
    setSessionError(false);
    setUser(result.user);
  }
  function logout() { sessionStorage.removeItem(sessionKey); setUser(null); setSessionError(false); }
  return <Session.Provider value={{ user, loading, sessionError, signIn, logout, updateUser: setUser }}>{children}</Session.Provider>;
}
