import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const STATUS_LABELS = {
    draft: "Draft",
    review_pending: "In Review",
    approved: "Approved",
    locked: "Locked",
    rejected: "Rejected",
    flagged: "Flagged",
};
const STATUS_COLORS = {
    draft: "bg-slate-500 text-white",
    review_pending: "bg-amber-500 text-white",
    approved: "bg-emerald-500 text-white",
    locked: "bg-slate-700 text-white",
    rejected: "bg-rose-600 text-white",
    flagged: "bg-orange-600 text-white",
};
export function HeaderBar({ works, selectedWorkId, onWorkChange, status, isSaving, lastSavedAt, connection, userEmail, onLoginClick, onLogoutClick, onSave, onSaveNext, onValidate, onApprove, onReject, onFlag, onLock, onOpenVerseJump, canApprove, canReject, canFlag, canLock, }) {
    return (_jsx("header", { className: "sticky top-0 z-20 border-b border-slate-800 bg-slate-950/95 backdrop-blur", children: _jsxs("div", { className: "mx-auto flex max-w-7xl items-center gap-4 px-6 py-3", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("select", { className: "rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm focus:border-brand focus:outline-none", value: selectedWorkId, onChange: (event) => onWorkChange(event.target.value), children: [works.length === 0 && _jsx("option", { value: "", children: "No works" }), works.map((work) => (_jsx("option", { value: work.work_id, children: work.title.en ?? work.title.bn ?? work.work_id }, work.work_id)))] }), _jsx("button", { type: "button", onClick: onOpenVerseJump, className: "rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 hover:border-brand hover:text-white", children: "Jump to Verse" })] }), _jsx("div", { className: `rounded-full px-3 py-1 text-xs font-semibold ${STATUS_COLORS[status]}`, children: STATUS_LABELS[status] }), _jsx(ConnectionChip, { connection: connection }), _jsxs("div", { className: "ml-auto flex items-center gap-2", children: [_jsx(ActionButton, { label: "Save", shortcut: "\u2318S", onClick: onSave }), _jsx(ActionButton, { label: "Save & Next", shortcut: "\u2318\u21B5", onClick: onSaveNext }), _jsx(ActionButton, { label: "Validate", shortcut: "V", onClick: onValidate }), _jsx(ActionButton, { label: "Approve", shortcut: "A", onClick: onApprove, disabled: !canApprove }), _jsx(ActionButton, { label: "Reject", shortcut: "R", onClick: onReject, disabled: !canReject }), _jsx(ActionButton, { label: "Flag", shortcut: "F", onClick: onFlag, disabled: !canFlag }), _jsx(ActionButton, { label: "Lock", shortcut: "L", onClick: onLock, disabled: !canLock })] }), _jsx("div", { className: "text-right text-xs text-slate-400", children: isSaving ? (_jsx("span", { className: "font-medium text-brand-light", children: "Saving\u2026" })) : lastSavedAt ? (_jsxs("span", { children: ["Saved ", lastSavedAt] })) : (_jsx("span", { children: "Not saved yet" })) }), _jsx(AuthControls, { userEmail: userEmail, onLoginClick: onLoginClick, onLogoutClick: onLogoutClick })] }) }));
}
function ActionButton({ label, shortcut, onClick, disabled }) {
    return (_jsxs("button", { type: "button", onClick: onClick, disabled: disabled, className: "rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-medium text-slate-100 transition hover:border-brand hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:border-slate-800 disabled:bg-slate-800 disabled:text-slate-500", children: [_jsx("span", { children: label }), shortcut && (_jsx("span", { className: "ml-2 rounded border border-slate-700 bg-slate-950 px-1.5 py-0.5 text-[10px] uppercase tracking-widest text-slate-400", children: shortcut }))] }));
}
function ConnectionChip({ connection }) {
    const { healthy, checking, baseUrl } = connection;
    let label = "Checking…";
    let color = "bg-slate-700 text-slate-200 border-slate-600";
    if (!checking && healthy === true) {
        label = "Connected";
        color = "bg-emerald-600/20 text-emerald-300 border-emerald-500/40";
    }
    else if (!checking && healthy === false) {
        label = "Offline";
        color = "bg-rose-700/30 text-rose-200 border-rose-500/40";
    }
    return (_jsxs("div", { className: `hidden items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium sm:flex ${color}`, title: `API base: ${baseUrl}`, children: [_jsx("span", { className: "inline-flex h-2 w-2 rounded-full bg-current" }), label] }));
}
function AuthControls({ userEmail, onLoginClick, onLogoutClick, }) {
    if (userEmail) {
        return (_jsxs("div", { className: "flex items-center gap-3 text-xs text-slate-300", children: [_jsx("span", { className: "rounded-md border border-slate-700 bg-slate-900 px-3 py-1 font-medium text-slate-100", children: userEmail }), _jsx("button", { type: "button", onClick: onLogoutClick, className: "rounded-md border border-slate-700 px-3 py-1 text-xs text-slate-300 transition hover:border-rose-600 hover:text-rose-300", children: "Logout" })] }));
    }
    return (_jsx("button", { type: "button", onClick: onLoginClick, className: "rounded-md border border-brand/50 bg-brand/20 px-3 py-1 text-xs font-semibold text-brand-light transition hover:border-brand hover:bg-brand/30 hover:text-white", children: "Login" }));
}
