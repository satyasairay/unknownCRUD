import { useState } from "react";
import { WorkDetail } from "../lib/types";

interface SourceEdition {
  id: string;
  lang: string;
  type: string;
  provenance?: string;
}

interface WorkFormData {
  work_id: string;
  title: Record<string, string | null>;
  author?: string;
  canonical_lang: string;
  langs: string[];
  structure: Record<string, string | null>;
  source_editions: SourceEdition[];
  policy: Record<string, string | null>;
}

interface WorkFormModalProps {
  title: string;
  work?: WorkDetail;
  onSubmit: (data: WorkFormData) => void;
  onCancel: () => void;
}

const LANGUAGES = [
  { code: 'bn', name: 'Bengali' },
  { code: 'en', name: 'English' },
  { code: 'or', name: 'Odia' },
  { code: 'hi', name: 'Hindi' },
  { code: 'as', name: 'Assamese' }
];

export function WorkFormModal({ title, work, onSubmit, onCancel }: WorkFormModalProps) {
  const [formData, setFormData] = useState<WorkFormData>({
    work_id: work?.work_id || '',
    title: work?.title || { en: '', bn: '' },
    author: work?.author || '',
    canonical_lang: work?.canonical_lang || 'bn',
    langs: work?.langs || ['bn', 'en'],
    structure: work?.structure || { unit: 'verse', numbering: 'sequential' },
    source_editions: work?.source_editions?.map(se => ({ ...se, provenance: se.provenance || '' })) || [],
    policy: (work?.policy as Record<string, string | null>) || {}
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

  const addSourceEdition = () => {
    setFormData(prev => ({
      ...prev,
      source_editions: [...prev.source_editions, { id: '', lang: 'bn', type: 'pdf', provenance: '' }]
    }));
  };

  const updateSourceEdition = (index: number, field: keyof SourceEdition, value: string) => {
    setFormData(prev => ({
      ...prev,
      source_editions: prev.source_editions.map((edition, i) => 
        i === index ? { ...edition, [field]: value } : edition
      )
    }));
  };

  const removeSourceEdition = (index: number) => {
    setFormData(prev => ({
      ...prev,
      source_editions: prev.source_editions.filter((_, i) => i !== index)
    }));
  };

  const updateStructure = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      structure: { ...prev.structure, [key]: value }
    }));
  };

  const updatePolicy = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      policy: { ...prev.policy, [key]: value }
    }));
  };

  const addPolicyField = () => {
    const key = prompt("Enter policy key:");
    if (key && key.trim()) {
      updatePolicy(key.trim(), '');
    }
  };

  const removePolicyField = (key: string) => {
    setFormData(prev => {
      const newPolicy = { ...prev.policy };
      delete newPolicy[key];
      return { ...prev, policy: newPolicy };
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-4xl rounded-lg border border-slate-800 bg-slate-900 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="border-b border-slate-800 px-6 py-4">
          <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6">
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h4 className="text-md font-semibold text-white mb-4">Basic Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-200">Work ID</label>
                  <input
                    type="text"
                    required
                    disabled={!!work}
                    value={formData.work_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, work_id: e.target.value }))}
                    className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm focus:border-brand focus:outline-none disabled:opacity-50"
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
            </div>

            {/* Titles */}
            <div>
              <h4 className="text-md font-semibold text-white mb-4">Titles</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {LANGUAGES.map(lang => (
                  <div key={lang.code}>
                    <label className="block text-sm font-medium text-slate-200">{lang.name} Title</label>
                    <input
                      type="text"
                      value={formData.title[lang.code] || ''}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        title: { ...prev.title, [lang.code]: e.target.value }
                      }))}
                      className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm focus:border-brand focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Language Configuration */}
            <div>
              <h4 className="text-md font-semibold text-white mb-4">Language Configuration</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <label className="block text-sm font-medium text-slate-200 mb-2">Supported Languages</label>
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
            </div>

            {/* Structure */}
            <div>
              <h4 className="text-md font-semibold text-white mb-4">Structure</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-200">Unit</label>
                  <select
                    value={formData.structure.unit || 'verse'}
                    onChange={(e) => updateStructure('unit', e.target.value)}
                    className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm focus:border-brand focus:outline-none"
                  >
                    <option value="verse">Verse</option>
                    <option value="chapter">Chapter</option>
                    <option value="section">Section</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-200">Numbering</label>
                  <select
                    value={formData.structure.numbering || 'sequential'}
                    onChange={(e) => updateStructure('numbering', e.target.value)}
                    className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm focus:border-brand focus:outline-none"
                  >
                    <option value="sequential">Sequential</option>
                    <option value="hierarchical">Hierarchical</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Source Editions */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-md font-semibold text-white">Source Editions</h4>
                <button
                  type="button"
                  onClick={addSourceEdition}
                  className="text-sm text-brand hover:text-brand-light"
                >
                  + Add Edition
                </button>
              </div>
              <div className="space-y-3">
                {formData.source_editions.map((edition, index) => (
                  <div key={index} className="border border-slate-700 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Edition ID</label>
                        <input
                          type="text"
                          value={edition.id}
                          onChange={(e) => updateSourceEdition(index, 'id', e.target.value)}
                          className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-sm focus:border-brand focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Language</label>
                        <select
                          value={edition.lang}
                          onChange={(e) => updateSourceEdition(index, 'lang', e.target.value)}
                          className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-sm focus:border-brand focus:outline-none"
                        >
                          {LANGUAGES.map(lang => (
                            <option key={lang.code} value={lang.code}>{lang.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Type</label>
                        <select
                          value={edition.type}
                          onChange={(e) => updateSourceEdition(index, 'type', e.target.value)}
                          className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-sm focus:border-brand focus:outline-none"
                        >
                          <option value="pdf">PDF</option>
                          <option value="book">Book</option>
                          <option value="manuscript">Manuscript</option>
                          <option value="digital">Digital</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Provenance</label>
                        <div className="flex gap-1">
                          <input
                            type="text"
                            value={edition.provenance || ''}
                            onChange={(e) => updateSourceEdition(index, 'provenance', e.target.value)}
                            className="flex-1 rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-sm focus:border-brand focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => removeSourceEdition(index)}
                            className="text-rose-400 hover:text-rose-300 px-2"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Policy */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-md font-semibold text-white">Policy</h4>
                <button
                  type="button"
                  onClick={addPolicyField}
                  className="text-sm text-brand hover:text-brand-light"
                >
                  + Add Policy
                </button>
              </div>
              <div className="space-y-3">
                {Object.entries(formData.policy).map(([key, value]) => (
                  <div key={key} className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-xs text-slate-400 mb-1">{key.replace('_', ' ')}</label>
                      <input
                        type="text"
                        value={value || ''}
                        onChange={(e) => updatePolicy(key, e.target.value)}
                        className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm focus:border-brand focus:outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removePolicyField(key)}
                      className="text-rose-400 hover:text-rose-300 px-2 mt-6"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {Object.keys(formData.policy).length === 0 && (
                  <p className="text-slate-400 italic text-sm">No policies defined. Click "Add Policy" to add one.</p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 flex gap-3">
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
              {work ? "Update Work" : "Create Work"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}