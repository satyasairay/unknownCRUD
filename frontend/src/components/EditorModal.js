import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function EditorModal({ title, tabs, activeTab, onTabChange, children, }) {
    return (_jsxs("div", { className: "mx-auto mt-6 w-full max-w-7xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl shadow-black/40", children: [_jsx("div", { className: "flex items-center justify-between border-b border-slate-800 px-6 py-4", children: _jsx("h2", { className: "text-lg font-semibold text-slate-100", children: title }) }), _jsx("nav", { className: "flex gap-1 border-b border-slate-800 px-4", children: tabs.map((tab) => {
                    const isActive = tab.key === activeTab;
                    const baseClasses = "px-4 py-3 text-sm font-medium transition focus:outline-none";
                    const activeClasses = isActive
                        ? "border-b-2 border-brand text-white"
                        : "text-slate-400 hover:text-slate-200";
                    const disabledClasses = tab.disabled
                        ? "cursor-not-allowed opacity-40"
                        : "cursor-pointer";
                    return (_jsx("button", { type: "button", className: `${baseClasses} ${activeClasses} ${disabledClasses}`, onClick: () => {
                            if (!tab.disabled) {
                                onTabChange(tab.key);
                            }
                        }, disabled: tab.disabled, children: tab.label }, tab.key));
                }) }), _jsx("div", { className: "px-6 py-6", children: children })] }));
}
