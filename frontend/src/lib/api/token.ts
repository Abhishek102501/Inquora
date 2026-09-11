/**
 * JWT storage.
 *
 * The backend issues stateless Bearer tokens with no cookie support, so
 * there is no safer alternative available today — see backend/README.md.
 * localStorage is used (not sessionStorage) so a session survives a tab
 * close, matching typical "stay signed in" expectations; all access is
 * guarded for SSR since this module is imported by code that can run
 * during a Next.js server render.
 */

const TOKEN_KEY = "inqora_access_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // Storage unavailable (private browsing, quota) — sign-in state simply
    // won't persist across reloads; not fatal.
  }
}

export function clearToken(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore
  }
}
