import { useState, useEffect } from 'react';
import { Button } from '../ui/button.jsx';
import { Input } from '../ui/input.jsx';
import { uploadProjectMedia } from '../../api/projectMedia.api.js';
import { getStages } from '../../api/payments.api.js';
import { getLabour } from '../../api/labour.api.js';
import { getProjectMaterials } from '../../api/materials.api.js';
import { getProjectAssociates } from '../../api/associates.api.js';
import { getBills } from '../../api/bills.api.js';
import { getProjectExpenses } from '../../api/expenses.api.js';
import { UPLOAD_LINK_OPTIONS } from '../../utils/mediaLabels.js';
import { X, Upload } from 'lucide-react';
import { toastStore } from '../../store/toastStore.js';

function todayInputValue() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

export function MediaUploadModal({ projectId, open, onClose, defaultLink, onUploaded }) {
  const [file, setFile] = useState(null);
  const [capturedAt, setCapturedAt] = useState(todayInputValue());
  const [note, setNote] = useState('');
  const [linkType, setLinkType] = useState(defaultLink?.linkType ?? 'PROJECT');
  const [linkId, setLinkId] = useState(defaultLink?.linkId ? String(defaultLink.linkId) : '');
  const [linkOptions, setLinkOptions] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const linkLocked = Boolean(defaultLink?.linkType && defaultLink.linkType !== 'PROJECT');

  useEffect(() => {
    if (!open) return;
    setFile(null);
    setCapturedAt(todayInputValue());
    setNote('');
    setError('');
    if (defaultLink?.linkType) {
      setLinkType(defaultLink.linkType);
      setLinkId(defaultLink.linkId ? String(defaultLink.linkId) : '');
    } else {
      setLinkType('PROJECT');
      setLinkId('');
    }
  }, [open, defaultLink]);

  useEffect(() => {
    if (!open || !projectId || linkType === 'PROJECT' || linkLocked) {
      setLinkOptions([]);
      return;
    }
    let cancelled = false;
    async function loadEntities() {
      try {
        let items = [];
        if (linkType === 'PAYMENT_STAGE') {
          const res = await getStages(projectId);
          items = (res?.data ?? []).map((s) => ({ id: s.id, label: `${s.stageNumber}. ${s.stageName}` }));
        } else if (linkType === 'LABOUR_PAYMENT') {
          const res = await getLabour(projectId);
          items = (res?.data ?? []).map((l) => ({ id: l.id, label: l.workerName }));
        } else if (linkType === 'MATERIAL_ITEM') {
          const res = await getProjectMaterials(projectId);
          items = (res?.data ?? []).map((m) => ({
            id: m.id,
            label: `${m.material?.name ?? 'Material'} — ${m.type}`,
          }));
        } else if (linkType === 'ASSOCIATE_PAYMENT') {
          const res = await getProjectAssociates(projectId);
          items = (res?.data ?? []).map((a) => ({
            id: a.id,
            label: a.associate?.name ?? `Associate #${a.id}`,
          }));
        } else if (linkType === 'BILL') {
          const res = await getBills({ projectId });
          items = (res?.data ?? []).map((b) => ({
            id: b.id,
            label: `${b.partyName} (${b.type})`,
          }));
        } else if (linkType === 'OTHER_EXPENSE') {
          const res = await getProjectExpenses(projectId);
          items = (res?.data ?? []).map((e) => ({
            id: e.id,
            label: e.description,
          }));
        }
        if (!cancelled) setLinkOptions(items);
      } catch {
        if (!cancelled) setLinkOptions([]);
      }
    }
    loadEntities();
    return () => {
      cancelled = true;
    };
  }, [open, projectId, linkType, linkLocked]);

  if (!open) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!file) {
      setError('Choose a file to upload.');
      return;
    }
    if (!note.trim()) {
      setError('Note is required.');
      return;
    }
    if (linkType !== 'PROJECT' && !linkId) {
      setError('Select the record to link this file to.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('capturedAt', capturedAt);
    formData.append('note', note.trim());
    if (linkType !== 'PROJECT') {
      formData.append('linkType', linkType);
      formData.append('linkId', linkId);
    }

    setSaving(true);
    try {
      const res = await uploadProjectMedia(projectId, formData);
      if (res?.success) {
        toastStore.getState().add('Site media uploaded', 'success');
        onUploaded?.(res.data);
        onClose();
      } else {
        setError(res?.error ?? 'Upload failed');
      }
    } catch (err) {
      setError(err.response?.data?.error ?? err.message ?? 'Upload failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h3 className="text-lg font-bold text-slate-900">Upload site media</h3>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{error}</p>
          )}
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">File</label>
            <Input
              type="file"
              accept="image/*,application/pdf,video/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="h-11"
            />
            <p className="mt-1 text-xs text-slate-500">Images, PDFs, or videos</p>
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Date</label>
            <Input
              type="date"
              value={capturedAt}
              onChange={(e) => setCapturedAt(e.target.value)}
              required
              className="h-11"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Note</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={500}
              rows={3}
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              placeholder="What does this photo or document show?"
            />
          </div>
          {!linkLocked && (
            <>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Link to (optional)</label>
                <select
                  value={linkType}
                  onChange={(e) => {
                    setLinkType(e.target.value);
                    setLinkId('');
                  }}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium"
                >
                  {UPLOAD_LINK_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              {linkType !== 'PROJECT' && (
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Record</label>
                  <select
                    value={linkId}
                    onChange={(e) => setLinkId(e.target.value)}
                    required
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium"
                  >
                    <option value="">Select…</option>
                    {linkOptions.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="gap-2">
              <Upload className="h-4 w-4" />
              {saving ? 'Uploading…' : 'Upload'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
