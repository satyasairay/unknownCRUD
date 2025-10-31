import { useState } from "react";
import { apiClient, formatError } from "../lib/apiClient";

interface SMELoginPageProps {
  onLogin: (user: { id: string; email: string; roles: string[] }) => void;
}

export function SMELoginPage({ onLogin }: SMELoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.post("/auth/login", { email, password });
      const user = response.data;
      
      // Check if user has SME permissions
      const isSME = user.roles?.includes("sme") || user.roles?.includes("platform_admin") || user.roles?.includes("admin");
      
      if (!isSME) {
        setError("Access denied. SME permissions required.");
        return;
      }
      
      onLogin(user);
    } catch (error) {
      setError(formatError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">SME Dashboard</h1>
          <p className="text-slate-400">Sign in with your SME credentials</p>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-900 shadow-2xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-brand focus:outline-none"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-brand focus:outline-none"
                placeholder="Enter your password"
              />
            </div>

            {error && (
              <div className="rounded-md border border-rose-700 bg-rose-950/40 px-4 py-3 text-sm text-rose-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-light disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a
              href="/"
              className="text-sm text-slate-400 hover:text-white transition"
            >
              ← Back to Verse Editor
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}