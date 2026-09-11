/**
 * Central HTTP client for talking to the Inqora FastAPI backend.
 *
 * Every API module (`auth.ts`, `documents.ts`, `chat.ts`,
 * `conversations.ts`) goes through `request()` or `uploadFile()` here —
 * no component or hook ever calls `fetch` directly. This is the one place
 * that knows the base URL, how auth is attached, how errors are shaped,
 * and how timeouts are enforced.
 */

import { getToken } from "@/lib/api/token";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";
const DEFAULT_TIMEOUT_MS = 30_000;

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export class ApiTimeoutError extends ApiError {
  constructor() {
    super(0, "The request took too long. Check your connection and try again.");
    this.name = "ApiTimeoutError";
  }
}

export class ApiNetworkError extends ApiError {
  constructor() {
    super(0, "Could not reach the server. Check your connection and try again.");
    this.name = "ApiNetworkError";
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  auth?: boolean;
  timeoutMs?: number;
}

async function extractErrorMessage(response: Response): Promise<string> {
  try {
    const data = await response.json();
    if (typeof data?.detail === "string") return data.detail;
  } catch {
    // response wasn't JSON — fall through to a generic message
  }
  return `Request failed with status ${response.status}.`;
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, auth = true, timeoutMs = DEFAULT_TIMEOUT_MS } = options;

  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new ApiTimeoutError();
    }
    throw new ApiNetworkError();
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    throw new ApiError(response.status, await extractErrorMessage(response));
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

/**
 * Uploads a file as multipart/form-data with progress reporting.
 *
 * Uses XMLHttpRequest (not fetch) because fetch has no upload-progress
 * event — this is the one client method that isn't built on `request()`.
 * The browser sets the multipart boundary/Content-Type itself from the
 * FormData body; it is never set manually here.
 */
export function uploadFile<T>(
  path: string,
  file: File,
  onProgress?: (percent: number) => void,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${BASE_URL}${path}`);

    const token = getToken();
    if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);

    xhr.upload.onprogress = (event) => {
      if (onProgress && event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      let data: unknown = undefined;
      try {
        data = xhr.responseText ? JSON.parse(xhr.responseText) : undefined;
      } catch {
        // non-JSON body — handled by the status check below
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(data as T);
      } else {
        const detail =
          data && typeof data === "object" && "detail" in data
            ? String((data as { detail: unknown }).detail)
            : `Upload failed with status ${xhr.status}.`;
        reject(new ApiError(xhr.status, detail));
      }
    };

    xhr.onerror = () => reject(new ApiNetworkError());
    xhr.ontimeout = () => reject(new ApiTimeoutError());
    xhr.timeout = 120_000; // uploads can legitimately take longer than a normal request

    xhr.send(formData);
  });
}
