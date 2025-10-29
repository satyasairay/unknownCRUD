import { useState } from "react";
import { ReviewState, WorkSummary } from "../lib/types";

const STATUS_LABELS: Record<ReviewState, string> = {
  draft: "Draft",
  review_pending: "In Review",
  approved: "Approved",
  locked: "Locked",
  rejected: "Rejected",
  flagged: "Flagged",
};

const STATUS_COLORS: Record<ReviewState, string> = {
  draft: "bg-slate-500 text-white",
  review_pending: "bg-amber-500 text-white",
  approved: "bg-emerald-500 text-white",
  locked: "bg-slate-700 text-white",
  rejected: "bg-rose-600 text-white",
  flagged: "bg-orange-600 text-white",
};

interface HeaderBarProps {
  works: WorkSummary[];
  selectedWorkId: string;
  onWorkChange: (workId: string) => void;
  status: ReviewState;
  isSaving: boolean;
  lastSavedAt: string | null;
  connection: ConnectionState;
  userEmail: string | null;
  onLoginClick: () => void;
  onLogoutClick: () => void;
  onSave: () => void;
  onSaveNext: () => void;
  onValidate: () => void;
  onApprove: () => void;
  onReject: () => void;
  onFlag: () => void;
  onLock: () => void;
  onOpenVerseJump: () => void;
  canApprove: boolean;
  canReject: boolean;
  canFlag: boolean;
  canLock: boolean;
}

export function HeaderBar({
  works,
  selectedWorkId,
  onWorkChange,
  status,
  isSaving,
  lastSavedAt,
  connection,
  userEmail,
  onLoginClick,
  onLogoutClick,
  onSave,
  onSaveNext,
  onValidate,
  onApprove,
  onReject,
  onFlag,
  onLock,
  onOpenVerseJump,
  canApprove,
  canReject,
  canFlag,
  canLock,
}: HeaderBarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Main header row */}
        <div className="flex items-center justify-between py-3">
          {/* Left section */}
          <div className="flex items-center gap-3">
            <select
              className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5 text-sm focus:border-brand focus:outline-none sm:px-3 sm:py-2"
              value={selectedWorkId}
              onChange={(event) => onWorkChange(event.target.value)}
            >
              {works.length === 0 && <option value="">No works</option>}
              {works.map((work) => (
                <option key={work.work_id} value={work.work_id}>
                  {work.title.en ?? work.title.bn ?? work.work_id}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={onOpenVerseJump}
              className="hidden rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 hover:border-brand hover:text-white sm:block"
            >
              Jump to Verse
            </button>
          </div>

          {/* Center section - Status */}
          <div
            className={`rounded-full px-2 py-1 text-xs font-semibold sm:px-3 ${STATUS_COLORS[status]}`}
          >
            {STATUS_LABELS[status]}
          </div>

          {/* Right section */}
          <div className="flex items-center gap-2">
            <ConnectionChip connection={connection} />
            
            {/* Desktop actions */}
            <div className="hidden items-center gap-2 lg:flex">
              <ActionButton label="Save" shortcut="⌘S" onClick={onSave} />
              <ActionButton label="Save & Next" shortcut="⌘↵" onClick={onSaveNext} />
              <ActionButton label="Validate" shortcut="V" onClick={onValidate} />
              <ActionButton
                label="Approve"
                shortcut="A"
                onClick={onApprove}
                disabled={!canApprove}
              />
              <ActionButton
                label="Reject"
                shortcut="R"
                onClick={onReject}
                disabled={!canReject}
              />
              <ActionButton
                label="Flag"
                shortcut="F"
                onClick={onFlag}
                disabled={!canFlag}
              />
              <ActionButton
                label="Lock"
                shortcut="L"
                onClick={onLock}
                disabled={!canLock}
              />
            </div>

            {/* Save status */}
            <div className="hidden text-right text-xs text-slate-400 sm:block">
              {isSaving ? (
                <span className="font-medium text-brand-light">Saving…</span>
              ) : lastSavedAt ? (
                <span>Saved {lastSavedAt}</span>
              ) : (
                <span>Not saved yet</span>
              )}
            </div>

            <AuthControls
              userEmail={userEmail}
              onLoginClick={onLoginClick}
              onLogoutClick={onLogoutClick}
            />

            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="rounded-md border border-slate-700 bg-slate-900 p-2 text-slate-200 hover:border-brand hover:text-white lg:hidden"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="border-t border-slate-800 py-3 lg:hidden">
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={onOpenVerseJump}
                className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-left text-sm text-slate-200 hover:border-brand hover:text-white sm:hidden"
              >
                Jump to Verse
              </button>
              
              <div className="grid grid-cols-2 gap-2">
                <MobileActionButton label="Save" onClick={onSave} />
                <MobileActionButton label="Save & Next" onClick={onSaveNext} />
                <MobileActionButton label="Validate" onClick={onValidate} />
                <MobileActionButton
                  label="Approve"
                  onClick={onApprove}
                  disabled={!canApprove}
                />
                <MobileActionButton
                  label="Reject"
                  onClick={onReject}
                  disabled={!canReject}
                />
                <MobileActionButton
                  label="Flag"
                  onClick={onFlag}
                  disabled={!canFlag}
                />
                <MobileActionButton
                  label="Lock"
                  onClick={onLock}
                  disabled={!canLock}
                />
              </div>
              
              <div className="mt-2 text-center text-xs text-slate-400 sm:hidden">
                {isSaving ? (
                  <span className="font-medium text-brand-light">Saving…</span>
                ) : lastSavedAt ? (
                  <span>Saved {lastSavedAt}</span>
                ) : (
                  <span>Not saved yet</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

interface ActionButtonProps {
  label: string;
  shortcut?: string;
  onClick: () => void;
  disabled?: boolean;
}

function ActionButton({ label, shortcut, onClick, disabled }: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-medium text-slate-100 transition hover:border-brand hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:border-slate-800 disabled:bg-slate-800 disabled:text-slate-500"
    >
      <span>{label}</span>
      {shortcut && (
        <span className="ml-2 rounded border border-slate-700 bg-slate-950 px-1.5 py-0.5 text-[10px] uppercase tracking-widest text-slate-400">
          {shortcut}
        </span>
      )}
    </button>
  );
}

function MobileActionButton({ label, onClick, disabled }: { label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-medium text-slate-100 transition hover:border-brand hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:border-slate-800 disabled:bg-slate-800 disabled:text-slate-500"
    >
      {label}
    </button>
  );
}

interface ConnectionState {
  healthy: boolean | null;
  checking: boolean;
  baseUrl: string;
}

function ConnectionChip({ connection }: { connection: ConnectionState }) {
  const { healthy, checking, baseUrl } = connection;
  let label = "Checking…";
  let color = "bg-slate-700 text-slate-200 border-slate-600";

  if (!checking && healthy === true) {
    label = "Connected";
    color = "bg-emerald-600/20 text-emerald-300 border-emerald-500/40";
  } else if (!checking && healthy === false) {
    label = "Offline";
    color = "bg-rose-700/30 text-rose-200 border-rose-500/40";
  }

  return (
    <div
      className={`hidden items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium sm:flex ${color}`}
      title={`API base: ${baseUrl}`}
    >
      <span className="inline-flex h-2 w-2 rounded-full bg-current" />
      {label}
    </div>
  );
}

function AuthControls({
  userEmail,
  onLoginClick,
  onLogoutClick,
}: {
  userEmail: string | null;
  onLoginClick: () => void;
  onLogoutClick: () => void;
}) {
  if (userEmail) {
    return (
      <div className="flex items-center gap-2 text-xs text-slate-300 sm:gap-3">
        <span className="hidden rounded-md border border-slate-700 bg-slate-900 px-2 py-1 font-medium text-slate-100 sm:block sm:px-3">
          {userEmail}
        </span>
        <button
          type="button"
          onClick={onLogoutClick}
          className="rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-300 transition hover:border-rose-600 hover:text-rose-300 sm:px-3"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onLoginClick}
      className="rounded-md border border-brand/50 bg-brand/20 px-2 py-1 text-xs font-semibold text-brand-light transition hover:border-brand hover:bg-brand/30 hover:text-white sm:px-3"
    >
      Login
    </button>
  );
}
