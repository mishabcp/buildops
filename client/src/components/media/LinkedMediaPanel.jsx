import { useState, useEffect, useCallback } from 'react';
import { Button } from '../ui/button.jsx';
import { listProjectMedia, deleteProjectMedia } from '../../api/projectMedia.api.js';
import { MediaUploadModal } from './MediaUploadModal.jsx';
import { MediaAuthPreview } from './MediaAuthPreview.jsx';
import { formatDate } from '../../utils/formatDate.js';
import { authStore } from '../../store/authStore.js';
import { toastStore } from '../../store/toastStore.js';
import { ChevronDown, ChevronRight, Paperclip, Plus, Trash2 } from 'lucide-react';
import { cn } from '../../lib/utils.js';

export function LinkedMediaPanel({ projectId, linkType, linkId, defaultExpanded = false }) {
  const user = authStore((s) => s.user);
  const canDelete = user?.role !== 'STAFF';

  const [expanded, setExpanded] = useState(defaultExpanded);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);

  const load = useCallback(async () => {
    if (!projectId || !linkId) return;
    setLoading(true);
    try {
      const res = await listProjectMedia(projectId, { linkType, linkId, limit: 20 });
      if (res?.success) setItems(res.data?.items ?? []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [projectId, linkType, linkId]);

  useEffect(() => {
    if (expanded) load();
  }, [expanded, load]);

  async function handleDelete(mediaId) {
    if (!window.confirm('Delete this file? This cannot be undone.')) return;
    try {
      const res = await deleteProjectMedia(projectId, mediaId);
      if (res?.success) {
        toastStore.getState().success('Media deleted');
        load();
      } else {
        toastStore.getState().error(res?.error ?? 'Delete failed');
      }
    } catch (err) {
      toastStore.getState().error(err.response?.data?.error ?? 'Delete failed');
    }
  }

  function openPdf(blobUrl) {
    if (blobUrl) window.open(blobUrl, '_blank', 'noopener,noreferrer');
  }

  return (
    <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50/80">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm font-semibold text-slate-700"
      >
        <span className="flex items-center gap-2">
          <Paperclip className="h-4 w-4 text-slate-400" />
          Site attachments
          {!loading && (
            <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-slate-500">
              {items.length}
            </span>
          )}
        </span>
        {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </button>

      {expanded && (
        <div className="border-t border-slate-100 px-3 pb-3 pt-2">
          <div className="mb-2 flex justify-end">
            <Button type="button" size="sm" variant="outline" className="h-8 gap-1 text-xs" onClick={() => setUploadOpen(true)}>
              <Plus className="h-3.5 w-3.5" />
              Add
            </Button>
          </div>
          {loading ? (
            <p className="text-xs text-slate-500 py-2">Loading…</p>
          ) : items.length === 0 ? (
            <p className="text-xs text-slate-500 py-2">No photos or documents linked yet.</p>
          ) : (
            <ul className="space-y-2">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex gap-3 rounded-lg border border-slate-200/80 bg-white p-2"
                >
                  <MediaAuthPreview
                    projectId={projectId}
                    media={item}
                    onOpen={openPdf}
                    className="h-14 w-14 shrink-0 rounded-lg overflow-hidden"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-slate-800">{item.note}</p>
                    <p className="text-[11px] text-slate-500">{formatDate(item.capturedAt)}</p>
                  </div>
                  {canDelete && (
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="shrink-0 rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <MediaUploadModal
        projectId={projectId}
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        defaultLink={{ linkType, linkId }}
        onUploaded={() => {
          setExpanded(true);
          load();
        }}
      />
    </div>
  );
}
