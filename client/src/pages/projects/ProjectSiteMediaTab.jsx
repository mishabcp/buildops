import { useState, useEffect, useCallback } from 'react';
import { Button } from '../../components/ui/button.jsx';
import { listProjectMedia, deleteProjectMedia } from '../../api/projectMedia.api.js';
import { MediaUploadModal } from '../../components/media/MediaUploadModal.jsx';
import { MediaAuthPreview } from '../../components/media/MediaAuthPreview.jsx';
import { formatDate } from '../../utils/formatDate.js';
import { linkBadgeLabel } from '../../utils/mediaLabels.js';
import { authStore } from '../../store/authStore.js';
import { toastStore } from '../../store/toastStore.js';
import { Camera, Plus, Trash2 } from 'lucide-react';
import { cn } from '../../lib/utils.js';

const KIND_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'IMAGE', label: 'Images' },
  { id: 'PDF', label: 'PDFs' },
  { id: 'VIDEO', label: 'Videos' },
];

export function ProjectSiteMediaTab({ projectId }) {
  const user = authStore((s) => s.user);
  const canDelete = user?.role !== 'STAFF';

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [kindFilter, setKindFilter] = useState('all');
  const [linkedOnly, setLinkedOnly] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const load = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const params = { limit: 100 };
      if (kindFilter !== 'all') params.kind = kindFilter;
      const res = await listProjectMedia(projectId, params);
      let list = res?.data?.items ?? [];
      if (linkedOnly) {
        list = list.filter((m) => m.linkType !== 'PROJECT' && m.linkId);
      }
      setItems(list);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [projectId, kindFilter, linkedOnly]);

  useEffect(() => {
    load();
  }, [load]);

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Camera className="h-5 w-5 text-brand-600" />
            Site media
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Photos, PDFs, and videos with a date and note. Link files to payment stages or costs from here or from each tab.
          </p>
        </div>
        <Button onClick={() => setUploadOpen(true)} className="gap-2 rounded-xl shrink-0">
          <Plus className="h-4 w-4" />
          Upload
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {KIND_FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setKindFilter(f.id)}
            className={cn(
              'rounded-full px-3 py-1.5 text-xs font-bold transition-colors',
              kindFilter === f.id
                ? 'bg-brand-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            )}
          >
            {f.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setLinkedOnly((v) => !v)}
          className={cn(
            'rounded-full px-3 py-1.5 text-xs font-bold transition-colors',
            linkedOnly ? 'bg-accent-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          )}
        >
          Linked only
        </button>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-500 font-medium">Loading media…</div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 py-16 text-center">
          <Camera className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 font-semibold text-slate-700">No site media yet</p>
          <p className="text-sm text-slate-500 mt-1">Upload progress photos, milestone proof, or bill scans.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <article
              key={item.id}
              className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm"
            >
              <MediaAuthPreview
                projectId={projectId}
                media={item}
                onOpen={(url) => {
                  if (item.kind === 'PDF') window.open(url, '_blank');
                  else setPreviewUrl(url);
                }}
                className="aspect-video w-full"
              />
              <div className="p-4 space-y-2">
                <p className="text-sm font-semibold text-slate-900 line-clamp-2">{item.note}</p>
                <p className="text-xs text-slate-500">{formatDate(item.capturedAt)}</p>
                <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600">
                  {linkBadgeLabel(item)}
                </span>
                {item.uploadedBy?.name && (
                  <p className="text-[11px] text-slate-400">By {item.uploadedBy.name}</p>
                )}
                {canDelete && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2 h-8 w-full gap-1 text-red-600 border-red-100 hover:bg-red-50"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </Button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {previewUrl && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4" onClick={() => setPreviewUrl(null)}>
          <img src={previewUrl} alt="" className="max-h-full max-w-full rounded-lg object-contain" onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      <MediaUploadModal projectId={projectId} open={uploadOpen} onClose={() => setUploadOpen(false)} onUploaded={load} />
    </div>
  );
}
