import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { apiClient, formatError } from "../lib/apiClient";
import { WorkDetail, WorkSummary } from "../lib/types";
import { SMEVerseEditor } from "./SMEVerseEditor";

interface BookCreateRequest {
  work_id: string;
  title: Record<string, string>;
  author?: string;
  canonical_lang: string;
  langs: string[];
  structure: Record<string, string>;
  source_editions: Array<{
    id: string;
    lang: string;
    type: string;
    provenance?: string;
  }>;
}

interface VerseCreateRequest {
  number_manual: string;
  texts: Record<string, string>;
  origin: Array<{
    edition: string;
    page?: number;
    para_index?: number;
  }>;
  tags: string[];
}

const LANGUAGES = [
  { code: 'bn', name: 'Bengali' },
  { code: 'en', name: 'English' },
  { code: 'or', name: 'Odia' },
  { code: 'hi', name: 'Hindi' },
  { code: 'as', name: 'Assamese' }
];

export function SMEBookManager() {
  const { user } = useAuth();
  const [works, setWorks] = useState<WorkSummary[]>([]);
  const [selectedWork, setSelectedWork] = useState<WorkDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateBook, setShowCreateBook] = useState(false);
  const [showCreateVerse, setShowCreateVerse] = useState(false);
  const [editingVerse, setEditingVerse] = useState<{ workId: string; verseId: string } | null>(null);

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

  const handleCreateBook = async (bookData: BookCreateRequest) => {
    try {
      await apiClient.post("/works", bookData);
      await loadWorks();
      setShowCreateBook(false);
      setError(null);
    } catch (error) {
      setError(formatError(error));
    }
  };

  const handleCreateVerse = async (verseData: VerseCreateRequest) => {
    if (!selectedWork) return;
    
    try {
      await apiClient.post(`/works/${selectedWork.work_id}/verses`, verseData);
      setShowCreateVerse(false);
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
          <p className="text-slate-400">You don't have SME permissions to manage books.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-white sm:text-3xl">Book Management</h1>
          <button
            onClick={() => setShowCreateBook(true)}
            className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-light"
          >
            Create New Book
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-md border border-rose-700 bg-rose-950/40 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand mx-auto mb-4"></div>
            <p className="text-slate-400">Loading books...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Books List */}
            <div className="lg:col-span-1">
              <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-800 bg-slate-950">
                  <h3 className="text-lg font-semibold text-white">Books</h3>
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
                        Languages: {work.langs.join(', ')}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Book Details */}
            <div className="lg:col-span-2">
              {selectedWork ? (
                <BookDetails 
                  work={selectedWork} 
                  onCreateVerse={() => setShowCreateVerse(true)}
                  onEditVerse={(verseId) => setEditingVerse({ workId: selectedWork.work_id, verseId })}
                />
              ) : (
                <div className="rounded-xl border border-slate-800 bg-slate-900 p-12 text-center">
                  <p className="text-slate-400">Select a book to view details</p>
                </div>
              )}
            </div>
          </div>
        )}

        {showCreateBook && (
          <CreateBookModal
            onSubmit={handleCreateBook}
            onCancel={() => setShowCreateBook(false)}
          />
        )}

        {showCreateVerse && selectedWork && (
          <CreateVerseModal
            work={selectedWork}
            onSubmit={handleCreateVerse}
            onCancel={() => setShowCreateVerse(false)}
          />
        )}

        {editingVerse && (
          <SMEVerseEditor
            workId={editingVerse.workId}
            verseId={editingVerse.verseId}
            onClose={() => setEditingVerse(null)}
            onSave={() => setEditingVerse(null)}
          />
        )}
      </div>
    </div>
  );
}

function BookDetails({ 
  work, 
  onCreateVerse, 
  onEditVerse 
}: { 
  work: WorkDetail;
  onCreateVerse: () => void;
  onEditVerse: (verseId: string) => void;
}) {
  const [verses, setVerses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadVerses = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/works/${work.work_id}/verses`);
      setVerses(response.data.items || []);
    } catch (error) {
      console.error('Failed to load verses:', error);
    } finally {
      setLoading(false);
    }
  }, [work.work_id]);

  useEffect(() => {
    loadVerses();
  }, [loadVerses]);

  return (
    <div className="space-y-6">
      {/* Book Info */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Book Details</h3>
          <button
            onClick={onCreateVerse}
            className="rounded-md bg-brand px-3 py-2 text-sm font-semibold text-white transition hover:bg-brand-light"
          >
            Add Verse
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-slate-400">Title</div>
            <div className="text-white">{work.title.en || work.title.bn || 'Untitled'}</div>
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
      </div>

      {/* Verses */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-800 bg-slate-950">
          <h3 className="text-lg font-semibold text-white">Verses ({verses.length})</h3>
        </div>
        
        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand mx-auto mb-2"></div>
            <p className="text-slate-400">Loading verses...</p>
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {verses.map((verse) => (
              <div
                key={verse.verse_id}
                className="px-4 py-3 border-b border-slate-800 last:border-b-0 hover:bg-slate-800/50"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-white">
                      Verse {verse.number_manual || verse.verse_id}
                    </div>
                    <div className="text-sm text-slate-400 truncate max-w-md">
                      {(Object.values(verse.texts || {}).find(text => text) as string) || 'No content'}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      verse.review?.state === 'approved' ? 'bg-emerald-500/20 text-emerald-300' :
                      verse.review?.state === 'rejected' ? 'bg-rose-500/20 text-rose-300' :
                      verse.review?.state === 'flagged' ? 'bg-orange-500/20 text-orange-300' :
                      'bg-slate-500/20 text-slate-300'
                    }`}>
                      {verse.review?.state || 'draft'}
                    </span>
                    <button
                      onClick={() => onEditVerse(verse.verse_id)}
                      className="text-xs text-brand hover:text-brand-light"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {verses.length === 0 ? (
              <div className="p-6 text-center text-slate-400">
                No verses found. Click "Add Verse" to create the first verse.
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

function CreateBookModal({ 
  onSubmit, 
  onCancel 
}: { 
  onSubmit: (data: BookCreateRequest) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<BookCreateRequest>({
    work_id: '',
    title: { en: '', bn: '' },
    author: '',
    canonical_lang: 'bn',
    langs: ['bn', 'en'],
    structure: {},
    source_editions: []
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const toggleLanguage = (langCode: string) => {
    setFormData(prev => ({
      ...prev,
      langs: prev.langs.includes(langCode)
        ? prev.langs.filter(l => l !== langCode)
        : [...prev.langs, langCode]
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-2xl rounded-lg border border-slate-800 bg-slate-900 shadow-2xl">
        <div className="border-b border-slate-800 px-6 py-4">
          <h3 className="text-lg font-semibold text-slate-100">Create New Book</h3>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-200">Work ID</label>
                <input
                  type="text"
                  required
                  value={formData.work_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, work_id: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm focus:border-brand focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200">Author</label>
                <input
                  type="text"
                  value={formData.author}
                  onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm focus:border-brand focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-200">English Title</label>
                <input
                  type="text"
                  value={formData.title.en}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    title: { ...prev.title, en: e.target.value }
                  }))}
                  className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm focus:border-brand focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200">Bengali Title</label>
                <input
                  type="text"
                  value={formData.title.bn}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    title: { ...prev.title, bn: e.target.value }
                  }))}
                  className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm focus:border-brand focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200">Canonical Language</label>
              <select
                value={formData.canonical_lang}
                onChange={(e) => setFormData(prev => ({ ...prev, canonical_lang: e.target.value }))}
                className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm focus:border-brand focus:outline-none"
              >
                {LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code}>{lang.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">Languages</label>
              <div className="grid grid-cols-2 gap-2">
                {LANGUAGES.map(lang => (
                  <label key={lang.code} className="flex items-center gap-2 text-sm text-slate-300">
                    <input
                      type="checkbox"
                      checked={formData.langs.includes(lang.code)}
                      onChange={() => toggleLanguage(lang.code)}
                      className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-brand focus:ring-brand"
                    />
                    {lang.name}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 rounded-md border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:border-slate-500 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-light"
            >
              Create Book
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CreateVerseModal({ 
  work,
  onSubmit, 
  onCancel 
}: { 
  work: WorkDetail;
  onSubmit: (data: VerseCreateRequest) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<VerseCreateRequest>({
    number_manual: '',
    texts: Object.fromEntries(work.langs.map(lang => [lang, ''])),
    origin: work.source_editions.length > 0 ? [{
      edition: work.source_editions[0].id,
      page: 1,
      para_index: 1
    }] : [],
    tags: []
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-2xl rounded-lg border border-slate-800 bg-slate-900 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="border-b border-slate-800 px-6 py-4">
          <h3 className="text-lg font-semibold text-slate-100">Add New Verse</h3>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-200">Verse Number</label>
              <input
                type="text"
                required
                value={formData.number_manual}
                onChange={(e) => setFormData(prev => ({ ...prev, number_manual: e.target.value }))}
                className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm focus:border-brand focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">Texts</label>
              <div className="space-y-3">
                {work.langs.map(lang => (
                  <div key={lang}>
                    <label className="block text-xs text-slate-400 mb-1">{lang.toUpperCase()}</label>
                    <textarea
                      value={formData.texts[lang] || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        texts: { ...prev.texts, [lang]: e.target.value }
                      }))}
                      rows={2}
                      className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm focus:border-brand focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 rounded-md border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:border-slate-500 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-light"
            >
              Add Verse
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}