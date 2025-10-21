import axios from "axios";

const baseURL =
  import.meta.env.VITE_API_BASE_URL?.toString() ?? "http://localhost:8000";

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 15000,
});

export function formatError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return (
      (error.response?.data as { detail?: string })?.detail ??
      error.message ??
      "Unexpected request error"
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown error";
}
