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
  return (
    <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-3">
        <div className="flex items-center gap-3">
          <select
            className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm focus:border-brand focus:outline-none"
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
            className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 hover:border-brand hover:text-white"
          >
            Jump to Verse
          </button>
        </div>

        <div
          className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_COLORS[status]}`}
        >
          {STATUS_LABELS[status]}
        </div>

        <ConnectionChip connection={connection} />

        <div className="ml-auto flex items-center gap-2">
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

        <div className="text-right text-xs text-slate-400">
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
      <div className="flex items-center gap-3 text-xs text-slate-300">
        <span className="rounded-md border border-slate-700 bg-slate-900 px-3 py-1 font-medium text-slate-100">
          {userEmail}
        </span>
        <button
          type="button"
          onClick={onLogoutClick}
          className="rounded-md border border-slate-700 px-3 py-1 text-xs text-slate-300 transition hover:border-rose-600 hover:text-rose-300"
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
      className="rounded-md border border-brand/50 bg-brand/20 px-3 py-1 text-xs font-semibold text-brand-light transition hover:border-brand hover:bg-brand/30 hover:text-white"
    >
      Login
    </button>
  );
}
