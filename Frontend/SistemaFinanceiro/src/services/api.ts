export const sessionKey = "nuvra.session";
export async function api<T>(path: string, init: RequestInit = {}, authenticated = true): Promise<T> {
  const token = authenticated ? sessionStorage.getItem(sessionKey) : null;
  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (init.body) headers.set("Content-Type", "application/json");
  const res = await fetch(`/api/v1${path}`, { ...init, headers });
  if (res.status === 401 && token && token === sessionStorage.getItem(sessionKey)) {
    sessionStorage.removeItem(sessionKey);
    window.dispatchEvent(new Event("session-expired"));
  }
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? "O serviço está indisponível. Tente novamente.");
  }
  return res.status === 204 ? undefined as T : res.json();
}
