import { request } from "@/lib/api/client";

export interface BackendUser {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

interface TokenResponse {
  access_token: string;
  token_type: string;
}

export function register(email: string, name: string, password: string): Promise<TokenResponse> {
  return request<TokenResponse>("/auth/register", {
    method: "POST",
    body: { email, name, password },
    auth: false,
  });
}

export function login(email: string, password: string): Promise<TokenResponse> {
  return request<TokenResponse>("/auth/login", {
    method: "POST",
    body: { email, password },
    auth: false,
  });
}

export function getCurrentUser(): Promise<BackendUser> {
  return request<BackendUser>("/auth/me");
}
