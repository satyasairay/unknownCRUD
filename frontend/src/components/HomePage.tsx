import { FormEvent, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { formatError } from "../lib/apiClient";

export function HomePage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isPasswordValid = password.length > 0;

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setErrorMessage(null);
  };



  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);

    try {
      await login({ email, password });
      resetForm();
    } catch (error) {
      setErrorMessage(formatError(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Unknown CRUD Library</h1>
          <p className="text-slate-400">Please sign in to continue</p>
          <p className="text-xs text-slate-500 mt-2">Contact your administrator for account access</p>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-900 shadow-2xl sm:rounded-xl">
          <header className="border-b border-slate-800 px-4 py-3 sm:px-6 sm:py-4">
            <h3 className="text-base font-semibold text-slate-100 text-center sm:text-lg">
              Sign In
            </h3>
          </header>

          <form className="px-4 py-4 sm:px-6 sm:py-6" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-200">
                  Email
                </label>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm focus:border-brand focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200">
                  Password
                </label>
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm focus:border-brand focus:outline-none"
                />
              </div>



              {errorMessage && (
                <div className="rounded-md border border-rose-700 bg-rose-950/40 px-3 py-2 text-sm text-rose-200">
                  {errorMessage}
                </div>
              )}
            </div>

            <div className="mt-4 sm:mt-6">
              <button
                type="submit"
                disabled={submitting || !isPasswordValid}
                className="w-full rounded-md bg-brand px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-light disabled:cursor-not-allowed disabled:bg-slate-700"
              >
                {submitting ? "Signing In…" : "Sign In"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

