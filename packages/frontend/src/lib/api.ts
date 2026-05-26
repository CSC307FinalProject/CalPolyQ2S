const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();
const localApiUrl = "http://localhost:3000";

export const API_URL = (
  configuredApiUrl || (import.meta.env.DEV ? localApiUrl : "")
).replace(/\/+$/, "");

export function apiUrl(path: string) {
  if (!API_URL) {
    throw new Error(
      "Missing VITE_API_URL. Set it to the backend API base URL.",
    );
  }

  if (!/^https?:\/\//i.test(API_URL)) {
    throw new Error("VITE_API_URL must start with http:// or https://.");
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_URL}${normalizedPath}`;
}
