import { useCallback, useEffect, useMemo, useState } from "react";
import { HeaderBar } from "./components/HeaderBar";
import { EditorModal, TabConfig } from "./components/EditorModal";
import { VerseTab } from "./components/VerseTab";
import { AuthModal } from "./components/AuthModal";
import { useAuth } from "./context/AuthContext";
import { useAutosave } from "./hooks/useAutosave";
import { API_BASE_URL, apiClient, formatError } from "./lib/apiClient";
import {
  OriginEntry,
  ReviewState,
  SavePayload,
  VerseDraft,
  WorkDetail,
  WorkSummary,
} from "./lib/types";

interface SaveOptions {
  silent?: boolean;
  advance?: boolean;
}

const AUTOSAVE_INTERVAL = 30_000;

const DEFAULT_TABS: TabConfig[] = [
  { key: "verse", label: "Verse" },
  { key: "translations", label: "Translations", disabled: true },
  { key: "segments", label: "Segments", disabled: true },
  { key: "origin", label: "Origin", disabled: true },
  { key: "commentary", label: "Commentary", disabled: true },
  { key: "review", label: "Review", disabled: true },
  { key: "history", label: "History", disabled: true },
  { key: "preview", label: "Preview", disabled: true },
];

const STATUS_DEFAULT: ReviewState = "draft";

function buildInitialDraft(work: WorkDetail | null): VerseDraft {
  const canonicalLang = work?.canonical_lang ?? "bn";
  const origin: OriginEntry[] =
    work?.source_editions?.length && work.source_editions[0]
      ? [
          {
            edition: work.source_editions[0].id,
            page: 1,
            para_index: 1,
          },
        ]
      : [];

  return {
    verseId: undefined,
    manualNumber: "",
    systemOrder: null,
    texts: {
      [canonicalLang]: "",
      en: "",
    },
    tags: [],
    origin,
    status: STATUS_DEFAULT,
  };
}

function formatTimestamp(iso: string | null): string | null {
  if (!iso) {
    return null;
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function App() {
  const [works, setWorks] = useState<WorkSummary[]>([]);
  const [selectedWorkId, setSelectedWorkId] = useState<string>("");
  const [workDetail, setWorkDetail] = useState<WorkDetail | null>(null);
  const [verseDraft, setVerseDraft] = useState<VerseDraft>(buildInitialDraft(null));
  const [activeTab, setActiveTab] = useState<string>("verse");
  const [isSaving, setIsSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [connection, setConnection] = useState({
    healthy: null as boolean | null,
    checking: true,
    baseUrl: API_BASE_URL,
  });

  const { user, logout } = useAuth();

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      setBannerMessage("Signed out successfully.");
    } catch (error) {
      setBannerMessage(`Logout failed: ${formatError(error)}`);
    }
  }, [logout]);

  const pingConnection = useCallback(async () => {
    setConnection((prev) => ({ ...prev, checking: true }));
    try {
      await apiClient.get("/health", { timeout: 5000 });
      setConnection({ healthy: true, checking: false, baseUrl: API_BASE_URL });
    } catch {
      setConnection({ healthy: false, checking: false, baseUrl: API_BASE_URL });
    }
  }, []);

  const fetchWorks = useCallback(async () => {
    try {
      const response = await apiClient.get<WorkSummary[]>("/works");
      setWorks(response.data);
      if (!selectedWorkId && response.data.length > 0) {
        setSelectedWorkId(response.data[0].work_id);
      }
    } catch (error) {
      setWorks([]);
      setBannerMessage(`Failed to load works: ${formatError(error)}`);
    }
  }, [selectedWorkId]);

  const fetchWorkDetail = useCallback(
    async (workId: string) => {
      if (!workId) {
        return;
      }
      try {
        const response = await apiClient.get<WorkDetail>(`/works/${workId}`);
        setWorkDetail(response.data);
        setVerseDraft(buildInitialDraft(response.data));
        setDirty(false);
        setLastSavedAt(null);
        setErrorMessage(null);
      } catch (error) {
        setWorkDetail(null);
        setBannerMessage(`Failed to load work: ${formatError(error)}`);
      }
    },
    [],
  );

  useEffect(() => {
    void fetchWorks();
  }, [fetchWorks]);

  useEffect(() => {
    void pingConnection();
    const id = window.setInterval(() => {
      void pingConnection();
    }, 20_000);
    return () => window.clearInterval(id);
  }, [pingConnection]);

  useEffect(() => {
    if (selectedWorkId) {
      void fetchWorkDetail(selectedWorkId);
    }
  }, [selectedWorkId, fetchWorkDetail]);

  const setDraft = useCallback((updater: (prev: VerseDraft) => VerseDraft) => {
    setVerseDraft((prev) => {
      const next = updater(prev);
      return next;
    });
    setDirty(true);
  }, []);

  const handleManualNumberChange = (value: string) => {
    setErrorMessage(null);
    setDraft((prev) => ({ ...prev, manualNumber: value }));
  };

  const handleTextChange = (lang: string, value: string) => {
    setDraft((prev) => ({
      ...prev,
      texts: {
        ...prev.texts,
        [lang]: value,
      },
    }));
  };

  const handleTagsChange = (tags: string[]) => {
    setDraft((prev) => ({ ...prev, tags }));
  };

  const preparePayload = useCallback(
    (options?: { silent?: boolean }): SavePayload | null => {
      if (!workDetail) {
        return null;
      }

      const manualNumber = verseDraft.manualNumber.trim();
      if (!manualNumber) {
        if (!options?.silent) {
          setErrorMessage("Manual verse number is required.");
        }
        return null;
      }

      const canonicalLang = workDetail.canonical_lang;
      const canonicalText = verseDraft.texts[canonicalLang]?.trim() ?? "";
      if (!canonicalText) {
        if (!options?.silent) {
          setErrorMessage(
            `Canonical text (${canonicalLang.toUpperCase()}) must not be empty.`,
          );
        }
        return null;
      }

      return {
        number_manual: manualNumber,
      texts: {
        ...verseDraft.texts,
      },
      origin: verseDraft.origin.length
        ? verseDraft.origin
        : [
            {
              edition: workDetail.source_editions[0]?.id ?? "UNKNOWN",
              page: 1,
              para_index: 1,
            },
          ],
      tags: verseDraft.tags,
    };
  },
    [verseDraft, workDetail],
  );

  const handleSave = useCallback(
    async (options?: SaveOptions) => {
      if (!selectedWorkId || !workDetail) {
        return;
      }

      const payload = preparePayload({ silent: options?.silent });
      if (!payload) {
        return;
      }

      setIsSaving(true);
      setErrorMessage(null);
      try {
        if (verseDraft.verseId) {
          await apiClient.put(
            `/works/${selectedWorkId}/verses/${verseDraft.verseId}`,
            payload,
          );
        } else {
          const response = await apiClient.post(
            `/works/${selectedWorkId}/verses`,
            payload,
          );
          const verseId = response.data?.verse_id as string | undefined;
          if (verseId) {
            setVerseDraft((prev) => ({ ...prev, verseId }));
          }
        }

        setDirty(false);
        setLastSavedAt(new Date().toISOString());
        if (!options?.silent) {
          setBannerMessage("Verse saved successfully.");
        }

        if (options?.advance) {
          setVerseDraft((prev) => ({
            ...buildInitialDraft(workDetail),
            manualNumber: incrementManualNumber(prev.manualNumber),
          }));
          setLastSavedAt(null);
          setDirty(false);
        }
      } catch (error) {
        const message = formatError(error);
        setErrorMessage(message);
        if (!options?.silent) {
          setBannerMessage(`Save failed: ${message}`);
        }
      } finally {
        setIsSaving(false);
      }
    },
    [preparePayload, selectedWorkId, verseDraft.verseId, workDetail],
  );

  useAutosave(
    () => handleSave({ silent: true }),
    dirty && !isSaving,
    AUTOSAVE_INTERVAL,
  );

  const handleSaveAndNext = () => {
    void handleSave({ advance: true });
  };

  const onValidate = () => {
    setBannerMessage("Validation flow coming soon.");
  };

  const onApprove = () => {
    setBannerMessage("Approval flow coming soon.");
  };

  const onReject = () => {
    setBannerMessage("Rejection flow coming soon.");
  };

  const formattedSavedAt = useMemo(
    () => formatTimestamp(lastSavedAt),
    [lastSavedAt],
  );

  const canonicalLang = workDetail?.canonical_lang ?? "bn";

  return (
    <div className="min-h-screen bg-slate-950 pb-12">
      <HeaderBar
        works={works}
        selectedWorkId={selectedWorkId}
        onWorkChange={setSelectedWorkId}
        status={verseDraft.status}
        isSaving={isSaving}
        lastSavedAt={formattedSavedAt}
        connection={connection}
        userEmail={user?.email ?? null}
        onLoginClick={() => setAuthModalOpen(true)}
        onLogoutClick={() => void handleLogout()}
        onSave={() => void handleSave()}
        onSaveNext={handleSaveAndNext}
        onValidate={onValidate}
        onApprove={onApprove}
        onReject={onReject}
        onOpenVerseJump={() =>
          setBannerMessage("Verse search/jump coming soon.")
        }
        disableReviewerActions={!user}
      />

      <main className="mx-auto max-w-7xl px-6">
        {bannerMessage && (
          <div className="mt-6 rounded-md border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-200">
            <div className="flex items-center justify-between">
              <span>{bannerMessage}</span>
              <button
                type="button"
                className="text-xs text-slate-400 hover:text-white"
                onClick={() => setBannerMessage(null)}
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        <EditorModal
          title={
            workDetail
              ? `${workDetail.title.en ?? workDetail.work_id} • Verse Editor`
              : "Verse Editor"
          }
          tabs={DEFAULT_TABS}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        >
          {activeTab === "verse" ? (
            <VerseTab
              draft={verseDraft}
              canonicalLang={canonicalLang}
              errorMessage={errorMessage}
              onManualNumberChange={handleManualNumberChange}
              onTextChange={handleTextChange}
              onTagsChange={handleTagsChange}
            />
          ) : (
            <PlaceholderTab label={activeTab} />
          )}
        </EditorModal>
      </main>
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </div>
  );
}

function PlaceholderTab({ label }: { label: string }) {
  return (
    <div className="rounded-md border border-dashed border-slate-700 bg-slate-900/40 px-4 py-14 text-center text-sm text-slate-400">
      {label} tab coming soon.
    </div>
  );
}

function incrementManualNumber(current: string): string {
  const numeric = parseInt(current, 10);
  if (Number.isNaN(numeric)) {
    return current;
  }
  return String(numeric + 1);
}
