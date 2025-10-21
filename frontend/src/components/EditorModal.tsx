import { ReactNode } from "react";

export interface TabConfig {
  key: string;
  label: string;
  disabled?: boolean;
}

interface EditorModalProps {
  title: string;
  tabs: TabConfig[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  children: ReactNode;
}

export function EditorModal({
  title,
  tabs,
  activeTab,
  onTabChange,
  children,
}: EditorModalProps) {
  return (
    <div className="mx-auto mt-6 w-full max-w-7xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl shadow-black/40">
      <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
        <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
      </div>

      <nav className="flex gap-1 border-b border-slate-800 px-4">
        {tabs.map((tab) => {
          const isActive = tab.key === activeTab;
          const baseClasses =
            "px-4 py-3 text-sm font-medium transition focus:outline-none";
          const activeClasses = isActive
            ? "border-b-2 border-brand text-white"
            : "text-slate-400 hover:text-slate-200";
          const disabledClasses = tab.disabled
            ? "cursor-not-allowed opacity-40"
            : "cursor-pointer";

          return (
            <button
              key={tab.key}
              type="button"
              className={`${baseClasses} ${activeClasses} ${disabledClasses}`}
              onClick={() => {
                if (!tab.disabled) {
                  onTabChange(tab.key);
                }
              }}
              disabled={tab.disabled}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>

      <div className="px-6 py-6">{children}</div>
    </div>
  );
}
