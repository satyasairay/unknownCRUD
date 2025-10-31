import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { apiClient, formatError } from "../lib/apiClient";
import { WorkDetail, WorkSummary } from "../lib/types";
import { WorkFormModal } from "./WorkFormModal";







export function SMEWorkManager() {
  const { user } = useAuth();
  const [works, setWorks] = useState<WorkSummary[]>([]);
  const [selectedWork, setSelectedWork] = useState<WorkDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateWork, setShowCreateWork] = useState(false);
  const [editingWork, setEditingWork] = useState<WorkDetail | null>(null);

  const isSME = user?.roles?.includes("sme") || user?.roles?.includes("platform_admin") || user?.roles?.includes("admin");

  const loadWorks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<WorkSummary[]>("/works");
      setWorks(response.data);
    } catch (error) {
      setError(formatError(error));
    } finally {
      setLoading(false);
    }
  }, []);

  const loadWorkDetail = useCallback(async (workId: string) => {
    try {
      const response = await apiClient.get<WorkDetail>(`/works/${workId}`);
      setSelectedWork(response.data);
    } catch (error) {
      setError(formatError(error));
    }
  }, []);

  useEffect(() => {
    if (isSME) {
      loadWorks();
    }
  }, [isSME, loadWorks]);

  const handleCreateWork = async (workData: any) => {
    try {
      await apiClient.post("/works", workData);
      await loadWorks();
      setShowCreateWork(false);
      setError(null);
    } catch (error) {
      setError(formatError(error));
    }
  };

  const handleUpdateWork = async (workData: any) => {
    try {
      await apiClient.put(`/works/${workData.work_id}`, workData);
      await loadWorks();
      await loadWorkDetail(workData.work_id);
      setEditingWork(null);
      setError(null);
    } catch (error) {
      setError(formatError(error));
    }
  };

  const handleDeleteWork = async (workId: string) => {
    if (!confirm("Are you sure you want to delete this work? This action cannot be undone.")) return;
    
    try {
      await apiClient.delete(`/works/${workId}`);
      await loadWorks();
      if (selectedWork?.work_id === workId) {
        setSelectedWork(null);
      }
      setError(null);
    } catch (error) {
      setError(formatError(error));
    }
  };

  if (!isSME) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-slate-400">You don't have SME permissions to manage works.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Work Management</h2>
        <button
          onClick={() => setShowCreateWork(true)}
          className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-light"
        >
          Create Work
        </button>
      </div>

      {error && (
        <div className="rounded-md border border-rose-700 bg-rose-950/40 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand mx-auto mb-4"></div>
          <p className="text-slate-400">Loading works...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Works List */}
          <div className="lg:col-span-1">
            <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-800 bg-slate-950">
                <h3 className="text-lg font-semibold text-white">Works ({works.length})</h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {works.map((work) => (
                  <button
                    key={work.work_id}
                    onClick={() => loadWorkDetail(work.work_id)}
                    className={`w-full text-left px-4 py-3 border-b border-slate-800 last:border-b-0 hover:bg-slate-800/50 transition ${
                      selectedWork?.work_id === work.work_id ? 'bg-slate-800' : ''
                    }`}
                  >
                    <div className="font-medium text-white">
                      {work.title.en || work.title.bn || work.work_id}
                    </div>
                    <div className="text-sm text-slate-400">
                      ID: {work.work_id} • Languages: {work.langs.join(', ')}
                    </div>
                  </button>
                ))}
                {works.length === 0 ? (
                  <div className="p-6 text-center text-slate-400">
                    No works found. Click "Create Work" to add the first work.
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {/* Work Details */}
          <div className="lg:col-span-2">
            {selectedWork ? (
              <WorkDetails 
                work={selectedWork} 
                onEdit={() => setEditingWork(selectedWork)}
                onDelete={() => handleDeleteWork(selectedWork.work_id)}
              />
            ) : (
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-12 text-center">
                <p className="text-slate-400">Select a work to view details</p>
              </div>
            )}
          </div>
        </div>
      )}

      {showCreateWork && (
        <WorkFormModal
          title="Create New Work"
          onSubmit={handleCreateWork}
          onCancel={() => setShowCreateWork(false)}
        />
      )}

      {editingWork && (
        <WorkFormModal
          title="Edit Work"
          work={editingWork}
          onSubmit={handleUpdateWork}
          onCancel={() => setEditingWork(null)}
        />
      )}
    </div>
  );
}

function WorkDetails({ 
  work, 
  onEdit, 
  onDelete 
}: { 
  work: WorkDetail;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Work Details</h3>
          <div className="flex gap-2">
            <button
              onClick={onEdit}
              className="rounded-md bg-brand px-3 py-2 text-sm font-semibold text-white transition hover:bg-brand-light"
            >
              Edit
            </button>
            <button
              onClick={onDelete}
              className="rounded-md bg-rose-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
            >
              Delete
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-slate-400">Work ID</div>
            <div className="text-white font-mono">{work.work_id}</div>
          </div>
          <div>
            <div className="text-sm text-slate-400">Author</div>
            <div className="text-white">{work.author || 'Unknown'}</div>
          </div>
          <div>
            <div className="text-sm text-slate-400">Canonical Language</div>
            <div className="text-white">{work.canonical_lang.toUpperCase()}</div>
          </div>
          <div>
            <div className="text-sm text-slate-400">Languages</div>
            <div className="text-white">{work.langs.join(', ')}</div>
          </div>
        </div>

        <div className="mt-4">
          <div className="text-sm text-slate-400 mb-2">Titles</div>
          <div className="space-y-1">
            {Object.entries(work.title).map(([lang, title]) => (
              <div key={lang} className="flex gap-2">
                <span className="text-xs text-slate-500 w-8">{lang.toUpperCase()}:</span>
                <span className="text-white">{title || 'Not set'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Structure */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Structure</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(work.structure || {}).map(([key, value]) => (
            <div key={key}>
              <div className="text-sm text-slate-400">{key.replace('_', ' ')}</div>
              <div className="text-white">{value || 'Not set'}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Source Editions */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Source Editions</h3>
        <div className="space-y-3">
          {work.source_editions?.map((edition, index) => (
            <div key={index} className="border border-slate-700 rounded-lg p-3">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
                <div>
                  <span className="text-slate-400">ID:</span>
                  <span className="text-white ml-2 font-mono">{edition.id}</span>
                </div>
                <div>
                  <span className="text-slate-400">Lang:</span>
                  <span className="text-white ml-2">{edition.lang.toUpperCase()}</span>
                </div>
                <div>
                  <span className="text-slate-400">Type:</span>
                  <span className="text-white ml-2">{edition.type}</span>
                </div>
                <div>
                  <span className="text-slate-400">Provenance:</span>
                  <span className="text-white ml-2">{edition.provenance || 'Not set'}</span>
                </div>
              </div>
            </div>
          ))}
          {(!work.source_editions || work.source_editions.length === 0) ? (
            <p className="text-slate-400 italic">No source editions defined</p>
          ) : null}
        </div>
      </div>

      {/* Policy */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Policy</h3>
        <div className="space-y-2">
          {Object.entries(work.policy || {}).map(([key, value]) => (
            <div key={key} className="flex gap-2">
              <span className="text-slate-400 min-w-0 flex-shrink-0">{key.replace('_', ' ')}:</span>
              <span className="text-white break-words">{String(value) || 'Not set'}</span>
            </div>
          ))}
          {(!work.policy || Object.keys(work.policy).length === 0) ? (
            <p className="text-slate-400 italic">No policies defined</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}