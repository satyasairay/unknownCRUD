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
  onSave: () => void;
  onSaveNext: () => void;
  onValidate: () => void;
  onApprove: () => void;
  onReject: () => void;
  onOpenVerseJump: () => void;
}

export function HeaderBar({
  works,
  selectedWorkId,
  onWorkChange,
  status,
  isSaving,
  lastSavedAt,
  onSave,
  onSaveNext,
  onValidate,
  onApprove,
  onReject,
  onOpenVerseJump,
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

        <div className="ml-auto flex items-center gap-2">
          <ActionButton label="Save" shortcut="⌘S" onClick={onSave} />
          <ActionButton label="Save & Next" shortcut="⌘↵" onClick={onSaveNext} />
          <ActionButton label="Validate" shortcut="V" onClick={onValidate} />
          <ActionButton label="Approve" shortcut="A" onClick={onApprove} />
          <ActionButton label="Reject" shortcut="R" onClick={onReject} />
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
      </div>
    </header>
  );
}

interface ActionButtonProps {
  label: string;
  shortcut?: string;
  onClick: () => void;
}

function ActionButton({ label, shortcut, onClick }: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-medium text-slate-100 transition hover:border-brand hover:bg-slate-800 hover:text-white"
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
