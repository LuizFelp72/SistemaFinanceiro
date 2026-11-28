export const sessionKey = "nuvra.session";

export function getStoredToken() {
  return localStorage.getItem(sessionKey);
}
export function setStoredToken(token: string) {
  localStorage.setItem(sessionKey, token);
}
export function clearStoredToken() {
  localStorage.removeItem(sessionKey);
}

export async function api<T>(path: string, init: RequestInit = {}, authenticated = true): Promise<T> {
  const token = authenticated ? getStoredToken() : null;
  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (init.body) headers.set("Content-Type", "application/json");
  let res: Response;
  try {
    res = await fetch(`/api/v1${path}`, { ...init, headers });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new Error("Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.", { cause: error });
  }
  if (res.status === 401 && token && token === getStoredToken()) {
    clearStoredToken();
    window.dispatchEvent(new Event("session-expired"));
  }
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? "O serviço está indisponível. Tente novamente.");
  }
  return res.status === 204 ? undefined as T : res.json();
}
