import { FormEvent, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { formatError } from "../lib/apiClient";

type AuthTab = "login" | "register";

const ROLE_OPTIONS = [
  { label: "Author", value: "author" },
  { label: "Reviewer", value: "reviewer" },
  { label: "Final Reviewer", value: "final" },
  { label: "Admin", value: "admin" },
];

export function HomePage() {
  const { login, register } = useAuth();
  const [tab, setTab] = useState<AuthTab>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roles, setRoles] = useState<string[]>(["author"]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isPasswordValid = useMemo(
    () => (tab === "login" ? password.length > 0 : password.length >= 12),
    [password.length, tab],
  );

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setRoles(["author"]);
    setErrorMessage(null);
  };

  const toggleRole = (role: string) => {
    setRoles((prev) => {
      if (prev.includes(role)) {
        return prev.filter((item) => item !== role);
      }
      return [...prev, role];
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);

    try {
      if (tab === "login") {
        await login({ email, password });
      } else {
        if (password.length < 12) {
          setErrorMessage("Password must be at least 12 characters long.");
          setSubmitting(false);
          return;
        }
        await register({ email, password, roles });
      }
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
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-900 shadow-2xl sm:rounded-xl">
          <header className="border-b border-slate-800 px-4 py-3 sm:px-6 sm:py-4">
            <h3 className="text-base font-semibold text-slate-100 text-center sm:text-lg">
              {tab === "login" ? "Sign In" : "Create Account"}
            </h3>
          </header>

          <nav className="flex gap-0.5 border-b border-slate-800 px-4 sm:gap-1 sm:px-6">
            <TabButton
              label="Login"
              active={tab === "login"}
              onClick={() => {
                setTab("login");
                setErrorMessage(null);
              }}
            />
            <TabButton
              label="Register"
              active={tab === "register"}
              onClick={() => {
                setTab("register");
                setErrorMessage(null);
              }}
            />
          </nav>

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
                  autoComplete={tab === "login" ? "current-password" : "new-password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm focus:border-brand focus:outline-none"
                />
                {tab === "register" && (
                  <p className="mt-1 text-xs text-slate-500">
                    Minimum 12 characters for new accounts.
                  </p>
                )}
              </div>

              {tab === "register" && (
                <div>
                  <span className="block text-sm font-medium text-slate-200">
                    Roles
                  </span>
                  <div className="mt-2 grid gap-1.5 sm:gap-2">
                    {ROLE_OPTIONS.map((role) => (
                      <label
                        key={role.value}
                        className="flex items-center gap-2 text-sm text-slate-300"
                      >
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-brand focus:ring-brand"
                          checked={roles.includes(role.value)}
                          onChange={() => toggleRole(role.value)}
                        />
                        {role.label}
                      </label>
                    ))}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    You can update role assignments later via admin tools.
                  </p>
                </div>
              )}

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
                {submitting
                  ? "Submitting…"
                  : tab === "login"
                  ? "Login"
                  : "Create Account"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function TabButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  const base =
    "flex-1 px-3 py-3 text-center text-sm font-medium transition focus:outline-none";
  const state = active
    ? "border-b-2 border-brand text-white"
    : "text-slate-400 hover:text-slate-200";
  return (
    <button type="button" onClick={onClick} className={`${base} ${state}`}>
      {label}
    </button>
  );
}