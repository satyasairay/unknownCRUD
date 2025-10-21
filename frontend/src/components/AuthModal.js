import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { formatError } from "../lib/apiClient";
const ROLE_OPTIONS = [
    { label: "Author", value: "author" },
    { label: "Reviewer", value: "reviewer" },
    { label: "Final Reviewer", value: "final" },
    { label: "Admin", value: "admin" },
];
export function AuthModal({ isOpen, onClose }) {
    const { login, register } = useAuth();
    const [tab, setTab] = useState("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [roles, setRoles] = useState(["author"]);
    const [submitting, setSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const isPasswordValid = useMemo(() => (tab === "login" ? password.length > 0 : password.length >= 12), [password.length, tab]);
    if (!isOpen) {
        return null;
    }
    const resetForm = () => {
        setEmail("");
        setPassword("");
        setRoles(["author"]);
        setErrorMessage(null);
    };
    const closeModal = () => {
        resetForm();
        onClose();
    };
    const toggleRole = (role) => {
        setRoles((prev) => {
            if (prev.includes(role)) {
                return prev.filter((item) => item !== role);
            }
            return [...prev, role];
        });
    };
    const handleSubmit = async (event) => {
        event.preventDefault();
        setSubmitting(true);
        setErrorMessage(null);
        try {
            if (tab === "login") {
                await login({ email, password });
            }
            else {
                if (password.length < 12) {
                    setErrorMessage("Password must be at least 12 characters long.");
                    setSubmitting(false);
                    return;
                }
                await register({ email, password, roles });
            }
            closeModal();
        }
        catch (error) {
            setErrorMessage(formatError(error));
        }
        finally {
            setSubmitting(false);
        }
    };
    return (_jsx("div", { className: "fixed inset-0 z-40 flex items-center justify-center bg-black/70 px-4", children: _jsxs("div", { className: "w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 shadow-2xl", children: [_jsxs("header", { className: "flex items-center justify-between border-b border-slate-800 px-6 py-4", children: [_jsx("h3", { className: "text-lg font-semibold text-slate-100", children: tab === "login" ? "Sign In" : "Create Account" }), _jsx("button", { type: "button", onClick: closeModal, className: "text-sm text-slate-400 transition hover:text-slate-100", children: "\u2715" })] }), _jsxs("nav", { className: "flex gap-1 border-b border-slate-800 px-6", children: [_jsx(TabButton, { label: "Login", active: tab === "login", onClick: () => {
                                setTab("login");
                                setErrorMessage(null);
                            } }), _jsx(TabButton, { label: "Register", active: tab === "register", onClick: () => {
                                setTab("register");
                                setErrorMessage(null);
                            } })] }), _jsxs("form", { className: "px-6 py-6", onSubmit: handleSubmit, children: [_jsxs("div", { className: "flex flex-col gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-200", children: "Email" }), _jsx("input", { type: "email", required: true, autoComplete: "email", value: email, onChange: (event) => setEmail(event.target.value), className: "mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm focus:border-brand focus:outline-none" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-200", children: "Password" }), _jsx("input", { type: "password", required: true, autoComplete: tab === "login" ? "current-password" : "new-password", value: password, onChange: (event) => setPassword(event.target.value), className: "mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm focus:border-brand focus:outline-none" }), tab === "register" && (_jsx("p", { className: "mt-1 text-xs text-slate-500", children: "Minimum 12 characters for new accounts." }))] }), tab === "register" && (_jsxs("div", { children: [_jsx("span", { className: "block text-sm font-medium text-slate-200", children: "Roles" }), _jsx("div", { className: "mt-2 grid gap-2", children: ROLE_OPTIONS.map((role) => (_jsxs("label", { className: "flex items-center gap-2 text-sm text-slate-300", children: [_jsx("input", { type: "checkbox", className: "h-4 w-4 rounded border-slate-600 bg-slate-900 text-brand focus:ring-brand", checked: roles.includes(role.value), onChange: () => toggleRole(role.value) }), role.label] }, role.value))) }), _jsx("p", { className: "mt-1 text-xs text-slate-500", children: "You can update role assignments later via admin tools." })] })), errorMessage && (_jsx("div", { className: "rounded-md border border-rose-700 bg-rose-950/40 px-3 py-2 text-sm text-rose-200", children: errorMessage }))] }), _jsxs("div", { className: "mt-6 flex items-center justify-between", children: [_jsx("button", { type: "button", onClick: closeModal, className: "rounded-md border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:border-slate-500 hover:text-white", children: "Cancel" }), _jsx("button", { type: "submit", disabled: submitting || !isPasswordValid, className: "rounded-md bg-brand px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-light disabled:cursor-not-allowed disabled:bg-slate-700", children: submitting
                                        ? "Submitting…"
                                        : tab === "login"
                                            ? "Login"
                                            : "Create Account" })] })] })] }) }));
}
function TabButton({ label, active, onClick, }) {
    const base = "flex-1 px-3 py-3 text-center text-sm font-medium transition focus:outline-none";
    const state = active
        ? "border-b-2 border-brand text-white"
        : "text-slate-400 hover:text-slate-200";
    return (_jsx("button", { type: "button", onClick: onClick, className: `${base} ${state}`, children: label }));
}
